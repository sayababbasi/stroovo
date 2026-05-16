import prisma from '@/lib/prisma';
import { taskEventBus, TaskEventFactory } from '@/events/task-events';
import '@/events/task-event-handlers';
import { CreateTaskDTO, UpdateTaskDTO } from '@/validation/task';
import { RiskEngine } from '@/ai/risk-engine';

// Define types for task since Prisma enums aren't exported
type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type Task = any; // Use any for Task type to avoid Prisma export issues

export class TaskService {
  /**
   * Defines flexible allowed transitions for task statuses.
   * Key: Current Status, Value: Array of allowed next statuses
   * More flexible workflow allowing realistic task management
   */
  private static readonly ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    BACKLOG: ['TODO', 'BLOCKED', 'DONE', 'IN_PROGRESS', 'REVIEW'],
    TODO: ['IN_PROGRESS', 'BLOCKED', 'BACKLOG', 'DONE', 'REVIEW'],
    IN_PROGRESS: ['REVIEW', 'DONE', 'TODO', 'BLOCKED', 'BACKLOG'], // Added BACKLOG for reprioritization
    REVIEW: ['DONE', 'IN_PROGRESS', 'BLOCKED', 'BACKLOG', 'TODO'],
    DONE: ['IN_PROGRESS', 'TODO', 'BACKLOG', 'BLOCKED', 'REVIEW'], // Can reopen to any state
    BLOCKED: ['TODO', 'IN_PROGRESS', 'BACKLOG', 'REVIEW', 'DONE'], // Unblocking can move anywhere
  };

  /**
   * Validates if a status transition is allowed.
   */
  public static isValidTransition(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
    if (currentStatus === newStatus) return true;
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    const isValid = allowed.includes(newStatus);
    if (!isValid) {
        console.warn(`[TaskService] Invalid transition attempted: ${currentStatus} -> ${newStatus}`);
    }
    return isValid;
  }

  /**
   * Create a new task and emit event.
   */
  public static async createTask(data: CreateTaskDTO, userId: string, tenantId?: string): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        ...data,
        tenantId: tenantId || null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
    console.log(`[TaskService] Successfully created task in DB: ${task.id} - ${task.title}`);

    // Emit event
    const event = TaskEventFactory.createTaskCreatedEvent(
      task.id,
      userId,
      {
        title: task.title,
        description: task.description || undefined,
        priority: task.priority,
        assigneeId: task.assigneeId || undefined,
        projectId: task.projectId,
        dueDate: task.dueDate || undefined,
      },
      tenantId
    );
    await taskEventBus.emitTaskEvent(event);

    // Auto-assignment logic (Phase 3)
    if (!task.assigneeId && task.teamId && tenantId) {
      try {
        const { DecisionEngine } = await import('@/lib/teams/decision-engine');
        await DecisionEngine.autoAssign(task.id, task.teamId, tenantId, userId);
      } catch (err) {
        console.warn(`[TaskService] Auto-assign failed for task ${task.id}:`, err);
      }
    }

    RiskEngine.scheduleTaskRiskEvaluation(task.id, userId);

    return task;
  }

  /**
   * Update a task, enforcing state machine transitions, and emitting necessary events.
   */
  public static async updateTask(taskId: string, data: UpdateTaskDTO, userId: string, tenantId?: string): Promise<Task> {
    // We use a transaction to ensure optimistic locking or consistent reads
    return await prisma.$transaction(async (tx) => {
      const existingTask = await tx.task.findUnique({
        where: { id: taskId },
      });

      if (!existingTask) {
        throw new Error('Task not found');
      }

      // Check status transition
      if (data.status && data.status !== existingTask.status) {
        if (!this.isValidTransition(existingTask.status, data.status)) {
          throw new Error(`Invalid status transition from ${existingTask.status} to ${data.status}`);
        }
      }

      // Process updates
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          ...data,
          startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
          dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        } as any,
      });

      // Fire events based on what changed
      
      // Status change
      if (data.status && data.status !== existingTask.status) {
        const event = TaskEventFactory.createTaskStatusChangedEvent(
          taskId,
          userId,
          existingTask.status,
          updatedTask.status,
          userId,
          'Updated via TaskService',
          tenantId
        );
        await taskEventBus.emitTaskEvent(event);

        if (updatedTask.status === 'DONE') {
          const compEvent = TaskEventFactory.createTaskCompletedEvent(
            taskId,
            userId,
            userId,
            undefined,
            'GOOD',
            tenantId
          );
          await taskEventBus.emitTaskEvent(compEvent);
        }
      }

      // Assignee change
      if (data.assigneeId !== undefined && data.assigneeId !== existingTask.assigneeId) {
         if(data.assigneeId) {
             const assignEvent = TaskEventFactory.createTaskAssignedEvent(
                taskId,
                userId,
                data.assigneeId,
                existingTask.assigneeId || undefined,
                userId,
                updatedTask.priority,
                updatedTask.dueDate || undefined,
                tenantId
             );
             await taskEventBus.emitTaskEvent(assignEvent);
         }
      }

      // General Update Event (if title, desc, priority, etc. changed)
      const isGeneralUpdate = data.title || data.description || data.priority || data.progress;
      if (isGeneralUpdate) {
          await taskEventBus.emitTaskEvent({
            type: 'TASK_UPDATED',
            taskId,
            userId,
            tenantId,
            timestamp: new Date(),
            data: {
                field: 'multiple',
                oldValue: existingTask,
                newValue: updatedTask
            }
          });
      }

      // Automatically update parent task progress if this is a subtask whose status changed
      if (updatedTask.parentId && data.status && data.status !== existingTask.status) {
          const allSubtasks = await tx.task.findMany({ where: { parentId: updatedTask.parentId } });
          const doneSubtasks = allSubtasks.filter(t => t.status === 'DONE').length;
          const newProgress = allSubtasks.length > 0 ? Math.round((doneSubtasks / allSubtasks.length) * 100) : 0;
          
          await tx.task.update({
              where: { id: updatedTask.parentId },
              data: { progress: newProgress }
          });
      }

      const shouldRecomputeRisk = Boolean(
        data.status !== undefined ||
        data.priority !== undefined ||
        data.assigneeId !== undefined ||
        data.dueDate !== undefined ||
        data.parentId !== undefined ||
        data.teamId !== undefined
      );

      if (shouldRecomputeRisk) {
        RiskEngine.scheduleTaskRiskEvaluation(taskId, userId);
        if (updatedTask.parentId) {
          RiskEngine.scheduleTaskRiskEvaluation(updatedTask.parentId, userId);
        }
      }

      return updatedTask;
    });
  }

  /**
   * Bulk update tasks within a single transaction.
   */
  public static async bulkUpdate(taskIds: string[], updates: UpdateTaskDTO, userId: string, tenantId?: string): Promise<Task[]> {
    const results: Task[] = [];
    
    // Process sequentially inside transaction to enforce state machine per task
    await prisma.$transaction(async (tx) => {
        for (const id of taskIds) {
             // We reuse the logic, passing the tx implicitly by querying it. 
             // To properly use the transaction, we'll inline a simplified update here for bulk speed
             
             const existingTask = await tx.task.findUnique({ where: { id } });
             if (!existingTask) continue;

             if (updates.status && updates.status !== existingTask.status) {
                 if (!this.isValidTransition(existingTask.status, updates.status)) {
                     throw new Error(`Task ${id}: Invalid status transition from ${existingTask.status} to ${updates.status}`);
                 }
             }

             const updatedTask = await tx.task.update({
                 where: { id },
                 data: {
                     ...updates,
                     startDate: updates.startDate !== undefined ? (updates.startDate ? new Date(updates.startDate) : null) : undefined,
                     dueDate: updates.dueDate !== undefined ? (updates.dueDate ? new Date(updates.dueDate) : null) : undefined,
                 } as any
             });

             results.push(updatedTask);

             // Emit events
             if (updates.status && updates.status !== existingTask.status) {
                await taskEventBus.emitTaskEvent(TaskEventFactory.createTaskStatusChangedEvent(
                    id, userId, existingTask.status, updatedTask.status, userId, 'Bulk Update', tenantId
                ));
             }

             if (updates.assigneeId !== undefined && updates.assigneeId !== existingTask.assigneeId && updates.assigneeId) {
                await taskEventBus.emitTaskEvent(TaskEventFactory.createTaskAssignedEvent(
                    id, userId, updates.assigneeId, existingTask.assigneeId || undefined, userId, updatedTask.priority, updatedTask.dueDate || undefined, tenantId
                ));
             }
        }
    });

    return results;
  }
}

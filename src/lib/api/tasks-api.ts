import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  validateCreateTask, 
  validateUpdateTask, 
  validateBulkUpdate, 
  validateTaskQuery,
  validateTaskDependency,
  safeValidateCreateTask,
  safeValidateUpdateTask,
  TaskValidator,
  type CreateTaskInput,
  type UpdateTaskInput,
  type BulkTaskUpdateInput
} from '@/validation/task-validation';
import { taskStateMachine } from '@/lib/tasks/state-machine';
import { taskEventBus, TaskEventFactory } from '@/events/task-events';
import { RiskEngine } from '@/ai/risk-engine';
import { workloadEngine } from '@/engines/workload-engine';

// Enterprise Task API Service Layer
// Production-grade endpoints with validation, events, and AI integration

export class TasksAPI {
  /**
   * Create a new task with full validation and event emission
   */
  static async createTask(data: CreateTaskInput, userId: string, tenantId?: string) {
    try {
      // Validate input
      const validatedData = validateCreateTask(data);
      
      // Business logic validation
      const businessValidation = this.validateBusinessRules(validatedData, 'CREATE');
      if (!businessValidation.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: businessValidation.errors },
          { status: 400 }
        );
      }

      // Create task with transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the task
        const task = await tx.task.create({
          data: {
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          include: {
            assignee: true,
            project: true
          }
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            action: 'TASK_CREATED',
            entity: 'Task',
            entityId: task.id,
            metadata: validatedData,
            userId,
            tenantId: tenantId || 'default'
          }
        });

        return task;
      });

      // Emit events
      await taskEventBus.emitTaskEvent(
        TaskEventFactory.createTaskCreatedEvent(
          result.id,
          userId,
          {
            title: result.title,
            description: result.description || undefined,
            priority: result.priority,
            assigneeId: result.assigneeId || undefined,
            projectId: result.projectId,
            dueDate: result.dueDate || undefined
          },
          tenantId
        )
      );

      // Trigger risk analysis
      if (result.assigneeId) {
        // This would be called asynchronously in production
        setTimeout(async () => {
          try {
            const allTasks = await prisma.task.findMany({
              where: { assigneeId: result.assigneeId }
            });
            const context = await this.buildAnalysisContext(allTasks);
            await RiskEngine.evaluateTaskRisk(result.id);
          } catch (error) {
            console.error('Risk analysis failed:', error);
          }
        }, 100);
      }

      return NextResponse.json(
        { 
          success: true, 
          data: result,
          message: 'Task created successfully'
        },
        { status: 201 }
      );

    } catch (error) {
      console.error('Create task error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Update a task with validation and state machine enforcement
   */
  static async updateTask(
    taskId: string, 
    data: UpdateTaskInput, 
    userId: string, 
    tenantId?: string
  ) {
    try {
      // Validate input
      const validatedData = validateUpdateTask(data);
      
      // Get current task
      const currentTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignee: true,
          taskDependencies: true,
          taskDependentOn: true
        }
      });

      if (!currentTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      // Business logic validation
      const businessValidation = this.validateBusinessRules(
        { ...currentTask, ...validatedData },
        'UPDATE'
      );
      if (!businessValidation.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: businessValidation.errors },
          { status: 400 }
        );
      }

      // Update with transaction
      const result = await prisma.$transaction(async (tx) => {
        // Store old values for activity logging
        const oldValues: Record<string, any> = {};
        const newValues: Record<string, any> = {};

        // Update the task
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            title: validatedData.title,
            description: validatedData.description,
            status: validatedData.status,
            priority: validatedData.priority,
            type: validatedData.type,
            startDate: validatedData.startDate,
            dueDate: validatedData.dueDate,
            progress: validatedData.progress,
            assigneeId: validatedData.assigneeId,
            updatedAt: new Date()
          },
          include: {
            assignee: true,
            project: true,
            taskDependencies: true,
            subTasks: true
          }
        });

        // Log activity for each changed field
        for (const [key, newValue] of Object.entries(validatedData)) {
          const oldValue = currentTask[key as keyof typeof currentTask];
          if (oldValue !== newValue) {
            oldValues[key] = oldValue;
            newValues[key] = newValue;

            await tx.activityLog.create({
              data: {
                action: 'TASK_UPDATED',
                entity: 'Task',
                entityId: taskId,
                metadata: {
                  field: key,
                  oldValue,
                  newValue
                },
                userId,
                tenantId: tenantId || 'default'
              }
            });
          }
        }

        return updatedTask;
      });

      // Emit events for significant changes
      if (validatedData.status && validatedData.status !== currentTask.status) {
        await taskEventBus.emitTaskEvent(
          TaskEventFactory.createTaskStatusChangedEvent(
            taskId,
            userId,
            currentTask.status,
            validatedData.status,
            userId,
            tenantId
          )
        );
      }

      if (validatedData.assigneeId && validatedData.assigneeId !== currentTask.assigneeId) {
        await taskEventBus.emitTaskEvent(
          TaskEventFactory.createTaskAssignedEvent(
            taskId,
            userId,
            validatedData.assigneeId,
            currentTask.assigneeId || undefined,
            userId,
            result.priority,
            result.dueDate || undefined,
            tenantId
          )
        );
      }

      // Trigger risk analysis for significant changes
      const significantFields = ['assigneeId', 'dueDate', 'priority'];
      const hasSignificantChange = significantFields.some(field => 
        validatedData[field as keyof UpdateTaskInput] !== undefined &&
        validatedData[field as keyof UpdateTaskInput] !== currentTask[field as keyof typeof currentTask]
      );

      if (hasSignificantChange) {
        setTimeout(async () => {
          try {
            const allTasks = await prisma.task.findMany({
              where: { projectId: result.projectId }
            });
            const context = await this.buildAnalysisContext(allTasks);
            await RiskEngine.evaluateTaskRisk(result.id);
          } catch (error) {
            console.error('Risk analysis failed:', error);
          }
        }, 100);
      }

      return NextResponse.json(
        { 
          success: true, 
          data: result,
          message: 'Task updated successfully'
        }
      );

    } catch (error) {
      console.error('Update task error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Bulk update tasks with validation
   */
  static async bulkUpdate(
    data: BulkTaskUpdateInput, 
    userId: string, 
    tenantId?: string
  ) {
    try {
      const validatedData = validateBulkUpdate(data);
      
      // Check permissions for bulk operations
      const permissionValidation = TaskValidator.validateBulkOperation(
        validatedData.taskIds,
        'UPDATE',
        'USER' // Would get actual user role
      );

      if (!permissionValidation.isValid) {
        return NextResponse.json(
          { error: 'Permission denied', details: permissionValidation.errors },
          { status: 403 }
        );
      }

      // Get current tasks
      const currentTasks = await prisma.task.findMany({
        where: { id: { in: validatedData.taskIds } }
      });

      if (currentTasks.length !== validatedData.taskIds.length) {
        return NextResponse.json(
          { error: 'One or more tasks not found' },
          { status: 404 }
        );
      }

      // Validate each task update
      const validationErrors: string[] = [];
      for (const task of currentTasks) {
        const mergedData = { ...task, ...validatedData.updates };
        const businessValidation = this.validateBusinessRules(mergedData, 'UPDATE');
        if (!businessValidation.isValid) {
          validationErrors.push(`Task ${task.id}: ${businessValidation.errors.join(', ')}`);
        }
      }

      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationErrors },
          { status: 400 }
        );
      }

      // Perform bulk update
      const results = await prisma.$transaction(async (tx) => {
        const updatedTasks = await tx.task.updateMany({
          where: { id: { in: validatedData.taskIds } },
          data: {
            title: validatedData.updates.title,
            description: validatedData.updates.description,
            status: validatedData.updates.status,
            priority: validatedData.updates.priority,
            type: validatedData.updates.type,
            startDate: validatedData.updates.startDate,
            dueDate: validatedData.updates.dueDate,
            progress: validatedData.updates.progress,
            assigneeId: validatedData.updates.assigneeId,
            updatedAt: new Date()
          }
        });

        // Log bulk activity
        await tx.activityLog.create({
          data: {
            action: 'TASK_BULK_UPDATED',
            entity: 'Task',
            entityId: validatedData.taskIds[0], // Log first task as representative
            metadata: {
              taskIds: validatedData.taskIds,
              updates: validatedData.updates
            },
            userId,
            tenantId: tenantId || 'default'
          }
        });

        return updatedTasks;
      });

      return NextResponse.json(
        { 
          success: true, 
          data: { updatedCount: results.count },
          message: `Successfully updated ${results.count} tasks`
        }
      );

    } catch (error) {
      console.error('Bulk update error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Delete a task with dependency cleanup
   */
  static async deleteTask(taskId: string, userId: string, tenantId?: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          taskDependencies: true,
          taskDependentOn: true,
          subTasks: true
        }
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      // Check if task has dependents
      if (task.taskDependentOn.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete task with active dependencies' },
          { status: 400 }
        );
      }

      // Delete with transaction
      await prisma.$transaction(async (tx) => {
        // Delete subtasks
        await tx.task.deleteMany({
          where: { parentId: taskId }
        });

        // Delete activities
        await tx.activityLog.deleteMany({
          where: { entityId: taskId }
        });

        // Delete the task
        await tx.task.delete({
          where: { id: taskId }
        });

        // Log deletion
        await tx.activityLog.create({
          data: {
            action: 'TASK_DELETED',
            entity: 'Task',
            entityId: taskId,
            metadata: { taskTitle: task.title },
            userId,
            tenantId: tenantId || 'default'
          }
        });
      });

      return NextResponse.json(
        { success: true, message: 'Task deleted successfully' }
      );

    } catch (error) {
      console.error('Delete task error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Get tasks with advanced filtering and pagination
   */
  static async getTasks(query: any, userId?: string, tenantId?: string) {
    try {
      const validatedQuery = validateTaskQuery(query);
      
      // Build where clause
      const where: any = {
        tenantId: tenantId || 'default'
      };

      // Apply filters
      if (validatedQuery.status?.length) {
        where.status = { in: validatedQuery.status };
      }

      if (validatedQuery.priority?.length) {
        where.priority = { in: validatedQuery.priority };
      }

      if (validatedQuery.assigneeId?.length) {
        where.assigneeId = { in: validatedQuery.assigneeId };
      }

      if (validatedQuery.projectId?.length) {
        where.projectId = { in: validatedQuery.projectId };
      }

      if (validatedQuery.tags?.length) {
        where.tags = { hasSome: validatedQuery.tags };
      }

      if (validatedQuery.dueDateFrom || validatedQuery.dueDateTo) {
        where.dueDate = {};
        if (validatedQuery.dueDateFrom) where.dueDate.gte = validatedQuery.dueDateFrom;
        if (validatedQuery.dueDateTo) where.dueDate.lte = validatedQuery.dueDateTo;
      }

      if (validatedQuery.createdFrom || validatedQuery.createdTo) {
        where.createdAt = {};
        if (validatedQuery.createdFrom) where.createdAt.gte = validatedQuery.createdFrom;
        if (validatedQuery.createdTo) where.createdAt.lte = validatedQuery.createdTo;
      }

      if (validatedQuery.riskScoreMin !== undefined || validatedQuery.riskScoreMax !== undefined) {
        where.riskScore = {};
        if (validatedQuery.riskScoreMin !== undefined) where.riskScore.gte = validatedQuery.riskScoreMin;
        if (validatedQuery.riskScoreMax !== undefined) where.riskScore.lte = validatedQuery.riskScoreMax;
      }

      if (validatedQuery.hasDependencies === true) {
        where.taskDependencies = { some: {} };
      } else if (validatedQuery.hasDependencies === false) {
        where.taskDependencies = { none: {} };
      }

      if (validatedQuery.isOverdue === true) {
        where.dueDate = { lt: new Date() };
        where.status = { not: 'DONE' };
      }

      // Search functionality
      if (validatedQuery.search) {
        where.OR = [
          { title: { contains: validatedQuery.search, mode: 'insensitive' } },
          { description: { contains: validatedQuery.search, mode: 'insensitive' } },
          { tags: { hasSome: [validatedQuery.search] } }
        ];
      }

      // Execute query with pagination
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          include: {
            assignee: true,
            project: true,
            taskDependencies: true,
            subTasks: true,
            _count: {
              select: {
                comments: true,
                files: true
              }
            }
          },
          orderBy: {
            [validatedQuery.sortBy]: validatedQuery.sortOrder
          },
          skip: (validatedQuery.page - 1) * validatedQuery.limit,
          take: validatedQuery.limit
        }),
        prisma.task.count({ where })
      ]);

      // Add AI risk analysis if requested
      const tasksWithRisk = await Promise.all(
        tasks.map(async (task) => {
          const riskAnalysis = await RiskEngine.evaluateTaskRisk(task.id);
          return {
            ...task,
            ai: riskAnalysis ? {
              riskLevel: (riskAnalysis as any).riskLevel,
              delayProbability: (riskAnalysis as any).delayProbability,
              recommendations: (riskAnalysis as any).recommendations?.slice(0, 3) || []
            } : null
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: tasksWithRisk,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total,
          totalPages: Math.ceil(total / validatedQuery.limit)
        }
      });

    } catch (error) {
      console.error('Get tasks error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Get single task with full details
   */
  static async getTask(taskId: string, userId?: string, tenantId?: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignee: true,
          project: true,
          taskDependencies: true,
          taskDependentOn: {
            include: { assignee: true }
          },
          subTasks: {
            include: { assignee: true }
          },
          comments: {
            include: { user: true },
            orderBy: { createdAt: 'desc' }
          },
          files: true
        }
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      // Add AI analysis
      const riskAnalysis = await RiskEngine.evaluateTaskRisk(taskId);
      
      const taskWithAI = {
        ...task,
        ai: riskAnalysis ? {
          riskLevel: (riskAnalysis as any).riskLevel,
          delayProbability: (riskAnalysis as any).delayProbability,
          riskFactors: (riskAnalysis as any).riskFactors,
          recommendations: (riskAnalysis as any).recommendations,
          confidence: (riskAnalysis as any).confidence
        } : null
      };

      return NextResponse.json({
        success: true,
        data: taskWithAI
      });

    } catch (error) {
      console.error('Get task error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Validate business rules
   */
  private static validateBusinessRules(data: any, operation: 'CREATE' | 'UPDATE'): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Due date validation
    if (data.startDate && data.dueDate) {
      if (!TaskValidator.validateDueDate(data.startDate, data.dueDate)) {
        errors.push('Due date must be after start date');
      }
    }

    // Estimated hours validation
    if (data.estimatedHours && data.complexity) {
      if (!TaskValidator.validateEstimatedHours(data.estimatedHours, data.complexity)) {
        errors.push('Estimated hours exceed complexity limits');
      }
    }

    // Task completion validation
    if (data.status) {
      const completionValidation = TaskValidator.validateTaskCompletion(data);
      if (!completionValidation.isValid) {
        errors.push(...completionValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Build analysis context for AI engines
   */
  private static async buildAnalysisContext(tasks: any[]): Promise<any> {
    // Get user workloads
    const userIds = [...new Set(tasks.map(t => t.assigneeId).filter(Boolean))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    const workloadAnalysis = await workloadEngine.analyzeTeamWorkload(tasks, users);

    // Get dependency analysis
    const dependencyAnalysis = new Map();
    for (const task of tasks) {
      const deps = task.taskDependencies || task.dependencies || [];
      dependencyAnalysis.set(task.id, {
        totalDependencies: deps.length,
        incompleteDependencies: deps.filter((d: any) => d.status !== 'DONE').length,
        criticalPath: false, // Would be calculated based on project structure
        blockedTasks: task.taskDependentOn?.length || task.dependents?.length || 0,
        dependencyRisk: 0 // Would be calculated
      });
    }

    // Get team performance data
    const teamPerformance = new Map();
    for (const user of users) {
      const userTasks = tasks.filter(t => t.assigneeId === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'DONE');
      
      teamPerformance.set(user.id, {
        onTimeDelivery: completedTasks.length > 0 ? 0.85 : 0.85, // Would calculate from actual data
        qualityScore: 85,
        avgOverdueDays: 0,
        skills: user.skills || []
      });
    }

    return {
      userWorkloads: new Map(workloadAnalysis.workloadDistribution.map(w => [w.userId, w])),
      dependencies: dependencyAnalysis,
      teamPerformance
    };
  }
}

// Export individual API handlers for Next.js routes
export const createTaskHandler = async (request: NextRequest) => {
  const body = await request.json();
  const userId = request.headers.get('x-user-id') || 'system';
  const tenantId = request.headers.get('x-tenant-id') || undefined;
  
  return TasksAPI.createTask(body, userId, tenantId);
};

export const updateTaskHandler = async (
  request: NextRequest, 
  { params }: { params: { id: string } }
) => {
  const body = await request.json();
  const userId = request.headers.get('x-user-id') || 'system';
  const tenantId = request.headers.get('x-tenant-id') || undefined;
  
  return TasksAPI.updateTask(params.id, body, userId, tenantId);
};

export const bulkUpdateTasksHandler = async (request: NextRequest) => {
  const body = await request.json();
  const userId = request.headers.get('x-user-id') || 'system';
  const tenantId = request.headers.get('x-tenant-id') || undefined;
  
  return TasksAPI.bulkUpdate(body, userId, tenantId);
};

export const deleteTaskHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const userId = request.headers.get('x-user-id') || 'system';
  const tenantId = request.headers.get('x-tenant-id') || undefined;
  
  return TasksAPI.deleteTask(params.id, userId, tenantId);
};

export const getTasksHandler = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());
  const userId = request.headers.get('x-user-id') || undefined;
  const tenantId = request.headers.get('x-tenant-id') || undefined;
  
  return TasksAPI.getTasks(query, userId, tenantId);
};

export const getTaskHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const userId = request.headers.get('x-user-id') || undefined;
  const tenantId = request.headers.get('x-tenant-id') || undefined;
  
  return TasksAPI.getTask(params.id, userId, tenantId);
};

import { taskEventBus, TaskCreatedEvent, TaskStatusChangedEvent, TaskAssignedEvent, TaskCompletedEvent } from './task-events';
import prisma from '@/lib/prisma';
import { RiskEngine } from '@/ai/risk-engine';
import { WorkloadEngine } from '@/ai/workload-engine';

let isRegistered = false;

export function registerTaskEventHandlers() {
  if (isRegistered) return;
  isRegistered = true;
  
  // 1. Log all status changes
  taskEventBus.registerHandler('TASK_STATUS_CHANGED', {
    handle: async (event: TaskStatusChangedEvent) => {
      if (event.tenantId) {
        await prisma.activityLog.create({
          data: {
            action: 'TASK_STATUS_CHANGED',
            entity: 'TASK',
            entityId: event.taskId,
            metadata: {
              oldStatus: event.data.oldStatus,
              newStatus: event.data.newStatus,
              reason: event.data.reason
            },
            tenantId: event.tenantId,
            userId: event.userId
          }
        });
      }

      // If status changed, recalculate risk for this task async
      RiskEngine.evaluateTaskRisk(event.taskId).catch(console.error);
    }
  });

  // 2. Log creation and run initial risk check
  taskEventBus.registerHandler('TASK_CREATED', {
    handle: async (event: TaskCreatedEvent) => {
      if (event.tenantId) {
        await prisma.activityLog.create({
          data: {
            action: 'TASK_CREATED',
            entity: 'TASK',
            entityId: event.taskId,
            metadata: { title: event.data.title, priority: event.data.priority },
            tenantId: event.tenantId,
            userId: event.userId
          }
        });
      }
      
      // Calculate risk async
      RiskEngine.evaluateTaskRisk(event.taskId).catch(console.error);

      // If assigned, balance workload
      if (event.data.assigneeId) {
         WorkloadEngine.evaluateUserWorkload(event.data.assigneeId).catch(console.error);
      }
    }
  });

  // 3. Handle Assignment -> Update Workload Engine
  taskEventBus.registerHandler('TASK_ASSIGNED', {
    handle: async (event: TaskAssignedEvent) => {
       if (event.tenantId) {
          await prisma.activityLog.create({
              data: {
                  action: 'TASK_ASSIGNED',
                  entity: 'TASK',
                  entityId: event.taskId,
                  metadata: { assigneeId: event.data.assigneeId, previousAssigneeId: event.data.previousAssigneeId },
                  tenantId: event.tenantId,
                  userId: event.userId
              }
          });
       }

       // Evaluate the workload of the new assignee
       WorkloadEngine.evaluateUserWorkload(event.data.assigneeId).catch(console.error);
       
       // Evaluate the workload of the previous assignee if there was one
       if (event.data.previousAssigneeId) {
           WorkloadEngine.evaluateUserWorkload(event.data.previousAssigneeId).catch(console.error);
       }
    }
  });

  // 4. Handle Completion
  taskEventBus.registerHandler('TASK_COMPLETED', {
    handle: async (event: TaskCompletedEvent) => {
      if (event.tenantId) {
          await prisma.activityLog.create({
              data: {
                  action: 'TASK_COMPLETED',
                  entity: 'TASK',
                  entityId: event.taskId,
                  metadata: { completedAt: event.data.completedAt, quality: event.data.quality },
                  tenantId: event.tenantId,
                  userId: event.userId
              }
          });
      }

      // Check dependents and unblock them if possible
      const task = await prisma.task.findUnique({
          where: { id: event.taskId },
          include: { dependedBy: true }
      });

      if (task && task.dependedBy.length > 0) {
          // This would be a more complex check in a real system, seeing if ALL dependencies are met
          // For now, we will log that dependents might be unblocked
          console.log(`Task ${event.taskId} completed. Dependents might be unblocked.`);
      }
    }
  });
  
  // 5. Handle General Updates (Title, Priority, etc.)
  taskEventBus.registerHandler('TASK_UPDATED', {
    handle: async (event: any) => {
      // Re-evaluate risk on any significant data change
      RiskEngine.evaluateTaskRisk(event.taskId).catch(console.error);
    }
  });

  console.log('✅ Enterprise Task Event Handlers Registered');
}

// Auto-register on import
registerTaskEventHandlers();

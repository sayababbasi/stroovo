import { NotificationEventType, NotificationEventKind, NotificationEvent } from './types';
import type { NotificationEngine } from './engine';

// Use dynamic import or singleton accessor to avoid circular dependency
let engine: any = null;
const getEngine = () => {
  if (!engine) {
    // Late-bind the engine to avoid circular reference at module load time
    const { notificationEngine } = require('./engine');
    engine = notificationEngine;
  }
  return engine;
};

export class NotificationEventEmitter {
  /**
   * Trigger task assigned notification
   */
  async taskAssigned(params: {
    taskId: string;
    taskTitle: string;
    assigneeId: string;
    assignerId: string;
    projectId: string;
    projectName: string;
    priority: string;
    dueDate?: Date;
    tenantId: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      id: `task_${params.taskId}_${Date.now()}`,
      type: NotificationEventType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${params.taskTitle}" in project "${params.projectName}"`,
      priority: this.mapPriority(params.priority),
      userId: params.assigneeId,
      tenantId: params.tenantId,
      link: `/projects/${params.projectId}/tasks/${params.taskId}`,
      metadata: {
        taskId: params.taskId,
        projectId: params.projectId,
        assignerId: params.assignerId,
        dueDate: params.dueDate
      }
    };

    await getEngine().sendNotification(event);
  }

  /**
   * Trigger task completed notification
   */
  async taskCompleted(params: {
    taskId: string;
    taskTitle: string;
    completedById: string;
    completedByName: string;
    projectId: string;
    projectName: string;
    managerId: string;
    tenantId: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      id: `task_complete_${params.taskId}_${Date.now()}`,
      type: NotificationEventType.TASK_COMPLETED,
      title: 'Task Completed',
      message: `${params.completedByName} completed task: "${params.taskTitle}" in project "${params.projectName}"`,
      priority: 'MEDIUM',
      userId: params.managerId,
      tenantId: params.tenantId,
      link: `/projects/${params.projectId}/tasks/${params.taskId}`,
      metadata: {
        taskId: params.taskId,
        projectId: params.projectId,
        completedById: params.completedById
      }
    };

    await getEngine().sendNotification(event);
  }

  /**
   * Trigger deadline approaching notification
   */
  async deadlineNear(params: {
    taskId: string;
    taskTitle: string;
    assigneeId: string;
    dueDate: Date;
    projectId: string;
    projectName: string;
    hoursUntil: number;
    tenantId: string;
  }): Promise<void> {
    const urgency = this.getDeadlineUrgency(params.hoursUntil);
    
    const event: NotificationEvent = {
      id: `deadline_${params.taskId}_${Date.now()}`,
      type: NotificationEventType.DEADLINE_NEAR,
      title: `Deadline ${urgency.label}`,
      message: `Task "${params.taskTitle}" is due in ${params.hoursUntil} hours`,
      priority: urgency.priority,
      userId: params.assigneeId,
      tenantId: params.tenantId,
      link: `/projects/${params.projectId}/tasks/${params.taskId}`,
      metadata: {
        taskId: params.taskId,
        projectId: params.projectId,
        dueDate: params.dueDate,
        hoursUntil: params.hoursUntil
      }
    };

    await getEngine().sendNotification(event);
  }

  /**
   * Trigger risk detected notification
   */
  async riskDetected(params: {
    riskType: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    projectId?: string;
    projectName?: string;
    userId: string;
    tenantId: string;
    affectedUsers?: string[];
  }): Promise<void> {
    const event: NotificationEvent = {
      id: `risk_${params.riskType}_${Date.now()}`,
      type: NotificationEventType.RISK_DETECTED,
      title: `${params.riskLevel} Risk Detected`,
      message: `${params.description}${params.projectName ? ` in project "${params.projectName}"` : ''}`,
      priority: params.riskLevel === 'CRITICAL' ? 'URGENT' : params.riskLevel,
      userId: params.userId,
      tenantId: params.tenantId,
      link: params.projectId ? `/projects/${params.projectId}` : '/ai/alerts',
      metadata: {
        riskType: params.riskType,
        riskLevel: params.riskLevel,
        projectId: params.projectId,
        affectedUsers: params.affectedUsers
      }
    };

    await getEngine().sendNotification(event);

    // Also notify affected users if specified
    if (params.affectedUsers && params.affectedUsers.length > 0) {
      for (const affectedUserId of params.affectedUsers) {
        if (affectedUserId !== params.userId) {
          const affectedEvent: NotificationEvent = {
            ...event,
            id: `risk_${params.riskType}_${affectedUserId}_${Date.now()}`,
            userId: affectedUserId
          };
          await getEngine().sendNotification(affectedEvent);
        }
      }
    }
  }

  /**
   * Trigger project created notification
   */
  async projectCreated(params: {
    projectId: string;
    projectName: string;
    createdById: string;
    createdByName: string;
    managerId: string;
    tenantId: string;
    teamMemberIds?: string[];
  }): Promise<void> {
    // Notify manager
    const managerEvent: NotificationEvent = {
      id: `project_created_${params.projectId}_${Date.now()}`,
      type: NotificationEventType.PROJECT_CREATED,
      title: 'New Project Created',
      message: `${params.createdByName} created new project: "${params.projectName}"`,
      priority: 'MEDIUM',
      userId: params.managerId,
      tenantId: params.tenantId,
      link: `/projects/${params.projectId}`,
      metadata: {
        projectId: params.projectId,
        createdById: params.createdById
      }
    };

    await getEngine().sendNotification(managerEvent);

    // Notify team members if specified
    if (params.teamMemberIds && params.teamMemberIds.length > 0) {
      for (const teamMemberId of params.teamMemberIds) {
        const teamEvent: NotificationEvent = {
          ...managerEvent,
          id: `project_created_${params.projectId}_${teamMemberId}_${Date.now()}`,
          userId: teamMemberId,
          message: `You were added to new project: "${params.projectName}"`
        };
        await getEngine().sendNotification(teamEvent);
      }
    }
  }

  /**
   * Trigger user mentioned notification
   */
  async userMentioned(params: {
    mentionedUserId: string;
    mentionedByUserId: string;
    mentionedByUserName: string;
    entityType: 'task' | 'comment' | 'project';
    entityId: string;
    entityTitle: string;
    projectId?: string;
    projectName?: string;
    tenantId: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      id: `mention_${params.entityId}_${params.mentionedUserId}_${Date.now()}`,
      type: NotificationEventType.USER_MENTIONED,
      title: 'You Were Mentioned',
      message: `${params.mentionedByUserName} mentioned you in ${params.entityType}: "${params.entityTitle}"`,
      priority: 'MEDIUM',
      userId: params.mentionedUserId,
      tenantId: params.tenantId,
      link: params.entityType === 'task' && params.projectId 
        ? `/projects/${params.projectId}/tasks/${params.entityId}`
        : `/projects/${params.projectId}`,
      metadata: {
        entityType: params.entityType,
        entityId: params.entityId,
        mentionedByUserId: params.mentionedByUserId,
        projectId: params.projectId
      }
    };

    await getEngine().sendNotification(event);
  }

  /**
   * Trigger high workload notification
   */
  async workloadHigh(params: {
    userId: string;
    userName: string;
    activeTasksCount: number;
    overdueTasksCount: number;
    tenantId: string;
    managerId?: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      id: `workload_${params.userId}_${Date.now()}`,
      type: NotificationEventType.WORKLOAD_HIGH,
      title: 'High Workload Alert',
      message: `${params.userName} has ${params.activeTasksCount} active tasks (${params.overdueTasksCount} overdue)`,
      priority: params.overdueTasksCount > 0 ? 'HIGH' : 'MEDIUM',
      userId: params.managerId || params.userId,
      tenantId: params.tenantId,
      link: '/dashboard',
      metadata: {
        userId: params.userId,
        activeTasksCount: params.activeTasksCount,
        overdueTasksCount: params.overdueTasksCount
      }
    };

    await getEngine().sendNotification(event);
  }

  /**
   * Trigger automation triggered notification
   */
  async automationTriggered(params: {
    ruleName: string;
    action: string;
    triggeredBy: string;
    userId: string;
    tenantId: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const event: NotificationEvent = {
      id: `automation_${params.ruleName}_${Date.now()}`,
      type: NotificationEventType.AUTOMATION_TRIGGERED,
      title: 'Automation Triggered',
      message: `Automation "${params.ruleName}" executed: ${params.action}`,
      priority: 'LOW',
      userId: params.userId,
      tenantId: params.tenantId,
      metadata: {
        ruleName: params.ruleName,
        action: params.action,
        triggeredBy: params.triggeredBy,
        ...params.metadata
      }
    };

    await getEngine().sendNotification(event);
  }

  /**
   * Trigger form submission notification
   */
  async formSubmission(params: {
    formName: string;
    submittedBy: string;
    submissionData: Record<string, any>;
    userId: string;
    tenantId: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      id: `form_${params.formName}_${Date.now()}`,
      type: NotificationEventType.FORM_SUBMISSION,
      title: 'New Form Submission',
      message: `A new submission was received for form: "${params.formName}"`,
      priority: 'MEDIUM',
      userId: params.userId,
      tenantId: params.tenantId,
      metadata: {
        formName: params.formName,
        submittedBy: params.submittedBy,
        ...params.submissionData,
        emailProfile: 'CUSTOMER_SERVICE' // Route to customer service email
      }
    };

    await getEngine().sendNotification(event);
  }

  /**
   * Map task priority to notification priority
   */
  private mapPriority(taskPriority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    switch (taskPriority.toUpperCase()) {
      case 'URGENT':
        return 'URGENT';
      case 'HIGH':
        return 'HIGH';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'LOW':
      default:
        return 'LOW';
    }
  }

  /**
   * Get deadline urgency based on hours until due
   */
  private getDeadlineUrgency(hoursUntil: number): { label: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' } {
    if (hoursUntil <= 2) {
      return { label: 'Very Soon', priority: 'URGENT' };
    } else if (hoursUntil <= 8) {
      return { label: 'Today', priority: 'HIGH' };
    } else if (hoursUntil <= 24) {
      return { label: 'Tomorrow', priority: 'MEDIUM' };
    } else {
      return { label: 'Approaching', priority: 'LOW' };
    }
  }
}

// Export singleton instance
export const notificationEvents = new NotificationEventEmitter();

/**
 * Utility function to trigger notifications from API routes
 */
export async function triggerNotificationEvent(
  eventType: NotificationEventType,
  params: Record<string, any>
): Promise<void> {
  switch (eventType) {
    case NotificationEventType.TASK_ASSIGNED:
      await notificationEvents.taskAssigned(params as any);
      break;
    case NotificationEventType.TASK_COMPLETED:
      await notificationEvents.taskCompleted(params as any);
      break;
    case NotificationEventType.DEADLINE_NEAR:
      await notificationEvents.deadlineNear(params as any);
      break;
    case NotificationEventType.RISK_DETECTED:
      await notificationEvents.riskDetected(params as any);
      break;
    case NotificationEventType.PROJECT_CREATED:
      await notificationEvents.projectCreated(params as any);
      break;
    case NotificationEventType.USER_MENTIONED:
      await notificationEvents.userMentioned(params as any);
      break;
    case NotificationEventType.WORKLOAD_HIGH:
      await notificationEvents.workloadHigh(params as any);
      break;
    case NotificationEventType.AUTOMATION_TRIGGERED:
      await notificationEvents.automationTriggered(params as any);
      break;
    case NotificationEventType.FORM_SUBMISSION:
      await notificationEvents.formSubmission(params as any);
      break;
    default:
      console.warn(`Unknown notification event type: ${eventType}`);
  }
}

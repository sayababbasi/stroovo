import { EventEmitter } from 'events';
import { TaskStatus, TaskPriority } from '@prisma/client';

// Enterprise Event-Driven Task System
// Every task action emits structured events that trigger workflows

export interface TaskEventPayload {
  taskId: string;
  userId: string;
  tenantId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Core Task Events
export interface TaskCreatedEvent extends TaskEventPayload {
  type: 'TASK_CREATED';
  data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assigneeId?: string;
    projectId: string;
    dueDate?: Date;
    estimatedHours?: number;
  };
}

export interface TaskUpdatedEvent extends TaskEventPayload {
  type: 'TASK_UPDATED';
  data: {
    field: string;
    oldValue: any;
    newValue: any;
    reason?: string;
  };
}

export interface TaskAssignedEvent extends TaskEventPayload {
  type: 'TASK_ASSIGNED';
  data: {
    assigneeId: string;
    previousAssigneeId?: string;
    assignedBy: string;
    priority: TaskPriority;
    dueDate?: Date;
  };
}

export interface TaskStatusChangedEvent extends TaskEventPayload {
  type: 'TASK_STATUS_CHANGED';
  data: {
    oldStatus: TaskStatus;
    newStatus: TaskStatus;
    changedBy: string;
    reason?: string;
  };
}

export interface TaskCompletedEvent extends TaskEventPayload {
  type: 'TASK_COMPLETED';
  data: {
    completedAt: Date;
    completedBy: string;
    actualHours?: number;
    quality: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT';
  };
}

export interface TaskDelayedEvent extends TaskEventPayload {
  type: 'TASK_DELAYED';
  data: {
    originalDueDate: Date;
    newDueDate: Date;
    delayReason: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface TaskBlockedEvent extends TaskEventPayload {
  type: 'TASK_BLOCKED';
  data: {
    blockedBy: string;
    blockReason: string;
    blockedAt: Date;
    dependencies: string[];
  };
}

export interface TaskUnblockedEvent extends TaskEventPayload {
  type: 'TASK_UNBLOCKED';
  data: {
    unblockedBy: string;
    unblockedAt: Date;
    resolution: string;
  };
}

export interface TaskDependencyAddedEvent extends TaskEventPayload {
  type: 'TASK_DEPENDENCY_ADDED';
  data: {
    taskId: string;
    dependsOnTaskId: string;
    type: string;
  };
}

export interface TaskRiskChangedEvent extends TaskEventPayload {
  type: 'TASK_RISK_CHANGED';
  data: {
    oldRiskScore: number;
    newRiskScore: number;
    riskFactors: string[];
    recommendations: string[];
  };
}

export interface TaskWorkloadChangedEvent extends TaskEventPayload {
  type: 'TASK_WORKLOAD_CHANGED';
  data: {
    assigneeId: string;
    previousWorkload: number;
    newWorkload: number;
    utilizationRate: number;
  };
}

export interface TaskCommentAddedEvent extends TaskEventPayload {
  type: 'TASK_COMMENT_ADDED';
  data: {
    commentId: string;
    content: string;
    isInternal: boolean;
    mentions: string[];
  };
}

export interface TaskFileAttachedEvent extends TaskEventPayload {
  type: 'TASK_FILE_ATTACHED';
  data: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  };
}

// Union type for all task events
export type TaskEvent = 
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskAssignedEvent
  | TaskStatusChangedEvent
  | TaskCompletedEvent
  | TaskDelayedEvent
  | TaskBlockedEvent
  | TaskUnblockedEvent
  | TaskDependencyAddedEvent
  | TaskRiskChangedEvent
  | TaskWorkloadChangedEvent
  | TaskCommentAddedEvent
  | TaskFileAttachedEvent;

// Event Handler Interface
export interface TaskEventHandler<T extends TaskEvent = TaskEvent> {
  handle(event: T): Promise<void>;
}

// Event Bus for Task Events
export class TaskEventBus extends EventEmitter {
  private static instance: TaskEventBus;
  private eventHistory: Map<string, TaskEvent[]> = new Map();
  private handlers: Map<string, TaskEventHandler[]> = new Map();

  private constructor() {
    super();
    this.setupMaxListeners();
  }

  public static getInstance(): TaskEventBus {
    if (!TaskEventBus.instance) {
      TaskEventBus.instance = new TaskEventBus();
    }
    return TaskEventBus.instance;
  }

  private setupMaxListeners(): void {
    // Set high max listeners for enterprise scale
    this.setMaxListeners(1000);
  }

  /**
   * Emit a task event
   */
  public async emitTaskEvent<T extends TaskEvent>(event: T): Promise<void> {
    // Store in history
    const taskId = event.taskId;
    if (!this.eventHistory.has(taskId)) {
      this.eventHistory.set(taskId, []);
    }
    this.eventHistory.get(taskId)!.push(event);

    // Emit to registered listeners
    this.emit(event.type, event);
    
    // Log event for debugging
    console.log(`[TaskEvent] ${event.type} emitted for task ${taskId} by user ${event.userId}`);
  }

  /**
   * Register an event handler
   */
  public registerHandler<T extends TaskEvent>(eventType: T['type'], handler: TaskEventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as TaskEventHandler);
    
    // Register with EventEmitter
    this.on(eventType, async (event: T) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
        // Continue processing other handlers even if one fails
      }
    });
  }

  /**
   * Get event history for a task
   */
  public getTaskEventHistory(taskId: string): TaskEvent[] {
    return this.eventHistory.get(taskId) || [];
  }

  /**
   * Get recent events across all tasks
   */
  public getRecentEvents(limit: number = 100): TaskEvent[] {
    const allEvents: TaskEvent[] = [];
    
    for (const events of this.eventHistory.values()) {
      allEvents.push(...events);
    }
    
    return allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear event history (useful for testing)
   */
  public clearHistory(): void {
    this.eventHistory.clear();
  }

  /**
   * Get event statistics
   */
  public getEventStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByTask: Record<string, number>;
  } {
    const stats = {
      totalEvents: 0,
      eventsByType: {} as Record<string, number>,
      eventsByTask: {} as Record<string, number>
    };

    for (const [taskId, events] of this.eventHistory.entries()) {
      stats.eventsByTask[taskId] = events.length;
      stats.totalEvents += events.length;
      
      for (const event of events) {
        stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
      }
    }

    return stats;
  }
}

// Event Factory Functions
export class TaskEventFactory {
  /**
   * Create a task created event
   */
  public static createTaskCreatedEvent(
    taskId: string,
    userId: string,
    data: TaskCreatedEvent['data'],
    tenantId?: string
  ): TaskCreatedEvent {
    return {
      type: 'TASK_CREATED',
      taskId,
      userId,
      tenantId,
      timestamp: new Date(),
      data
    };
  }

  /**
   * Create a task assigned event
   */
  public static createTaskAssignedEvent(
    taskId: string,
    userId: string,
    assigneeId: string,
    previousAssigneeId: string | undefined,
    assignedBy: string,
    priority: TaskPriority,
    dueDate?: Date,
    tenantId?: string
  ): TaskAssignedEvent {
    return {
      type: 'TASK_ASSIGNED',
      taskId,
      userId,
      tenantId,
      timestamp: new Date(),
      data: {
        assigneeId,
        previousAssigneeId,
        assignedBy,
        priority,
        dueDate
      }
    };
  }

  /**
   * Create a task status changed event
   */
  public static createTaskStatusChangedEvent(
    taskId: string,
    userId: string,
    oldStatus: TaskStatus,
    newStatus: TaskStatus,
    changedBy: string,
    reason?: string,
    tenantId?: string
  ): TaskStatusChangedEvent {
    return {
      type: 'TASK_STATUS_CHANGED',
      taskId,
      userId,
      tenantId,
      timestamp: new Date(),
      data: {
        oldStatus,
        newStatus,
        changedBy,
        reason
      }
    };
  }

  /**
   * Create a task completed event
   */
  public static createTaskCompletedEvent(
    taskId: string,
    userId: string,
    completedBy: string,
    actualHours?: number,
    quality: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' = 'GOOD',
    tenantId?: string
  ): TaskCompletedEvent {
    return {
      type: 'TASK_COMPLETED',
      taskId,
      userId,
      tenantId,
      timestamp: new Date(),
      data: {
        completedAt: new Date(),
        completedBy,
        actualHours,
        quality
      }
    };
  }

  /**
   * Create a task risk changed event
   */
  public static createTaskRiskChangedEvent(
    taskId: string,
    userId: string,
    oldRiskScore: number,
    newRiskScore: number,
    riskFactors: string[],
    recommendations: string[],
    tenantId?: string
  ): TaskRiskChangedEvent {
    return {
      type: 'TASK_RISK_CHANGED',
      taskId,
      userId,
      tenantId,
      timestamp: new Date(),
      data: {
        oldRiskScore,
        newRiskScore,
        riskFactors,
        recommendations
      }
    };
  }
}

// Global event bus instance
export const taskEventBus = TaskEventBus.getInstance();

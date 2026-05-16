import { TaskStatus } from '@prisma/client';

// Enterprise Task State Machine
// Implements strict state transitions with validation and business rules

export type TaskEvent = 
  | 'CREATE'
  | 'START'
  | 'PROGRESS'
  | 'COMPLETE'
  | 'BLOCK'
  | 'UNBLOCK'
  | 'REVIEW'
  | 'APPROVE'
  | 'REJECT'
  | 'ASSIGN'
  | 'REASSIGN'
  | 'ARCHIVE';

export interface StateTransition {
  from: TaskStatus;
  to: TaskStatus;
  event: TaskEvent;
  conditions?: TransitionCondition[];
  actions?: TransitionAction[];
}

export interface TransitionCondition {
  type: 'HAS_ASSIGNEE' | 'HAS_DUE_DATE' | 'HAS_DEPENDENCIES_COMPLETE' | 'IS_REVIEWER' | 'CUSTOM';
  validate: (context: TransitionContext) => boolean;
  errorMessage: string;
}

export interface TransitionAction {
  type: 'LOG_ACTIVITY' | 'NOTIFY_ASSIGNEE' | 'NOTIFY_MANAGER' | 'UPDATE_PROGRESS' | 'CALCULATE_RISK' | 'CUSTOM';
  execute: (context: TransitionContext) => Promise<void>;
}

export interface TransitionContext {
  task: any;
  user: any;
  previousState?: TaskStatus;
  newState: TaskStatus;
  event: TaskEvent;
  metadata?: Record<string, any>;
}

// Define valid state transitions
export const STATE_TRANSITIONS: StateTransition[] = [
  // Initial creation
  {
    from: 'BACKLOG' as TaskStatus,
    to: 'TODO' as TaskStatus,
    event: 'CREATE',
    conditions: [
      {
        type: 'HAS_ASSIGNEE',
        validate: (ctx) => !!ctx.task.assigneeId,
        errorMessage: 'Task must have an assignee to move from Backlog'
      }
    ],
    actions: [
      {
        type: 'LOG_ACTIVITY',
        execute: async (ctx) => {
          console.log(`Task ${ctx.task.id} created and assigned to ${ctx.task.assigneeId}`);
        }
      }
    ]
  },

  // Start work
  {
    from: 'TODO' as TaskStatus,
    to: 'IN_PROGRESS' as TaskStatus,
    event: 'START',
    conditions: [
      {
        type: 'HAS_ASSIGNEE',
        validate: (ctx) => !!ctx.task.assigneeId,
        errorMessage: 'Task must have an assignee to start work'
      },
      {
        type: 'HAS_DEPENDENCIES_COMPLETE',
        validate: (ctx) => {
          // Check if all dependencies are complete
          return ctx.task.blockedByCount === 0;
        },
        errorMessage: 'Cannot start task: dependencies not completed'
      }
    ],
    actions: [
      {
        type: 'NOTIFY_MANAGER',
        execute: async (ctx) => {
          console.log(`Notifying manager: Task ${ctx.task.id} started by ${ctx.user.id}`);
        }
      },
      {
        type: 'CALCULATE_RISK',
        execute: async (ctx) => {
          console.log(`Recalculating risk for task ${ctx.task.id}`);
        }
      }
    ]
  },

  // Submit for review
  {
    from: 'IN_PROGRESS' as TaskStatus,
    to: 'REVIEW' as TaskStatus,
    event: 'REVIEW',
    conditions: [
      {
        type: 'CUSTOM',
        validate: (ctx) => {
          // Check if progress is at least 80%
          return ctx.task.progress >= 80;
        },
        errorMessage: 'Task must be at least 80% complete to submit for review'
      }
    ],
    actions: [
      {
        type: 'NOTIFY_ASSIGNEE',
        execute: async (ctx) => {
          console.log(`Notifying reviewer: Task ${ctx.task.id} ready for review`);
        }
      }
    ]
  },

  // Complete task
  {
    from: 'REVIEW' as TaskStatus,
    to: 'DONE' as TaskStatus,
    event: 'APPROVE',
    conditions: [
      {
        type: 'IS_REVIEWER',
        validate: (ctx) => {
          return ctx.user.id === ctx.task.reviewerId || ctx.user.role === 'ADMIN';
        },
        errorMessage: 'Only assigned reviewer or admin can approve task'
      }
    ],
    actions: [
      {
        type: 'UPDATE_PROGRESS',
        execute: async (ctx) => {
          ctx.task.progress = 100;
        }
      },
      {
        type: 'NOTIFY_ASSIGNEE',
        execute: async (ctx) => {
          console.log(`Notifying assignee: Task ${ctx.task.id} approved and completed`);
        }
      }
    ]
  },

  // Reject from review
  {
    from: 'REVIEW' as TaskStatus,
    to: 'IN_PROGRESS' as TaskStatus,
    event: 'REJECT',
    conditions: [
      {
        type: 'IS_REVIEWER',
        validate: (ctx) => {
          return ctx.user.id === ctx.task.reviewerId || ctx.user.role === 'ADMIN';
        },
        errorMessage: 'Only assigned reviewer or admin can reject task'
      }
    ],
    actions: [
      {
        type: 'NOTIFY_ASSIGNEE',
        execute: async (ctx) => {
          console.log(`Notifying assignee: Task ${ctx.task.id} rejected, needs more work`);
        }
      }
    ]
  },

  // Block task
  {
    from: 'TODO' as TaskStatus,
    to: 'BLOCKED' as TaskStatus,
    event: 'BLOCK',
    actions: [
      {
        type: 'NOTIFY_MANAGER',
        execute: async (ctx) => {
          console.log(`Alerting manager: Task ${ctx.task.id} is blocked`);
        }
      }
    ]
  },
  {
    from: 'IN_PROGRESS' as TaskStatus,
    to: 'BLOCKED' as TaskStatus,
    event: 'BLOCK',
    actions: [
      {
        type: 'NOTIFY_MANAGER',
        execute: async (ctx) => {
          console.log(`Alerting manager: Task ${ctx.task.id} is blocked during work`);
        }
      }
    ]
  },

  // Unblock task
  {
    from: 'BLOCKED' as TaskStatus,
    to: 'TODO' as TaskStatus,
    event: 'UNBLOCK',
    conditions: [
      {
        type: 'HAS_DEPENDENCIES_COMPLETE',
        validate: (ctx) => {
          return ctx.task.blockedByCount === 0;
        },
        errorMessage: 'Cannot unblock task: dependencies still not completed'
      }
    ]
  },

  // Archive completed tasks
  {
    from: 'DONE' as TaskStatus,
    to: 'BACKLOG' as TaskStatus,
    event: 'ARCHIVE',
    conditions: [
      {
        type: 'CUSTOM',
        validate: (ctx) => {
          return ctx.user.role === 'ADMIN' || ctx.user.role === 'PROJECT_MANAGER';
        },
        errorMessage: 'Only admin or project manager can archive tasks'
      }
    ]
  }
];

export class TaskStateMachine {
  private transitions: Map<string, StateTransition[]> = new Map();

  constructor() {
    this.initializeTransitions();
  }

  private initializeTransitions(): void {
    for (const transition of STATE_TRANSITIONS) {
      const key = `${transition.from}-${transition.event}`;
      if (!this.transitions.has(key)) {
        this.transitions.set(key, []);
      }
      this.transitions.get(key)!.push(transition);
    }
  }

  /**
   * Check if a transition is valid
   */
  public canTransition(from: TaskStatus, event: TaskEvent): boolean {
    const key = `${from}-${event}`;
    return this.transitions.has(key);
  }

  /**
   * Get possible target states for a transition
   */
  public getPossibleStates(from: TaskStatus, event: TaskEvent): TaskStatus[] {
    const key = `${from}-${event}`;
    const transitions = this.transitions.get(key);
    return transitions ? transitions.map(t => t.to) : [];
  }

  /**
   * Validate and execute a state transition
   */
  public async transition(
    task: any,
    event: TaskEvent,
    user: any,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; newState?: TaskStatus; error?: string }> {
    const from = task.status as TaskStatus;
    const key = `${from}-${event}`;
    const transitions = this.transitions.get(key);

    if (!transitions || transitions.length === 0) {
      return {
        success: false,
        error: `Invalid transition: ${from} -> ${event}. No valid transitions found.`
      };
    }

    // For now, we'll use the first valid transition
    // In a more complex system, you might have multiple transitions for the same event
    const transition = transitions[0];
    const context: TransitionContext = {
      task,
      user,
      previousState: from,
      newState: transition.to,
      event,
      metadata
    };

    // Validate conditions
    if (transition.conditions) {
      for (const condition of transition.conditions) {
        if (!condition.validate(context)) {
          return {
            success: false,
            error: condition.errorMessage
          };
        }
      }
    }

    // Execute actions
    if (transition.actions) {
      for (const action of transition.actions) {
        try {
          await action.execute(context);
        } catch (error) {
          console.error(`Failed to execute action ${action.type}:`, error);
          // Continue executing other actions even if one fails
        }
      }
    }

    return {
      success: true,
      newState: transition.to
    };
  }

  /**
   * Get all possible transitions from current state
   */
  public getAvailableTransitions(currentState: TaskStatus): TaskEvent[] {
    const events = new Set<TaskEvent>();
    
    for (const [key, transitions] of this.transitions.entries()) {
      if (key.startsWith(currentState.toString())) {
        const event = key.split('-')[1] as TaskEvent;
        events.add(event);
      }
    }
    
    return Array.from(events);
  }

  /**
   * Get state transition history for a task
   */
  public getTransitionHistory(taskId: string): Promise<any[]> {
    // This would typically query the TaskActivity table
    // For now, return empty array
    return Promise.resolve([]);
  }
}

// Singleton instance
export const taskStateMachine = new TaskStateMachine();

// Helper functions for common transitions
export const TaskTransitions = {
  canStart: (task: any): boolean => taskStateMachine.canTransition(task.status, 'START'),
  canComplete: (task: any): boolean => taskStateMachine.canTransition(task.status, 'APPROVE'),
  canBlock: (task: any): boolean => taskStateMachine.canTransition(task.status, 'BLOCK'),
  canReview: (task: any): boolean => taskStateMachine.canTransition(task.status, 'REVIEW'),
  
  getNextStates: (task: any, event: TaskEvent): TaskStatus[] => {
    return taskStateMachine.getPossibleStates(task.status, event);
  },
  
  getAvailableActions: (task: any): TaskEvent[] => {
    return taskStateMachine.getAvailableTransitions(task.status);
  }
};

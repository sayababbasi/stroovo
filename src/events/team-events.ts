import { EventEmitter } from 'events';

// ──────────────────────────────────────
// Team Event System
// Mirrors the task event architecture
// for consistency across the platform.
// ──────────────────────────────────────

export interface TeamEventPayload {
  teamId: string;
  userId: string;
  tenantId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ── Event Types ──────────────────────

export interface TeamCreatedEvent extends TeamEventPayload {
  type: 'TEAM_CREATED';
  data: { name: string; description?: string };
}

export interface TeamUpdatedEvent extends TeamEventPayload {
  type: 'TEAM_UPDATED';
  data: { field: string; oldValue: any; newValue: any };
}

export interface TeamDeletedEvent extends TeamEventPayload {
  type: 'TEAM_DELETED';
  data: { name: string };
}

export interface MemberAddedEvent extends TeamEventPayload {
  type: 'MEMBER_ADDED';
  data: { memberId: string; memberName: string; role?: string };
}

export interface MemberRemovedEvent extends TeamEventPayload {
  type: 'MEMBER_REMOVED';
  data: { memberId: string; memberName: string };
}

export interface TaskAssignedInTeamEvent extends TeamEventPayload {
  type: 'TEAM_TASK_ASSIGNED';
  data: {
    taskId: string;
    assigneeIds: string[];
    assignedBy: string;
  };
}

export interface WorkloadCalculatedEvent extends TeamEventPayload {
  type: 'WORKLOAD_CALCULATED';
  data: {
    memberWorkloads: Array<{
      userId: string;
      activeTasks: number;
      completedTasks: number;
      workloadPercentage: number;
    }>;
  };
}

export interface MemberUpdatedEvent extends TeamEventPayload {
  type: 'MEMBER_UPDATED';
  data: { memberId: string; field: string; oldValue?: any; newValue: any };
}

export interface TeamActionExecutedEvent extends TeamEventPayload {
  type: 'TEAM_ACTION_EXECUTED';
  data: { action: string; logId?: string; [key: string]: any };
}

export interface TaskSuggestedEvent extends TeamEventPayload {
  type: 'TASK_SUGGESTED';
  data: { taskId: string; suggestedUserId: string; score: number; [key: string]: any };
}

// ── Union type ───────────────────────

export type TeamEvent =
  | TeamCreatedEvent
  | TeamUpdatedEvent
  | TeamDeletedEvent
  | MemberAddedEvent
  | MemberRemovedEvent
  | MemberUpdatedEvent
  | TeamActionExecutedEvent
  | TaskSuggestedEvent
  | TaskAssignedInTeamEvent
  | WorkloadCalculatedEvent;

// ── Event Bus ────────────────────────

export class TeamEventBus extends EventEmitter {
  private static instance: TeamEventBus;
  private history: TeamEvent[] = [];

  private constructor() {
    super();
    this.setMaxListeners(500);
  }

  public static getInstance(): TeamEventBus {
    if (!TeamEventBus.instance) {
      TeamEventBus.instance = new TeamEventBus();
    }
    return TeamEventBus.instance;
  }

  public async emitTeamEvent<T extends TeamEvent>(event: T): Promise<void> {
    this.history.push(event);
    // Keep history bounded
    if (this.history.length > 10000) {
      this.history = this.history.slice(-5000);
    }
    this.emit(event.type, event);
    console.log(`[TeamEvent] ${event.type} for team ${event.teamId} by ${event.userId}`);
  }

  public getRecentEvents(limit = 100): TeamEvent[] {
    return this.history.slice(-limit).reverse();
  }

  public getTeamHistory(teamId: string): TeamEvent[] {
    return this.history.filter(e => e.teamId === teamId);
  }
}

export const teamEventBus = TeamEventBus.getInstance();

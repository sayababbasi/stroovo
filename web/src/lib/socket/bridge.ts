import { taskEventBus, TaskEvent } from '@/events/task-events';
import { teamEventBus, TeamEvent } from '@/events/team-events';
import { broadcast } from '@/lib/socket/server';

// ──────────────────────────────────────
// EventSocketBridge
// Bridges internal Node.js events to
// real-time WebSocket broadcasts.
// ──────────────────────────────────────

export class EventSocketBridge {
  private static instance: EventSocketBridge;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): EventSocketBridge {
    if (!EventSocketBridge.instance) {
      EventSocketBridge.instance = new EventSocketBridge();
    }
    return EventSocketBridge.instance;
  }

  public init() {
    if (this.isInitialized) return;

    console.log('[Bridge] Initializing Event-to-Socket Bridge...');

    // 1. Subscribe to Task Events
    const taskEventTypes: TaskEvent['type'][] = [
      'TASK_CREATED',
      'TASK_UPDATED',
      'TASK_STATUS_CHANGED',
      'TASK_ASSIGNED',
      'TASK_COMPLETED'
    ];

    taskEventTypes.forEach(type => {
      taskEventBus.on(type, (event: TaskEvent) => {
        console.log(`[Bridge] Forwarding ${type} to WebSocket`);
        // Broadcast to tenant-specific room and global updates
        if (event.tenantId) {
          broadcast(type, event, `tenant-${event.tenantId}`);
        }
        broadcast(type, event);
      });
    });

    // 2. Subscribe to Team Events
    const teamEventTypes: TeamEvent['type'][] = [
      'TEAM_CREATED',
      'TEAM_UPDATED',
      'MEMBER_ADDED',
      'MEMBER_REMOVED',
      'WORKLOAD_CALCULATED'
    ];

    teamEventTypes.forEach(type => {
      teamEventBus.on(type, (event: TeamEvent) => {
        console.log(`[Bridge] Forwarding ${type} to WebSocket`);
        // Broadcast to team-specific room
        broadcast(type, event, `team-${event.teamId}`);
        if (event.tenantId) {
          broadcast(type, event, `tenant-${event.tenantId}`);
        }
      });
    });

    this.isInitialized = true;
  }
}

export const eventSocketBridge = EventSocketBridge.getInstance();

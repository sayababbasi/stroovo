import { EventEmitter } from 'events';

export type ProjectEventType = 
  | 'PROJECT_CREATED' 
  | 'PROJECT_UPDATED' 
  | 'PROJECT_DELETED' 
  | 'PROJECT_RISK_UPDATED'
  | 'PROJECT_HEALTH_CHANGED';

export interface ProjectEventPayload {
  projectId: string;
  userId: string;
  tenantId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ProjectCreatedEvent extends ProjectEventPayload {
  type: 'PROJECT_CREATED';
  data: {
    name: string;
    managerId: string;
    status: string;
  };
}

export interface ProjectUpdatedEvent extends ProjectEventPayload {
  type: 'PROJECT_UPDATED';
  data: {
    changes: Record<string, any>;
  };
}

export interface ProjectHealthChangedEvent extends ProjectEventPayload {
  type: 'PROJECT_HEALTH_CHANGED';
  data: {
    oldHealth: string;
    newHealth: string;
    reason?: string;
  };
}

export type ProjectEvent = 
  | ProjectCreatedEvent 
  | ProjectUpdatedEvent 
  | ProjectHealthChangedEvent;

class ProjectEventBus extends EventEmitter {
  private static instance: ProjectEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): ProjectEventBus {
    if (!ProjectEventBus.instance) {
      ProjectEventBus.instance = new ProjectEventBus();
    }
    return ProjectEventBus.instance;
  }

  public emitProjectEvent(event: ProjectEvent) {
    this.emit(event.type, event);
    this.emit('*', event);
    
    // In a real environment, this would integrate with the WebSocketManager
    console.log(`[ProjectEventBus] ${event.type} for ${event.projectId}`);
  }
}

export const projectEventBus = ProjectEventBus.getInstance();

export class ProjectEventFactory {
  static createCreatedEvent(projectId: string, userId: string, tenantId: string, data: ProjectCreatedEvent['data']): ProjectCreatedEvent {
    return {
      type: 'PROJECT_CREATED',
      projectId,
      userId,
      tenantId,
      timestamp: new Date(),
      data
    };
  }

  static createUpdatedEvent(projectId: string, userId: string, tenantId: string, changes: Record<string, any>): ProjectUpdatedEvent {
    return {
      type: 'PROJECT_UPDATED',
      projectId,
      userId,
      tenantId,
      timestamp: new Date(),
      data: { changes }
    };
  }
}

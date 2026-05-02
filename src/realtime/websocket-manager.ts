import { Server as SocketIOServer } from 'socket.io';
import { NextRequest } from 'next/server';
import { taskEventBus, TaskEvent } from '@/events/task-events';
import { WorkloadEngine } from '@/engines/workload-engine';

// Real-time WebSocket Manager for Task Management
// Provides live updates, collaboration, and instant synchronization

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId: string;
  tenantId: string;
  messageId: string;
}

export interface TaskUpdateMessage extends WebSocketMessage {
  type: 'TASK_UPDATED' | 'TASK_CREATED' | 'TASK_DELETED' | 'TASK_ASSIGNED' | 'TASK_STATUS_CHANGED';
  payload: {
    taskId: string;
    changes: Record<string, any>;
    assigneeId?: string;
    projectId?: string;
  };
}

export interface RiskUpdateMessage extends WebSocketMessage {
  type: 'RISK_ANALYSIS_UPDATED' | 'RISK_UPDATED';
  payload: {
    taskId: string;
    riskLevel: string;
    delayProbability: number;
    recommendations: string[];
  };
}

export interface WorkloadUpdateMessage extends WebSocketMessage {
  type: 'WORKLOAD_UPDATED';
  payload: {
    userId: string;
    utilizationRate: number;
    overloadRisk: string;
    recommendations: string[];
  };
}

export interface CollaborationMessage extends WebSocketMessage {
  type: 'USER_JOINED' | 'USER_LEFT' | 'TYPING' | 'COMMENT_ADDED' | 'FILE_ATTACHED';
  payload: {
    taskId: string;
    userName: string;
    data?: any;
  };
}

export interface NotificationMessage extends WebSocketMessage {
  type: 'NOTIFICATION';
  payload: {
    title: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    actionUrl?: string;
  };
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // tenantId -> Set of userIds
  private userSockets: Map<string, string> = new Map(); // socketId -> userId
  private socketRooms: Map<string, Set<string>> = new Map(); // roomId -> Set of socketIds
  private taskSubscriptions: Map<string, Set<string>> = new Map(); // taskId -> Set of userIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
    this.setupTaskEventListeners();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Authentication middleware
      socket.on('authenticate', async (data) => {
        const { userId, tenantId, token } = data;
        
        // Validate token (simplified - would use proper JWT validation)
        if (!this.validateToken(token)) {
          socket.emit('authentication_error', { message: 'Invalid token' });
          socket.disconnect();
          return;
        }

        // Store user connection
        this.userSockets.set(socket.id, userId);
        
        if (!this.connectedUsers.has(tenantId)) {
          this.connectedUsers.set(tenantId, new Set());
        }
        this.connectedUsers.get(tenantId)!.add(userId);

        // Join tenant room
        socket.join(`tenant:${tenantId}`);
        
        // Join user-specific room
        socket.join(`user:${userId}`);

        // Send initial data
        await this.sendInitialData(socket, userId, tenantId);

        socket.emit('authenticated', { success: true });
        console.log(`User ${userId} authenticated for tenant ${tenantId}`);
      });

      // Task subscription handlers
      socket.on('subscribe_task', (data) => {
        const { taskId } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          socket.join(`task:${taskId}`);
          
          if (!this.taskSubscriptions.has(taskId)) {
            this.taskSubscriptions.set(taskId, new Set());
          }
          this.taskSubscriptions.get(taskId)!.add(userId);
          
          socket.emit('subscribed_to_task', { taskId });
        }
      });

      socket.on('unsubscribe_task', (data) => {
        const { taskId } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          socket.leave(`task:${taskId}`);
          
          const subscriptions = this.taskSubscriptions.get(taskId);
          if (subscriptions) {
            subscriptions.delete(userId);
            if (subscriptions.size === 0) {
              this.taskSubscriptions.delete(taskId);
            }
          }
          
          socket.emit('unsubscribed_from_task', { taskId });
        }
      });

      // Project subscription handlers
      socket.on('subscribe_project', (data) => {
        const { projectId } = data;
        socket.join(`project:${projectId}`);
        socket.emit('subscribed_to_project', { projectId });
      });

      socket.on('unsubscribe_project', (data) => {
        const { projectId } = data;
        socket.leave(`project:${projectId}`);
        socket.emit('unsubscribed_from_project', { projectId });
      });

      // Collaboration handlers
      socket.on('typing_start', (data) => {
        const { taskId } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          socket.to(`task:${taskId}`).emit('user_typing', {
            userId,
            taskId,
            action: 'start'
          });
        }
      });

      socket.on('typing_stop', (data) => {
        const { taskId } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          socket.to(`task:${taskId}`).emit('user_typing', {
            userId,
            taskId,
            action: 'stop'
          });
        }
      });

      // Real-time cursors for collaborative editing
      socket.on('cursor_position', (data) => {
        const { taskId, position } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          socket.to(`task:${taskId}`).emit('cursor_update', {
            userId,
            taskId,
            position
          });
        }
      });

      // Presence handlers
      socket.on('presence_update', (data) => {
        const { status, taskId } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          const presenceData = {
            userId,
            status, // 'online', 'away', 'busy'
            lastSeen: new Date(),
            taskId: taskId || null
          };

          // Broadcast to relevant rooms
          if (taskId) {
            socket.to(`task:${taskId}`).emit('presence_updated', presenceData);
          } else {
            socket.to(`tenant:${this.getUserTenant(userId)}`).emit('presence_updated', presenceData);
          }
        }
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        const userId = this.userSockets.get(socket.id);
        const tenantId = userId ? this.getUserTenant(userId) : null;
        
        if (userId && tenantId) {
          // Remove from connected users
          const tenantUsers = this.connectedUsers.get(tenantId);
          if (tenantUsers) {
            tenantUsers.delete(userId);
            if (tenantUsers.size === 0) {
              this.connectedUsers.delete(tenantId);
            }
          }

          // Clean up task subscriptions
          for (const [taskId, subscribers] of this.taskSubscriptions.entries()) {
            subscribers.delete(userId);
            if (subscribers.size === 0) {
              this.taskSubscriptions.delete(taskId);
            }
          }

          // Broadcast user offline
          socket.to(`tenant:${tenantId}`).emit('presence_updated', {
            userId,
            status: 'offline',
            lastSeen: new Date(),
            taskId: null
          });
        }

        this.userSockets.delete(socket.id);
        console.log(`User disconnected: ${socket.id}`);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Setup task event listeners for real-time updates
   */
  private setupTaskEventListeners(): void {
    // Listen to task events and broadcast updates
    taskEventBus.on('TASK_CREATED', (event: TaskEvent) => {
      this.broadcastTaskUpdate('TASK_CREATED', event.taskId, {
        task: event.data,
        userId: event.userId
      }, event.tenantId);
    });

    taskEventBus.on('TASK_UPDATED', (event: TaskEvent) => {
      this.broadcastTaskUpdate('TASK_UPDATED', event.taskId, {
        field: (event as any).data.field,
        oldValue: (event as any).data.oldValue,
        newValue: (event as any).data.newValue,
        userId: event.userId
      }, event.tenantId);
    });

    taskEventBus.on('TASK_ASSIGNED', (event: TaskEvent) => {
      this.broadcastTaskUpdate('TASK_ASSIGNED', event.taskId, {
        assigneeId: (event as any).data.assigneeId,
        previousAssigneeId: (event as any).data.previousAssigneeId,
        assignedBy: (event as any).data.assignedBy,
        userId: event.userId
      }, event.tenantId);

      // Send notification to new assignee
      if ((event as any).data.assigneeId) {
        this.sendNotificationToUser((event as any).data.assigneeId, {
          title: 'Task Assigned',
          message: `You have been assigned a new task`,
          priority: 'MEDIUM',
          actionUrl: `/tasks/${event.taskId}`
        }, event.tenantId);
      }
    });

    taskEventBus.on('TASK_STATUS_CHANGED', (event: TaskEvent) => {
      this.broadcastTaskUpdate('TASK_STATUS_CHANGED', event.taskId, {
        oldStatus: (event as any).data.oldStatus,
        newStatus: (event as any).data.newStatus,
        changedBy: (event as any).data.changedBy,
        reason: (event as any).data.reason,
        userId: event.userId
      }, event.tenantId);
    });

    taskEventBus.on('TASK_COMPLETED', (event: TaskEvent) => {
      this.broadcastTaskUpdate('TASK_COMPLETED', event.taskId, {
        completedAt: (event as any).data.completedAt,
        completedBy: (event as any).data.completedBy,
        quality: (event as any).data.quality,
        userId: event.userId
      }, event.tenantId);

      // Send completion celebration
      this.sendNotificationToUser((event as any).data.completedBy, {
        title: 'Task Completed! 🎉',
        message: 'Congratulations on completing your task!',
        priority: 'LOW',
        actionUrl: `/tasks/${event.taskId}`
      }, event.tenantId);
    });

    taskEventBus.on('TASK_RISK_CHANGED', (event: TaskEvent) => {
      this.broadcastRiskUpdate(event.taskId, {
        oldRiskScore: (event as any).data.oldRiskScore,
        newRiskScore: (event as any).data.newRiskScore,
        riskFactors: (event as any).data.riskFactors,
        recommendations: (event as any).data.recommendations,
        userId: event.userId
      }, event.tenantId);
    });

    taskEventBus.on('TASK_WORKLOAD_CHANGED', (event: TaskEvent) => {
      this.broadcastWorkloadUpdate((event as any).data.assigneeId, {
        previousWorkload: (event as any).data.previousWorkload,
        newWorkload: (event as any).data.newWorkload,
        utilizationRate: (event as any).data.utilizationRate,
        userId: event.userId
      }, event.tenantId);
    });
  }

  /**
   * Send initial data to newly connected user
   */
  private async sendInitialData(socket: any, userId: string, tenantId: string): Promise<void> {
    try {
      // Send user's active tasks
      // This would typically fetch from database
      const activeTasks = await this.getUserActiveTasks(userId);
      
      socket.emit('initial_data', {
        activeTasks,
        notifications: await this.getUserNotifications(userId),
        presence: await this.getTeamPresence(tenantId)
      });

    } catch (error) {
      console.error('Failed to send initial data:', error);
      socket.emit('initial_data_error', { message: 'Failed to load initial data' });
    }
  }

  /**
   * Broadcast task updates to relevant users
   */
  private broadcastTaskUpdate(
    type: string, 
    taskId: string, 
    data: any, 
    tenantId?: string
  ): void {
    const message: TaskUpdateMessage = {
      type: type as any,
      payload: { taskId, ...data },
      timestamp: new Date(),
      userId: data.userId || 'system',
      tenantId: tenantId || 'default',
      messageId: this.generateMessageId()
    };

    // Broadcast to task subscribers
    this.io.to(`task:${taskId}`).emit('task_update', message);

    // Broadcast to tenant if high priority
    if (type === 'TASK_COMPLETED' || type === 'TASK_ASSIGNED') {
      this.io.to(`tenant:${tenantId}`).emit('task_update', message);
    }
  }

  /**
   * Broadcast risk analysis updates
   */
  private broadcastRiskUpdate(taskId: string, data: any, tenantId?: string): void {
    const message: RiskUpdateMessage = {
      type: 'RISK_UPDATED',
      payload: { taskId, ...data },
      timestamp: new Date(),
      userId: data.userId || 'system',
      tenantId: tenantId || 'default',
      messageId: this.generateMessageId()
    };

    this.io.to(`task:${taskId}`).emit('risk_update', message);
    this.io.to(`task:${taskId}`).emit('RISK_UPDATED', message);
    
    // Also send to project managers
    this.io.to(`tenant:${tenantId}`).emit('risk_update', message);
    this.io.to(`tenant:${tenantId}`).emit('RISK_UPDATED', message);
  }

  /**
   * Broadcast workload updates
   */
  private broadcastWorkloadUpdate(userId: string, data: any, tenantId?: string): void {
    const message: WorkloadUpdateMessage = {
      type: 'WORKLOAD_UPDATED',
      payload: { userId, ...data },
      timestamp: new Date(),
      userId: data.userId || 'system',
      tenantId: tenantId || 'default',
      messageId: this.generateMessageId()
    };

    this.io.to(`user:${userId}`).emit('workload_update', message);
    this.io.to(`tenant:${tenantId}`).emit('workload_update', message);
  }

  /**
   * Send notification to specific user
   */
  private sendNotificationToUser(
    userId: string, 
    notification: Omit<NotificationMessage, 'payload'> & { payload: NotificationMessage['payload'] },
    tenantId?: string
  ): void {
    const message: NotificationMessage = {
      type: 'NOTIFICATION',
      payload: notification,
      timestamp: new Date(),
      userId: 'system',
      tenantId: tenantId || 'default',
      messageId: this.generateMessageId()
    };

    this.io.to(`user:${userId}`).emit('notification', message);
  }

  /**
   * Broadcast collaboration events
   */
  public broadcastCollaboration(
    type: 'USER_JOINED' | 'USER_LEFT' | 'TYPING' | 'COMMENT_ADDED' | 'FILE_ATTACHED',
    taskId: string,
    userId: string,
    userName: string,
    data?: any,
    tenantId?: string
  ): void {
    const message: CollaborationMessage = {
      type,
      payload: { taskId, userName, data },
      timestamp: new Date(),
      userId,
      tenantId: tenantId || 'default',
      messageId: this.generateMessageId()
    };

    this.io.to(`task:${taskId}`).emit('collaboration', message);
  }

  /**
   * Get online users for a tenant
   */
  public getOnlineUsers(tenantId: string): string[] {
    const users = this.connectedUsers.get(tenantId);
    return users ? Array.from(users) : [];
  }

  /**
   * Get users subscribed to a task
   */
  public getTaskSubscribers(taskId: string): string[] {
    const subscribers = this.taskSubscriptions.get(taskId);
    return subscribers ? Array.from(subscribers) : [];
  }

  /**
   * Get connection statistics
   */
  public getStats(): {
    totalConnections: number;
    totalTenants: number;
    totalTaskSubscriptions: number;
    tenantsWithUsers: string[];
  } {
    const totalConnections = this.userSockets.size;
    const totalTenants = this.connectedUsers.size;
    const totalTaskSubscriptions = Array.from(this.taskSubscriptions.values())
      .reduce((sum, set) => sum + set.size, 0);
    const tenantsWithUsers = Array.from(this.connectedUsers.keys());

    return {
      totalConnections,
      totalTenants,
      totalTaskSubscriptions,
      tenantsWithUsers
    };
  }

  // Helper methods
  private validateToken(token: string): boolean {
    // Simplified token validation - would use proper JWT verification
    return token && token.length > 10;
  }

  private getUserTenant(userId: string): string {
    // Would typically fetch from database or session
    return 'default';
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUserActiveTasks(userId: string): Promise<any[]> {
    // Would fetch from database
    return [];
  }

  private async getUserNotifications(userId: string): Promise<any[]> {
    // Would fetch from database
    return [];
  }

  private async getTeamPresence(tenantId: string): Promise<any[]> {
    // Would fetch from database or cache
    return [];
  }

  /**
   * Cleanup method for graceful shutdown
   */
  public shutdown(): void {
    console.log('Shutting down WebSocket manager...');
    
    // Disconnect all clients
    this.io.disconnectSockets(true);
    
    // Clear all data structures
    this.connectedUsers.clear();
    this.userSockets.clear();
    this.socketRooms.clear();
    this.taskSubscriptions.clear();
    
    console.log('WebSocket manager shutdown complete');
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(io?: SocketIOServer): WebSocketManager {
  if (!wsManager && io) {
    wsManager = new WebSocketManager(io);
  }
  return wsManager!;
}

// Real-time event emitters for external use
export class RealtimeEmitter {
  static emitTaskUpdate(taskId: string, update: any, tenantId?: string): void {
    const manager = getWebSocketManager();
    if (manager) {
      manager.broadcastTaskUpdate('TASK_UPDATED', taskId, update, tenantId);
    }
  }

  static emitRiskUpdate(taskId: string, riskData: any, tenantId?: string): void {
    const manager = getWebSocketManager();
    if (manager) {
      manager.broadcastRiskUpdate(taskId, riskData, tenantId);
    }
  }

  static emitWorkloadUpdate(userId: string, workloadData: any, tenantId?: string): void {
    const manager = getWebSocketManager();
    if (manager) {
      manager.broadcastWorkloadUpdate(userId, workloadData, tenantId);
    }
  }

  static emitNotification(userId: string, notification: any, tenantId?: string): void {
    const manager = getWebSocketManager();
    if (manager) {
      manager.sendNotificationToUser(userId, notification, tenantId);
    }
  }

  static emitCollaboration(
    type: CollaborationMessage['type'],
    taskId: string,
    userId: string,
    userName: string,
    data?: any,
    tenantId?: string
  ): void {
    const manager = getWebSocketManager();
    if (manager) {
      manager.broadcastCollaboration(type, taskId, userId, userName, data, tenantId);
    }
  }
}

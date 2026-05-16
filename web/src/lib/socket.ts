import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// WebSocket event types
export interface SocketEvents {
  // Team events
  TEAM_UPDATED: { teamId: string; data: any };
  MEMBER_ADDED: { teamId: string; member: any };
  MEMBER_REMOVED: { teamId: string; memberId: string };
  MEMBER_ROLE_CHANGED: { teamId: string; memberId: string; newRole: string };
  
  // Task events
  TASK_CREATED: { teamId: string; task: any };
  TASK_UPDATED: { teamId: string; task: any };
  TASK_DELETED: { teamId: string; taskId: string };
  TASK_ASSIGNED: { teamId: string; taskId: string; assigneeId: string };
  TASK_STATUS_CHANGED: { teamId: string; taskId: string; newStatus: string };
  
  // Space/List events
  SPACE_CREATED: { teamId: string; space: any };
  SPACE_UPDATED: { teamId: string; space: any };
  SPACE_DELETED: { teamId: string; spaceId: string };
  LIST_CREATED: { teamId: string; list: any };
  LIST_UPDATED: { teamId: string; list: any };
  LIST_DELETED: { teamId: string; listId: string };
  
  // Chat events
  MESSAGE_SENT: { teamId: string; message: any };
  MESSAGE_EDITED: { teamId: string; messageId: string; newContent: string };
  MESSAGE_DELETED: { teamId: string; messageId: string };
  REACTION_ADDED: { teamId: string; messageId: string; reaction: any };
  REACTION_REMOVED: { teamId: string; messageId: string; emoji: string; userId: string };
  
  // Presence events
  USER_ONLINE: { userId: string; teamId: string };
  USER_OFFLINE: { userId: string; teamId: string };
  USER_TYPING: { userId: string; teamId: string; isTyping: boolean };
  
  // AI events
  AI_INSIGHTS_GENERATED: { teamId: string; insights: any };
  WORKLOAD_UPDATED: { teamId: string; workloads: any };
  RISKS_DETECTED: { teamId: string; risks: any };
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private webSocketDisabled = false;
  private disabledUntil: number = 0;
  private pollingInterval: NodeJS.Timeout | null = null;
  private pollingEnabled = false;
  private eventCallbacks: Map<string, Set<Function>> = new Map();

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Check if WebSocket is temporarily disabled
    if (this.webSocketDisabled && Date.now() < this.disabledUntil) {
      console.log('WebSocket temporarily disabled, switching to polling mode');
      this.enablePolling();
      return this.socket || ({} as Socket);
    }

    // Re-enable WebSocket if disabled period has passed
    if (this.webSocketDisabled && Date.now() >= this.disabledUntil) {
      this.webSocketDisabled = false;
      this.reconnectAttempts = 0;
      console.log('WebSocket re-enabled after timeout period, attempting connection...');
      this.disablePolling();
    }

    // Clear any existing timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }

    // WebSocket endpoint from environment variables
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false,
      timeout: 10000,
      forceNew: true
    });

    // Set connection timeout
    this.connectionTimeout = setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        console.log('Connection timeout, attempting to reconnect...');
        this.handleReconnect();
      }
    }, 10000);

    this.setupEventListeners();
    return this.socket;
  }

  // Enable polling as fallback when WebSocket fails
  private enablePolling() {
    if (this.pollingEnabled) return;
    
    console.log('Enabling polling mode as fallback');
    this.pollingEnabled = true;
    
    // Poll for updates every 5 seconds
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, 5000);
  }

  // Disable polling and revert to WebSocket
  private disablePolling() {
    if (!this.pollingEnabled) return;
    
    console.log('Disabling polling mode, reverting to WebSocket');
    this.pollingEnabled = false;
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Poll for updates via REST API when WebSocket is unavailable
  private async pollForUpdates() {
    try {
      // Poll for task updates
      const tasksResponse = await fetch('/api/tasks');
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        // Trigger TASK_UPDATED event for all tasks
        this.triggerEvent('TASK_UPDATED', { tasks });
      }

      // Poll for team updates
      const teamsResponse = await fetch('/api/teams');
      if (teamsResponse.ok) {
        const teams = await teamsResponse.json();
        this.triggerEvent('TEAM_UPDATED', { teams });
      }

      // Poll for messages
      const teamId = this.getCurrentTeamId();
      if (teamId) {
        const messagesResponse = await fetch(`/api/team-messages?teamId=${teamId}`);
        if (messagesResponse.ok) {
          const messages = await messagesResponse.json();
          this.triggerEvent('MESSAGE_SENT', { messages });
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  // Track current team ID for polling
  private currentTeamId: string | null = null;

  private getCurrentTeamId(): string | null {
    return this.currentTeamId;
  }

  // Trigger event callbacks (used by polling)
  private triggerEvent(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      this.webSocketDisabled = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      // Don't immediately reconnect on connection error, wait a bit
      setTimeout(() => {
        this.handleReconnect();
      }, 2000);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to WebSocket server after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.webSocketDisabled = false;
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.warn('Max reconnection attempts reached - WebSocket temporarily disabled for 30 seconds');
      // Disable WebSocket for 30 seconds instead of 2 minutes
      this.webSocketDisabled = true;
      this.disabledUntil = Date.now() + 30000; // 30 seconds
      this.reconnectAttempts = 0;

      // Clear any existing socket
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
    }
  }

  disconnect() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // Disable polling when disconnecting
    this.disablePolling();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  // Join/Leave rooms
  joinTeam(teamId: string) {
    this.currentTeamId = teamId;
    this.socket?.emit('join-team', teamId);
  }

  leaveTeam(teamId: string) {
    if (this.currentTeamId === teamId) {
      this.currentTeamId = null;
    }
    this.socket?.emit('leave-team', teamId);
  }

  joinSpace(spaceId: string) {
    this.socket?.emit('join-space', spaceId);
  }

  leaveSpace(spaceId: string) {
    this.socket?.emit('leave-space', spaceId);
  }

  // Event listeners
  onTeamUpdate(callback: (data: SocketEvents['TEAM_UPDATED']) => void) {
    this.socket?.on('TEAM_UPDATED', callback);
    // Store callback for polling mode
    if (!this.eventCallbacks.has('TEAM_UPDATED')) {
      this.eventCallbacks.set('TEAM_UPDATED', new Set());
    }
    this.eventCallbacks.get('TEAM_UPDATED')!.add(callback);
  }

  offTeamUpdate(callback: (data: SocketEvents['TEAM_UPDATED']) => void) {
    this.socket?.off('TEAM_UPDATED', callback);
    this.eventCallbacks.get('TEAM_UPDATED')?.delete(callback);
  }

  onMemberAdded(callback: (data: SocketEvents['MEMBER_ADDED']) => void) {
    this.socket?.on('MEMBER_ADDED', callback);
    if (!this.eventCallbacks.has('MEMBER_ADDED')) {
      this.eventCallbacks.set('MEMBER_ADDED', new Set());
    }
    this.eventCallbacks.get('MEMBER_ADDED')!.add(callback);
  }

  offMemberAdded(callback: (data: SocketEvents['MEMBER_ADDED']) => void) {
    this.socket?.off('MEMBER_ADDED', callback);
    this.eventCallbacks.get('MEMBER_ADDED')?.delete(callback);
  }

  onMemberRemoved(callback: (data: SocketEvents['MEMBER_REMOVED']) => void) {
    this.socket?.on('MEMBER_REMOVED', callback);
    if (!this.eventCallbacks.has('MEMBER_REMOVED')) {
      this.eventCallbacks.set('MEMBER_REMOVED', new Set());
    }
    this.eventCallbacks.get('MEMBER_REMOVED')!.add(callback);
  }

  offMemberRemoved(callback: (data: SocketEvents['MEMBER_REMOVED']) => void) {
    this.socket?.off('MEMBER_REMOVED', callback);
    this.eventCallbacks.get('MEMBER_REMOVED')?.delete(callback);
  }

  onTaskCreated(callback: (data: SocketEvents['TASK_CREATED']) => void) {
    this.socket?.on('TASK_CREATED', callback);
    if (!this.eventCallbacks.has('TASK_CREATED')) {
      this.eventCallbacks.set('TASK_CREATED', new Set());
    }
    this.eventCallbacks.get('TASK_CREATED')!.add(callback);
  }

  onTaskUpdated(callback: (data: SocketEvents['TASK_UPDATED']) => void) {
    this.socket?.on('TASK_UPDATED', callback);
    if (!this.eventCallbacks.has('TASK_UPDATED')) {
      this.eventCallbacks.set('TASK_UPDATED', new Set());
    }
    this.eventCallbacks.get('TASK_UPDATED')!.add(callback);
  }

  onTaskDeleted(callback: (data: SocketEvents['TASK_DELETED']) => void) {
    this.socket?.on('TASK_DELETED', callback);
    if (!this.eventCallbacks.has('TASK_DELETED')) {
      this.eventCallbacks.set('TASK_DELETED', new Set());
    }
    this.eventCallbacks.get('TASK_DELETED')!.add(callback);
  }

  offTaskCreated(callback: (data: SocketEvents['TASK_CREATED']) => void) {
    this.socket?.off('TASK_CREATED', callback);
    this.eventCallbacks.get('TASK_CREATED')?.delete(callback);
  }

  offTaskUpdated(callback: (data: SocketEvents['TASK_UPDATED']) => void) {
    this.socket?.off('TASK_UPDATED', callback);
    this.eventCallbacks.get('TASK_UPDATED')?.delete(callback);
  }

  offTaskDeleted(callback: (data: SocketEvents['TASK_DELETED']) => void) {
    this.socket?.off('TASK_DELETED', callback);
    this.eventCallbacks.get('TASK_DELETED')?.delete(callback);
  }

  onMessageSent(callback: (data: SocketEvents['MESSAGE_SENT']) => void) {
    this.socket?.on('MESSAGE_SENT', callback);
    if (!this.eventCallbacks.has('MESSAGE_SENT')) {
      this.eventCallbacks.set('MESSAGE_SENT', new Set());
    }
    this.eventCallbacks.get('MESSAGE_SENT')!.add(callback);
  }

  offMessageSent(callback: (data: SocketEvents['MESSAGE_SENT']) => void) {
    this.socket?.off('MESSAGE_SENT', callback);
    this.eventCallbacks.get('MESSAGE_SENT')?.delete(callback);
  }

  onUserOnline(callback: (data: SocketEvents['USER_ONLINE']) => void) {
    this.socket?.on('USER_ONLINE', callback);
  }

  onUserOffline(callback: (data: SocketEvents['USER_OFFLINE']) => void) {
    this.socket?.on('USER_OFFLINE', callback);
  }

  onUserTyping(callback: (data: SocketEvents['USER_TYPING']) => void) {
    this.socket?.on('USER_TYPING', callback);
  }

  // Presence
  setTyping(teamId: string, isTyping: boolean) {
    this.socket?.emit('typing', { teamId, isTyping });
  }

  // Remove listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketService = new SocketService();

// React hook for using socket
export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
    };
  }, []);

  return { socket, isConnected };
}

// React hook for team events
export function useTeamEvents(teamId: string) {
  const { socket } = useSocket();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !teamId) return;

    socketService.joinTeam(teamId);

    const handleTaskUpdate = (data: any) => {
      setEvents((prev: any[]) => [...prev, { type: 'TASK_UPDATED', data, timestamp: Date.now() }]);
    };

    const handleMessageSent = (data: any) => {
      setEvents((prev: any[]) => [...prev, { type: 'MESSAGE_SENT', data, timestamp: Date.now() }]);
    };

    const handleMemberAdded = (data: any) => {
      setEvents((prev: any[]) => [...prev, { type: 'MEMBER_ADDED', data, timestamp: Date.now() }]);
    };

    socket.on('TASK_UPDATED', handleTaskUpdate);
    socket.on('MESSAGE_SENT', handleMessageSent);
    socket.on('MEMBER_ADDED', handleMemberAdded);

    return () => {
      socket.off('TASK_UPDATED', handleTaskUpdate);
      socket.off('MESSAGE_SENT', handleMessageSent);
      socket.off('MEMBER_ADDED', handleMemberAdded);
      socketService.leaveTeam(teamId);
    };
  }, [socket, teamId]);

  return events;
}

import { useState, useEffect } from 'react';
import { NotificationPayload } from './types';

export interface RealtimeSubscription {
  userId: string;
  tenantId: string;
  callback: (notification: NotificationPayload) => void;
  lastPollTime?: Date;
  pollInterval?: number;
}

export interface WebSocketConnection {
  userId: string;
  tenantId: string;
  socket: WebSocket;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

export class RealtimeNotificationService {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private webSocketConnections: Map<string, WebSocketConnection> = new Map();
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEFAULT_POLL_INTERVAL = 30000; // 30 seconds
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 5000; // 5 seconds

  constructor() {
    // Initialize WebSocket connections if available
    this.initializeWebSocketSupport();
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribe(
    userId: string,
    tenantId: string,
    callback: (notification: NotificationPayload) => void,
    options: {
      useWebSocket?: boolean;
      pollInterval?: number;
    } = {}
  ): () => void {
    const subscriptionId = `${userId}_${tenantId}`;
    const subscription: RealtimeSubscription = {
      userId,
      tenantId,
      callback,
      lastPollTime: new Date(),
      pollInterval: options.pollInterval || this.DEFAULT_POLL_INTERVAL
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Try WebSocket first, fallback to polling
    if (options.useWebSocket !== false && this.isWebSocketSupported()) {
      this.connectWebSocket(userId, tenantId);
    } else {
      this.startPolling(subscriptionId);
    }

    // Return unsubscribe function
    return () => this.unsubscribe(subscriptionId);
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    // Stop polling
    const pollInterval = this.pollIntervals.get(subscriptionId);
    if (pollInterval) {
      clearInterval(pollInterval);
      this.pollIntervals.delete(subscriptionId);
    }

    // Close WebSocket connection
    const wsConnection = this.webSocketConnections.get(subscriptionId);
    if (wsConnection) {
      wsConnection.socket.close();
      this.webSocketConnections.delete(subscriptionId);
    }

    // Remove subscription
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Start polling for notifications
   */
  private startPolling(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    const pollInterval = setInterval(async () => {
      await this.pollNotifications(subscription);
    }, subscription.pollInterval);

    this.pollIntervals.set(subscriptionId, pollInterval);

    // Initial poll
    this.pollNotifications(subscription);
  }

  /**
   * Poll for new notifications
   */
  private async pollNotifications(subscription: RealtimeSubscription): Promise<void> {
    try {
      const response = await fetch(
        `/api/notifications/list?userId=${subscription.userId}&tenantId=${subscription.tenantId}&limit=10`,
        {
          headers: {
            'If-Modified-Since': subscription.lastPollTime?.toUTCString() || ''
          }
        }
      );

      if (response.status === 304) {
        // No new notifications
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.notifications) {
          // Filter notifications created after last poll time
          const newNotifications = data.notifications.filter((notification: any) => {
            const createdAt = new Date(notification.createdAt);
            return !subscription.lastPollTime || createdAt > subscription.lastPollTime;
          });

          // Notify callback for each new notification
          newNotifications.forEach((notification: any) => {
            const payload: NotificationPayload = {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              priority: notification.priority || 'MEDIUM',
              userId: notification.userId,
              tenantId: notification.tenantId,
              link: notification.link || undefined,
              metadata: (notification.metadata as Record<string, any>) || {}
            };

            subscription.callback(payload);
          });

          // Update last poll time
          subscription.lastPollTime = new Date();
        }
      }
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  private connectWebSocket(userId: string, tenantId: string): void {
    const subscriptionId = `${userId}_${tenantId}`;
    
    if (!this.isWebSocketSupported()) {
      console.warn('WebSocket not supported, falling back to polling');
      this.startPolling(subscriptionId);
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${userId}&tenantId=${tenantId}`;
      
      const socket = new WebSocket(wsUrl);
      
      const connection: WebSocketConnection = {
        userId,
        tenantId,
        socket,
        isConnected: false,
        reconnectAttempts: 0,
        maxReconnectAttempts: this.MAX_RECONNECT_ATTEMPTS
      };

      this.webSocketConnections.set(subscriptionId, connection);

      socket.onopen = () => {
        console.log(`WebSocket connected for user ${userId}`);
        connection.isConnected = true;
        connection.reconnectAttempts = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            const subscription = this.subscriptions.get(subscriptionId);
            if (subscription) {
              subscription.callback(data.notification);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        console.log(`WebSocket disconnected for user ${userId}`);
        connection.isConnected = false;
        
        // Attempt to reconnect
        if (connection.reconnectAttempts < connection.maxReconnectAttempts) {
          connection.reconnectAttempts++;
          console.log(`Attempting to reconnect (${connection.reconnectAttempts}/${connection.maxReconnectAttempts})`);
          
          setTimeout(() => {
            this.connectWebSocket(userId, tenantId);
          }, this.RECONNECT_DELAY);
        } else {
          console.log('Max reconnect attempts reached, falling back to polling');
          this.startPolling(subscriptionId);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      // Fallback to polling
      this.startPolling(subscriptionId);
    }
  }

  /**
   * Check if WebSocket is supported
   */
  private isWebSocketSupported(): boolean {
    return typeof WebSocket !== 'undefined';
  }

  /**
   * Initialize WebSocket support
   */
  private initializeWebSocketSupport(): void {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Add any WebSocket initialization logic here
      console.log('WebSocket support initialized');
    }
  }

  /**
   * Broadcast notification to all connected clients
   */
  broadcastNotification(notification: NotificationPayload): void {
    // This would be used on the server side to broadcast to all connected clients
    console.log('Broadcasting notification:', notification);
  }

  /**
   * Get connection statistics
   */
  getStatistics(): {
    totalSubscriptions: number;
    activeWebSocketConnections: number;
    activePollingConnections: number;
  } {
    const totalSubscriptions = this.subscriptions.size;
    const activeWebSocketConnections = Array.from(this.webSocketConnections.values())
      .filter(conn => conn.isConnected).length;
    const activePollingConnections = this.pollIntervals.size;

    return {
      totalSubscriptions,
      activeWebSocketConnections,
      activePollingConnections
    };
  }

  /**
   * Force reconnection for all WebSocket connections
   */
  reconnectAll(): void {
    for (const [subscriptionId, connection] of this.webSocketConnections.entries()) {
      if (!connection.isConnected) {
        console.log(`Reconnecting WebSocket for ${subscriptionId}`);
        this.connectWebSocket(connection.userId, connection.tenantId);
      }
    }
  }

  /**
   * Cleanup all connections
   */
  cleanup(): void {
    // Clear all polling intervals
    for (const interval of this.pollIntervals.values()) {
      clearInterval(interval);
    }
    this.pollIntervals.clear();

    // Close all WebSocket connections
    for (const connection of this.webSocketConnections.values()) {
      connection.socket.close();
    }
    this.webSocketConnections.clear();

    // Clear subscriptions
    this.subscriptions.clear();
  }
}

// React Hook for real-time notifications
export function useRealtimeNotifications(
  userId: string,
  tenantId: string,
  onNotification: (notification: NotificationPayload) => void,
  options?: {
    useWebSocket?: boolean;
    pollInterval?: number;
  }
) {
  const [service] = useState(() => new RealtimeNotificationService());

  useEffect(() => {
    if (!userId || !tenantId) return;

    const unsubscribe = service.subscribe(userId, tenantId, onNotification, options);

    return () => {
      unsubscribe();
    };
  }, [userId, tenantId, onNotification, options]);

  return service;
}

// Export singleton instance
export const realtimeNotificationService = new RealtimeNotificationService();

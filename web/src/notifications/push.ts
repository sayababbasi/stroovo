import { NotificationPayload } from './types';
import webpush from 'web-push';

export interface PushConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  ttl?: number;
}

export class PushService {
  private config: PushConfig;
  private subscriptions: Map<string, PushSubscription[]> = new Map();

  constructor() {
    // Web Push configuration
    this.config = {
      publicKey: process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      privateKey: process.env.VAPID_PRIVATE_KEY || '',
      subject: process.env.VAPID_SUBJECT || 'mailto:notifications@stroovo.com'
    };

    // Configure web-push only if keys are available
    if (this.config.publicKey && this.config.privateKey) {
      webpush.setVapidDetails(
        this.config.subject,
        this.config.publicKey,
        this.config.privateKey
      );
      console.log('Web Push configured successfully');
    } else {
      console.warn('VAPID keys not found in environment variables. Push notifications will be disabled.');
    }

    // Load existing subscriptions from database (mock implementation)
    this.loadSubscriptions();
  }

  /**
   * Send notification via push
   */
  async sendNotification(notification: NotificationPayload): Promise<void> {
    try {
      // Check if VAPID is configured
      if (!this.config.publicKey || !this.config.privateKey) {
        console.log('Push notifications disabled - VAPID keys not configured');
        return;
      }

      const userSubscriptions = this.subscriptions.get(notification.userId) || [];
      
      if (userSubscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${notification.userId}`);
        return;
      }

      const pushPayload = this.formatPushNotification(notification);
      const promises = userSubscriptions.map(subscription => 
        this.sendPush(subscription, pushPayload)
      );

      await Promise.allSettled(promises);
      console.log(`Push notification sent to ${userSubscriptions.length} devices for user ${notification.userId}`);
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Don't throw error, just log it to prevent breaking other notification channels
    }
  }

  /**
   * Send push notification to specific subscription
   */
  private async sendPush(subscription: PushSubscription, payload: PushNotificationPayload): Promise<void> {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        },
        JSON.stringify(payload),
        {
          urgency: this.getUrgency(payload),
          TTL: payload.ttl || 3600 // 1 hour default
        }
      );
    } catch (error) {
      console.error('Error sending push to subscription:', error);
      
      // Remove invalid subscription
      if (this.isInvalidSubscription(error)) {
        await this.removeSubscription(subscription);
      }
      
      throw error;
    }
  }

  /**
   * Format notification for push
   */
  private formatPushNotification(notification: NotificationPayload): PushNotificationPayload {
    const priority = this.getPriority(notification.priority);
    
    return {
      title: notification.title,
      body: notification.message,
      icon: '/icons/notification-icon-192x192.png',
      badge: '/icons/notification-badge-72x72.png',
      data: {
        notificationId: notification.id,
        type: notification.type,
        priority: notification.priority,
        link: notification.link,
        metadata: notification.metadata
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-icon.png'
        }
      ],
      tag: `stroovo-${notification.type}-${notification.userId}`,
      requireInteraction: notification.priority === 'URGENT',
      silent: notification.priority === 'LOW',
      urgency: priority,
      ttl: this.getTTL(notification.priority)
    };
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(userId: string, subscription: Omit<PushSubscription, 'userId' | 'createdAt'>): Promise<void> {
    try {
      const fullSubscription: PushSubscription = {
        ...subscription,
        userId,
        createdAt: new Date()
      };

      // Add to in-memory subscriptions
      const userSubscriptions = this.subscriptions.get(userId) || [];
      userSubscriptions.push(fullSubscription);
      this.subscriptions.set(userId, userSubscriptions);

      // Save to database (mock implementation)
      await this.saveSubscription(fullSubscription);

      console.log(`User ${userId} subscribed to push notifications`);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    try {
      const userSubscriptions = this.subscriptions.get(userId) || [];
      const filteredSubscriptions = userSubscriptions.filter(sub => sub.endpoint !== endpoint);
      
      this.subscriptions.set(userId, filteredSubscriptions);

      // Remove from database (mock implementation)
      await this.removeSubscriptionByEndpoint(endpoint);

      console.log(`User ${userId} unsubscribed from push notifications`);
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  /**
   * Get user subscriptions
   */
  getUserSubscriptions(userId: string): PushSubscription[] {
    return this.subscriptions.get(userId) || [];
  }

  /**
   * Get VAPID public key for client-side subscription
   */
  getVAPIDPublicKey(): string {
    return this.config.publicKey;
  }

  /**
   * Generate VAPID keys
   */
  static generateVAPIDKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }

  /**
   * Get urgency based on notification priority
   */
  private getUrgency(payload: PushNotificationPayload): 'very-low' | 'low' | 'normal' | 'high' {
    if (payload.requireInteraction) return 'high';
    if (payload.silent) return 'low';
    return 'normal';
  }

  /**
   * Get web push urgency based on notification priority
   */
  private getPriority(notificationPriority: string): 'very-low' | 'low' | 'normal' | 'high' {
    switch (notificationPriority) {
      case 'URGENT':
        return 'high';
      case 'HIGH':
        return 'normal';
      case 'MEDIUM':
        return 'low';
      case 'LOW':
        return 'very-low';
      default:
        return 'normal';
    }
  }

  /**
   * Get TTL based on priority
   */
  private getTTL(priority: string): number {
    switch (priority) {
      case 'URGENT':
        return 0; // Immediate delivery
      case 'HIGH':
        return 3600; // 1 hour
      case 'MEDIUM':
        return 86400; // 24 hours
      case 'LOW':
        return 604800; // 1 week
      default:
        return 3600;
    }
  }

  /**
   * Check if subscription is invalid
   */
  private isInvalidSubscription(error: any): boolean {
    const errorMessage = error.message || '';
    return errorMessage.includes('410 Gone') || 
           errorMessage.includes('404 Not Found') ||
           errorMessage.includes('Invalid subscription');
  }

  /**
   * Remove invalid subscription
   */
  private async removeSubscription(subscription: PushSubscription): Promise<void> {
    if (!subscription.userId) return;

    const userSubscriptions = this.subscriptions.get(subscription.userId) || [];
    const filteredSubscriptions = userSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
    
    this.subscriptions.set(subscription.userId, filteredSubscriptions);

    // Remove from database
    await this.removeSubscriptionByEndpoint(subscription.endpoint);
  }

  /**
   * Load subscriptions from database (mock implementation)
   */
  private async loadSubscriptions(): Promise<void> {
    // In a real implementation, you would load from database
    console.log('Loading push subscriptions from database...');
  }

  /**
   * Save subscription to database (mock implementation)
   */
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    // In a real implementation, you would save to database
    console.log('Saving push subscription to database:', subscription.endpoint);
  }

  /**
   * Remove subscription from database (mock implementation)
   */
  private async removeSubscriptionByEndpoint(endpoint: string): Promise<void> {
    // In a real implementation, you would remove from database
    console.log('Removing push subscription from database:', endpoint);
  }

  /**
   * Send bulk push notifications
   */
  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<void> {
    const promises = notifications.map(async (notification) => {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        console.error(`Failed to send push notification to user ${notification.userId}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Test push notification
   */
  async testPushNotification(userId: string): Promise<void> {
    const testNotification: NotificationPayload = {
      id: 'test-push-' + Date.now(),
      type: 'INFO',
      title: 'Test Push Notification',
      message: 'This is a test push notification from Stroovo Platform',
      priority: 'MEDIUM',
      userId,
      tenantId: 'test-tenant'
    };

    await this.sendNotification(testNotification);
  }

  /**
   * Clean up expired subscriptions
   */
  async cleanupExpiredSubscriptions(): Promise<void> {
    const expiredThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    for (const [userId, subscriptions] of this.subscriptions.entries()) {
      const validSubscriptions = subscriptions.filter(sub => 
        sub.createdAt > expiredThreshold
      );
      
      if (validSubscriptions.length !== subscriptions.length) {
        this.subscriptions.set(userId, validSubscriptions);
        console.log(`Cleaned up ${subscriptions.length - validSubscriptions.length} expired subscriptions for user ${userId}`);
      }
    }
  }

  /**
   * Get subscription statistics
   */
  getStatistics(): {
    totalSubscriptions: number;
    activeUsers: number;
    subscriptionsByUser: Record<string, number>;
  } {
    let totalSubscriptions = 0;
    const subscriptionsByUser: Record<string, number> = {};

    for (const [userId, subscriptions] of this.subscriptions.entries()) {
      totalSubscriptions += subscriptions.length;
      subscriptionsByUser[userId] = subscriptions.length;
    }

    return {
      totalSubscriptions,
      activeUsers: this.subscriptions.size,
      subscriptionsByUser
    };
  }
}

// Export singleton instance
export const pushService = new PushService();

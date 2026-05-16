import { 
  NotificationEvent, 
  NotificationPayload, 
  NotificationChannel, 
  NotificationRule 
} from './types';
import { EmailService } from './email';
import { WhatsAppService } from './whatsapp';
import { PushService } from './push';
import { AISmartLayer } from './ai';
import prisma from '@/lib/prisma';


interface NotificationRuleRecord {
  id: string;
  name: string;
  event: string;
  condition: unknown;
  action: string;
  channels: string[];
  enabled: boolean;
}

export class NotificationEngine {
  private prisma = prisma;
  private emailService: EmailService;
  private whatsappService: WhatsAppService;
  private pushService: PushService;
  private aiSmartLayer: AISmartLayer;

  constructor() {
    this.emailService = new EmailService();
    this.whatsappService = new WhatsAppService();
    this.pushService = new PushService();
    this.aiSmartLayer = new AISmartLayer();
  }

  /**
   * Main notification engine - processes events and sends notifications
   */
  async sendNotification(event: NotificationEvent): Promise<void> {
    try {
      console.log(`Processing notification event: ${event.type}`, event);

      // Step 1: Apply AI smart layer for optimization
      const optimizedEvent = await this.aiSmartLayer.optimizeEvent(event);
      if (!optimizedEvent.shouldSend) {
        console.log('Notification filtered by AI smart layer');
        return;
      }

      // Step 2: Fetch user preferences and rules
      const { userChannels, applicableRules } = await this.fetchNotificationConfig(
        optimizedEvent.userId,
        optimizedEvent.tenantId,
        optimizedEvent.type
      );

      // Step 3: Create notification record
      const notification = await this.createNotification(optimizedEvent);

      // Step 4: Send via enabled channels
      await this.sendViaChannels(notification, userChannels, applicableRules, optimizedEvent);

      // Step 5: Log results
      await this.logNotificationResults(notification.id, optimizedEvent);

      console.log(`Notification processed successfully: ${notification.id}`);
    } catch (error) {
      console.error('Error processing notification:', error);
      throw error;
    }
  }

  /**
   * Fetch user notification preferences and applicable rules
   */
  private async fetchNotificationConfig(
    userId: string,
    tenantId: string,
    eventType: string
  ): Promise<{ userChannels: NotificationChannel; applicableRules: NotificationRule[] }> {
    // Fetch user notification channels (with fallback)
    let userChannelConfig;
    try {
      userChannelConfig = await (this.prisma as any).notificationChannel?.findUnique?.({
        where: {
          userId_tenantId: {
            userId,
            tenantId
          }
        }
      });
    } catch (error) {
      console.log('NotificationChannel model not found, using defaults');
      userChannelConfig = null;
    }

    // Default channels if not configured
    const userChannels: NotificationChannel = userChannelConfig ? {
      email: userChannelConfig.email,
      whatsapp: userChannelConfig.whatsapp,
      push: userChannelConfig.push,
      inApp: userChannelConfig.inApp
    } : {
      email: true,
      whatsapp: false,
      push: true,
      inApp: true
    };

    // Fetch applicable notification rules (with fallback)
    let rules: NotificationRuleRecord[] = [];
    try {
      const fetchedRules = await (this.prisma as any).notificationRule?.findMany?.({
        where: {
          tenantId,
          event: eventType,
          enabled: true,
          OR: [
            { userId: null }, // Tenant-wide rules
            { userId } // User-specific rules
          ]
        }
      });
      rules = Array.isArray(fetchedRules) ? (fetchedRules as NotificationRuleRecord[]) : [];
    } catch (error) {
      console.log('NotificationRule model not found, using empty rules');
      rules = [];
    }

    const applicableRules: NotificationRule[] = rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      event: rule.event,
      condition: rule.condition as Record<string, any>,
      action: rule.action,
      channels: rule.channels,
      enabled: rule.enabled
    }));

    return { userChannels, applicableRules };
  }

  /**
   * Create notification record in database
   */
  private async createNotification(event: NotificationEvent): Promise<NotificationPayload> {
    const notification = await this.prisma.notification.create({
      data: {
        title: event.title,
        message: event.message,
        type: event.type,
        priority: event.priority || 'MEDIUM',
        userId: event.userId,
        tenantId: event.tenantId,
        link: event.link
      }
    });

    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: event.priority || 'MEDIUM',
      userId: notification.userId,
      tenantId: notification.tenantId,
      link: notification.link || undefined,
      metadata: event.metadata || {}
    };
  }

  /**
   * Send notification via enabled channels
   */
  private async sendViaChannels(
    notification: NotificationPayload,
    userChannels: NotificationChannel,
    rules: NotificationRule[],
    event: NotificationEvent
  ): Promise<void> {
    const channels = this.determineChannels(userChannels, rules, event);
    const promises: Promise<void>[] = [];

    // In-App (always included)
    if (channels.includes('inApp')) {
      promises.push(this.sendInApp(notification));
    }

    // Email
    if (channels.includes('email') && userChannels.email) {
      promises.push(this.sendEmail(notification));
    }

    // WhatsApp
    if (channels.includes('whatsapp') && userChannels.whatsapp) {
      promises.push(this.sendWhatsApp(notification));
    }

    // Push
    if (channels.includes('push') && userChannels.push) {
      promises.push(this.sendPush(notification));
    }

    // Execute all channel sends in parallel
    await Promise.allSettled(promises);
  }

  /**
   * Determine which channels to use based on user preferences and rules
   */
  private determineChannels(
    userChannels: NotificationChannel,
    rules: NotificationRule[],
    event: NotificationEvent
  ): string[] {
    const channels: string[] = [];

    // Always include in-app
    if (userChannels.inApp) {
      channels.push('inApp');
    }

    // Apply rules to determine other channels
    for (const rule of rules) {
      if (this.evaluateCondition(rule.condition, event)) {
        channels.push(...rule.channels);
      }
    }

    // If no rules match, use default channels based on priority
    if (channels.length === 1) { // Only in-app so far
      if (event.priority === 'URGENT' || event.priority === 'HIGH') {
        if (userChannels.email) channels.push('email');
        if (userChannels.push) channels.push('push');
      }
    }

    return [...new Set(channels)]; // Remove duplicates
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateCondition(condition: Record<string, any> | undefined, event: NotificationEvent): boolean {
    if (!condition) return true;

    // Simple condition evaluation - can be extended
    for (const [key, value] of Object.entries(condition)) {
      if (event.metadata?.[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Send in-app notification (stored in DB)
   */
  private async sendInApp(notification: NotificationPayload): Promise<void> {
    // In-app notifications are already stored in DB
    // This method can trigger real-time updates via WebSocket
    console.log(`In-app notification sent: ${notification.id}`);
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: NotificationPayload): Promise<void> {
    try {
      // Determine profile based on metadata or type
      const profile = notification.metadata?.emailProfile === 'CUSTOMER_SERVICE' 
        ? 'CUSTOMER_SERVICE' 
        : 'INTERNAL';

      await this.emailService.sendNotification(notification, profile);
      await this.logChannelStatus(notification.id, 'EMAIL', 'SENT');
    } catch (error) {
      console.error('Email send failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logChannelStatus(notification.id, 'EMAIL', 'FAILED', errorMessage);
    }
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsApp(notification: NotificationPayload): Promise<void> {
    try {
      await this.whatsappService.sendNotification(notification);
      await this.logChannelStatus(notification.id, 'WHATSAPP', 'SENT');
    } catch (error) {
      console.error('WhatsApp send failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logChannelStatus(notification.id, 'WHATSAPP', 'FAILED', errorMessage);
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: NotificationPayload): Promise<void> {
    try {
      await this.pushService.sendNotification(notification);
      await this.logChannelStatus(notification.id, 'PUSH', 'SENT');
    } catch (error) {
      console.error('Push send failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logChannelStatus(notification.id, 'PUSH', 'FAILED', errorMessage);
    }
  }

  /**
   * Log channel status
   */
  private async logChannelStatus(
    notificationId: string,
    channel: string,
    status: string,
    error?: string
  ): Promise<void> {
    try {
      await (this.prisma as any).notificationLog?.create?.({
        data: {
          notificationId,
          channel,
          status,
          error,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (logError) {
      console.log('NotificationLog model not found, skipping log entry');
    }
  }

  /**
   * Log overall notification results
   */
  private async logNotificationResults(notificationId: string, event: NotificationEvent): Promise<void> {
    try {
      const logs = await (this.prisma as any).notificationLog?.findMany?.({
        where: { notificationId }
      });

      if (logs) {
        const successCount = logs.filter((log: any) => log.status === 'SENT').length;
        const failureCount = logs.filter((log: any) => log.status === 'FAILED').length;
        console.log(`Notification ${notificationId} results: ${successCount} sent, ${failureCount} failed`);
      }
    } catch (logError) {
      console.log('NotificationLog model not found, skipping result logging');
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, tenantId: string, limit = 50): Promise<any[]> {
    return await this.prisma.notification.findMany({
      where: {
        userId,
        tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true
      }
    });
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    tenantId: string,
    preferences: NotificationChannel
  ): Promise<void> {
    try {
      await (this.prisma as any).notificationChannel?.upsert?.({
        where: {
          userId_tenantId: {
            userId,
            tenantId
          }
        },
        update: {
          email: preferences.email,
          whatsapp: preferences.whatsapp,
          push: preferences.push,
          inApp: preferences.inApp
        },
        create: {
          userId,
          tenantId,
          email: preferences.email,
          whatsapp: preferences.whatsapp,
          push: preferences.push,
          inApp: preferences.inApp
        }
      });
    } catch (error) {
      console.log('NotificationChannel model not found, preferences not saved');
    }
  }
}

// Singleton instance
export const notificationEngine = new NotificationEngine();

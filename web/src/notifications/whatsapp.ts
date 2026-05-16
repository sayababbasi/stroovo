import { NotificationPayload } from './types';

export interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string[];
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor() {
    // Twilio WhatsApp configuration
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886', // Twilio sandbox number
      apiKey: process.env.TWILIO_API_KEY,
      apiSecret: process.env.TWILIO_API_SECRET
    };

    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}`;
  }

  /**
   * Send notification via WhatsApp
   */
  async sendNotification(notification: NotificationPayload): Promise<void> {
    try {
      const phoneNumber = await this.getUserPhoneNumber(notification.userId);
      const message = this.formatWhatsAppMessage(notification);

      await this.sendMessage({
        to: phoneNumber,
        body: message
      });

      console.log(`WhatsApp notification sent to ${phoneNumber}`);
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   */
  private async sendMessage(message: WhatsAppMessage): Promise<any> {
    const url = `${this.baseUrl}/Messages.json`;
    const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');

    const payload = {
      To: message.to,
      From: this.config.fromNumber,
      Body: message.body,
      ...(message.mediaUrl && { MediaUrl: message.mediaUrl }),
      ...(message.templateName && {
        ContentSid: message.templateName,
        ContentVariables: this.formatTemplateVariables(message.templateComponents || [])
      })
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(payload as any).toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${errorData.message}`);
    }

    return response.json();
  }

  /**
   * Format message for WhatsApp
   */
  private formatWhatsAppMessage(notification: NotificationPayload): string {
    const priorityEmoji = this.getPriorityEmoji(notification.priority);
    const typeEmoji = this.getTypeEmoji(notification.type);
    
    let message = `${priorityEmoji} *${notification.title}*\n\n`;
    message += `${notification.message}\n\n`;
    
    if (notification.link) {
      message += `View: ${notification.link}\n\n`;
    }

    message += `---\n`;
    message += `${typeEmoji} Sent by Stroovo Platform`;
    message += `\nPriority: ${notification.priority}`;

    // Add metadata if available
    if (notification.metadata && Object.keys(notification.metadata).length > 0) {
      message += '\n\n*Details:*\n';
      Object.entries(notification.metadata).forEach(([key, value]) => {
        message += `_${this.formatMetadataKey(key)}_: ${this.formatMetadataValue(key, value)}\n`;
      });
    }

    return message;
  }

  /**
   * Get user phone number (mock implementation)
   */
  private async getUserPhoneNumber(userId: string): Promise<string> {
    // In a real implementation, you would fetch the user's phone number from the database
    // For now, return a mock phone number
    return `whatsapp:+1234567890`; // Mock number for testing
  }

  /**
   * Get priority emoji
   */
  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'URGENT';
      case 'HIGH':
        return 'HIGH';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'LOW':
        return 'LOW';
      default:
        return 'INFO';
    }
  }

  /**
   * Get type emoji
   */
  private getTypeEmoji(type: string): string {
    switch (type) {
      case 'TASK_ASSIGNED':
        return 'D';
      case 'TASK_COMPLETED':
        return 'C';
      case 'DEADLINE_NEAR':
        return '!';
      case 'RISK_DETECTED':
        return '!';
      case 'PROJECT_CREATED':
        return '+';
      default:
        return 'i';
    }
  }

  /**
   * Format metadata key for display
   */
  private formatMetadataKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Format metadata value for display
   */
  private formatMetadataValue(key: string, value: any): string {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  }

  /**
   * Format template variables for WhatsApp templates
   */
  private formatTemplateVariables(components: any[]): string[] {
    return components.map((component, index) => {
      if (component.type === 'body') {
        return component.parameters.map((param: any) => param.text).join('|');
      }
      return '';
    }).filter(Boolean);
  }

  /**
   * Send WhatsApp template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string = 'en',
    components: any[] = []
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/Messages.json`;
      const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');

      const payload = {
        To: to,
        From: this.config.fromNumber,
        ContentSid: templateName,
        ContentVariables: this.formatTemplateVariables(components),
        ContentLanguage: language
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(payload as any).toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp template error: ${errorData.message}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }

  /**
   * Check WhatsApp number validity
   */
  async checkNumberValidity(phoneNumber: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/Lookups.json`;
      const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');

      const response = await fetch(`${url}?Phone=${phoneNumber}&Type=carrier`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.carrier && data.carrier.type === 'mobile';
    } catch (error) {
      console.error('Error checking WhatsApp number:', error);
      return false;
    }
  }

  /**
   * Get WhatsApp message status
   */
  async getMessageStatus(messageSid: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/Messages/${messageSid}.json`;
      const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get message status');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting WhatsApp message status:', error);
      throw error;
    }
  }

  /**
   * Send bulk WhatsApp notifications
   */
  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<void> {
    const promises = notifications.map(async (notification) => {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        console.error(`Failed to send WhatsApp notification to user ${notification.userId}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Test WhatsApp connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Send a test message to a sandbox number
      const testMessage: WhatsAppMessage = {
        to: 'whatsapp:+14155238886', // Twilio sandbox number
        body: 'Test message from Stroovo Platform'
      };

      await this.sendMessage(testMessage);
      console.log('WhatsApp service connection verified successfully');
      return true;
    } catch (error) {
      console.error('WhatsApp service connection failed:', error);
      return false;
    }
  }

  /**
   * Create WhatsApp template (for pre-approved templates)
   */
  async createTemplate(template: {
    name: string;
    category: string;
    language: string;
    components: any[];
  }): Promise<any> {
    // This would typically be done through Twilio Console or WhatsApp Business API
    // Mock implementation for demonstration
    console.log('WhatsApp template creation:', template);
    return { success: true, templateId: template.name };
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

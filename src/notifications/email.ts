import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { NotificationPayload } from './types';

export type EmailProfile = 'INTERNAL' | 'CUSTOMER_SERVICE';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    // Gmail SMTP configuration - Defaults from .env
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(this.config);
  }

  /**
   * Get dynamic transporter based on tenant and profile
   */
  private async getTransporter(tenantId: string, profile: EmailProfile = 'INTERNAL'): Promise<nodemailer.Transporter> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    }) as any;

    let config = { ...this.config };

    if (tenant) {
      if (profile === 'CUSTOMER_SERVICE') {
        config.auth.user = tenant.customerServiceEmail || process.env.CUSTOMER_SERVICE_EMAIL || config.auth.user;
        config.auth.pass = tenant.customerServicePass || process.env.CUSTOMER_SERVICE_PASS || config.auth.pass;
      } else {
        config.auth.user = tenant.internalEmail || process.env.INTERNAL_EMAIL || config.auth.user;
        config.auth.pass = tenant.internalPass || process.env.INTERNAL_PASSWORD || config.auth.pass;
      }

      config.host = tenant.smtpHost || config.host;
      config.port = tenant.smtpPort || config.port;
      config.secure = tenant.smtpSecure ?? config.secure;
    } else {
      // Fallback to .env defaults if no tenant found
      if (profile === 'CUSTOMER_SERVICE') {
        config.auth.user = process.env.CUSTOMER_SERVICE_EMAIL || config.auth.user;
        config.auth.pass = process.env.CUSTOMER_SERVICE_PASS || config.auth.pass;
      } else {
        config.auth.user = process.env.INTERNAL_EMAIL || config.auth.user;
        config.auth.pass = process.env.INTERNAL_PASSWORD || config.auth.pass;
      }
    }

    return nodemailer.createTransport(config);
  }

  /**
   * Send notification via email
   */
  async sendNotification(notification: NotificationPayload, profile: EmailProfile = 'INTERNAL'): Promise<void> {
    try {
      const transporter = await this.getTransporter(notification.tenantId, profile);
      const recipient = await this.getUserEmail(notification.userId);
      const { html, text } = this.renderEmailContent(notification);

      const mailOptions = {
        from: `"Stroovo Notifications" <${(transporter as any).options.auth.user}>`,
        to: recipient,
        subject: this.formatSubject(notification),
        text,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email (${profile}) sent successfully:`, info.messageId);
    } catch (error) {
      console.error(`Error sending email (${profile}):`, error);
      throw error;
    }
  }

  /**
   * Send a direct test email to a specific address
   */
  async sendTestEmail(params: {
    tenantId: string;
    to: string;
    profile?: EmailProfile;
    subject?: string;
    title?: string;
    message?: string;
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const profile = params.profile || 'INTERNAL';
    const transporter = await this.getTransporter(params.tenantId, profile);
    const notification: NotificationPayload = {
      id: `email_test_${Date.now()}`,
      type: 'INFO',
      title: params.title || 'Stroovo Platform Test Email',
      message: params.message || 'This is a live delivery test for your notification configuration.',
      priority: 'MEDIUM',
      userId: 'email-test',
      tenantId: params.tenantId,
      link: params.link,
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        emailProfile: profile,
        triggeredAt: new Date().toISOString(),
        ...params.metadata
      }
    };
    const { html, text } = this.renderEmailContent(notification);

    await transporter.sendMail({
      from: `"Stroovo Notifications" <${(transporter as any).options.auth.user}>`,
      to: params.to,
      subject: params.subject || this.formatSubject(notification),
      text,
      html
    });
  }

  /**
   * Build HTML and text email content
   */
  renderEmailContent(notification: NotificationPayload): { html: string; text: string } {
    return {
      html: this.generateEmailTemplate(notification),
      text: this.generateTextTemplate(notification)
    };
  }

  /**
   * Generate HTML email template
   */
  private generateEmailTemplate(notification: NotificationPayload): string {
    const priorityColor = this.getPriorityColor(notification.priority);
    const priorityIcon = this.getPriorityIcon(notification.priority);
    const typeIcon = this.getTypeIcon(notification.type);
    const supportEmail = process.env.CUSTOMER_SERVICE_EMAIL || 'contact.revoticai@gmail.com';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${notification.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a202c;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7fafc;
        }
        .container {
            background: white;
            border-radius: 24px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 15px;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .notification-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid #edf2f7;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        .notification-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .icon-wrapper {
            width: 48px;
            height: 48px;
            background: ${priorityColor}15;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${priorityColor};
            font-size: 20px;
            margin-right: 16px;
            border: 1px solid ${priorityColor}30;
        }
        .notification-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin: 0;
        }
        .message-box {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.7;
            margin: 0;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid ${priorityColor};
        }
        .metadata-section {
            margin-top: 24px;
            background: #f1f5f9;
            border-radius: 16px;
            padding: 20px;
        }
        .metadata-title {
            font-size: 14px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            display: block;
        }
        .metadata-grid {
            display: grid;
            gap: 12px;
        }
        .metadata-item {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #475569;
        }
        .metadata-label {
            font-weight: 600;
            color: #1e293b;
        }
        .action-button {
            display: block;
            background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
            color: white !important;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            text-align: center;
            margin-top: 32px;
            transition: transform 0.2s;
            box-shadow: 0 4px 6px -1px rgba(76, 81, 191, 0.4);
        }
        .footer {
            padding: 32px;
            text-align: center;
            background: #f8fafc;
            border-top: 1px solid #edf2f7;
        }
        .footer-logo {
            font-weight: 700;
            color: #4c51bf;
            font-size: 18px;
            margin-bottom: 12px;
        }
        .footer-text {
            color: #718096;
            font-size: 13px;
            margin: 4px 0;
        }
        .priority-badge {
            display: inline-block;
            background: ${priorityColor};
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            margin-left: 10px;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Stroovo Platform</h1>
            <p class="subtitle">${typeIcon} intelligent workspace notification</p>
        </div>
        
        <div class="content">
            <div class="notification-card">
                <div class="notification-header">
                    <div class="icon-wrapper">
                        ${priorityIcon}
                    </div>
                    <div>
                        <h2 class="notification-title">
                            ${notification.title}
                            <span class="priority-badge">${notification.priority}</span>
                        </h2>
                    </div>
                </div>
                <div class="message-box">
                    ${notification.message}
                </div>
            </div>

            ${notification.metadata && Object.keys(notification.metadata).length > 0 ? `
                <div class="metadata-section">
                    <span class="metadata-title">Information Details</span>
                    <div class="metadata-grid">
                        ${Object.entries(notification.metadata).map(([key, value]) => `
                            <div class="metadata-item">
                                <span class="metadata-label">${this.formatMetadataKey(key)}</span>
                                <span>${this.formatMetadataValue(key, value)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${notification.link ? `
                <a href="${notification.link}" class="action-button">
                    View in Workspace
                </a>
            ` : ''}
        </div>
        
        <div class="footer">
            <div class="footer-logo">Stroovo</div>
            <p class="footer-text">Where Work Flows Smarter.</p>
            <p class="footer-text">
                Support: <a href="mailto:${supportEmail}" style="color: #4c51bf; text-decoration: none;">${supportEmail}</a>
            </p>
            <p class="footer-text" style="margin-top: 20px; font-size: 11px; opacity: 0.7;">
                (c) 2026 Stroovo. All rights reserved.
                <br>
                <a href="#" style="color: #718096;">Preferences</a> | <a href="#" style="color: #718096;">Privacy</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email template
   */
  private generateTextTemplate(notification: NotificationPayload): string {
    const supportEmail = process.env.CUSTOMER_SERVICE_EMAIL || 'contact.revoticai@gmail.com';

    return `
STROOVO NOTIFICATION
======================

${notification.title.toUpperCase()} [${notification.priority.toUpperCase()}]

${notification.message}

${notification.link ? `View Details: ${notification.link}` : ''}

${notification.metadata && Object.keys(notification.metadata).length > 0 ? `
Additional Information:
${Object.entries(notification.metadata).map(([key, value]) => 
  `${this.formatMetadataKey(key)}: ${this.formatMetadataValue(key, value)}`
).join('\n')}
` : ''}

---
This notification was sent by Stroovo Platform.
Support: ${supportEmail}
`;
  }

  /**
   * Format email subject
   */
  private formatSubject(notification: NotificationPayload): string {
    const priorityPrefix = notification.priority === 'URGENT' ? '[URGENT] ' : 
                         notification.priority === 'HIGH' ? '[IMPORTANT] ' : '';
    return `${priorityPrefix}${notification.title}`;
  }

  /**
   * Get priority color for styling
   */
  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  /**
   * Get priority icon
   */
  private getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'Urgent';
      case 'HIGH':
        return 'High';
      case 'MEDIUM':
        return 'Info';
      case 'LOW':
        return 'Notice';
      default:
        return 'Info';
    }
  }

  /**
   * Get type icon
   */
  private getTypeIcon(type: string): string {
    switch (type) {
      case 'TASK_ASSIGNED':
        return 'Task';
      case 'TASK_COMPLETED':
        return 'Complete';
      case 'DEADLINE_NEAR':
        return 'Deadline';
      case 'RISK_DETECTED':
        return 'Risk';
      case 'PROJECT_CREATED':
        return 'Project';
      default:
        return 'Update';
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
   * Resolve user email from the database
   */
  private async getUserEmail(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user?.email) {
      throw new Error(`No email address found for user ${userId}`);
    }

    return user.email;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<void> {
    const promises = notifications.map(notification => 
      this.sendNotification(notification).catch(error => 
        console.error(`Failed to send email to user ${notification.userId}:`, error)
      )
    );
    
    await Promise.allSettled(promises);
  }
}

// Export singleton instance
export const emailService = new EmailService();

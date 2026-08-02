import nodemailer from 'nodemailer';
import { BaseEmailProvider } from './base';
import { EmailOptions, EmailProviderResponse } from '../types';

export class SMTPProvider extends BaseEmailProvider {
  name = 'smtp';
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || process.env.INTERNAL_EMAIL || process.env.SMTP_USER || '',
        pass: process.env.EMAIL_PASS || process.env.INTERNAL_PASSWORD || process.env.SMTP_PASS || ''
      }
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('[SMTPProvider] Verification failed:', error);
      return false;
    }
  }

  async send(options: EmailOptions): Promise<EmailProviderResponse> {
    try {
      const info = await this.transporter.sendMail({
        from: this.applyDefaultFrom(options),
        to: this.formatRecipients(options.to),
        cc: options.cc ? this.formatRecipients(options.cc) : undefined,
        bcc: options.bcc ? this.formatRecipients(options.bcc) : undefined,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return {
        success: true,
        messageId: info.messageId,
        providerResponse: info
      };
    } catch (error: any) {
      console.error('[SMTPProvider] Failed to send email:', error);
      return {
        success: false,
        error: error.message || error
      };
    }
  }
}

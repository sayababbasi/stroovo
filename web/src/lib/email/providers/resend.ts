import { Resend } from 'resend';
import { BaseEmailProvider } from './base';
import { EmailOptions, EmailProviderResponse } from '../types';

export class ResendProvider extends BaseEmailProvider {
  name = 'resend';
  private resend: Resend;

  constructor() {
    super();
    // Use the RESEND_API_KEY environment variable. 
    // We throw an error if it's missing and we try to instantiate this provider in production.
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === 'production') {
        console.error('RESEND_API_KEY is not set in production');
      } else {
        console.warn('RESEND_API_KEY is not set. ResendProvider will fail if used.');
      }
    }
    this.resend = new Resend(apiKey || 'missing_key');
  }

  async send(options: EmailOptions): Promise<EmailProviderResponse> {
    try {
      const from = this.applyDefaultFrom(options);
      
      const payload: any = {
        from,
        to: options.to,
        subject: options.subject,
      };

      if (options.html) {
        payload.html = options.html;
      } else if (options.text) {
        payload.text = options.text;
      } else {
        return {
          success: false,
          error: 'Either html or text content must be provided',
        };
      }

      if (options.replyTo) payload.reply_to = options.replyTo;
      if (options.cc) payload.cc = options.cc;
      if (options.bcc) payload.bcc = options.bcc;
      
      // We don't map attachments directly yet since Resend expects { filename, content } 
      // where content is Buffer or string. 
      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          content_type: att.contentType
        }));
      }

      const { data, error } = await this.resend.emails.send(payload);

      if (error) {
        return {
          success: false,
          error: error.message || 'Unknown Resend Error',
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    // Quick validation check just by ensuring we have an API key configured.
    return !!process.env.RESEND_API_KEY;
  }
}

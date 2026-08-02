import { EmailProvider, EmailOptions, EmailProviderResponse } from '../types';

export abstract class BaseEmailProvider implements EmailProvider {
  abstract name: string;

  abstract send(options: EmailOptions): Promise<EmailProviderResponse>;

  /**
   * Format the "to" field correctly based on provider requirements
   */
  protected formatRecipients(to: string | string[]): string {
    return Array.isArray(to) ? to.join(', ') : to;
  }

  /**
   * Ensure default from address is applied if missing
   */
  protected applyDefaultFrom(options: EmailOptions): string {
    return options.from || process.env.EMAIL_FROM || process.env.INTERNAL_EMAIL || 'noreply@stroovo.com';
  }
}

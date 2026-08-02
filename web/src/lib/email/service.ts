import { EmailProvider, EmailOptions, EmailProviderResponse } from './types';
import { SMTPProvider } from './providers/smtp';
import { MockProvider } from './providers/mock';
import { emailQueue } from './queue';
import { startEmailWorker } from './worker';
import prisma from '../prisma';

class EmailService {
  private provider: EmailProvider;

  constructor() {
    this.provider = this.initializeProvider();
  }

  /**
   * Determine and instantiate the correct provider based on environment variables
   */
  private initializeProvider(): EmailProvider {
    const providerName = process.env.EMAIL_PROVIDER || 'smtp';
    
    switch (providerName.toLowerCase()) {
      case 'mock':
      case 'console':
        return new MockProvider();
      case 'smtp':
      default:
        return new SMTPProvider();
    }
  }

  private workerStarted = false;
  private queueDisabledLogged = false;

  /**
   * Centralized method to send an email. 
   * This pushes the job to the background queue and returns immediately.
   */
  async sendEmail(options: EmailOptions): Promise<EmailProviderResponse> {
    // Graceful Fallback for local dev without Redis
    if (!emailQueue) {
      if (!this.queueDisabledLogged && process.env.NODE_ENV === 'development') {
        console.warn('⚠️  REDIS_URL is not configured. Falling back to synchronous email delivery.');
        this.queueDisabledLogged = true;
      }
      return await this.processEmail(options);
    }

    // Ensure worker is running in local dev
    if (!this.workerStarted && process.env.NODE_ENV === 'development') {
      startEmailWorker();
      this.workerStarted = true;
    }

    try {
      const job = await emailQueue.add('send-email', options);
      return {
        success: true,
        messageId: `job-${job.id}`,
      };
    } catch (error: any) {
      console.error('[Email Queue] Failed to enqueue job. Falling back to synchronous.', error);
      return await this.processEmail(options);
    }
  }

  /**
   * Internal method used by the Worker (or fallback) to actually process the email dispatch.
   */
  async processEmail(options: EmailOptions): Promise<EmailProviderResponse> {
    try {
      console.log(`[EmailService] Processing email to ${options.to} via ${this.provider.name}`);
      const response = await this.provider.send(options);
      
      if (!response.success) {
        console.error('[EmailService] Delivery failed:', response.error);
      }
      
      try {
        await prisma.emailLog.create({
          data: {
            to: Array.isArray(options.to) ? options.to.join(',') : options.to,
            subject: options.subject,
            status: response.success ? 'SENT' : 'FAILED',
            error: typeof response.error === 'string' ? response.error : response.error?.message || null,
            provider: this.provider.name,
          }
        });
      } catch (dbErr) {
        console.error('[EmailService] Failed to save EmailLog:', dbErr);
      }
      
      return response;
    } catch (error: any) {
      console.error('[EmailService] Unexpected error sending email:', error);
      
      try {
        await prisma.emailLog.create({
          data: {
            to: Array.isArray(options.to) ? options.to.join(',') : options.to,
            subject: options.subject,
            status: 'FAILED',
            error: error.message || String(error),
            provider: this.provider.name,
          }
        });
      } catch (dbErr) {}

      return {
        success: false,
        error: error.message || error
      };
    }
  }

  /**
   * Diagnostic method to check if the current provider is healthy
   */
  async checkHealth(): Promise<boolean> {
    if (this.provider.verifyConnection) {
      return await this.provider.verifyConnection();
    }
    return true; // Providers without verifyConnection (like mock) are assumed healthy
  }
}

// Export as a singleton
export const emailService = new EmailService();

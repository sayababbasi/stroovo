import { BaseEmailProvider } from './base';
import { EmailOptions, EmailProviderResponse } from '../types';

export class MockProvider extends BaseEmailProvider {
  name = 'mock';

  async send(options: EmailOptions): Promise<EmailProviderResponse> {
    console.log('\n======================================================');
    console.log('[MOCK EMAIL PROVIDER] Simulating email delivery...');
    console.log(`FROM:    ${this.applyDefaultFrom(options)}`);
    console.log(`TO:      ${this.formatRecipients(options.to)}`);
    if (options.cc) console.log(`CC:      ${this.formatRecipients(options.cc)}`);
    if (options.bcc) console.log(`BCC:     ${this.formatRecipients(options.bcc)}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log('------------------------------------------------------');
    console.log('CONTENT (HTML):');
    console.log(options.html.substring(0, 500) + (options.html.length > 500 ? '...\n[TRUNCATED]' : ''));
    console.log('======================================================\n');

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      providerResponse: { mode: 'mock', status: 'logged_to_console' }
    };
  }
}

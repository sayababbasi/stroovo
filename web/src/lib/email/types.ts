export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: { filename: string; content: string | Buffer; contentType?: string }[];
}

export interface EmailProviderResponse {
  success: boolean;
  messageId?: string;
  providerResponse?: any;
  error?: Error | string;
}

export interface EmailProvider {
  name: string;
  send(options: EmailOptions): Promise<EmailProviderResponse>;
  verifyConnection?(): Promise<boolean>;
}

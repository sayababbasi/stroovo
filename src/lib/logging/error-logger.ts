import { PrismaClient } from '@prisma/client';

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
  };
  metadata: {
    service: string;
    component: string;
    errorCode?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'VALIDATION' | 'BUSINESS_LOGIC' | 'EXTERNAL_SERVICE' | 'DATABASE' | 'SYSTEM' | 'SECURITY';
    resolved?: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
  };
  sanitized: boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByCategory: Record<string, number>;
  errorsByService: Record<string, number>;
  criticalErrors: number;
  resolvedErrors: number;
  averageResolutionTime: number;
  errorRate: number;
}

export class ErrorLogger {
  private prisma: PrismaClient;
  private static instance: ErrorLogger;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  static getInstance(prisma: PrismaClient): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger(prisma);
    }
    return ErrorLogger.instance;
  }

  async logError(error: Error, context: Partial<ErrorLogEntry['context']> = {}, metadata: Partial<ErrorLogEntry['metadata']> = {}): Promise<void> {
    try {
      const sanitizedError = this.sanitizeError(error);
      const errorEntry: Omit<ErrorLogEntry, 'id'> = {
        timestamp: new Date(),
        level: 'ERROR',
        message: sanitizedError.message,
        stack: sanitizedError.stack,
        context: {
          userId: context.userId,
          requestId: context.requestId,
          endpoint: context.endpoint,
          method: context.method,
          userAgent: context.userAgent,
          ipAddress: this.sanitizeIPAddress(context.ipAddress),
          sessionId: context.sessionId
        },
        metadata: {
          service: metadata.service || 'unknown',
          component: metadata.component || 'unknown',
          errorCode: metadata.errorCode,
          severity: metadata.severity || 'MEDIUM',
          category: metadata.category || 'SYSTEM'
        },
        sanitized: true
      };

      // Store in database
      await this.prisma.errorLog.create({
        data: {
          level: errorEntry.level,
          message: errorEntry.message,
          stack: errorEntry.stack,
          context: errorEntry.context,
          metadata: errorEntry.metadata,
          sanitized: errorEntry.sanitized,
          createdAt: errorEntry.timestamp
        }
      });

      // Log to console (structured)
      console.error(JSON.stringify({
        type: 'error',
        timestamp: errorEntry.timestamp,
        level: errorEntry.level,
        message: errorEntry.message,
        service: errorEntry.metadata.service,
        component: errorEntry.metadata.component,
        category: errorEntry.metadata.category,
        severity: errorEntry.metadata.severity,
        context: errorEntry.context
      }));

      // Send alerts for critical errors
      if (errorEntry.metadata.severity === 'CRITICAL') {
        await this.sendCriticalErrorAlert(errorEntry);
      }

    } catch (loggingError) {
      // Fallback logging if database logging fails
      console.error('Failed to log error:', {
        originalError: error.message,
        loggingError: loggingError instanceof Error ? loggingError.message : 'Unknown',
        timestamp: new Date()
      });
    }
  }

  async logWarning(message: string, context: Partial<ErrorLogEntry['context']> = {}, metadata: Partial<ErrorLogEntry['metadata']> = {}): Promise<void> {
    try {
      const warningEntry: Omit<ErrorLogEntry, 'id' | 'stack' | 'sanitized'> = {
        timestamp: new Date(),
        level: 'WARN',
        message: this.sanitizeMessage(message),
        context: {
          userId: context.userId,
          requestId: context.requestId,
          endpoint: context.endpoint,
          method: context.method,
          userAgent: context.userAgent,
          ipAddress: this.sanitizeIPAddress(context.ipAddress),
          sessionId: context.sessionId
        },
        metadata: {
          service: metadata.service || 'unknown',
          component: metadata.component || 'unknown',
          severity: metadata.severity || 'LOW',
          category: metadata.category || 'SYSTEM'
        }
      };

      // Store in database
      await this.prisma.errorLog.create({
        data: {
          level: warningEntry.level,
          message: warningEntry.message,
          context: warningEntry.context,
          metadata: warningEntry.metadata,
          sanitized: true,
          createdAt: warningEntry.timestamp
        }
      });

      // Log to console
      console.warn(JSON.stringify({
        type: 'warning',
        timestamp: warningEntry.timestamp,
        level: warningEntry.level,
        message: warningEntry.message,
        service: warningEntry.metadata.service,
        component: warningEntry.metadata.component,
        context: warningEntry.context
      }));

    } catch (loggingError) {
      console.error('Failed to log warning:', {
        originalMessage: message,
        loggingError: loggingError instanceof Error ? loggingError.message : 'Unknown',
        timestamp: new Date()
      });
    }
  }

  async logInfo(message: string, context: Partial<ErrorLogEntry['context']> = {}, metadata: Partial<ErrorLogEntry['metadata']> = {}): Promise<void> {
    try {
      const infoEntry: Omit<ErrorLogEntry, 'id' | 'stack' | 'sanitized'> = {
        timestamp: new Date(),
        level: 'INFO',
        message: this.sanitizeMessage(message),
        context: {
          userId: context.userId,
          requestId: context.requestId,
          endpoint: context.endpoint,
          method: context.method,
          userAgent: context.userAgent,
          ipAddress: this.sanitizeIPAddress(context.ipAddress),
          sessionId: context.sessionId
        },
        metadata: {
          service: metadata.service || 'unknown',
          component: metadata.component || 'unknown',
          severity: 'LOW',
          category: metadata.category || 'SYSTEM'
        }
      };

      // Log to console (info level might not need database storage)
      console.info(JSON.stringify({
        type: 'info',
        timestamp: infoEntry.timestamp,
        level: infoEntry.level,
        message: infoEntry.message,
        service: infoEntry.metadata.service,
        component: infoEntry.metadata.component,
        context: infoEntry.context
      }));

    } catch (loggingError) {
      console.error('Failed to log info:', {
        originalMessage: message,
        loggingError: loggingError instanceof Error ? loggingError.message : 'Unknown',
        timestamp: new Date()
      });
    }
  }

  private sanitizeError(error: Error): Error {
    const sanitized = new Error(error.message);
    
    // Remove sensitive information from stack trace
    if (error.stack) {
      sanitized.stack = error.stack
        .split('\n')
        .filter(line => !line.includes('password') && !line.includes('token') && !line.includes('secret'))
        .join('\n');
    }

    // Sanitize message
    sanitized.message = this.sanitizeMessage(error.message);

    return sanitized;
  }

  private sanitizeMessage(message: string): string {
    return message
      // Remove potential sensitive data patterns
      .replace(/password["\s]*[:=]["\s]*[^"\s]+/gi, 'password=[REDACTED]')
      .replace(/token["\s]*[:=]["\s]*[^"\s]+/gi, 'token=[REDACTED]')
      .replace(/secret["\s]*[:=]["\s]*[^"\s]+/gi, 'secret=[REDACTED]')
      .replace(/key["\s]*[:=]["\s]*[^"\s]+/gi, 'key=[REDACTED]')
      // Remove email addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      // Remove phone numbers
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      // Remove IP addresses (except for logging purposes)
      .replace(/\b(?!(?:10\.|172\.(?:1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.))\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
  }

  private sanitizeIPAddress(ip?: string): string {
    if (!ip) return 'unknown';
    
    // Allow private IP ranges for debugging, but mask others
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^127\./,
      /^::1$/,
      /^localhost$/i
    ];

    const isPrivate = privateRanges.some(range => range.test(ip));
    
    if (isPrivate) {
      return ip;
    }

    // Mask public IPs
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }

    return '[IP]';
  }

  private async sendCriticalErrorAlert(errorEntry: Omit<ErrorLogEntry, 'id'>): Promise<void> {
    try {
      // In a real implementation, this would send alerts to monitoring systems
      console.error('CRITICAL ERROR ALERT:', {
        id: 'ALERT-' + Date.now(),
        timestamp: errorEntry.timestamp,
        message: errorEntry.message,
        service: errorEntry.metadata.service,
        component: errorEntry.metadata.component,
        context: errorEntry.context
      });

      // Store alert in database
      await this.prisma.errorAlert.create({
        data: {
          errorId: 'ALERT-' + Date.now(),
          message: errorEntry.message,
          service: errorEntry.metadata.service,
          component: errorEntry.metadata.component,
          severity: errorEntry.metadata.severity,
          context: errorEntry.context,
          createdAt: errorEntry.timestamp
        }
      });

    } catch (alertError) {
      console.error('Failed to send critical error alert:', alertError);
    }
  }

  async getErrorMetrics(timeRange: '1h' | '6h' | '24h' | '7d' = '24h'): Promise<ErrorMetrics> {
    const now = new Date();
    let timeStart: Date;

    switch (timeRange) {
      case '1h':
        timeStart = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        timeStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '7d':
        timeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        timeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const errors = await this.prisma.errorLog.findMany({
      where: {
        createdAt: { gte: timeStart }
      }
    });

    const totalErrors = errors.length;
    const errorCounts: Record<string, number> = errors.reduce((acc, error) => {
      const key = error.message;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const errorsByCategory: Record<string, number> = errors.reduce((acc, error) => {
      const category = error.metadata?.category || 'UNKNOWN';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const errorsByService: Record<string, number> = errors.reduce((acc, error) => {
      const service = error.metadata?.service || 'unknown';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});

    const criticalErrors = errors.filter(error => 
      error.metadata?.severity === 'CRITICAL'
    ).length;

    const resolvedErrors = errors.filter(error => 
      error.metadata?.resolved === true
    ).length;

    // Calculate average resolution time
    const resolvedErrorsWithTime = errors.filter(error => 
      error.metadata?.resolved === true && 
      error.metadata?.resolvedAt
    );

    const averageResolutionTime = resolvedErrorsWithTime.length > 0
      ? resolvedErrorsWithTime.reduce((sum, error) => {
          const createdAt = error.createdAt.getTime();
          const resolvedAt = new Date(error.metadata.resolvedAt).getTime();
          return sum + (resolvedAt - createdAt);
        }, 0) / resolvedErrorsWithTime.length
      : 0;

    // Calculate error rate (errors per minute)
    const timeRangeMinutes = timeRange === '1h' ? 60 : 
                           timeRange === '6h' ? 360 : 
                           timeRange === '7d' ? 10080 : 1440;
    const errorRate = totalErrors / timeRangeMinutes;

    return {
      totalErrors,
      errorsByLevel: errors.reduce((acc, error) => {
        acc[error.level] = (acc[error.level] || 0) + 1;
        return acc;
      }, {}),
      errorsByCategory,
      errorsByService,
      criticalErrors,
      resolvedErrors,
      averageResolutionTime,
      errorRate
    };
  }

  async resolveError(errorId: string, resolvedBy: string): Promise<void> {
    try {
      const topErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({
        message,
        count,
        severity: 'MEDIUM', // Would need to get from actual error
        category: 'SYSTEM' // Would need to get from actual error
      }));

      await this.prisma.errorLog.update({
        where: { id: errorId },
        data: {
          metadata: {
            resolved: true,
            resolvedAt: new Date(),
            resolvedBy
          }
        }
      });

      this.logInfo(`Error ${errorId} resolved by ${resolvedBy}`, {}, {
        service: 'error-logger',
        component: 'resolution'
      });

    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  }

  async getRecentErrors(limit: number = 50, severity?: string): Promise<ErrorLogEntry[]> {
    try {
      const errors = await this.prisma.errorLog.findMany({
        where: severity ? {
          metadata: {
            severity
          }
        } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return errors.map(error => ({
        id: error.id,
        timestamp: error.createdAt,
        level: error.level,
        message: error.message,
        stack: error.stack,
        context: error.context as any,
        metadata: error.metadata as any,
        sanitized: error.sanitized
      }));

    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }
}

// Singleton instance
export const errorLogger = (prisma: PrismaClient) => ErrorLogger.getInstance(prisma);

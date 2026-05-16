import { PrismaClient, AuthAction, AuthStatus, User } from '@prisma/client';
import { extractIPAddress, extractUserAgent } from './security';

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: AuthAction;
  ipAddress: string;
  device?: string;
  userAgent: string;
  status: AuthStatus;
  details?: string;
  metadata?: any;
  createdAt: Date;
}

export interface AuditFilter {
  userId?: string;
  action?: AuthAction;
  status?: AuthStatus;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  suspiciousEvents: number;
  uniqueUsers: number;
  uniqueIPs: number;
  topActions: Array<{ action: string; count: number }>;
  timeline: Array<{ date: string; count: number }>;
}

export class AuditLogger {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Log authentication event
  async logAuthEvent({
    userId,
    action,
    status,
    request,
    details,
    metadata
  }: {
    userId?: string;
    action: AuthAction;
    status: AuthStatus;
    request: Request;
    details?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const ipAddress = extractIPAddress(request);
      const userAgent = extractUserAgent(request);
      
      // Parse device info from user agent
      const deviceInfo = this.parseDeviceInfo(userAgent);

      await this.prisma.authLog.create({
        data: {
          userId,
          action,
          ipAddress,
          device: deviceInfo.device,
          userAgent,
          status,
          details,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          }
        }
      });

      // Check for suspicious patterns and alert if needed
      await this.checkSuspiciousPatterns(userId, action, status, ipAddress);

    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }

  // Query audit logs with filtering
  async getAuditLogs(filter: AuditFilter): Promise<{
    logs: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const where: any = {};

      if (filter.userId) where.userId = filter.userId;
      if (filter.action) where.action = filter.action;
      if (filter.status) where.status = filter.status;
      if (filter.ipAddress) where.ipAddress = filter.ipAddress;

      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt.gte = filter.startDate;
        if (filter.endDate) where.createdAt.lte = filter.endDate;
      }

      const total = await this.prisma.authLog.count({ where });

      const logs = await this.prisma.authLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit || 50,
        skip: filter.offset || 0,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        }
      });

      const hasMore = (filter.offset || 0) + logs.length < total;

      return {
        logs: logs.map(log => ({
          id: log.id,
          userId: log.userId || undefined,
          action: log.action,
          ipAddress: log.ipAddress || '',
          device: log.device || undefined,
          userAgent: log.userAgent || '',
          status: log.status,
          details: log.details || undefined,
          metadata: log.metadata || undefined,
          createdAt: log.createdAt,
        })),
        total,
        hasMore
      };

    } catch (error) {
      console.error('Error getting audit logs:', error);
      return { logs: [], total: 0, hasMore: false };
    }
  }

  // Get audit summary statistics
  async getAuditSummary(filter: Partial<AuditFilter> = {}): Promise<AuditSummary> {
    try {
      const where: any = {};

      if (filter.userId) where.userId = filter.userId;
      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt.gte = filter.startDate;
        if (filter.endDate) where.createdAt.lte = filter.endDate;
      }

      // Get basic counts
      const [total, successful, failed, suspicious] = await Promise.all([
        this.prisma.authLog.count({ where }),
        this.prisma.authLog.count({ where: { ...where, status: 'SUCCESS' } }),
        this.prisma.authLog.count({ where: { ...where, status: 'FAILED' } }),
        this.prisma.authLog.count({ where: { ...where, status: 'SUSPICIOUS' } })
      ]);

      // Get unique users and IPs
      const [uniqueUsers, uniqueIPs] = await Promise.all([
        this.prisma.authLog.findMany({ where, select: { userId: true }, distinct: ['userId'] })
          .then(logs => logs.filter(log => log.userId).length),
        this.prisma.authLog.findMany({ where, select: { ipAddress: true }, distinct: ['ipAddress'] })
          .then(logs => logs.length)
      ]);

      // Get top actions
      const topActions = await this.prisma.authLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      });

      // Get timeline data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const timeline = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          COUNT(*) as count
        FROM "AuthLog" 
        WHERE "createdAt" >= ${thirtyDaysAgo}
        ${filter.userId ? `AND "userId" = ${filter.userId}` : ''}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date DESC
        LIMIT 30
      ` as Array<{ date: string; count: number }>;

      return {
        totalEvents: total,
        successfulEvents: successful,
        failedEvents: failed,
        suspiciousEvents: suspicious,
        uniqueUsers,
        uniqueIPs,
        topActions: topActions.map(item => ({
          action: item.action,
          count: item._count.action
        })),
        timeline
      };

    } catch (error) {
      console.error('Error getting audit summary:', error);
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        suspiciousEvents: 0,
        uniqueUsers: 0,
        uniqueIPs: 0,
        topActions: [],
        timeline: []
      };
    }
  }

  // Get user activity timeline
  async getUserActivityTimeline(
    userId: string,
    days: number = 30
  ): Promise<Array<{
    date: string;
    actions: Array<{
      time: string;
      action: AuthAction;
      status: AuthStatus;
      ipAddress: string;
      device?: string;
      details?: string;
    }>;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await this.prisma.authLog.findMany({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 1000
      });

      // Group by date
      const grouped = logs.reduce((acc, log) => {
        const date = log.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push({
          time: log.createdAt.toTimeString().split(' ')[0],
          action: log.action,
          status: log.status,
          ipAddress: log.ipAddress,
          device: log.device,
          details: log.details
        });
        return acc;
      }, {} as Record<string, any[]>);

      return Object.entries(grouped)
        .map(([date, actions]) => ({ date, actions }))
        .sort((a, b) => b.date.localeCompare(a.date));

    } catch (error) {
      console.error('Error getting user activity timeline:', error);
      return [];
    }
  }

  // Get security alerts
  async getSecurityAlerts(hours: number = 24): Promise<Array<{
    type: 'BRUTE_FORCE' | 'SUSPICIOUS_LOGIN' | 'MULTIPLE_FAILURES' | 'NEW_DEVICE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    userId?: string;
    ipAddress: string;
    createdAt: Date;
    metadata: any;
  }>> {
    try {
      const alerts = [];
      const since = new Date();
      since.setHours(since.getHours() - hours);

      // Check for brute force attacks
      const bruteForceAttempts = await this.prisma.authLog.groupBy({
        by: ['ipAddress'],
        where: {
          action: 'FAILED_LOGIN',
          createdAt: { gte: since }
        },
        _count: { ipAddress: true },
        having: {
          ipAddress: { _count: { gt: 10 } }
        }
      });

      for (const attempt of bruteForceAttempts) {
        alerts.push({
          type: 'BRUTE_FORCE' as const,
          severity: 'HIGH' as const,
          message: `Brute force attack detected from ${attempt.ipAddress}`,
          ipAddress: attempt.ipAddress || '',
          createdAt: new Date(),
          metadata: { attempts: attempt._count.ipAddress }
        });
      }

      // Check for suspicious logins
      const suspiciousLogins = await this.prisma.authLog.findMany({
        where: {
          status: 'SUSPICIOUS',
          createdAt: { gte: since }
        },
        include: { user: true }
      });

      for (const login of suspiciousLogins) {
        alerts.push({
          type: 'SUSPICIOUS_LOGIN' as const,
          severity: 'MEDIUM' as const,
          message: `Suspicious login detected for ${login.user?.email || 'unknown user'}`,
          userId: login.userId || undefined,
          ipAddress: login.ipAddress || '',
          createdAt: login.createdAt,
          metadata: login.metadata as any
        });
      }

      // Check for multiple failed attempts from same user
      const userFailures = await this.prisma.authLog.groupBy({
        by: ['userId'],
        where: {
          action: 'FAILED_LOGIN',
          userId: { not: null },
          createdAt: { gte: since }
        },
        _count: { userId: true },
        having: {
          userId: { _count: { gt: 5 } }
        }
      });

      for (const failure of userFailures) {
        if (failure.userId) {
          alerts.push({
            type: 'MULTIPLE_FAILURES' as const,
            severity: 'MEDIUM' as const,
            message: `Multiple failed login attempts for user`,
            userId: failure.userId || undefined,
            ipAddress: 'multiple',
            createdAt: new Date(),
            metadata: { failures: failure._count.userId }
          });
        }
      }

      return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
      console.error('Error getting security alerts:', error);
      return [];
    }
  }

  // Export audit logs
  async exportAuditLogs(filter: AuditFilter, format: 'CSV' | 'JSON' = 'CSV'): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    try {
      const { logs } = await this.getAuditLogs({ ...filter, limit: 10000 });

      if (format === 'CSV') {
        const headers = [
          'ID', 'User ID', 'User Email', 'Action', 'Status', 'IP Address',
          'Device', 'User Agent', 'Details', 'Created At'
        ];
        
        const csvData = [
          headers.join(','),
          ...logs.map(log => [
            log.id,
            log.userId || '',
            '', // Would need to join with user table
            log.action,
            log.status,
            log.ipAddress,
            log.device || '',
            `"${log.userAgent.replace(/"/g, '""')}"`,
            `"${(log.details || '').replace(/"/g, '""')}"`,
            log.createdAt.toISOString()
          ].join(','))
        ].join('\n');

        return {
          data: csvData,
          filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
          mimeType: 'text/csv'
        };
      } else {
        const jsonData = JSON.stringify(logs, null, 2);
        return {
          data: jsonData,
          filename: `audit-logs-${new Date().toISOString().split('T')[0]}.json`,
          mimeType: 'application/json'
        };
      }

    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  // Check for suspicious patterns
  private async checkSuspiciousPatterns(
    userId?: string,
    action?: AuthAction,
    status?: AuthStatus,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Check for rapid failed attempts
      if (action === 'FAILED_LOGIN' && status === 'FAILED') {
        const recentFailures = await this.prisma.authLog.count({
          where: {
            action: 'FAILED_LOGIN',
            status: 'FAILED',
            ipAddress,
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
          }
        });

        if (recentFailures >= 5) {
          // Log suspicious activity
          await this.prisma.authLog.create({
            data: {
              userId: userId || null,
              action: 'SUSPICIOUS_LOGIN' as any,
              ipAddress: ipAddress || null,
              userAgent: 'system',
              status: 'SUSPICIOUS' as any,
              details: 'Rapid failed login attempts detected',
              metadata: {
                failureCount: recentFailures,
                timeWindow: '5 minutes'
              }
            }
          });
        }
      }

      // Check for login from unusual location
      if (action === 'LOGIN' && status === 'SUCCESS' && userId) {
        const previousLogins = await this.prisma.authLog.findMany({
          where: {
            userId,
            action: 'LOGIN',
            status: 'SUCCESS',
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          select: { ipAddress: true },
          distinct: ['ipAddress']
        });

        const previousIPs = new Set(previousLogins.map(l => l.ipAddress).filter(Boolean) as string[]);
        if (previousIPs.size > 0 && ipAddress && !previousIPs.has(ipAddress)) {
          await this.prisma.authLog.create({
            data: {
              userId: userId || null,
              action: 'SUSPICIOUS_LOGIN' as any,
              ipAddress: ipAddress || null,
              userAgent: 'system',
              status: 'SUSPICIOUS' as any,
              details: 'Login from new IP address',
              metadata: {
                newIP: ipAddress,
                previousIPs: Array.from(previousIPs)
              }
            }
          });
        }
      }

    } catch (error) {
      console.error('Error checking suspicious patterns:', error);
    }
  }

  // Parse device info from user agent
  private parseDeviceInfo(userAgent: string): {
    device: string;
    browser: string;
    os: string;
  } {
    const ua = userAgent.toLowerCase();
    
    let device = 'Unknown';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Device detection
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('ios')) {
      device = 'Mobile';
    } else if (ua.includes('tablet')) {
      device = 'Tablet';
    } else {
      device = 'Desktop';
    }

    // Browser detection
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // OS detection
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios')) os = 'iOS';

    return { device, browser, os };
  }

  // Clean up old audit logs
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prisma.authLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }

  // Get compliance report
  async getComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: string;
    totalAuthEvents: number;
    successfulLogins: number;
    failedLogins: number;
    mfaUsage: number;
    passwordChanges: number;
    suspiciousActivities: number;
    uniqueUsers: number;
    topRiskFactors: Array<{ factor: string; count: number }>;
  }> {
    try {
      const where = {
        createdAt: { gte: startDate, lte: endDate }
      };

      const [
        totalAuthEvents,
        successfulLogins,
        failedLogins,
        mfaUsage,
        passwordChanges,
        suspiciousActivities,
        uniqueUsers
      ] = await Promise.all([
        this.prisma.authLog.count({ where }),
        this.prisma.authLog.count({ 
          where: { ...where, action: 'LOGIN', status: 'SUCCESS' }
        }),
        this.prisma.authLog.count({ 
          where: { ...where, action: 'FAILED_LOGIN', status: 'FAILED' }
        }),
        this.prisma.authLog.count({ 
          where: { ...where, action: { in: ['MFA_ENABLED', 'MFA_DISABLED'] } }
        }),
        this.prisma.authLog.count({ 
          where: { ...where, action: 'PASSWORD_CHANGE' }
        }),
        this.prisma.authLog.count({ 
          where: { ...where, status: 'SUSPICIOUS' }
        }),
        this.prisma.authLog.findMany({ 
          where, 
          select: { userId: true }, 
          distinct: ['userId'] 
        }).then(logs => logs.filter(log => log.userId).length)
      ]);

      // Get top risk factors
      const riskFactors = await this.prisma.authLog.groupBy({
        by: ['action'],
        where: { ...where, status: 'FAILED' },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 5
      });

      return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalAuthEvents,
        successfulLogins,
        failedLogins,
        mfaUsage,
        passwordChanges,
        suspiciousActivities,
        uniqueUsers,
        topRiskFactors: riskFactors.map(item => ({
          factor: item.action,
          count: item._count.action
        }))
      };

    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const auditLogger = (prisma: PrismaClient) => new AuditLogger(prisma);

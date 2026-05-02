import { PrismaClient } from '@prisma/client';
import { ollamaClient } from '@/ai/ollama';
import { performance } from 'perf_hooks';

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  timestamp: Date;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    connections: number;
  };
  ai: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    models: number;
  };
  sessions: {
    active: number;
    total: number;
  };
  requests: {
    total: number;
    failed: number;
    averageLatency: number;
  };
  queue: {
    pending: number;
    processing: number;
    failed: number;
  };
}

export class SystemHealthMonitor {
  private prisma: PrismaClient;
  private startTime: Date;
  private requestMetrics: Array<{ timestamp: Date; latency: number; success: boolean }> = [];
  private maxMetricsHistory = 1000;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.startTime = new Date();
  }

  async checkDatabase(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Test connection pool
      const connectionTest = await this.prisma.$queryRaw`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
      
      const latency = performance.now() - startTime;
      const connections = Array.isArray(connectionTest) ? Number(connectionTest[0]?.active_connections || 0) : 0;

      return {
        service: 'database',
        status: latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
        latency,
        metadata: { connections }
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkAI(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const models = await ollamaClient.listModels();
      const latency = performance.now() - startTime;
      
      // Test a simple generation to ensure AI is responsive
      const testPrompt = 'Test';
      await ollamaClient.generate({
        model: models.models?.[0]?.name || 'llama2',
        prompt: testPrompt,
        options: { num_predict: 1 }
      });

      return {
        service: 'ai',
        status: latency < 2000 ? 'healthy' : latency < 5000 ? 'degraded' : 'unhealthy',
        latency,
        metadata: { 
          models: models.models?.length || 0,
          availableModels: models.models?.map(m => m.name) || []
        }
      };
    } catch (error) {
      return {
        service: 'ai',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkNotifications(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Check notification tables exist and are accessible
      const notificationCount = await this.prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const latency = performance.now() - startTime;

      return {
        service: 'notifications',
        status: 'healthy',
        latency,
        metadata: { 
          notifications24h: notificationCount,
          channels: ['email', 'whatsapp', 'push']
        }
      };
    } catch (error) {
      return {
        service: 'notifications',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkAuth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Check auth-related tables
      const activeSessions = await this.prisma.session.count({
        where: {
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        }
      });

      const recentAuthLogs = await this.prisma.authLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      });

      const latency = performance.now() - startTime;

      return {
        service: 'auth',
        status: 'healthy',
        latency,
        metadata: { 
          activeSessions,
          authEventsLastHour: recentAuthLogs
        }
      };
    } catch (error) {
      return {
        service: 'auth',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const now = new Date();
    const uptime = now.getTime() - this.startTime.getTime();

    // Get memory usage (Node.js process)
    const memUsage = process.memoryUsage();
    const memoryUsed = memUsage.heapUsed;
    const memoryTotal = memUsage.heapTotal;
    const memoryPercentage = (memoryUsed / memoryTotal) * 100;

    // Get database metrics
    const dbHealth = await this.checkDatabase();
    const dbConnections = dbHealth.metadata?.connections || 0;

    // Get AI metrics
    const aiHealth = await this.checkAI();
    const aiModels = aiHealth.metadata?.models || 0;

    // Get session metrics
    const activeSessions = await this.prisma.session.count({
      where: { status: 'ACTIVE', expiresAt: { gt: new Date() } }
    });
    const totalSessions = await this.prisma.session.count();

    // Get request metrics
    const recentMetrics = this.requestMetrics.filter(
      m => now.getTime() - m.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    const totalRequests = recentMetrics.length;
    const failedRequests = recentMetrics.filter(m => !m.success).length;
    const averageLatency = totalRequests > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.latency, 0) / totalRequests 
      : 0;

    // Get queue metrics (simplified - would need actual queue implementation)
    const queueMetrics = {
      pending: 0,
      processing: 0,
      failed: 0
    };

    return {
      timestamp: now,
      uptime,
      memory: {
        used: memoryUsed,
        total: memoryTotal,
        percentage: memoryPercentage / 100
      },
      database: {
        status: dbHealth.status as 'healthy' | 'degraded' | 'unhealthy',
        latency: dbHealth.latency || 0,
        connections: dbConnections
      },
      ai: {
        status: aiHealth.status as 'healthy' | 'degraded' | 'unhealthy',
        latency: aiHealth.latency || 0,
        models: aiModels
      },
      sessions: {
        active: activeSessions,
        total: totalSessions
      },
      requests: {
        total: totalRequests,
        failed: failedRequests,
        averageLatency
      },
      queue: queueMetrics
    };
  }

  recordRequest(latency: number, success: boolean): void {
    const metric = {
      timestamp: new Date(),
      latency,
      success
    };

    this.requestMetrics.push(metric);

    // Keep only recent metrics
    if (this.requestMetrics.length > this.maxMetricsHistory) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxMetricsHistory);
    }
  }

  async getOverallHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    metrics: SystemMetrics;
    uptime: number;
  }> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkAI(),
      this.checkNotifications(),
      this.checkAuth()
    ]);

    const metrics = await this.getSystemMetrics();
    const uptime = Date.now() - this.startTime.getTime();

    // Determine overall status
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount > 0) {
      status = 'unhealthy';
    } else if (degradedCount > 0 || metrics.memory.percentage > 0.8) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      checks,
      metrics,
      uptime
    };
  }

  // Security monitoring
  async getSecurityMetrics(): Promise<{
    suspiciousLogins: number;
    failedAttempts: number;
    blockedIPs: number;
    activeMFA: number;
    recentSecurityEvents: Array<{
      type: string;
      count: number;
      lastOccurrence: Date;
    }>;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [suspiciousLogins, failedAttempts, blockedIPs, activeMFA] = await Promise.all([
      this.prisma.authLog.count({
        where: {
          status: 'SUSPICIOUS',
          createdAt: { gte: oneHourAgo }
        }
      }),
      this.prisma.authLog.count({
        where: {
          action: 'FAILED_LOGIN',
          status: 'FAILED',
          createdAt: { gte: oneHourAgo }
        }
      }),
      this.prisma.iPReputation.count({
        where: {
          reputation: { lt: -50 },
          lastSeen: { gte: oneHourAgo }
        }
      }),
      this.prisma.mFASetting.count({
        where: { isEnabled: true }
      })
    ]);

    // Get recent security events
    const securityEvents = await this.prisma.authLog.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: oneHourAgo },
        status: { in: ['FAILED', 'SUSPICIOUS'] }
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 5
    });

    const recentSecurityEvents = securityEvents.map(event => ({
      type: event.action,
      count: event._count.action,
      lastOccurrence: new Date() // This would need actual timestamp from the query
    }));

    return {
      suspiciousLogins,
      failedAttempts,
      blockedIPs,
      activeMFA,
      recentSecurityEvents
    };
  }
}

// Singleton instance
export const systemHealthMonitor = (prisma: PrismaClient) => new SystemHealthMonitor(prisma);

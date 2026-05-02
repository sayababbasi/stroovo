import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { systemHealthMonitor } from '@/lib/monitoring/system-health';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '1h'; // 1h, 6h, 24h, 7d
    
    const monitor = systemHealthMonitor(prisma);
    const health = await monitor.getOverallHealth();
    const securityMetrics = await monitor.getSecurityMetrics();

    // Calculate time ranges
    const now = new Date();
    let timeStart: Date;
    
    switch (timeRange) {
      case '6h':
        timeStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        timeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default: // 1h
        timeStart = new Date(now.getTime() - 60 * 60 * 1000);
    }

    // Get historical metrics
    const [
      authMetrics,
      notificationMetrics,
      sessionMetrics,
      errorMetrics
    ] = await Promise.all([
      // Authentication metrics
      prisma.authLog.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: timeStart }
        },
        _count: { status: true }
      }),
      
      // Notification metrics
      prisma.notification.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: timeStart }
        },
        _count: { status: true }
      }),
      
      // Session metrics
      prisma.session.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: timeStart }
        },
        _count: { status: true }
      }),
      
      // Error metrics (simplified - would need error tracking table)
      prisma.authLog.groupBy({
        by: ['action'],
        where: {
          createdAt: { gte: timeStart },
          status: 'FAILED'
        },
        _count: { action: true }
      })
    ]);

    // Calculate performance metrics
    const authEvents = authMetrics.reduce((sum, item) => sum + item._count.status, 0);
    const authSuccessRate = authEvents > 0 
      ? ((authMetrics.find(m => m.status === 'SUCCESS')?._count.status || 0) / authEvents) * 100 
      : 0;

    const notificationEvents = notificationMetrics.reduce((sum, item) => sum + item._count.status, 0);
    const notificationSuccessRate = notificationEvents > 0 
      ? ((notificationMetrics.find(m => m.status === 'SENT')?._count.status || 0) / notificationEvents) * 100 
      : 0;

    // Get timeline data
    const timelineData = await getTimelineData(prisma, timeStart, timeRange);

    return NextResponse.json({
      timeRange,
      timestamp: now,
      
      // Performance metrics
      performance: {
        auth: {
          total: authEvents,
          successRate: authSuccessRate,
          averageLatency: health.metrics.requests.averageLatency
        },
        notifications: {
          total: notificationEvents,
          successRate: notificationSuccessRate
        },
        database: {
          latency: health.metrics.database.latency,
          connections: health.metrics.database.connections
        },
        ai: {
          latency: health.metrics.ai.latency,
          models: health.metrics.ai.models
        }
      },

      // Security metrics
      security: {
        ...securityMetrics,
        authEvents: authEvents,
        errorEvents: errorMetrics.reduce((sum, item) => sum + item._count.action, 0)
      },

      // Resource metrics
      resources: {
        memory: health.metrics.memory,
        sessions: health.metrics.sessions,
        uptime: health.uptime
      },

      // Timeline data
      timeline: timelineData,

      // Alerts
      alerts: generateAlerts(health, securityMetrics, authSuccessRate, notificationSuccessRate)
    });
  } catch (error) {
    console.error('Metrics collection failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to collect metrics',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

async function getTimelineData(prisma: PrismaClient, timeStart: Date, timeRange: string): Promise<any[]> {
  const intervals = timeRange === '7d' ? 24 : timeRange === '24h' ? 1 : 1; // hours
  const intervalMs = intervals * 60 * 60 * 1000;
  
  const timeline = [];
  const now = new Date();
  
  for (let i = 0; i < (timeRange === '7d' ? 7 : timeRange === '24h' ? 24 : 60); i++) {
    const intervalStart = new Date(now.getTime() - (i + 1) * intervalMs);
    const intervalEnd = new Date(now.getTime() - i * intervalMs);
    
    const [authCount, notificationCount] = await Promise.all([
      prisma.authLog.count({
        where: {
          createdAt: { gte: intervalStart, lt: intervalEnd }
        }
      }),
      prisma.notification.count({
        where: {
          createdAt: { gte: intervalStart, lt: intervalEnd }
        }
      })
    ]);
    
    timeline.unshift({
      timestamp: intervalStart,
      auth: authCount,
      notifications: notificationCount
    });
  }
  
  return timeline;
}

function generateAlerts(health: any, security: any, authSuccessRate: number, notificationSuccessRate: number): any[] {
  const alerts = [];
  
  // System health alerts
  if (health.status === 'unhealthy') {
    alerts.push({
      type: 'critical',
      message: 'System is unhealthy',
      services: health.checks.filter((c: any) => c.status === 'unhealthy').map((c: any) => c.service)
    });
  } else if (health.status === 'degraded') {
    alerts.push({
      type: 'warning',
      message: 'System performance degraded',
      services: health.checks.filter((c: any) => c.status === 'degraded').map((c: any) => c.service)
    });
  }
  
  // Memory alerts
  if (health.metrics.memory.percentage > 0.9) {
    alerts.push({
      type: 'critical',
      message: 'High memory usage',
      value: `${(health.metrics.memory.percentage * 100).toFixed(1)}%`
    });
  } else if (health.metrics.memory.percentage > 0.8) {
    alerts.push({
      type: 'warning',
      message: 'Elevated memory usage',
      value: `${(health.metrics.memory.percentage * 100).toFixed(1)}%`
    });
  }
  
  // Security alerts
  if (security.suspiciousLogins > 20) {
    alerts.push({
      type: 'critical',
      message: 'High number of suspicious logins',
      value: security.suspiciousLogins
    });
  } else if (security.suspiciousLogins > 10) {
    alerts.push({
      type: 'warning',
      message: 'Elevated suspicious login activity',
      value: security.suspiciousLogins
    });
  }
  
  // Performance alerts
  if (authSuccessRate < 90) {
    alerts.push({
      type: 'warning',
      message: 'Low authentication success rate',
      value: `${authSuccessRate.toFixed(1)}%`
    });
  }
  
  if (notificationSuccessRate < 95) {
    alerts.push({
      type: 'warning',
      message: 'Low notification delivery rate',
      value: `${notificationSuccessRate.toFixed(1)}%`
    });
  }
  
  return alerts;
}

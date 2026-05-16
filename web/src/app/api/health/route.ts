import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { systemHealthMonitor } from '@/lib/monitoring/system-health';

export async function GET() {
  try {
    const monitor = systemHealthMonitor(prisma);
    const health = await monitor.getOverallHealth();

    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503;

    return NextResponse.json({
      status: health.status,
      timestamp: health.metrics.timestamp,
      uptime: health.uptime,
      services: health.checks.reduce((acc, check) => {
        acc[check.service] = {
          status: check.status,
          latency: check.latency,
          error: check.error,
          metadata: check.metadata
        };
        return acc;
      }, {} as Record<string, any>),
      metrics: {
        memory: health.metrics.memory,
        database: health.metrics.database,
        ai: health.metrics.ai,
        sessions: health.metrics.sessions,
        requests: health.metrics.requests,
        queue: health.metrics.queue
      }
    }, { status: statusCode });
  } catch (error) {
    console.error('Health check failure:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date()
      },
      { status: 503 }
    );
  }
}

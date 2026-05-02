import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { systemHealthMonitor } from '@/lib/monitoring/system-health';

export async function GET() {
  try {
    const monitor = systemHealthMonitor(prisma);
    const health = await monitor.getOverallHealth();
    const securityMetrics = await monitor.getSecurityMetrics();

    return NextResponse.json({
      status: health.status,
      timestamp: new Date(),
      uptime: health.uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      // Service status
      services: health.checks.map(check => ({
        name: check.service,
        status: check.status,
        latency: check.latency,
        error: check.error,
        metadata: check.metadata
      })),

      // System metrics
      system: {
        memory: health.metrics.memory,
        uptime: health.uptime,
        nodeVersion: process.version,
        platform: process.platform
      },

      // Database metrics
      database: {
        status: health.metrics.database.status,
        latency: health.metrics.database.latency,
        connections: health.metrics.database.connections
      },

      // AI metrics
      ai: {
        status: health.metrics.ai.status,
        latency: health.metrics.ai.latency,
        models: health.metrics.ai.models
      },

      // Session metrics
      sessions: {
        active: health.metrics.sessions.active,
        total: health.metrics.sessions.total
      },

      // Request metrics
      requests: {
        total: health.metrics.requests.total,
        failed: health.metrics.requests.failed,
        averageLatency: health.metrics.requests.averageLatency,
        failureRate: health.metrics.requests.total > 0 
          ? (health.metrics.requests.failed / health.metrics.requests.total) * 100 
          : 0
      },

      // Security metrics
      security: securityMetrics,

      // Health score (0-100)
      healthScore: calculateHealthScore(health, securityMetrics)
    });
  } catch (error) {
    console.error('System status check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to get system status',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

function calculateHealthScore(health: any, security: any): number {
  let score = 100;

  // Deduct for unhealthy services
  health.checks.forEach((check: any) => {
    if (check.status === 'unhealthy') score -= 25;
    else if (check.status === 'degraded') score -= 10;
  });

  // Deduct for high memory usage
  if (health.metrics.memory.percentage > 0.8) score -= 15;
  else if (health.metrics.memory.percentage > 0.6) score -= 5;

  // Deduct for high failure rate
  const failureRate = health.metrics.requests.total > 0 
    ? (health.metrics.requests.failed / health.metrics.requests.total) * 100 
    : 0;
  if (failureRate > 10) score -= 20;
  else if (failureRate > 5) score -= 10;

  // Deduct for security issues
  if (security.suspiciousLogins > 10) score -= 15;
  if (security.failedAttempts > 50) score -= 10;
  if (security.blockedIPs > 5) score -= 5;

  return Math.max(0, Math.min(100, score));
}

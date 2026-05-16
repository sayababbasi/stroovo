import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { loadTester } from '@/lib/testing/load-tester';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl } = body;

    // Initialize load tester
    const tester = loadTester(prisma, baseUrl);

    // Run comprehensive load tests
    const report = await tester.runLoadTests();

    // Store load test results
    await prisma.loadTest.create({
      data: {
        score: report.overallScore,
        testsRun: report.tests.length,
        failures: report.failures.length,
        warnings: report.warnings.length,
        totalRequests: report.systemMetrics.totalRequests,
        totalErrors: report.systemMetrics.totalErrors,
        averageResponseTime: Math.round(report.systemMetrics.averageResponseTime),
        peakMemoryUsage: Math.round(report.systemMetrics.peakMemoryUsage),
        peakCpuUsage: Math.round(report.systemMetrics.peakCpuUsage),
        throughput: Math.round(report.systemMetrics.throughput),
        metadata: JSON.parse(JSON.stringify({
          report: report,
          timestamp: report.timestamp,
          baseUrl: baseUrl || 'default'
        }))
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        summary: {
          totalTests: report.tests.length,
          passed: report.tests.filter(t => t.status === 'PASS').length,
          failed: report.failures.length,
          warnings: report.warnings.length,
          criticalIssues: report.failures.filter(f => f.severity === 'CRITICAL').length,
          highIssues: report.failures.filter(f => f.severity === 'HIGH').length,
          mediumIssues: report.failures.filter(f => f.severity === 'MEDIUM').length,
          lowIssues: report.failures.filter(f => f.severity === 'LOW').length
        }
      }
    });
  } catch (error) {
    console.error('Load test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Load test failed',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

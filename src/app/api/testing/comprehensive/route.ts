import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comprehensiveTestRunner } from '@/lib/testing/runner';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl, quickCheck, productionReadiness } = body;

    // Initialize comprehensive test runner
    const runner = comprehensiveTestRunner(prisma) as any;

    if (quickCheck) {
      // Quick health check for CI/CD
      const healthCheck = await runner.quickHealthCheck();
      
      return NextResponse.json({
        success: true,
        type: 'quick-check',
        result: healthCheck,
        timestamp: new Date()
      });
    }

    if (productionReadiness) {
      // Production readiness check
      const readinessCheck = await runner.productionReadinessCheck();
      
      return NextResponse.json({
        success: true,
        type: 'production-readiness',
        result: readinessCheck,
        timestamp: new Date()
      });
    }

    // Full comprehensive test suite
    const report = await runner.runAllTests();

    return NextResponse.json({
      success: true,
      type: 'comprehensive',
      report: {
        ...report,
        summary: {
          totalTests: report.summary.totalTests,
          passed: report.summary.passed,
          failed: report.summary.failed,
          warnings: report.summary.warnings,
          criticalIssues: report.summary.criticalIssues,
          highIssues: report.summary.highIssues,
          mediumIssues: report.summary.mediumIssues,
          lowIssues: report.summary.lowIssues,
          overallScore: report.overallScore,
          readinessScore: report.readinessScore,
          systemStatus: report.systemStatus
        }
      }
    });
  } catch (error) {
    console.error('Comprehensive test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Comprehensive test failed',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get recent comprehensive test reports
    const reports = await prisma.comprehensiveTest.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.comprehensiveTest.count();

    return NextResponse.json({
      reports: reports.map(report => ({
        id: report.id,
        overallScore: report.overallScore,
        systemStatus: report.systemStatus,
        readinessScore: report.readinessScore,
        totalTests: report.totalTests,
        passed: report.passed,
        failed: report.failed,
        warnings: report.warnings,
        criticalIssues: report.criticalIssues,
        highIssues: report.highIssues,
        mediumIssues: report.mediumIssues,
        lowIssues: report.lowIssues,
        duration: report.duration,
        createdAt: report.createdAt,
        summary: report.metadata as any
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Failed to get comprehensive test reports:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve comprehensive test reports',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

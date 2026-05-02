import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { aiValidator } from '@/lib/testing/ai-validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl } = body;

    // Initialize AI validator
    const validator = aiValidator(prisma, baseUrl);

    // Run comprehensive AI tests
    const report = await validator.runAITests();

    // Store AI validation results
    await prisma.aIValidation.create({
      data: {
        score: report.overallScore,
        testsRun: report.tests.length,
        failures: report.failures.length,
        warnings: report.warnings.length,
        averageResponseTime: Math.round(report.aiMetrics.averageResponseTime),
        successRate: Math.round(report.aiMetrics.successRate * 100),
        metadata: {
          report: report,
          timestamp: report.timestamp,
          baseUrl: baseUrl || 'default'
        }
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
    console.error('AI validation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'AI validation failed',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

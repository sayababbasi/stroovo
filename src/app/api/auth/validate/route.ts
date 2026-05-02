import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authValidator } from '@/lib/testing/auth-validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl } = body;

    // Initialize auth validator
    const validator = authValidator(prisma, baseUrl);

    // Run comprehensive auth tests
    const report = await validator.runAuthTests();

    // Store auth validation results
    await prisma.authValidation.create({
      data: {
        score: report.overallScore,
        testsRun: report.tests.length,
        failures: report.failures.length,
        warnings: report.warnings.length,
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
    console.error('Auth validation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Auth validation failed',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

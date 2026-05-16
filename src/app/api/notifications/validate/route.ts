import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notificationValidator } from '@/lib/testing/notification-validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl } = body;

    // Initialize notification validator
    const validator = notificationValidator(prisma, baseUrl);

    // Run comprehensive notification tests
    const report = await validator.runNotificationTests();

    // Store notification validation results
    await prisma.notificationValidation.create({
      data: {
        score: report.overallScore,
        testsRun: report.tests.length,
        failures: report.failures.length,
        warnings: report.warnings.length,
        emailSuccess: report.channelMetrics.email.success,
        emailFailed: report.channelMetrics.email.failed,
        whatsappSuccess: report.channelMetrics.whatsapp.success,
        whatsappFailed: report.channelMetrics.whatsapp.failed,
        pushSuccess: report.channelMetrics.push.success,
        pushFailed: report.channelMetrics.push.failed,
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
    console.error('Notification validation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Notification validation failed',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

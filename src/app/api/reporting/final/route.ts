import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { finalReportGenerator } from '@/lib/reporting/final-report-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl } = body;

    // Initialize final report generator
    const generator = finalReportGenerator(prisma, baseUrl);

    // Generate comprehensive final report
    const report = await generator.generateFinalReport();

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        summary: {
          overallScore: report.summary.totalScore,
          grade: report.summary.grade,
          systemStatus: report.systemOverview.status,
          readinessStatus: report.productionReadiness.status,
          criticalIssues: report.securityAssessment.vulnerabilities.critical,
          highIssues: report.securityAssessment.vulnerabilities.high,
          totalTests: report.summary.totalScore,
          strengths: report.summary.strengths,
          weaknesses: report.summary.weaknesses,
          recommendations: report.summary.nextSteps
        }
      }
    });
  } catch (error) {
    console.error('Final report generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Final report generation failed',
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

    // Get recent final reports
    const reports = await prisma.finalReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: true
      }
    });

    const total = await prisma.finalReport.count();

    return NextResponse.json({
      reports: reports.map(report => ({
        id: report.id,
        overallScore: report.overallScore,
        grade: report.grade,
        systemStatus: report.systemStatus,
        securityScore: report.securityScore,
        performanceScore: report.performanceScore,
        authScore: report.authScore,
        aiScore: report.aiScore,
        notificationScore: report.notificationScore,
        readinessScore: report.readinessScore,
        totalTests: report.totalTests,
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
    console.error('Failed to get final reports:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve final reports',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

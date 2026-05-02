import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { securityTester } from '@/lib/security/security-tester';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl, testCategories } = body;

    // Initialize security tester
    const tester = securityTester(prisma, baseUrl);

    // Run comprehensive security tests
    const report = await tester.runAllTests();

    // Store security audit results
    await prisma.securityAudit.create({
      data: {
        score: report.overallScore,
        status: report.systemStatus,
        vulnerabilities: report.vulnerabilities.length,
        warnings: report.tests.filter(t => t.status === 'WARNING').length,
        testsRun: report.tests.length,
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
          failed: report.tests.filter(t => t.status === 'FAIL').length,
          warnings: report.tests.filter(t => t.status === 'WARNING').length,
          criticalIssues: report.vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
          highIssues: report.vulnerabilities.filter(v => v.severity === 'HIGH').length,
          mediumIssues: report.vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
          lowIssues: report.vulnerabilities.filter(v => v.severity === 'LOW').length
        }
      }
    });
  } catch (error) {
    console.error('Security audit failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Security audit failed',
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

    // Get recent security audit reports
    const audits = await prisma.securityAudit.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: true
      }
    });

    const total = await prisma.securityAudit.count();

    return NextResponse.json({
      audits: audits.map(audit => ({
        id: audit.id,
        score: audit.score,
        status: audit.status,
        vulnerabilities: audit.vulnerabilities,
        warnings: audit.warnings,
        testsRun: audit.testsRun,
        createdAt: audit.createdAt,
        summary: audit.metadata as any
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Failed to get security audits:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve security audits',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

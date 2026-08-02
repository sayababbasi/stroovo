import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
  const authResult = await requirePermission('audit_logs.view')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, critical, failed] = await Promise.all([
      prisma.activityLog.count(),
      prisma.activityLog.count({ where: { createdAt: { gte: today } } }),
      prisma.activityLog.count({ where: { severity: 'CRITICAL' } }),
      prisma.activityLog.count({ where: { result: { in: ['FAILED', 'BLOCKED'] } } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        today: todayCount,
        critical,
        failed
      }
    });
  } catch (error: any) {
    console.error('[GET /api/admin/audit/stats]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

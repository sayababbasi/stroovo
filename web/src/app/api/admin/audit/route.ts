import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { requirePermission, hasPermission } from '@/lib/authorization';

export async function GET(request: Request) {
  const authResult = await requirePermission('audit_logs.view')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const take = parseInt(searchParams.get('take') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const result = searchParams.get('result');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const canViewSensitive = hasPermission(authResult.user, 'audit_logs.view_sensitive');

    const where: any = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (action) where.action = action;
    if (severity) where.severity = severity;
    if (result) where.result = result;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, systemRole: { select: { name: true } } }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ]);

    // Strip sensitive fields if user lacks permission
    const processedLogs = logs.map(log => {
      if (!canViewSensitive) {
        return {
          ...log,
          ipAddress: null,
          userAgent: null,
          location: null,
          sessionId: null,
        };
      }
      return log;
    });

    return NextResponse.json({
      success: true,
      data: processedLogs,
      meta: {
        total,
        take,
        skip,
        canViewSensitive
      }
    });

  } catch (error: any) {
    console.error('[GET /api/admin/audit]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

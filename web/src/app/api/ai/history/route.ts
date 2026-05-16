import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
    const authResult = await requirePermission('ai.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const tenantId = authResult.user.tenantId;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const where: any = { tenantId };
        if (type && type !== 'ALL') where.type = type;

        const timelineEvents = await (prisma as any).aITimelineEvent.findMany({
            where,
            include: {
                decision: true
            },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        return NextResponse.json(timelineEvents);
    } catch (error: any) {
        console.error('[API/AI/History/GET] Failed:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

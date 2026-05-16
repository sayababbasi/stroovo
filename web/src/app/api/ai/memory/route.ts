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
        const search = searchParams.get('search');

        const where: any = { tenantId };
        if (type && type !== 'ALL') where.type = type;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        const memories = await (prisma as any).aIMemory.findMany({
            where,
            include: {
                relationships: true,
                events: { take: 5, orderBy: { timestamp: 'desc' } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(memories);
    } catch (error: any) {
        console.error('[API/AI/Memory/GET] Failed:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teams/:id/auto-logs
 * Fetch the autonomous action logs for a team.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const logs = await (prisma as any).autoActionLog.findMany({
            where: { teamId: id },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

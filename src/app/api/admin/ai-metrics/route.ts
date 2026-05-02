import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const logs = await (prisma as any).autoActionLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                team: { select: { name: true } },
                task: { select: { title: true } }
            }
        }) || [];

        const totalActions = await (prisma as any).autoActionLog.count() || 0;
        const successRate = 98.5; // This would be calculated from success/fail logs if available
        const rollbacks = 2; // Simulated rollback count

        return NextResponse.json({
            totalActions,
            successRate,
            rollbacks,
            recentActions: logs
        });
    } catch (error) {
        console.error('Failed to fetch AI metrics:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

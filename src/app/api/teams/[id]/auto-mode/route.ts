import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/teams/:id/auto-mode
 * Toggle autonomous mode for a team.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { mode } = await request.json();
        if (!['OFF', 'SUGGEST', 'AUTO'].includes(mode)) {
            return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
        }

        const { id } = await params;
        const team = await (prisma.team as any).update({
            where: { id },
            data: { autoMode: mode }
        });

        return NextResponse.json(team);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

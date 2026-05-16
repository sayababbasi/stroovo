import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DecisionEngine } from '@/lib/teams/decision-engine';
import prisma from '@/lib/prisma';

/**
 * GET /api/tasks/:id/suggest-assignee
 * Returns the best team member for this task based on workload and performance.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const { id } = await params;
        
        // Find the team for this task
        const task = await prisma.task.findUnique({
            where: { id },
            select: { teamId: true }
        });

        if (!task || !task.teamId) {
            return NextResponse.json({ error: 'Task must be associated with a team for smart assignment' }, { status: 400 });
        }

        const suggestion = await DecisionEngine.getBestAssignee(id, task.teamId, tenantId);
        return NextResponse.json(suggestion);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

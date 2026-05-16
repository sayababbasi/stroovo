import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WorkloadEngine } from '@/lib/teams/workload-engine';

/**
 * GET /api/teams/:id/workload
 * Returns real-time workload analytics for every member of the team.
 *
 * Response shape:
 * {
 *   teamId, teamName, memberCount,
 *   totalActiveTasks, totalCompletedTasks, totalBlockedTasks,
 *   healthScore,
 *   members: [
 *     { userId, userName, email, role,
 *       activeTasks, completedTasks, blockedTasks, totalTasks,
 *       workloadPercentage, completionRate, avgCompletionDays,
 *       status: "idle" | "balanced" | "overloaded" }
 *   ]
 * }
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
        const workload = await WorkloadEngine.calculateTeamWorkload(id, tenantId);

        return NextResponse.json(workload);
    } catch (error: any) {
        console.error(`[GET /api/teams/:id/workload] Error:`, error);
        const status = error.message === 'Team not found' ? 404 : 500;
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
    }
}

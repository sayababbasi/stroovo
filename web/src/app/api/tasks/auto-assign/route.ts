import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DecisionEngine } from '@/lib/teams/decision-engine';

/**
 * POST /api/tasks/auto-assign
 * Trigger automatic best-fit assignment for a specific task.
 * Body: { taskId, teamId }
 */
export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id') || 'SYSTEM';

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const body = await request.json();
        const { taskId, teamId } = body;

        if (!taskId || !teamId) {
            return NextResponse.json({ error: 'taskId and teamId are required' }, { status: 400 });
        }

        const result = await DecisionEngine.autoAssign(taskId, teamId, tenantId, userId);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

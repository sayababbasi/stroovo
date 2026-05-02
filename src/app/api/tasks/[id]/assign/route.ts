import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AssignmentService } from '@/lib/teams/assignment-service';

/**
 * POST /api/tasks/:id/assign
 * Assign or Reassign users to a task.
 * Body: { userIds: string[], reassign?: boolean }
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id') || undefined;
        const userId = headerList.get('x-user-id') || 'SYSTEM';

        const { id } = await params;
        const body = await request.json();

        if (!body.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0) {
            return NextResponse.json(
                { error: 'userIds array is required' },
                { status: 400 }
            );
        }

        if (body.reassign) {
            // Reassign uses the first ID in the array as the target
            const result = await AssignmentService.reassignTask(id, body.userIds[0], userId, tenantId);
            return NextResponse.json(result);
        }

        const result = await AssignmentService.assignUsers(id, body.userIds, userId, tenantId);
        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error(`[POST /api/tasks/:id/assign] Error:`, error);
        const msg = error.message || 'Internal Server Error';
        let status = 500;
        if (msg.includes('not found')) status = 404;
        else if (msg.includes('not members')) status = 403;
        return NextResponse.json({ error: msg }, { status });
    }
}

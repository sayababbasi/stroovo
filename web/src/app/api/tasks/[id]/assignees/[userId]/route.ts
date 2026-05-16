import { NextResponse } from 'next/server';
import { AssignmentService } from '@/lib/teams/assignment-service';
import { headers } from 'next/headers';

/**
 * DELETE /api/tasks/:id/assignees/:userId
 * Remove a specific user from a task assignment.
 * If the removed user was the primary assignee, the next assignee takes over.
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {
    try {
        const { id, userId } = await params;
        // In a real app we'd get this from auth session
        const headerList = await headers();
        const performedBy = headerList.get('x-user-id') || 'SYSTEM';

        const result = await AssignmentService.removeAssignee(id, userId, performedBy);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error(`[DELETE /api/tasks/:id/assignees/:userId] Error:`, error);
        const msg = error.message || 'Internal Server Error';
        const status = msg.includes('not found') ? 404 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}

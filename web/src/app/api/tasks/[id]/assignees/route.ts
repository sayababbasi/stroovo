import { NextResponse } from 'next/server';
import { AssignmentService } from '@/lib/teams/assignment-service';

/**
 * GET /api/tasks/:id/assignees
 * Returns all users assigned to a task, ordered by assignment date.
 *
 * Response: [{ id, taskId, userId, assignedBy, assignedAt, user: { id, name, email, image, role, title } }]
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const assignees = await AssignmentService.getAssignees(id);
        return NextResponse.json(assignees);
    } catch (error: any) {
        console.error(`[GET /api/tasks/:id/assignees] Error:`, error);
        const status = error.message === 'Task not found' ? 404 : 500;
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
    }
}

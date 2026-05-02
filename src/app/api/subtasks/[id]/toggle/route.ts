import { NextResponse } from 'next/server';
import { SubTaskService } from '@/lib/teams/subtask-service';

/**
 * PATCH /api/subtasks/:id/toggle
 * Toggle subtask completion status.
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (body.isCompleted === undefined) {
            return NextResponse.json({ error: 'isCompleted is required' }, { status: 400 });
        }

        const subtask = await SubTaskService.toggleSubTask(id, body.isCompleted);
        return NextResponse.json(subtask);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

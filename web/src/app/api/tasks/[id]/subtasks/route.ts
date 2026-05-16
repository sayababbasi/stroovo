import { NextResponse } from 'next/server';
import { SubTaskService } from '@/lib/teams/subtask-service';

/**
 * POST /api/tasks/:id/subtasks
 * Create a new subtask for a task.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const subtask = await SubTaskService.createSubTask(id, body.title);
        return NextResponse.json(subtask, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('tasks.update.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const body = await request.json();
        
        if (!body.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const subtask = await prisma.subTask.create({
            data: {
                title: body.title,
                taskId: id,
                isCompleted: false
            }
        });

        // Optimistically increment project progress or just rely on manual refresh
        // (Usually handled via a database trigger or a background worker, but we'll return it directly)
        
        return NextResponse.json(subtask, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/tasks/:id/subtasks] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await _request.json();
        const { title, description, status, priority, type, assigneeId, dueDate, progress } = body;

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = String(title);
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (type !== undefined) updateData.type = type;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (progress !== undefined) updateData.progress = Number(progress);

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } },
            },
        });
        return NextResponse.json(task);
    } catch (error) {
        console.error('Failed to update task:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.task.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete task:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

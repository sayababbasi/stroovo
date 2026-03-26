import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';



export async function OPTIONS() {
    return NextResponse.json({});
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assigneeId = searchParams.get('assigneeId');

        const tasks = await prisma.task.findMany({
            where: assigneeId ? { assigneeId } : {},
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } },
                subTasks: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : null;
        return NextResponse.json({ error: 'Internal Server Error', details: errorMessage, stack: errorStack }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, status, priority, type, projectId, assigneeId, dueDate } = body;

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project is required' },
                { status: 400 }
            );
        }

        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                status: status || 'TODO',
                priority: priority || 'MEDIUM',
                type: type || 'TASK',
                projectId,
                assigneeId: assigneeId || null,
                dueDate: dueDate ? new Date(dueDate) : null
            },
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } }
            }
        });
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Failed to create task:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

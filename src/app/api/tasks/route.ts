import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                project: {
                    select: { name: true }
                },
                assignee: {
                    select: { name: true, image: true }
                },
                subTasks: true
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, projectId, status, priority, type, assigneeId, startDate, dueDate, progress } = body;
        if (!title || !projectId) {
            return NextResponse.json({ error: 'Title and project are required' }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                title: String(title),
                description: description ?? null,
                projectId: String(projectId),
                status: status ?? 'TODO',
                priority: priority ?? 'MEDIUM',
                type: type ?? 'TASK',
                assigneeId: assigneeId || null,
                startDate: startDate ? new Date(startDate) : new Date(),
                dueDate: dueDate ? new Date(dueDate) : null,
                progress: progress ?? 0,
            },
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } },
            },
        });
        return NextResponse.json(task);
    } catch (error) {
        console.error('Failed to create task:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

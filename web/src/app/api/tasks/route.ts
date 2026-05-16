import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { CreateTaskSchema } from '@/validation/task';
import { TaskService } from '@/lib/tasks/task-service';
import { canAccessTask, requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
    const authResult = await requirePermission('tasks.read.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const { searchParams } = new URL(request.url);
        const assigneeId = searchParams.get('assigneeId');
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const teamId = searchParams.get('teamId');
        const spaceId = searchParams.get('spaceId');
        const listId = searchParams.get('listId');
        const priority = searchParams.get('priority');

        const whereClause: any = {};
        if (tenantId) whereClause.tenantId = tenantId;
        if (assigneeId) whereClause.assigneeId = assigneeId;
        if (projectId) whereClause.projectId = projectId;
        if (status) whereClause.status = status;
        if (teamId) whereClause.teamId = teamId;
        if (spaceId) whereClause.spaceId = spaceId;
        if (listId) whereClause.listId = listId;
        if (priority) whereClause.priority = priority;

        const tasks = await (prisma.task as any).findMany({
            where: whereClause,
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } },
                subTasks: true,
                parent: { select: { title: true } },
                dependencies: { select: { id: true, title: true, status: true } },
                team: { select: { id: true, name: true } },
                _count: { select: { comments: true, files: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        const visibleTasks = await Promise.all(
            tasks.map(async (task: any) => ((await canAccessTask(authResult.user, task, 'read')) ? task : null))
        );

        return NextResponse.json(visibleTasks.filter(Boolean));
    } catch (error: any) {
        console.error('[GET /api/tasks] Failed to fetch tasks:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authResult = await requirePermission('tasks.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id') || undefined;
        const userId = authResult.user.id;

        const body = await request.json();
        
        // 1. Zod Validation
        const parsed = CreateTaskSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
        }

        // 2. Delegate to TaskService
        const task = await TaskService.createTask(parsed.data, userId, tenantId);

        // 3. Return newly created task with relations populated
        const fullTask = await prisma.task.findUnique({
            where: { id: task.id },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json(fullTask, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/tasks] Failed to create task:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

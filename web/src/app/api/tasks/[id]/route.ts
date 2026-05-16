import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { UpdateTaskSchema } from '@/validation/task';
import { TaskService } from '@/lib/tasks/task-service';
import { canAccessTask, requirePermission } from '@/lib/authorization';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('tasks.read.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        const { id } = await params;
        
        console.log('[GET /api/tasks/:id] Fetching task:', id, 'by user:', userId);
        
        const task = await (prisma.task as any).findUnique({
            where: { id },
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } },
                subTasks: { 
                    select: { id: true, title: true, status: true, priority: true },
                    orderBy: { createdAt: 'asc' }
                },
                dependencies: { select: { id: true, title: true, status: true } },
                files: true,
                _count: { select: { comments: true, files: true } },
            }
        });

        if (!task) {
            console.log('[GET /api/tasks/:id] Task not found:', id);
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (!(await canAccessTask(authResult.user, task, 'read'))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const generationHistory = await prisma.activityLog.findMany({
            where: {
                entity: 'TASK',
                entityId: id,
                action: 'AI_SUBTASK_GENERATED',
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                createdAt: true,
                metadata: true,
            }
        });

        console.log('[GET /api/tasks/:id] Task fetched successfully:', task.title);
        return NextResponse.json({
            ...task,
            generationHistory,
        });
    } catch (error: any) {
        console.error('[GET /api/tasks/:id] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('tasks.update.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id') || undefined;
        const userId = authResult.user.id;

        const { id } = await params;
        const body = await request.json();

        console.log('[PATCH /api/tasks/:id] Updating task:', id, 'by user:', userId);

        const existingTask = await prisma.task.findUnique({
            where: { id },
            select: {
                id: true,
                assigneeId: true,
                teamId: true,
                tenantId: true,
            }
        });
        if (!(await canAccessTask(authResult.user, existingTask, 'update'))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const parsed = UpdateTaskSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
        }

        // 2. Delegate to TaskService
        const task = await TaskService.updateTask(id, parsed.data, userId, tenantId);

        // 3. Return full task
        const fullTask = await (prisma.task as any).findUnique({
            where: { id: task.id },
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } },
                subTasks: { select: { id: true, title: true, status: true } },
                dependencies: { select: { id: true, title: true, status: true } },
                files: true,
                _count: { select: { comments: true, files: true } },
            }
        });

        return NextResponse.json(fullTask);
    } catch (error: any) {
        console.error(`[PATCH /api/tasks/${error.taskId}] Failed to update task:`, error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error.message.includes('not found') ? 404 : 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('tasks.delete.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id') || undefined;
        const userId = authResult.user.id;

        const { id } = await params;

        const existingTask = await prisma.task.findUnique({
            where: { id }
        });

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (!(await canAccessTask(authResult.user, existingTask, 'delete'))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.task.delete({
            where: { id }
        });

        // Log activity (We do this manually here since deletion isn't in TaskService yet)
        if (tenantId) {
            await prisma.activityLog.create({
                data: {
                    action: 'TASK_DELETE',
                    entity: 'TASK',
                    entityId: id,
                    metadata: { title: existingTask.title },
                    tenantId,
                    userId
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`[DELETE /api/tasks/${error.taskId}] Failed to delete task:`, error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

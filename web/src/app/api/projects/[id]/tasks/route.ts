import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('tasks.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const body = await request.json();
        const tenantId = authResult.user.tenantId;
        const userId = authResult.user.id;

        // Ensure project exists and belongs to tenant
        const project = await prisma.project.findFirst({
            where: { id, tenantId, status: { not: 'DELETED' } }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const task = await prisma.task.create({
            data: {
                title: body.title,
                description: body.description || '',
                type: body.type || 'TASK',
                status: body.status || 'TODO',
                priority: body.priority || 'MEDIUM',
                storyPoints: body.storyPoints ? parseFloat(body.storyPoints) : null,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                projectId: id,
                tenantId: tenantId,
                assigneeId: body.assigneeId || null,
                createdBy: userId,
            },
            include: {
                assignee: { select: { id: true, name: true, image: true } },
                subtasks: true,
                dependencies: { select: { id: true, status: true } },
                dependedBy: { select: { id: true, status: true } }
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'TASK_CREATED',
                entity: 'TASK',
                entityId: task.id,
                tenantId: tenantId || '',
                userId: userId,
                metadata: { projectId: id, taskTitle: task.title } as any
            }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('[API/Projects/Tasks/POST] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

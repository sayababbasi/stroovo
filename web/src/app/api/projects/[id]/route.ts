import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { ProjectEngine } from '@/lib/projects/project-engine';
import { projectEventBus, ProjectEventFactory } from '@/events/project-events';
import { cache } from '@/lib/cache';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('projects.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const tenantId = authResult.user.tenantId;

        const project = await (prisma.project as any).findFirst({
            where: { id, tenantId, status: { not: 'DELETED' } },
            include: {
                manager: { select: { id: true, name: true, email: true, image: true } },
                _count: { select: { tasks: true } },
                goal: true,
                tasks: {
                    include: {
                        assignee: { select: { name: true, image: true } },
                    },
                    orderBy: { dueDate: 'asc' }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Fetch activity logs for this project
        const activityLogs = await prisma.activityLog.findMany({
            where: { entityId: id, entity: 'PROJECT', tenantId: tenantId || undefined },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { name: true, image: true } } }
        });

        // Fetch files from tasks in this project
        const files = await prisma.taskFile.findMany({
            where: { task: { projectId: id } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Refresh intelligence if requested or if data is stale
        const { searchParams } = new URL(request.url);
        if (searchParams.get('refresh') === 'true') {
            await ProjectEngine.refreshProject(id);
            // Re-fetch after refresh
            const updatedProject = await (prisma.project as any).findUnique({
                where: { id },
                include: {
                    manager: { select: { id: true, name: true, email: true, image: true } },
                    _count: { select: { tasks: true } },
                    goal: true,
                    tasks: {
                        include: {
                            assignee: { select: { name: true, image: true } },
                        },
                        orderBy: { dueDate: 'asc' }
                    }
                }
            });
            return NextResponse.json({ ...updatedProject, activityLogs, files });
        }

        return NextResponse.json({ ...project, activityLogs, files });
    } catch (error) {
        console.error('[API/Projects/ID/GET] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('projects.update')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const tenantId = authResult.user.tenantId;
        const userId = authResult.user.id;
        
        const { id } = await params;
        const body = await request.json();

        // Ensure project belongs to tenant
        const existingProject = await (prisma.project as any).findFirst({
            where: { id, tenantId, status: { not: 'DELETED' } }
        });

        if (!existingProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const { id: _, createdAt, updatedAt, tenantId: __, ...updateData } = body;

        const finalUpdateData: any = { ...updateData };
        if (updateData.startDate) finalUpdateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) finalUpdateData.endDate = updateData.endDate ? new Date(updateData.endDate) : null;

        const project = await (prisma.project as any).update({
            where: { id },
            data: finalUpdateData
        });

        // Trigger Intelligence Engine refresh
        await ProjectEngine.refreshProject(id);

        // Emit Update Event
        projectEventBus.emitProjectEvent(
            ProjectEventFactory.createUpdatedEvent(id, userId, tenantId || 'default', updateData)
        );

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'PROJECT_UPDATE',
                entity: 'PROJECT',
                entityId: project.id,
                metadata: { changes: updateData },
                tenantId: tenantId || 'default',
                userId
            }
        });

        // Invalidate caches
        await cache.del(`projects:${tenantId}`);

        return NextResponse.json(project);
    } catch (error) {
        console.error('[API/Projects/ID/PATCH] Failed to update project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('projects.delete')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const tenantId = authResult.user.tenantId;
        const userId = authResult.user.id;
        
        const { id } = await params;

        // Ensure project belongs to tenant
        const existingProject = await (prisma.project as any).findFirst({
            where: { id, tenantId, status: { not: 'DELETED' } }
        });

        if (!existingProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // SOFT DELETE
        await (prisma.project as any).update({
            where: { id },
            data: { 
                status: 'DELETED'
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'PROJECT_DELETE',
                entity: 'PROJECT',
                entityId: id,
                metadata: { name: existingProject.name, softDelete: true },
                tenantId: tenantId || 'default',
                userId
            }
        });

        // Invalidate caches
        await cache.del(`projects:${tenantId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API/Projects/ID/DELETE] Failed to delete project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

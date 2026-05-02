import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('projects.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const tenantId = authResult.user.tenantId;

        // Fetch project and its task IDs so we can get activity for both
        const project = await (prisma.project as any).findFirst({
            where: { id, tenantId, status: { not: 'DELETED' } },
            select: { id: true, tasks: { select: { id: true } } }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const taskIds = project.tasks?.map((t: any) => t.id) || [];
        
        const activityLogs = await (prisma.activityLog as any).findMany({
            where: {
                tenantId,
                OR: [
                    { entity: 'PROJECT', entityId: id },
                    { entity: 'TASK', entityId: { in: taskIds } }
                ]
            },
            include: {
                user: { select: { id: true, name: true, image: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(activityLogs);
    } catch (error) {
        console.error('[API/Projects/ID/Activity/GET] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

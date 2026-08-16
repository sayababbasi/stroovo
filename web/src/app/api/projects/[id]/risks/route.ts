import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { projectEventBus, ProjectEventFactory } from '@/events/project-events';

export async function POST(
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

        const { title, impact, probability, status } = body;

        if (!title || !impact || !probability) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const project = await (prisma.project as any).findFirst({
            where: { id, tenantId, status: { not: 'DELETED' } }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const risk = await prisma.risk.create({
            data: {
                projectId: id,
                title,
                impact,
                probability,
                status: status || 'OPEN'
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'RISK_CREATED',
                entity: 'PROJECT',
                entityId: project.id,
                metadata: { riskId: risk.id, title },
                tenantId: tenantId || 'default',
                userId
            }
        });

        return NextResponse.json(risk, { status: 201 });
    } catch (error) {
        console.error('[API/Projects/ID/Risks/POST] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

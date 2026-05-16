import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { cache } from '@/lib/cache';

export async function GET(request: Request) {
    const authResult = await requirePermission('automations.read')(request as any);
    if (!authResult.success) return authResult.response;
    
    try {
        const tenantId = authResult.user.tenantId;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        const where: any = { tenantId };
        if (status && status !== 'ALL') where.status = status;
        if (type && type !== 'ALL') where.type = type;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Diagnostic check
        if (!(prisma as any).automation) {
            console.error('[PRISMA DIAGNOSTIC] Automation model missing from client keys:', Object.keys(prisma));
            throw new Error('Prisma automation model is missing from the client. Ensure prisma generate was run and server restarted.');
        }

        const automations = await (prisma as any).automation.findMany({
            where,
            include: {
                owner: { select: { id: true, name: true, image: true } },
                analytics: true,
                _count: {
                    select: {
                        executions: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(automations);
    } catch (error: any) {
        console.error('[API/Automations/GET] Failed:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authResult = await requirePermission('automations.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const tenantId = authResult.user.tenantId;
        const userId = authResult.user.id;
        const body = await request.json();
        
        const { name, description, type, nodes, edges, isAutonomous } = body;

        if (!name) {
            return NextResponse.json({ error: 'Automation name is required' }, { status: 400 });
        }

        const automation = await prisma.automation.create({
            data: {
                name,
                description,
                type: type || 'OPERATIONAL',
                status: 'DRAFT',
                isAutonomous: isAutonomous || false,
                tenantId: tenantId || 'default',
                ownerId: userId,
                nodes: {
                    create: nodes?.map((node: any) => ({
                        type: node.type,
                        subType: node.subType,
                        config: node.config || {},
                        positionX: node.position.x,
                        positionY: node.position.y
                    }))
                },
                edges: {
                    create: edges?.map((edge: any) => ({
                        sourceNodeId: edge.source,
                        targetNodeId: edge.target,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle,
                        config: edge.config || {}
                    }))
                }
            },
            include: {
                nodes: true,
                edges: true
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'AUTOMATION_CREATE',
                entity: 'AUTOMATION',
                entityId: automation.id,
                metadata: { name: automation.name },
                tenantId: tenantId || 'default',
                userId
            }
        });

        return NextResponse.json(automation, { status: 201 });
    } catch (error: any) {
        console.error('[API/Automations/POST] Failed:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

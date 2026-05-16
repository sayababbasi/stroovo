import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const authResult = await requirePermission('automations.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        if (!(prisma as any).automation) {
            console.error('[PRISMA DIAGNOSTIC] Automation model missing in [id] route. Keys:', Object.keys(prisma));
            throw new Error('Database synchronization error. Please refresh the dashboard.');
        }

        const automation = await (prisma as any).automation.findUnique({
            where: { id },
            include: {
                nodes: true,
                edges: true,
                owner: { select: { id: true, name: true, image: true } },
                analytics: true,
                executions: {
                    take: 10,
                    orderBy: { startTime: 'desc' }
                }
            }
        });

        if (!automation) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
        }

        return NextResponse.json(automation);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const authResult = await requirePermission('automations.update')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const body = await request.json();
        const { name, description, status, nodes, edges, isAutonomous } = body;

        // Transaction to update automation and its nodes/edges
        const automation = await prisma.$transaction(async (tx: any) => {
            // Update basic info
            const updated = await tx.automation.update({
                where: { id },
                data: {
                    name,
                    description,
                    status,
                    isAutonomous,
                    updatedAt: new Date()
                }
            });

            // If nodes are provided, replace them
            if (nodes) {
                await tx.automationNode.deleteMany({ where: { automationId: id } });
                await tx.automationNode.createMany({
                    data: nodes.map((node: any) => ({
                        automationId: id,
                        type: node.type,
                        subType: node.subType,
                        config: node.config || {},
                        positionX: node.position.x,
                        positionY: node.position.y
                    }))
                });
            }

            // If edges are provided, replace them
            if (edges) {
                await tx.automationEdge.deleteMany({ where: { automationId: id } });
                await tx.automationEdge.createMany({
                    data: edges.map((edge: any) => ({
                        automationId: id,
                        sourceNodeId: edge.source,
                        targetNodeId: edge.target,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle,
                        config: edge.config || {}
                    }))
                });
            }

            return updated;
        });

        return NextResponse.json(automation);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const authResult = await requirePermission('automations.delete')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        await prisma.automation.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Automation deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

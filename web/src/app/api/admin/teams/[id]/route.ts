import { NextResponse } from 'next/server';
import { requirePermission, logAdminAction } from '@/lib/authorization';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('teams.read.all')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const tenantId = authResult.user.tenantId;

        const team = await prisma.team.findUnique({
            where: { id, tenantId },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true, image: true, status: true, isActive: true } }, systemRole: true }
                },
                spaces: true,
                tasks: { take: 5, orderBy: { createdAt: 'desc' } }
            }
        });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: team });
    } catch (error: any) {
        console.error('[GET /api/admin/teams/:id] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('teams.edit')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const tenantId = authResult.user.tenantId;
        const body = await request.json();
        const { name, description, status, newOwnerId } = body;

        const team = await prisma.team.findUnique({ where: { id, tenantId } });
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;

        const updatedTeam = await prisma.$transaction(async (tx) => {
            let t = await tx.team.update({
                where: { id },
                data: updateData
            });

            if (newOwnerId) {
                // Remove existing OWNER roles for this team
                await tx.teamMember.updateMany({
                    where: { teamId: id, role: 'OWNER' },
                    data: { role: 'MEMBER' }
                });

                // Set or create new owner
                const existingMember = await tx.teamMember.findUnique({
                    where: { teamId_userId: { teamId: id, userId: newOwnerId } }
                });

                if (existingMember) {
                    await tx.teamMember.update({
                        where: { id: existingMember.id },
                        data: { role: 'OWNER' }
                    });
                } else {
                    await tx.teamMember.create({
                        data: { teamId: id, userId: newOwnerId, role: 'OWNER' }
                    });
                }
            }

            return t;
        });

        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_TEAM_UPDATE',
            entity: 'TEAM',
            entityId: id,
            metadata: { updates: Object.keys(updateData), newOwnerId }
        });

        return NextResponse.json({ success: true, data: updatedTeam });
    } catch (error: any) {
        console.error('[PATCH /api/admin/teams/:id] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('teams.delete')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const tenantId = authResult.user.tenantId;

        const team = await prisma.team.findUnique({ where: { id, tenantId } });
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Hard delete - Cascade constraints should handle related records 
        // if they are configured correctly in schema.prisma
        await prisma.team.delete({
            where: { id }
        });

        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_TEAM_DELETE',
            entity: 'TEAM',
            entityId: id,
            metadata: { teamName: team.name }
        });

        return NextResponse.json({ success: true, message: 'Team deleted permanently' });
    } catch (error: any) {
        console.error('[DELETE /api/admin/teams/:id] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

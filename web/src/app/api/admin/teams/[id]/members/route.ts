import { NextResponse } from 'next/server';
import { requirePermission, logAdminAction } from '@/lib/authorization';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('teams.edit')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id: teamId } = await params;
        const tenantId = authResult.user.tenantId;
        const body = await request.json();
        const { userId, role = 'MEMBER' } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const team = await prisma.team.findUnique({ where: { id: teamId, tenantId: tenantId! } });
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId, tenantId: tenantId! } });
        if (!user) {
            return NextResponse.json({ error: 'User not found in this tenant' }, { status: 404 });
        }

        const existingMember = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId } }
        });

        if (existingMember) {
            return NextResponse.json({ error: 'User is already a member of this team' }, { status: 400 });
        }

        const newMember = await prisma.teamMember.create({
            data: {
                teamId,
                userId,
                role
            }
        });

        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_TEAM_ADD_MEMBER',
            entity: 'TEAM_MEMBER',
            entityId: newMember.id,
            metadata: { teamId, userId, role }
        });

        return NextResponse.json({ success: true, data: newMember });
    } catch (error: any) {
        console.error('[POST /api/admin/teams/:id/members] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

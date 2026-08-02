import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, logAdminAction } from '@/lib/authorization';
import { P } from '@/lib/permissions/registry';

export async function PATCH(request: Request) {
  const auth = await requirePermission(P.TEAMS_HIERARCHY_MOVE)(request);
  if (!auth.success) return auth.response;

  try {
    const { teamId, targetParentId } = await request.json();
    const tenantId = auth.user.tenantId!;

    if (!teamId) return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });

    if (teamId === targetParentId) {
        return NextResponse.json({ success: false, error: 'A team cannot be its own parent.' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({ where: { id: teamId, tenantId: tenantId! } });
    if (!team) return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });

    if (targetParentId) {
        const targetParent = await prisma.team.findUnique({ where: { id: targetParentId, tenantId: tenantId! } });
        if (!targetParent) return NextResponse.json({ success: false, error: 'Target parent team not found' }, { status: 404 });

        let currentParentId: string | null = targetParent.parentTeamId;
        let depth = 0;
        const maxDepth = 100; 
        
        while (currentParentId) {
            if (currentParentId === teamId) {
                return NextResponse.json({ success: false, error: 'Cannot move a team under its own descendant (Circular Hierarchy).' }, { status: 400 });
            }
            if (depth > maxDepth) break;

            const p = await prisma.team.findUnique({ where: { id: currentParentId }, select: { parentTeamId: true } });
            currentParentId = p?.parentTeamId || null;
            depth++;
        }
    }

    const updated = await prisma.team.update({
        where: { id: teamId },
        data: { parentTeamId: targetParentId || null }
    });

    await logAdminAction({
        request,
        user: auth.user,
        action: 'TEAM_HIERARCHY_MOVED',
        entity: 'TEAM',
        entityId: team.id,
        metadata: { details: `Moved team ${team.name} to parent ${targetParentId || 'root'}`, teamId, targetParentId }
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    console.error('[PATCH /api/admin/teams/hierarchy/move] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

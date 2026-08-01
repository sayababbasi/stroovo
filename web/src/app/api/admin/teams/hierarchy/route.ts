import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { P } from '@/lib/permissions/registry';

export async function GET(request: Request) {
  const auth = await requirePermission(P.TEAMS_HIERARCHY_VIEW)(request);
  if (!auth.success) return auth.response;

  try {
    const tenantId = auth.user.tenantId!;

    const teams = await prisma.team.findMany({
      where: { tenantId },
      include: {
        lead: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { members: true, children: true } }
      },
      orderBy: { name: 'asc' }
    });

    const rootTeams = teams.filter(t => !t.parentTeamId);
    const nestedTeams = teams.filter(t => t.parentTeamId);
    const totalMembers = teams.reduce((acc, t) => acc + t._count.members, 0);

    // Compute max depth
    let maxDepth = 0;
    const teamMap = new Map(teams.map(t => [t.id, t]));
    
    for (const team of teams) {
        let depth = 0;
        let current = team;
        let cycleDetected = false;
        const visited = new Set<string>();

        while (current.parentTeamId) {
            if (visited.has(current.id)) {
                cycleDetected = true;
                break;
            }
            visited.add(current.id);
            depth++;
            current = teamMap.get(current.parentTeamId) as any;
            if (!current) break;
        }
        
        if (!cycleDetected && depth > maxDepth) {
            maxDepth = depth;
        }
    }

    const stats = {
      totalTeams: teams.length,
      rootTeams: rootTeams.length,
      nestedTeams: nestedTeams.length,
      totalMembers,
      maxDepth,
      unassignedTeams: teams.filter(t => t.status === 'ARCHIVED').length
    };

    return NextResponse.json({ success: true, data: teams, stats });

  } catch (error: any) {
    console.error('[GET /api/admin/teams/hierarchy] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

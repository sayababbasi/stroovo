import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teams/members/all
 * Returns all TeamMembers across all teams for the current user's tenant.
 * Includes user info, task count, and teams.
 */
export async function GET(request: NextRequest) {
  try {
    const headerList = await headers();
    const tenantId = headerList.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID required' }, { status: 400 });
    }

    // Get all teams for the tenant
    const teams = await prisma.team.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });

    const teamIds = teams.map((t) => t.id);

    if (teamIds.length === 0) {
      return NextResponse.json({ success: true, data: [], total: 0 });
    }

    // Get all team members across all teams
    const members = await prisma.teamMember.findMany({
      where: { teamId: { in: teamIds } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            isActive: true,
            lastLoginAt: true,
            _count: {
              select: {
                tasks: true,
                managedProjects: true,
                comments: true,
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    // Group by userId to merge multi-team memberships
    const userMap = new Map<
      string,
      {
        memberId: string;
        userId: string;
        user: typeof members[0]['user'];
        teams: { id: string; name: string; role: string }[];
        role: string; // highest role across all teams
        joinedAt: Date;
      }
    >();

    for (const m of members) {
      const existing = userMap.get(m.userId);
      if (existing) {
        existing.teams.push({ id: m.team.id, name: m.team.name, role: m.role });
        // Promote to higher role if applicable
        const roleRank: Record<string, number> = { ADMIN: 4, MANAGER: 3, MEMBER: 2, VIEWER: 1 };
        if ((roleRank[m.role] || 0) > (roleRank[existing.role] || 0)) {
          existing.role = m.role;
        }
      } else {
        userMap.set(m.userId, {
          memberId: m.id,
          userId: m.userId,
          user: m.user,
          teams: [{ id: m.team.id, name: m.team.name, role: m.role }],
          role: m.role,
          joinedAt: m.joinedAt,
        });
      }
    }

    const result = Array.from(userMap.values()).map((entry) => ({
      memberId: entry.memberId,
      userId: entry.userId,
      name: entry.user.name,
      email: entry.user.email,
      image: entry.user.image,
      systemRole: entry.user.role,
      teamRole: entry.role,
      isActive: entry.user.isActive,
      lastLoginAt: entry.user.lastLoginAt,
      joinedAt: entry.joinedAt,
      teams: entry.teams,
      taskCount: entry.user._count?.tasks ?? 0,
      projectCount: entry.user._count?.managedProjects ?? 0,
      commentCount: entry.user._count?.comments ?? 0,
    }));

    // Stats for KPI cards
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = result.filter((m) => new Date(m.joinedAt) >= thisMonthStart).length;

    // Count active (logged in within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeCount = result.filter(
      (m) => m.lastLoginAt && new Date(m.lastLoginAt) >= sevenDaysAgo
    ).length;

    return NextResponse.json({
      success: true,
      data: result,
      total: result.length,
      stats: {
        total: result.length,
        active: activeCount,
        newThisMonth,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/teams/members/all] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

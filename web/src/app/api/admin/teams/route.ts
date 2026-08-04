import { NextResponse } from 'next/server';
import { requirePermission, logAdminAction } from '@/lib/authorization';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const authResult = await requirePermission('teams.read.all')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { searchParams } = new URL(request.url);
        const tenantId = authResult.user.tenantId;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const departmentId = searchParams.get('departmentId');

        let whereClause: any = { tenantId };

        if (status && status !== 'ALL') {
            whereClause.status = status;
        }
        if (search) {
            whereClause.name = { contains: search, mode: 'insensitive' };
        }
        if (departmentId) {
            whereClause.departmentId = departmentId;
        }

        const teams = await (prisma as any).team.findMany({
            where: whereClause,
            include: {
                department: { select: { id: true, name: true, code: true } },
                _count: {
                    select: { members: true, spaces: true, tasks: true }
                },
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true, image: true, role: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map owner and members count
        const mappedTeams = teams.map((team: any) => {
            const ownerMember = team.members.find((m: any) => m.role === 'OWNER') || team.members[0];
            return {
                ...team,
                owner: ownerMember?.user || null
            };
        });

        // Compute dashboard stats if requested
        const getStats = searchParams.get('stats') === 'true';
        let stats = null;
        if (getStats) {
            const now = new Date();
            const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const allTeamsForStats = await (prisma as any).team.findMany({
                where: { tenantId: tenantId! },
                include: { _count: { select: { members: true, spaces: true, tasks: true } } }
            });

            const totalTeams = allTeamsForStats.length;
            const teamsUntilLastMonth = allTeamsForStats.filter((t: any) => t.createdAt < firstDayThisMonth).length;
            const teamsGrowth = teamsUntilLastMonth === 0 ? (totalTeams > 0 ? 100 : 0) : Math.round(((totalTeams - teamsUntilLastMonth) / teamsUntilLastMonth) * 100);

            const allMembers = await prisma.teamMember.findMany({
                where: { team: { tenantId: tenantId! } },
                select: { joinedAt: true }
            });
            const totalMembers = allMembers.length;
            const membersUntilLastMonth = allMembers.filter((m: any) => m.joinedAt < firstDayThisMonth).length;
            const membersGrowth = membersUntilLastMonth === 0 ? (totalMembers > 0 ? 100 : 0) : Math.round(((totalMembers - membersUntilLastMonth) / membersUntilLastMonth) * 100);

            const accessIssues = await prisma.activityLog.count({
                where: { tenantId: tenantId!, result: { in: ['FAILED', 'BLOCKED'] } }
            });

            stats = {
                totalTeams,
                teamsTrend: teamsGrowth >= 0 ? `+${teamsGrowth}% vs last month` : `${teamsGrowth}% vs last month`,
                activeTeams: allTeamsForStats.filter((t: any) => t.status !== 'ARCHIVED').length,
                totalMembers,
                membersTrend: membersGrowth >= 0 ? `+${membersGrowth}% vs last month` : `${membersGrowth}% vs last month`,
                totalProjects: allTeamsForStats.reduce((sum: number, t: any) => sum + t._count.spaces, 0),
                totalTasks: allTeamsForStats.reduce((sum: number, t: any) => sum + t._count.tasks, 0),
                archivedTeams: allTeamsForStats.filter((t: any) => t.status === 'ARCHIVED').length,
                accessIssues
            };
        }

        return NextResponse.json({
            success: true,
            data: mappedTeams,
            stats
        });

    } catch (error: any) {
        console.error('[GET /api/admin/teams] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authResult = await requirePermission('teams.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const body = await request.json();
        const { name, description, ownerId, status, visibility, departmentId, parentTeamId, teamType, leadId, memberIds } = body;
        const tenantId = authResult.user.tenantId;

        if (!name) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        const newTeam = await prisma.$transaction(async (tx) => {
            // 1. Create the team
            const team = await (tx as any).team.create({
                data: {
                    name: name.trim(),
                    description: description ? description.trim() : null,
                    status: status || 'ACTIVE',
                    visibility: visibility || 'PRIVATE',
                    tenantId: tenantId!,
                    createdBy: authResult.user.id,
                    departmentId: departmentId || null,
                    parentTeamId: parentTeamId || null,
                    teamType: teamType || 'TEAM',
                    leadId: leadId || ownerId || null
                }
            });

            // 2. Add owner
            const targetOwnerId = ownerId || authResult.user.id;
            await tx.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: targetOwnerId,
                    role: 'OWNER'
                }
            });

            // 3. Add members if provided
            if (memberIds && Array.isArray(memberIds)) {
                for (const mId of memberIds) {
                    if (mId !== targetOwnerId) {
                        await tx.teamMember.create({
                            data: {
                                teamId: team.id,
                                userId: mId,
                                role: 'MEMBER'
                            }
                        });
                    }
                }
            }

            return team;
        });

        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_TEAM_CREATE',
            entity: 'TEAM',
            entityId: newTeam.id,
            metadata: { name: newTeam.name, ownerId, departmentId }
        });

        return NextResponse.json({ success: true, data: newTeam }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/admin/teams] Error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

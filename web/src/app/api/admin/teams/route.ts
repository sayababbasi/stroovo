import { NextResponse } from 'next/server';
import { requirePermission, logAdminAction } from '@/lib/authorization';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const authResult = await requirePermission('teams.read.all')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { searchParams } = new URL(request.url);
        const tenantId = authResult.user.tenantId;
        const status = searchParams.get('status'); // e.g. ACTIVE, ARCHIVED
        const search = searchParams.get('search');

        let whereClause: any = { tenantId };

        if (status && status !== 'ALL') {
            whereClause.status = status;
        }
        if (search) {
            whereClause.name = { contains: search, mode: 'insensitive' };
        }

        const teams = await prisma.team.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { members: true, spaces: true, tasks: true }
                },
                members: {
                    where: { role: 'OWNER' },
                    include: {
                        user: { select: { id: true, name: true, email: true, image: true } }
                    },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to include owner
        const mappedTeams = teams.map(team => {
            const ownerMember = team.members[0];
            const { members, ...rest } = team;
            return {
                ...rest,
                owner: ownerMember?.user || null
            };
        });

        // Compute some basic stats for the dashboard if requested
        const getStats = searchParams.get('stats') === 'true';
        let stats = null;
        if (getStats) {
            const allTeamsForStats = await prisma.team.findMany({
                where: { tenantId },
                select: { status: true, _count: { select: { members: true, spaces: true, tasks: true } } }
            });
            const pendingInvites = await prisma.teamInvitation.count({
                where: { team: { tenantId }, status: 'PENDING' }
            });
            
            stats = {
                totalTeams: allTeamsForStats.length,
                activeTeams: allTeamsForStats.filter(t => t.status !== 'ARCHIVED').length,
                totalMembers: allTeamsForStats.reduce((sum, t) => sum + t._count.members, 0),
                totalProjects: allTeamsForStats.reduce((sum, t) => sum + t._count.spaces, 0),
                totalTasks: allTeamsForStats.reduce((sum, t) => sum + t._count.tasks, 0),
                archivedTeams: allTeamsForStats.filter(t => t.status === 'ARCHIVED').length,
                pendingInvitations: pendingInvites,
                accessIssues: 0 // Mocked for now, can compute based on policies later
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
        const { name, description, ownerId, status, visibility } = body;
        const tenantId = authResult.user.tenantId;

        if (!name) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        const newTeam = await prisma.$transaction(async (tx) => {
            // 1. Create the team
            const team = await tx.team.create({
                data: {
                    name,
                    description,
                    status: status || 'ACTIVE',
                    tenantId,
                    createdBy: authResult.user.id
                    // visibility is not in schema currently, omit or map to a JSON field if added
                }
            });

            // 2. Add owner if specified, otherwise the creator is the owner
            const targetOwnerId = ownerId || authResult.user.id;
            await tx.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: targetOwnerId,
                    role: 'OWNER'
                }
            });

            return team;
        });

        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_TEAM_CREATE',
            entity: 'TEAM',
            entityId: newTeam.id,
            metadata: { name: newTeam.name, ownerId }
        });

        return NextResponse.json({ success: true, data: newTeam }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/admin/teams] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

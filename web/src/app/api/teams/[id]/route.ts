import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TeamService } from '@/lib/teams/team-service';

/**
 * GET /api/teams/:id
 * Get full team details including members, tasks, and assignments.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const { id } = await params;
        const team = await TeamService.getTeamById(id, tenantId);
        return NextResponse.json(team);
    } catch (error: any) {
        const status = error.message === 'Team not found' ? 404 : 500;
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
    }
}

/**
 * PATCH /api/teams/:id
 * Update team name/description, or set memberIds.
 * Body: { name?, description?, memberIds? }
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id');

        if (!tenantId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Handle memberIds separately (backward compat with frontend)
        if (body.memberIds !== undefined) {
            const { default: prisma } = await import('@/lib/prisma');
            const existing = await prisma.team.findFirst({ where: { id, tenantId } });
            if (!existing) {
                return NextResponse.json({ error: 'Team not found' }, { status: 404 });
            }

            await prisma.team.update({
                where: { id },
                data: {
                    ...(body.name !== undefined && { name: body.name }),
                    ...(body.description !== undefined && { description: body.description }),
                    members: { set: body.memberIds.map((mid: string) => ({ id: mid })) },
                },
                include: { _count: { select: { members: true } } },
            });

            const updated = await TeamService.getTeamById(id, tenantId);
            return NextResponse.json(updated);
        }

        // Standard update (name/description only)
        const team = await TeamService.updateTeam(
            id,
            { name: body.name, description: body.description },
            userId,
            tenantId
        );

        return NextResponse.json(team);
    } catch (error: any) {
        console.error(`[PATCH /api/teams] Error:`, error);
        const status = error.message === 'Team not found' ? 404 : 500;
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
    }
}

/**
 * DELETE /api/teams/:id
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id');

        if (!tenantId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const result = await TeamService.deleteTeam(id, userId, tenantId);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error(`[DELETE /api/teams] Error:`, error);
        const status = error.message === 'Team not found' ? 404 : 500;
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
    }
}

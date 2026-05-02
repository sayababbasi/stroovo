import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TeamService } from '@/lib/teams/team-service';

/**
 * GET /api/teams/:id/members
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
        const members = await TeamService.getMembers(id, tenantId);
        return NextResponse.json(members);
    } catch (error: any) {
        const status = error.message === 'Team not found' ? 404 : 500;
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
    }
}

/**
 * POST /api/teams/:id/members
 * Body: { userId: string, role?: string }
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const requestingUserId = headerList.get('x-user-id');

        if (!tenantId || !requestingUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        if (!body.userId || typeof body.userId !== 'string') {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const result = await TeamService.addMember(id, body.userId, body.role || 'MEMBER', requestingUserId, tenantId);
        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error(`[POST /api/teams/:id/members] Error:`, error);
        const msg = error.message || 'Internal Server Error';
        const status = msg.includes('not found') ? 404 : msg.includes('already') ? 409 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}

/**
 * PATCH /api/teams/:id/members
 * Update member role.
 * Body: { userId: string, role: string }
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const requestingUserId = headerList.get('x-user-id');

        if (!tenantId || !requestingUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        if (!body.userId || !body.role) {
            return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
        }

        const result = await TeamService.updateMemberRole(id, body.userId, body.role, requestingUserId, tenantId);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

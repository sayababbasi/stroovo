import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TeamService } from '@/lib/teams/team-service';

/**
 * DELETE /api/teams/:id/members/:userId
 * Remove a member from a team.
 * Also unassigns them from all team-scoped tasks.
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const requestingUserId = headerList.get('x-user-id');

        if (!tenantId || !requestingUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, userId } = await params;
        const result = await TeamService.removeMember(id, userId, requestingUserId, tenantId);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error(`[DELETE /api/teams/:id/members/:userId] Error:`, error);
        const msg = error.message || 'Internal Server Error';
        const status = msg.includes('not found') || msg.includes('not a member') ? 404 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}

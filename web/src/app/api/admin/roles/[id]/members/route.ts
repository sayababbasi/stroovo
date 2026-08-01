import { NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/RoleService';
import { requirePermission, logAdminAction } from '@/lib/authorization';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('roles.assign')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const body = await request.json();
        const { userIds, scopeType = 'organization', scopeId } = body;

        if (!Array.isArray(userIds)) {
            return NextResponse.json({ error: 'userIds must be an array of strings' }, { status: 400 });
        }

        for (const userId of userIds) {
            await RoleService.assignRoleScoped(userId, id, scopeType, scopeId);
        }
        
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_ROLE_MEMBERS_ASSIGN',
            entity: 'ROLE',
            entityId: id,
            metadata: { userIds }
        });

        return NextResponse.json({ success: true, message: 'Members assigned successfully' });
    } catch (error: any) {
        console.error('[POST /api/admin/roles/:id/members] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('roles.assign')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const body = await request.json();
        const { userIds } = body;

        if (!Array.isArray(userIds)) {
            return NextResponse.json({ error: 'userIds must be an array of strings' }, { status: 400 });
        }

        for (const userId of userIds) {
            await RoleService.removeUserFromRole(userId);
        }
        
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_ROLE_MEMBERS_REMOVE',
            entity: 'ROLE',
            entityId: id,
            metadata: { userIds }
        });

        return NextResponse.json({ success: true, message: 'Members removed successfully' });
    } catch (error: any) {
        console.error('[DELETE /api/admin/roles/:id/members] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

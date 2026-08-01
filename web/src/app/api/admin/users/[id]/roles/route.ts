import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/AdminService';
import { logAdminAction, requirePermission } from '@/lib/authorization';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('roles.assign')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const body = await request.json();
        
        console.log('[PATCH /api/admin/users/:id/roles] Updating user roles:', id);
        
        // Ensure body contains primaryRoleId and additionalRoleIds
        const { primaryRoleId, additionalRoleIds } = body;
        
        if (primaryRoleId === undefined && additionalRoleIds === undefined) {
            return NextResponse.json({ error: 'Missing role assignment data' }, { status: 400 });
        }

        const user = await AdminService.assignUserRoles(id, primaryRoleId, additionalRoleIds);
        
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_USER_ROLE_ASSIGNMENT',
            entity: 'USER',
            entityId: id,
            metadata: { primaryRoleId, additionalRoleIds }
        });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('[PATCH /api/admin/users/:id/roles] Error:', error);
        
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}

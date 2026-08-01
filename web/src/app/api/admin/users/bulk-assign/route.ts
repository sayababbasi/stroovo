import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/AdminService';
import { logAdminAction, requirePermission } from '@/lib/authorization';

export async function POST(request: Request) {
    const authResult = await requirePermission('roles.assign')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const body = await request.json();
        const { userIds, primaryRoleId, additionalRoleIds } = body;
        
        console.log('[POST /api/admin/users/bulk-assign] Bulk assigning roles:', { userIds, primaryRoleId, additionalRoleIds });
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'Missing or invalid userIds array' }, { status: 400 });
        }

        // Using Promise.all for simplicity. Ideally, this should be a bulk operation if AdminService supports it.
        const results = await Promise.all(userIds.map(async (userId) => {
            return AdminService.assignUserRoles(userId, primaryRoleId, additionalRoleIds);
        }));
        
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_USERS_BULK_ROLE_ASSIGNMENT',
            entity: 'USER',
            entityId: 'BULK',
            metadata: { count: userIds.length, primaryRoleId, additionalRoleIds, userIds }
        });

        return NextResponse.json({ success: true, updatedCount: results.length });
    } catch (error: any) {
        console.error('[POST /api/admin/users/bulk-assign] Error:', error);
        
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/RoleService';
import { requirePermission, logAdminAction } from '@/lib/authorization';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('roles.view')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const role = await RoleService.getRoleById(id);
        
        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }
        
        return NextResponse.json(role.permissions);
    } catch (error: any) {
        console.error('[GET /api/admin/roles/:id/permissions] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('roles.edit')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const body = await request.json();
        const { permissionKeys } = body;

        if (!Array.isArray(permissionKeys)) {
            return NextResponse.json({ error: 'permissionKeys must be an array of strings' }, { status: 400 });
        }

        await RoleService.updateRolePermissions(id, permissionKeys);
        
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_ROLE_PERMISSIONS_UPDATE',
            entity: 'ROLE',
            entityId: id,
            metadata: { permissionCount: permissionKeys.length, permissionKeys }
        });

        return NextResponse.json({ success: true, message: 'Permissions updated successfully' });
    } catch (error: any) {
        console.error('[PUT /api/admin/roles/:id/permissions] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

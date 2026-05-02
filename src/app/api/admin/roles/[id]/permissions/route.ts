import { NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/RoleService';
import { requirePermission } from '@/lib/authorization';
import { rolePermissionSchema } from '@/lib/validation/role-validation';
import { headers } from 'next/headers';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check permission
    const authResult = await requirePermission('roles.update')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        const { id } = await params;
        
        const body = await request.json();
        console.log('[PATCH /api/admin/roles/:id/permissions] Updating permissions for role:', id, 'by user:', userId);
        
        const validatedData = rolePermissionSchema.parse(body);
        console.log('[PATCH /api/admin/roles/:id/permissions] Validated data:', validatedData);
        
        await RoleService.updateRolePermissions(id, validatedData.permissionIds);
        console.log('[PATCH /api/admin/roles/:id/permissions] Permissions updated successfully for role:', id);
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[PATCH /api/admin/roles/:id/permissions] Error:', error);
        
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

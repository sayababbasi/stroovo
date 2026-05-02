import { NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/RoleService';
import { requirePermission } from '@/lib/authorization';
import { updateRoleSchema } from '@/lib/validation/role-validation';
import { headers } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check permission
    const authResult = await requirePermission('roles.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        console.log('[GET /api/admin/roles/:id] Fetching role:', id);
        
        const role = await RoleService.getRoleById(id);
        if (!role) {
            console.log('[GET /api/admin/roles/:id] Role not found:', id);
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }
        
        console.log('[GET /api/admin/roles/:id] Role found:', role.name);
        return NextResponse.json(role);
    } catch (error: any) {
        console.error('[GET /api/admin/roles/:id] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
        console.log('[PATCH /api/admin/roles/:id] Updating role:', id, 'with data:', body, 'by user:', userId);
        
        const validatedData = updateRoleSchema.parse(body);
        console.log('[PATCH /api/admin/roles/:id] Validated data:', validatedData);
        
        const role = await RoleService.updateRole(id, validatedData);
        console.log('[PATCH /api/admin/roles/:id] Role updated successfully:', role.id);
        
        return NextResponse.json(role);
    } catch (error: any) {
        console.error('[PATCH /api/admin/roles/:id] Error:', error);
        
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check permission
    const authResult = await requirePermission('roles.delete')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        const { id } = await params;
        
        console.log('[DELETE /api/admin/roles/:id] Deleting role:', id, 'by user:', userId);
        
        await RoleService.deleteRole(id);
        console.log('[DELETE /api/admin/roles/:id] Role deleted successfully:', id);
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/admin/roles/:id] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

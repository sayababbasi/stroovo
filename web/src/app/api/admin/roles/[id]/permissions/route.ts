import { NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/RoleService';
import { requirePermission } from '@/lib/authorization';
import { headers } from 'next/headers';

/**
 * PUT /api/admin/roles/[id]/permissions
 * Full sync of role permissions by permission key array.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission('roles.update')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const { id } = await params;

    const body = await request.json();
    const { permissionKeys } = body;

    if (!Array.isArray(permissionKeys)) {
      return NextResponse.json({ error: 'permissionKeys must be an array' }, { status: 400 });
    }

    console.log(`[PUT /api/admin/roles/${id}/permissions] Syncing ${permissionKeys.length} permissions by user: ${userId}`);

    await RoleService.updateRolePermissions(id, permissionKeys);

    const updatedRole = await RoleService.getRoleById(id);
    console.log(`[PUT /api/admin/roles/${id}/permissions] Done`);

    return NextResponse.json({ success: true, data: updatedRole });
  } catch (error: any) {
    console.error('[PUT /api/admin/roles/:id/permissions] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/roles/[id]/permissions (existing, kept for compat)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

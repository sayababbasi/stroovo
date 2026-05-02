import { NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/RoleService';
import { requirePermission } from '@/lib/authorization';
import { permissionQuerySchema } from '@/lib/validation/role-validation';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    // Check permission
    const authResult = await requirePermission('roles.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        const { searchParams } = new URL(request.url);
        
        const query = permissionQuerySchema.parse(Object.fromEntries(searchParams));
        console.log('[GET /api/admin/permissions] Query params:', query, 'by user:', userId);
        
        const permissions = await RoleService.getAllPermissions();
        console.log(`[GET /api/admin/permissions] Returning ${permissions.length} permissions`);
        
        return NextResponse.json(permissions);
    } catch (error: any) {
        console.error('[GET /api/admin/permissions] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

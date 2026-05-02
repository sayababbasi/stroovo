import { NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/RoleService';
import { requirePermission } from '@/lib/authorization';
import { createRoleSchema, updateRoleSchema, roleQuerySchema } from '@/lib/validation/role-validation';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    // Check permission
    const authResult = await requirePermission('roles.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { searchParams } = new URL(request.url);
        const query = roleQuerySchema.parse(Object.fromEntries(searchParams));
        
        console.log('[GET /api/admin/roles] Query params:', query);
        
        const roles = await RoleService.getAllRoles();
        console.log(`[GET /api/admin/roles] Returning ${roles.length} roles`);
        
        return NextResponse.json(roles);
    } catch (error: any) {
        console.error('[GET /api/admin/roles] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Check permission
    const authResult = await requirePermission('roles.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        const body = await request.json();
        console.log('[POST /api/admin/roles] Creating role with data:', body, 'by user:', userId);
        
        const validatedData = createRoleSchema.parse(body);
        console.log('[POST /api/admin/roles] Validated data:', validatedData);
        
        const role = await RoleService.createRole(validatedData);
        console.log('[POST /api/admin/roles] Role created successfully:', role.id);
        
        return NextResponse.json(role, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/admin/roles] Error:', error);
        
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

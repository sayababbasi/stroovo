import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AdminService } from '@/lib/services/AdminService';
import { createUserSchema, updateUserSchema, userQuerySchema } from '@/lib/validation/user-validation';
import { logAdminAction, requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
    const authResult = await requirePermission('users.read.all')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[GET /api/admin/users] Fetching users for user:', userId);

        const { searchParams } = new URL(request.url);
        
        // Build filters manually to avoid Zod issues
        const filters: any = {};
        const role = searchParams.get('role');
        const isActive = searchParams.get('isActive');
        const search = searchParams.get('search');
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');

        if (role && role !== 'ALL') filters.role = role;
        if (isActive === 'true') filters.isActive = true;
        if (isActive === 'false') filters.isActive = false;
        if (search) filters.search = search;
        if (page) filters.page = parseInt(page);
        if (limit) filters.limit = parseInt(limit);

        console.log('[GET /api/admin/users] Filters:', filters);

        const result = await AdminService.getAllUsers(filters);
        console.log('[GET /api/admin/users] Result:', JSON.stringify(result, null, 2));
        console.log('[GET /api/admin/users] Returning users:', result.users?.length);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[GET /api/admin/users] Error:', error);
        console.error('[GET /api/admin/users] Error stack:', error.stack);
        
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authResult = await requirePermission('users.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const body = await request.json();
        console.log('[POST /api/admin/users] Creating user with data:', body);
        
        const validatedData = createUserSchema.parse(body);
        console.log('[POST /api/admin/users] Validated data:', validatedData);

        const user = await AdminService.createUser(validatedData);
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_USER_CREATE',
            entity: 'USER',
            entityId: user.id,
            metadata: { email: user.email, role: user.role }
        });
        console.log('[POST /api/admin/users] User created:', user);
        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/admin/users] Error:', error);
        console.error('[POST /api/admin/users] Error stack:', error.stack);
        
        if (error.name === 'ZodError') {
            console.error('[POST /api/admin/users] ZodError:', error.errors);
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        if (error.message === 'Email already exists') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}

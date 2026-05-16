import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AdminService } from '@/lib/services/AdminService';
import { updateUserSchema, updateRoleSchema, updateStatusSchema } from '@/lib/validation/user-validation';
import { logAdminAction, requirePermission } from '@/lib/authorization';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('users.update.all')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const body = await request.json();
        
        console.log('[PATCH /api/admin/users/:id] Updating user:', id);
        console.log('[PATCH /api/admin/users/:id] Request body:', body);

        // Check if this is a role-only update
        if (body.role !== undefined && Object.keys(body).length === 1) {
            console.log('[PATCH /api/admin/users/:id] Role update detected');
            const validatedData = updateRoleSchema.parse(body);
            console.log('[PATCH /api/admin/users/:id] Validated role:', validatedData);
            const user = await AdminService.updateUser(id, { role: validatedData.role });
            await logAdminAction({
                request,
                user: authResult.user,
                action: 'ADMIN_USER_ROLE_UPDATE',
                entity: 'USER',
                entityId: id,
                metadata: { role: validatedData.role }
            });
            console.log('[PATCH /api/admin/users/:id] User updated successfully');
            return NextResponse.json(user);
        }

        // Check if this is a status-only update
        if (body.isActive !== undefined && Object.keys(body).length === 1) {
            console.log('[PATCH /api/admin/users/:id] Status update detected');
            const validatedData = updateStatusSchema.parse(body);
            console.log('[PATCH /api/admin/users/:id] Validated status:', validatedData);
            const user = await AdminService.updateUser(id, { isActive: validatedData.isActive });
            await logAdminAction({
                request,
                user: authResult.user,
                action: 'ADMIN_USER_STATUS_UPDATE',
                entity: 'USER',
                entityId: id,
                metadata: { isActive: validatedData.isActive }
            });
            console.log('[PATCH /api/admin/users/:id] User updated successfully');
            return NextResponse.json(user);
        }

        // General user update
        console.log('[PATCH /api/admin/users/:id] General update detected');
        const validatedData = updateUserSchema.parse(body);
        console.log('[PATCH /api/admin/users/:id] Validated data:', validatedData);
        const user = await AdminService.updateUser(id, validatedData);
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_USER_UPDATE',
            entity: 'USER',
            entityId: id,
            metadata: validatedData as Record<string, unknown>
        });
        console.log('[PATCH /api/admin/users/:id] User updated successfully');
        return NextResponse.json(user);
    } catch (error: any) {
        console.error('[PATCH /api/admin/users/:id] Error:', error);
        console.error('[PATCH /api/admin/users/:id] Error details:', JSON.stringify(error, null, 2));
        
        if (error.name === 'ZodError') {
            console.error('[PATCH /api/admin/users/:id] ZodError:', error.errors);
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('users.delete')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        await AdminService.deleteUser(id);
        await logAdminAction({
            request,
            user: authResult.user,
            action: 'ADMIN_USER_DELETE',
            entity: 'USER',
            entityId: id,
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

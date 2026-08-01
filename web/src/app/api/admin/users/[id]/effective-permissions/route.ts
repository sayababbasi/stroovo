import { NextResponse } from 'next/server';
import { requirePermission, getUserPermissions } from '@/lib/authorization';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('users.read.all')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        console.log('[GET /api/admin/users/:id/effective-permissions] Fetching for user:', id);
        
        const effectivePermissions = await getUserPermissions(id);
        
        return NextResponse.json({
            permissions: effectivePermissions
        });
    } catch (error: any) {
        console.error('[GET /api/admin/users/:id/effective-permissions] Error:', error);
        
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}

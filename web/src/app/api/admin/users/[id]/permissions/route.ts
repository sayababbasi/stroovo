import { NextResponse } from 'next/server';
import { requirePermission, loadUserFromRequest, permissionSetForUser, explainPermission } from '@/lib/authorization';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('admin.users')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        
        // Use the same includes as loadUserFromRequest
        const targetUser = await prisma.user.findUnique({
            where: { id },
            include: {
                systemRole: { include: { permissions: { include: { permission: true } } } },
                additionalRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
                teamMembers: { include: { systemRole: { include: { permissions: { include: { permission: true } } } } } },
                projectAccesses: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
            }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const effectivePermissions = permissionSetForUser(targetUser as any);
        
        // Let's generate a breakdown for every permission they have
        const allPermissions = await prisma.permission.findMany();
        
        const explanation: Record<string, { granted: boolean; sources: string[] }> = {};
        for (const p of allPermissions) {
            explanation[p.key] = explainPermission(targetUser as any, p.key);
        }

        return NextResponse.json({ 
            success: true, 
            data: {
                effectivePermissions,
                explanation
            }
        });
    } catch (error: any) {
        console.error('[GET /api/admin/users/:id/permissions] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

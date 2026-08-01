import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/authorization';
import prisma from '@/lib/prisma';
import { AdminService } from '@/lib/services/AdminService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('users.read.all')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const tenantId = authResult.user.tenantId;

        // Ensure user belongs to tenant
        const user = await prisma.user.findUnique({
            where: { id, tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                title: true,
                contact: true,
                image: true,
                isActive: true,
                status: true,
                isEmailVerified: true,
                lastLoginAt: true,
                systemRole: {
                  select: { id: true, name: true, isSystem: true }
                },
                additionalRoles: {
                  select: { role: { select: { id: true, name: true, isSystem: true } } }
                },
                teamMembers: {
                  select: { team: { select: { id: true, name: true } }, role: true }
                },
                projectAccesses: {
                  select: { project: { select: { id: true, name: true } }, role: { select: { id: true, name: true } } }
                },
                createdAt: true,
                _count: {
                  select: { tasks: true, managedProjects: true }
                },
                department: true,
                designation: true,
                experienceLevel: true,
                address: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch audit logs where this user is the target (entityId)
        const activityLogs = await prisma.activityLog.findMany({
            where: {
                tenantId,
                entityId: id,
                entityType: 'USER'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        return NextResponse.json({ 
            success: true, 
            data: {
                user,
                activityLogs
            }
        });
    } catch (error: any) {
        console.error('[GET /api/admin/users/:id/activity] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

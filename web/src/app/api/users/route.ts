import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { hashPassword } from '@/lib/auth';
import { canAccessUserDirectory, logAdminAction, requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
    const authResult = await requirePermission('users.read.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const canReadAll = await canAccessUserDirectory(authResult.user, 'all');
        const users = await prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                _count: {
                    select: {
                        tasks: true,
                        managedProjects: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (canReadAll) {
            return NextResponse.json(users);
        }

        const slimUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            role: user.role,
            image: user.image,
        }));

        return NextResponse.json(slimUsers);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authResult = await requirePermission('users.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id');
        
        if (!tenantId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email, name, role } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Ideally, this would send an invite email and create a pending user
        // For now, we'll create the user directly in the tenant
        const password = await hashPassword(`invite-${crypto.randomUUID()}`);
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash: password,
                role: (role as any) || 'USER',
                tenantId
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'USER_INVITE',
                entity: 'USER',
                entityId: user.id,
                metadata: { email: user.email, role: user.role },
                tenantId,
                userId
            }
        });

        await logAdminAction({
            request,
            user: authResult.user,
            action: 'USER_INVITE',
            entity: 'USER',
            entityId: user.id,
            metadata: { email: user.email, role: user.role }
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        console.error('Failed to invite user:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

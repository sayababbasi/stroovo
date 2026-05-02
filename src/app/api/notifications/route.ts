import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const whereClause: any = { userId };
        if (tenantId) whereClause.tenantId = tenantId;

        let notifications: any[] = [];
        let unreadCount = 0;
        try {
            notifications = await prisma.notification.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: 20
            });

            unreadCount = await prisma.notification.count({
                where: { ...whereClause, isRead: false }
            });
        } catch (e: any) {
            if (e.code !== 'P2021') throw e;
        }

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Mark all as read
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

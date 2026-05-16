import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isRead = searchParams.get('isRead');

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, tenantId' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      userId,
      tenantId
    };

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    // Fetch notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.notification.count({ where })
    ]);

    // Format notifications
    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority || 'MEDIUM',
      isRead: notification.isRead || false,
      link: notification.link,
      metadata: notification.metadata || {},
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt || notification.createdAt,
      deliveryStatus: {
        email: 'SENT',
        whatsapp: 'PENDING',
        push: 'SENT',
        inApp: 'SENT' // In-app is always sent if notification exists
      }
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tenantId, filters } = body;

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, tenantId' },
        { status: 400 }
      );
    }

    // Build advanced filters
    const where: any = {
      userId,
      tenantId
    };

    if (filters) {
      if (filters.types && filters.types.length > 0) {
        where.type = { in: filters.types };
      }

      if (filters.priorities && filters.priorities.length > 0) {
        where.priority = { in: filters.priorities };
      }

      if (filters.dateRange) {
        where.createdAt = {
          gte: new Date(filters.dateRange.start),
          lte: new Date(filters.dateRange.end)
        };
      }

      if (filters.isRead !== undefined) {
        where.isRead = filters.isRead;
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { message: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: filters?.limit || 50
    });

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Error filtering notifications:', error);
    return NextResponse.json(
      { error: 'Failed to filter notifications' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { notificationEngine } from '@/notifications/engine';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAll = false } = body;

    if (markAll) {
      // Mark all notifications as read for user
      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required when marking all as read' },
          { status: 400 }
        );
      }

      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `Marked ${result.count} notifications as read`,
        markedCount: result.count
      });

    } else {
      // Mark specific notification as read
      if (!notificationId || !userId) {
        return NextResponse.json(
          { error: 'notificationId and userId are required' },
          { status: 400 }
        );
      }

      await notificationEngine.markAsRead(notificationId, userId);

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    }

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, userId } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || !userId) {
      return NextResponse.json(
        { error: 'notificationIds (array) and userId are required' },
        { status: 400 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      markedCount: result.count
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    const userId = searchParams.get('userId');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      // Delete all read notifications for user
      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required when deleting all notifications' },
          { status: 400 }
        );
      }

      const result = await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `Deleted ${result.count} read notifications`,
        deletedCount: result.count
      });

    } else {
      // Delete specific notification
      if (!notificationId || !userId) {
        return NextResponse.json(
          { error: 'notificationId and userId are required' },
          { status: 400 }
        );
      }

      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId
        }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      await prisma.notification.delete({
        where: {
          id: notificationId
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

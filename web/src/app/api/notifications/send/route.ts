import { NextRequest, NextResponse } from 'next/server';
import { notificationEngine } from '@/notifications/engine';
import { triggerNotificationEvent } from '@/notifications/events';
import { NotificationEventType } from '@/notifications/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      title, 
      message, 
      priority = 'MEDIUM', 
      userId, 
      tenantId, 
      link, 
      metadata,
      eventType,
      eventData 
    } = body;

    // Validate required fields
    if (!type || !title || !message || !userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message, userId, tenantId' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be one of: LOW, MEDIUM, HIGH, URGENT' },
        { status: 400 }
      );
    }

    // Create notification event
    const notificationEvent = {
      id: `manual_${Date.now()}_${userId}`,
      type,
      title,
      message,
      priority,
      userId,
      tenantId,
      link,
      metadata: metadata || {}
    };

    // Send notification via engine
    await notificationEngine.sendNotification(notificationEvent);

    // If eventType is provided, also trigger specific event
    if (eventType && eventData) {
      await triggerNotificationEvent(eventType as NotificationEventType, eventData);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      notificationId: notificationEvent.id
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, tenantId' },
        { status: 400 }
      );
    }

    const notifications = await notificationEngine.getUserNotifications(userId, tenantId, limit);

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

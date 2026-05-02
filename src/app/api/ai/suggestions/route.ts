import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { suggestionEngine } from '@/ai/suggestions';
import type { SuggestionContext } from '@/ai/suggestions';
import prisma from '@/lib/prisma';

interface SuggestionsRequest {
  projectId?: string;
  userId?: string;
  timeRange?: 'week' | 'month' | 'quarter';
}

const VALID_TIME_RANGES = new Set<NonNullable<SuggestionsRequest['timeRange']>>([
  'week',
  'month',
  'quarter',
]);

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const tenantId = headerList.get('x-tenant-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as SuggestionsRequest | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const requestedTimeRange = body.timeRange || 'week';
    if (!VALID_TIME_RANGES.has(requestedTimeRange)) {
      return NextResponse.json({ error: 'Invalid timeRange value' }, { status: 400 });
    }

    const { projectId, userId: targetUserId } = body;
    const timeRange = requestedTimeRange;

    // Build context for suggestions
    const context: SuggestionContext = {
      tasks: [],
      deadlines: [],
      workload: [],
    };

    // Get tasks for context
    const taskWhere: { tenantId?: string; projectId?: string; assigneeId?: string } = {
      tenantId: tenantId || undefined,
    };
    
    if (projectId) {
      taskWhere.projectId = projectId;
    }

    if (targetUserId) {
      taskWhere.assigneeId = targetUserId;
    }

    // Get recent tasks
    const tasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        assignee: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent tasks
    });

    // Format tasks for AI
    context.tasks = tasks.map(task => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.name || 'Unassigned',
      deadline: task.dueDate?.toISOString().split('T')[0],
    }));

    // Get upcoming deadlines
    const now = new Date();
    const deadlineFilter: { tenantId?: string; projectId?: string; assigneeId?: string } = {
      tenantId: tenantId || undefined,
    };
    
    if (projectId) {
      deadlineFilter.projectId = projectId;
    }

    if (targetUserId) {
      deadlineFilter.assigneeId = targetUserId;
    }

    const upcomingTasks = await prisma.task.findMany({
      where: {
        ...deadlineFilter,
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + (timeRange === 'week' ? 7 * 24 * 60 * 60 * 1000 : 
                                       timeRange === 'month' ? 30 * 24 * 60 * 60 * 1000 : 
                                       90 * 24 * 60 * 60 * 1000))
        },
        status: { notIn: ['DONE', 'BLOCKED'] }
      },
      select: {
        id: true,
        dueDate: true,
        priority: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    context.deadlines = upcomingTasks.map(task => ({
      taskId: task.id,
      dueDate: task.dueDate!.toISOString().split('T')[0],
      priority: task.priority,
    }));

    // Get workload data
    const workloadData = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        ...deadlineFilter,
        status: { notIn: ['DONE', 'BLOCKED'] }
      },
      _count: { id: true },
    });

    // Get user details for workload
    const userIds = workloadData
      .map((workloadItem) => workloadItem.assigneeId)
      .filter((assigneeId): assigneeId is string => Boolean(assigneeId));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.name || 'Unknown';
      return acc;
    }, {} as Record<string, string>);

    context.workload = workloadData
      .filter((workloadItem): workloadItem is typeof workloadItem & { assigneeId: string } => Boolean(workloadItem.assigneeId))
      .map((workloadItem) => ({
        userId: workloadItem.assigneeId,
        userName: userMap[workloadItem.assigneeId] || 'Unknown',
        activeTasks: workloadItem._count.id,
        capacity: 5,
      }));

    // Generate suggestions
    const suggestions = await suggestionEngine.generateSuggestions(context);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        context: {
          taskCount: context.tasks.length,
          deadlineCount: context.deadlines.length,
          userCount: context.workload.length,
          timeRange,
        },
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in /api/ai/suggestions:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate suggestions',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate suggestions.' },
    { status: 405 }
  );
}

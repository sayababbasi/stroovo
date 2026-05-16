import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { TaskService } from '@/lib/tasks/task-service';
import { headers } from 'next/headers';

const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  type: z.string().default('TASK'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  assigneeId: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  estimatedHours: z.number().min(0).optional(),
  teamId: z.string(),
  spaceId: z.string().optional(),
  listId: z.string().optional(),
  projectId: z.string().min(1),
});

// GET /api/team-tasks - Get tasks for team/space/list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const spaceId = searchParams.get('spaceId');
    const listId = searchParams.get('listId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (teamId) {
      where.OR = [
        { teamId: teamId },
        { project: { teamIds: { has: teamId } } }
      ];
    }
    if (spaceId) where.spaceId = spaceId;
    if (listId) where.listId = listId;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        },

        project: {
          select: {
            id: true,
            name: true
          }
        },
        subtasks: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch team tasks' }, { status: 500 });
  }
}

// POST /api/team-tasks - Create a new team task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const headerList = await headers();
    const userId = headerList.get('x-user-id') || 'admin@revoticai.com';
    const tenantId = headerList.get('x-tenant-id') || 'default-tenant';

    // Use TaskService for standardized creation, events, and AI logic
    const task = await TaskService.createTask(validatedData as any, userId, tenantId);

    // Fetch the task with relations for the UI
    const fullTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        },
        team: {
          select: { id: true, name: true }
        },

        project: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(fullTask, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error creating team task:', error);
    return NextResponse.json({ error: 'Failed to create team task' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { taskPlanner } from '@/ai/planner';
import prisma from '@/lib/prisma';

interface SaveTasksRequest {
  goal: string;
  projectId: string;
  selectedTasks?: number[];
  assigneeId?: string;
}

const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

function normalizePriority(priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  return VALID_PRIORITIES.has(priority) ? (priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') : 'MEDIUM';
}

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const tenantId = headerList.get('x-tenant-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as SaveTasksRequest | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { goal, projectId, selectedTasks, assigneeId } = body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      return NextResponse.json(
        { error: 'Goal is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (selectedTasks !== undefined) {
      const isValidSelection =
        Array.isArray(selectedTasks) &&
        selectedTasks.every((index) => Number.isInteger(index) && index >= 0);

      if (!isValidSelection) {
        return NextResponse.json(
          { error: 'selectedTasks must be an array of non-negative integers' },
          { status: 400 }
        );
      }
    }

    if (assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: assigneeId,
          tenantId: tenantId || undefined,
        },
        select: { id: true },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId || undefined,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Generate tasks using AI
    const taskPlan = await taskPlanner.generateTasks(goal.trim());
    
    const isValid = await taskPlanner.validateTaskPlan(taskPlan);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Generated task plan failed validation' },
        { status: 500 }
      );
    }

    // Filter tasks if specific indices provided
    const uniqueSelectedTasks = selectedTasks ? [...new Set(selectedTasks)] : undefined;
    const tasksToSave = uniqueSelectedTasks
      ? taskPlan.tasks.filter((_, index) => uniqueSelectedTasks.includes(index))
      : taskPlan.tasks;

    if (tasksToSave.length === 0) {
      return NextResponse.json(
        { error: 'No tasks selected for saving' },
        { status: 400 }
      );
    }

    // Create tasks in database
    const createdTasks = await prisma.$transaction(async (transaction) => {
      const newTasks = [];

      for (const taskData of tasksToSave) {
        const normalizedPriority = normalizePriority(taskData.priority);
        const createdTask = await transaction.task.create({
          data: {
            title: taskData.title,
            description: taskData.description,
            priority: normalizedPriority,
            status: 'TODO',
            type: 'TASK',
            projectId,
            assigneeId: assigneeId || null,
            tenantId: tenantId || null,
            startDate: new Date(),
          },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
        });

        if (taskData.subtasks.length > 0) {
          await transaction.task.createMany({
            data: taskData.subtasks.map((subtaskTitle) => ({
              title: subtaskTitle,
              description: `Subtask of: ${taskData.title}`,
              priority: normalizedPriority,
              status: 'TODO',
              type: 'TASK',
              projectId,
              assigneeId: assigneeId || null,
              tenantId: tenantId || null,
              parentId: createdTask.id,
              startDate: new Date(),
            })),
          });
        }

        if (tenantId) {
          await transaction.activityLog.create({
            data: {
              action: 'TASK_CREATE',
              entity: 'TASK',
              entityId: createdTask.id,
              metadata: {
                title: createdTask.title,
                source: 'AI_GENERATED',
                goal: goal.trim(),
              },
              tenantId,
              userId,
            },
          });
        }

        newTasks.push(createdTask);
      }

      if (tenantId && project.managerId !== userId) {
        await transaction.notification.create({
          data: {
            type: 'INFO',
            title: 'AI Tasks Generated',
            message: `${newTasks.length} tasks were generated and added to project "${project.name}"`,
            link: `/projects/${projectId}`,
            tenantId,
            userId: project.managerId,
          },
        });
      }

      return newTasks;
    });

    return NextResponse.json({
      success: true,
      data: {
        createdTasks,
        goal: goal.trim(),
        projectId,
        totalGenerated: taskPlan.tasks.length,
        totalSaved: createdTasks.length,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in /api/ai/save-tasks:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to save tasks',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to save tasks.' },
    { status: 405 }
  );
}

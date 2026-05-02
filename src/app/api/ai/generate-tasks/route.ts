import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { taskPlanner } from '@/ai/planner';

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const tenantId = headerList.get('x-tenant-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { goal } = body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      return NextResponse.json(
        { error: 'Goal is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (goal.length > 500) {
      return NextResponse.json(
        { error: 'Goal must be less than 500 characters' },
        { status: 400 }
      );
    }

    const taskPlan = await taskPlanner.generateTasks(goal.trim());
    
    const isValid = await taskPlanner.validateTaskPlan(taskPlan);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Generated task plan failed validation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: taskPlan,
      goal: goal.trim(),
      generatedAt: new Date().toISOString(),
      taskCount: taskPlan.tasks.length,
      userId,
      tenantId
    });

  } catch (error) {
    console.error('Error in /api/ai/generate-tasks:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate tasks',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate tasks.' },
    { status: 405 }
  );
}

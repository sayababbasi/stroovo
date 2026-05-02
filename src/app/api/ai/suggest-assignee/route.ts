import { NextResponse } from 'next/server';
import { AIIntegrationEngine } from '@/ai/ai-integration';
import { requirePermission } from '@/lib/authorization';
import { z } from 'zod';
import { headers } from 'next/headers';

const suggestAssigneeSchema = z.object({
  taskId: z.string().min(1),
  teamId: z.string().optional(),
});

export async function POST(request: Request) {
  // Check permission - all roles can suggest assignees (with role-based filtering)
  const authResult = await requirePermission('tasks.update')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const body = await request.json();
    const { taskId, teamId } = suggestAssigneeSchema.parse(body);

    console.log('[POST /api/ai/suggest-assignee] Suggesting assignee for task:', taskId, 'by user:', userId);

    const suggestion = await AIIntegrationEngine.suggestTaskAssignee(taskId, teamId);

    console.log('[POST /api/ai/suggest-assignee] Suggestion generated:', suggestion ? 'success' : 'no suitable assignee');
    return NextResponse.json({
      suggestion,
      message: suggestion ? 'Assignee suggestion generated' : 'No suitable assignee found'
    });
  } catch (error: any) {
    console.error('[POST /api/ai/suggest-assignee] Error suggesting assignee:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to suggest assignee', details: error.message },
      { status: 500 }
    );
  }
}

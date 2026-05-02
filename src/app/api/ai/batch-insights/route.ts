import { NextResponse } from 'next/server';
import { AIIntegrationEngine } from '@/ai/ai-integration';
import { requirePermission } from '@/lib/authorization';
import { z } from 'zod';
import { headers } from 'next/headers';

const batchInsightsSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1).max(50), // Limit to 50 tasks per batch
});

export async function POST(request: Request) {
  // Check permission - managers and above can run batch analysis
  const authResult = await requirePermission('tasks.read')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const body = await request.json();
    const { taskIds } = batchInsightsSchema.parse(body);

    // Restrict batch operations to managers and above
    if ('user' in authResult) {
      const userRole = authResult.user.role;
      const canRunBatch = ['ADMIN', 'SUPER_ADMIN', 'CEO', 'EXECUTIVE', 'MANAGER', 'PROJECT_MANAGER'].includes(userRole);
      
      if (!canRunBatch) {
        console.log('[POST /api/ai/batch-insights] Access denied - user role insufficient for batch operations');
        return NextResponse.json(
          { error: 'Only managers and above can run batch AI analysis' },
          { status: 403 }
        );
      }
    }
    
    console.log('[POST /api/ai/batch-insights] Starting batch analysis for', taskIds.length, 'tasks by user:', userId);
    
    // Run batch analysis
    await AIIntegrationEngine.batchUpdateInsights(taskIds);
    
    console.log('[POST /api/ai/batch-insights] Batch analysis completed successfully');
    return NextResponse.json({ 
      message: `Batch AI insights updated for ${taskIds.length} tasks`,
      processedCount: taskIds.length
    });
  } catch (error: any) {
    console.error('[POST /api/ai/batch-insights] Error in batch analysis:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to run batch AI analysis', details: error.message },
      { status: 500 }
    );
  }
}

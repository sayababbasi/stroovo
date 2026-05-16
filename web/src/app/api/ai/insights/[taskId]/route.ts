import { NextResponse } from 'next/server';
import { AIIntegrationEngine } from '@/ai/ai-integration';
import { requirePermission } from '@/lib/authorization';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  // Check permission - all roles can view AI insights for their tasks
  const authResult = await requirePermission('tasks.read')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const { taskId } = await params;
    
    console.log('[GET /api/ai/insights/:taskId] Generating insights for task:', taskId, 'by user:', userId);
    
    const insights = await AIIntegrationEngine.generateTaskInsights(taskId);
    
    console.log('[GET /api/ai/insights/:taskId] Insights generated successfully');
    return NextResponse.json(insights);
  } catch (error: any) {
    console.error('[GET /api/ai/insights/:taskId] Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  // Check permission - all roles can refresh AI insights for their tasks
  const authResult = await requirePermission('tasks.read')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const { taskId } = await params;
    
    console.log('[POST /api/ai/insights/:taskId] Refreshing insights for task:', taskId, 'by user:', userId);
    
    // Force refresh insights
    const insights = await AIIntegrationEngine.generateTaskInsights(taskId);
    
    console.log('[POST /api/ai/insights/:taskId] Insights refreshed successfully');
    return NextResponse.json({ 
      message: 'AI insights refreshed successfully',
      insights 
    });
  } catch (error: any) {
    console.error('[POST /api/ai/insights/:taskId] Error refreshing AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to refresh AI insights', details: error.message },
      { status: 500 }
    );
  }
}

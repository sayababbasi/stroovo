import { NextResponse } from 'next/server';
import { AIIntegrationEngine } from '@/ai/ai-integration';
import { requirePermission } from '@/lib/authorization';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check permission - all roles can view bottlenecks for projects they have access to
  const authResult = await requirePermission('projects.read')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const { id: projectId } = await params;
    
    console.log('[GET /api/ai/project-bottlenecks/:projectId] Analyzing bottlenecks for project:', projectId, 'by user:', userId);
    
    const bottlenecks = await AIIntegrationEngine.detectProjectBottlenecks(projectId);
    
    console.log('[GET /api/ai/project-bottlenecks/:projectId] Bottleneck analysis completed:', bottlenecks.length, 'bottlenecks found');
    
    return NextResponse.json({
      projectId,
      bottlenecks,
      analysis: bottlenecks.length > 0 ? 'Issues detected' : 'No significant bottlenecks'
    });
  } catch (error: any) {
    console.error('[GET /api/ai/project-bottlenecks/:projectId] Error analyzing bottlenecks:', error);
    return NextResponse.json(
      { error: 'Failed to analyze project bottlenecks', details: error.message },
      { status: 500 }
    );
  }
}

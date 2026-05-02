import { NextResponse } from 'next/server';
import { RiskEngine } from '@/ai/risk-engine';
import { requirePermission } from '@/lib/authorization';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  // Check permission - all roles can view risk analysis for their tasks
  const authResult = await requirePermission('tasks.read')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const { taskId } = await params;
    
    console.log('[GET /api/ai/risk-analysis/:taskId] Analyzing risk for task:', taskId, 'by user:', userId);
    
    const riskAnalysis = await RiskEngine.evaluateTaskRisk(taskId);
    
    console.log('[GET /api/ai/risk-analysis/:taskId] Risk analysis completed:', {
      riskScore: riskAnalysis.riskScore,
      delayProbability: riskAnalysis.delayProbability,
      riskLevel: riskAnalysis.insights.riskLevel
    });
    
    return NextResponse.json(riskAnalysis);
  } catch (error: any) {
    console.error('[GET /api/ai/risk-analysis/:taskId] Error analyzing risk:', error);
    return NextResponse.json(
      { error: 'Failed to analyze task risk', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  // Check permission - all roles can refresh risk analysis for their tasks
  const authResult = await requirePermission('tasks.update')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const { taskId } = await params;
    
    console.log('[POST /api/ai/risk-analysis/:taskId] Refreshing risk analysis for task:', taskId, 'by user:', userId);
    
    // Force refresh risk analysis
    const riskAnalysis = await RiskEngine.evaluateTaskRisk(taskId);
    
    console.log('[POST /api/ai/risk-analysis/:taskId] Risk analysis refreshed successfully');
    return NextResponse.json({ 
      message: 'Risk analysis refreshed successfully',
      riskAnalysis 
    });
  } catch (error: any) {
    console.error('[POST /api/ai/risk-analysis/:taskId] Error refreshing risk analysis:', error);
    return NextResponse.json(
      { error: 'Failed to refresh risk analysis', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { WorkloadEngine } from '@/ai/workload-engine';
import { requirePermission } from '@/lib/authorization';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Check permission - users can view their own workload, managers can view team workload
  const authResult = await requirePermission('users.read')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const currentUserId = headerList.get('x-user-id');
    const { userId } = await params;
    
    // Users can only view their own workload unless they have higher permissions
    if ('user' in authResult) {
      const userRole = authResult.user.role;
      const canViewOthers = ['ADMIN', 'SUPER_ADMIN', 'CEO', 'EXECUTIVE', 'MANAGER', 'PROJECT_MANAGER'].includes(userRole);
      
      if (!canViewOthers && currentUserId !== userId) {
        console.log('[GET /api/ai/workload/:userId] Access denied - user trying to view others workload');
        return NextResponse.json(
          { error: 'You can only view your own workload' },
          { status: 403 }
        );
      }
    }
    
    console.log('[GET /api/ai/workload/:userId] Analyzing workload for user:', userId, 'by user:', currentUserId);
    
    const workloadAnalysis = await WorkloadEngine.evaluateUserWorkload(userId);
    
    console.log('[GET /api/ai/workload/:userId] Workload analysis completed:', {
      userId,
      activeTaskCount: workloadAnalysis.activeTaskCount,
      status: workloadAnalysis.status,
      utilizationRate: workloadAnalysis.utilizationRate
    });
    
    return NextResponse.json(workloadAnalysis);
  } catch (error: any) {
    console.error('[GET /api/ai/workload/:userId] Error analyzing workload:', error);
    return NextResponse.json(
      { error: 'Failed to analyze user workload', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Check permission - only managers can refresh workload analysis for others
  const authResult = await requirePermission('users.update')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const headerList = await headers();
    const currentUserId = headerList.get('x-user-id');
    const { userId } = await params;
    
    // Users can refresh their own workload, managers can refresh team workload
    if ('user' in authResult) {
      const userRole = authResult.user.role;
      const canRefreshOthers = ['ADMIN', 'SUPER_ADMIN', 'CEO', 'EXECUTIVE', 'MANAGER', 'PROJECT_MANAGER'].includes(userRole);
      
      if (!canRefreshOthers && currentUserId !== userId) {
        console.log('[POST /api/ai/workload/:userId] Access denied - user trying to refresh others workload');
        return NextResponse.json(
          { error: 'You can only refresh your own workload' },
          { status: 403 }
        );
      }
    }
    
    console.log('[POST /api/ai/workload/:userId] Refreshing workload for user:', userId, 'by user:', currentUserId);
    
    // Force refresh workload analysis
    const workloadAnalysis = await WorkloadEngine.evaluateUserWorkload(userId);
    
    console.log('[POST /api/ai/workload/:userId] Workload analysis refreshed successfully');
    return NextResponse.json({ 
      message: 'Workload analysis refreshed successfully',
      workloadAnalysis 
    });
  } catch (error: any) {
    console.error('[POST /api/ai/workload/:userId] Error refreshing workload:', error);
    return NextResponse.json(
      { error: 'Failed to refresh workload analysis', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AutoExecutionService } from '@/lib/teams/auto-execution-service';

/**
 * POST /api/teams/:id/auto-rollback
 * Revert an autonomous action taken by the AI.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const { logId } = await request.json();
        const result = await AutoExecutionService.rollbackAction(logId, tenantId);
        
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

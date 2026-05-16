import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AutoExecutionService } from '@/lib/teams/auto-execution-service';

/**
 * POST /api/teams/:id/auto-run
 * Manually trigger the semi-autonomous autopilot for a team.
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

        const { id } = await params;
        const result = await AutoExecutionService.runAutoPilot(id, tenantId);
        
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

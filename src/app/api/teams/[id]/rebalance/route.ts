import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TeamAutomationService } from '@/lib/teams/automation-service';

/**
 * POST /api/teams/:id/rebalance
 * Execute automated workload rebalancing for high-confidence suggestions.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id') || 'SYSTEM_AUTO';

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const { id } = await params;
        const result = await TeamAutomationService.rebalanceWorkload(id, tenantId, userId);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TeamAutomationService } from '@/lib/teams/automation-service';

/**
 * POST /api/teams/:id/optimize
 * Get suggestions for reassignment to optimize team workload.
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
        const suggestions = await TeamAutomationService.optimizeTeam(id, tenantId);
        return NextResponse.json(suggestions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

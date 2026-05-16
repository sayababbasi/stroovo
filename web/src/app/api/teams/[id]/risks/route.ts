import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TeamAutomationService } from '@/lib/teams/automation-service';

/**
 * GET /api/teams/:id/risks
 * Detect workflow risks, bottlenecks, and overloads.
 */
export async function GET(
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
        const risks = await TeamAutomationService.detectRisks(id, tenantId);
        return NextResponse.json(risks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

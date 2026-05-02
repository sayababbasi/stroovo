import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TeamService } from '@/lib/teams/team-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teams
 * List all teams for the current tenant.
 */
export async function GET(request: Request) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const { searchParams } = new URL(request.url);
        const include = searchParams.get('include');

        // For development, use a default tenant if none provided
        const effectiveTenantId = tenantId || 'default-tenant';

        // Ensure default tenant exists
        await ensureDefaultTenant(effectiveTenantId);

        console.log(`[GET /api/teams] Fetching for tenant: ${effectiveTenantId}`);
        const teams = await TeamService.getTeams(effectiveTenantId, include || undefined);
        console.log(`[GET /api/teams] Found ${teams?.length || 0} teams for tenant: ${effectiveTenantId}`, JSON.stringify(teams));

        return NextResponse.json({ 
            success: true, 
            data: teams,
            message: 'Teams retrieved successfully'
        });
    } catch (error: any) {
        console.error('[GET /api/teams] Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal Server Error',
            details: error.message 
        }, { status: 500 });
    }
}

// Helper function to ensure default tenant and user exist
async function ensureDefaultTenant(tenantId: string, userId?: string) {
    const prisma = await import('@/lib/prisma').then(m => m.default);

    // Ensure tenant exists
    const existingTenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
    });

    if (!existingTenant) {
        await prisma.tenant.create({
            data: {
                id: tenantId,
                name: 'Default Tenant',
                domain: 'localhost'
            }
        });
        console.log(`[TEAMS] Created default tenant: ${tenantId}`);
    }

    // Ensure user exists if userId is provided
    if (userId) {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    id: userId,
                    name: 'Default User',
                    email: 'default@example.com',
                    tenantId: tenantId,
                    passwordHash: 'default-hash' // Required field for user creation
                }
            });
            console.log(`[TEAMS] Created default user: ${userId}`);
        }
    }
}

/**
 * POST /api/teams
 * Create a new team.
 * Body: { name: string, description?: string }
 */
export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id');

        // For development, use defaults if not provided
        const effectiveTenantId = tenantId || 'default-tenant';
        const effectiveUserId = userId || 'default-user';

        // Ensure default tenant and user exist
        await ensureDefaultTenant(effectiveTenantId, effectiveUserId);

        const body = await request.json();

        if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
            return NextResponse.json({ success: false, error: 'Team name is required' }, { status: 400 });
        }

        const team = await TeamService.createTeam(
            { name: body.name, description: body.description },
            effectiveUserId,
            effectiveTenantId
        );

        return NextResponse.json({ 
            success: true, 
            data: team,
            message: 'Team created successfully'
        }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/teams] Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal Server Error',
            details: error.message 
        }, { status: 500 });
    }
}

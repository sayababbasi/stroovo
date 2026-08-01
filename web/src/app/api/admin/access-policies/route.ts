import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { createAccessPolicySchema } from '@/lib/validation/access-policy';

export async function GET(request: Request) {
  // Requires access_policies.view or equivalent. Mapping to a generic admin view for now.
  const authResult = await requirePermission('teams.read.all')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const policies = await prisma.accessPolicy.findMany({
      where,
      include: {
        users: { include: { user: true } },
        roles: { include: { role: true } },
        teams: { include: { team: true } },
        resources: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      active: await prisma.accessPolicy.count({ where: { status: 'ACTIVE' } }),
      draft: await prisma.accessPolicy.count({ where: { status: 'DRAFT' } }),
      total: await prisma.accessPolicy.count(),
    };

    return NextResponse.json({ success: true, data: policies, stats });
  } catch (error: any) {
    console.error('[GET /api/admin/access-policies]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authResult = await requirePermission('teams.create')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const validatedData = createAccessPolicySchema.parse(body);
    const headerList = await headers();
    const userId = headerList.get('x-user-id');

    // Create policy and its relations
    const policy = await prisma.accessPolicy.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        effect: validatedData.effect,
        appliesToAll: validatedData.appliesToAll,
        actions: validatedData.actions || [],
        mfaRequired: validatedData.mfaRequired,
        approvalRequired: validatedData.approvalRequired,
        readOnly: validatedData.readOnly,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        allowedDays: validatedData.allowedDays || [],
        timezone: validatedData.timezone,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        allowedIps: validatedData.allowedIps || [],
        blockedIps: validatedData.blockedIps || [],
        allowedCountries: validatedData.allowedCountries || [],
        blockedCountries: validatedData.blockedCountries || [],
        requireManagedDevice: validatedData.requireManagedDevice,
        requireTrustedDevice: validatedData.requireTrustedDevice,
        createdBy: userId || 'system',
        updatedBy: userId || 'system',
        
        resources: {
          create: validatedData.resources.map(r => ({ resource: r }))
        },
        users: validatedData.userIds ? {
          create: validatedData.userIds.map(id => ({ userId: id }))
        } : undefined,
        roles: validatedData.roleIds ? {
          create: validatedData.roleIds.map(id => ({ roleId: id }))
        } : undefined,
        teams: validatedData.teamIds ? {
          create: validatedData.teamIds.map(id => ({ teamId: id }))
        } : undefined
      }
    });

    return NextResponse.json({ success: true, data: policy });
  } catch (error: any) {
    console.error('[POST /api/admin/access-policies]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

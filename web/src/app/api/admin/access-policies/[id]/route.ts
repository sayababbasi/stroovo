import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { updateAccessPolicySchema } from '@/lib/validation/access-policy';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission('teams.read.all')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const { id } = await params;
    const policy = await prisma.accessPolicy.findUnique({
      where: { id },
      include: {
        users: { include: { user: true } },
        roles: { include: { role: true } },
        teams: { include: { team: true } },
        resources: true,
        exceptions: {
          include: { user: true, role: true, team: true }
        }
      }
    });

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: policy });
  } catch (error: any) {
    console.error(`[GET /api/admin/access-policies]`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission('teams.create')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateAccessPolicySchema.parse(body);
    const headerList = await headers();
    const userId = headerList.get('x-user-id') || 'system';

    const updateData: any = {
      name: validatedData.name,
      description: validatedData.description,
      status: validatedData.status,
      priority: validatedData.priority,
      effect: validatedData.effect,
      appliesToAll: validatedData.appliesToAll,
      actions: validatedData.actions,
      mfaRequired: validatedData.mfaRequired,
      approvalRequired: validatedData.approvalRequired,
      readOnly: validatedData.readOnly,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      allowedDays: validatedData.allowedDays,
      timezone: validatedData.timezone,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      allowedIps: validatedData.allowedIps,
      blockedIps: validatedData.blockedIps,
      allowedCountries: validatedData.allowedCountries,
      blockedCountries: validatedData.blockedCountries,
      requireManagedDevice: validatedData.requireManagedDevice,
      requireTrustedDevice: validatedData.requireTrustedDevice,
      updatedBy: userId,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const policy = await prisma.accessPolicy.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: policy });
  } catch (error: any) {
    console.error(`[PATCH /api/admin/access-policies]`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePermission('teams.create')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const { id } = await params;
    await prisma.accessPolicy.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[DELETE /api/admin/access-policies]`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

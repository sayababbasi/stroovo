import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { P } from '@/lib/permissions/registry';
import { requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
  const auth = await requirePermission(P.INVITATIONS_VIEW)(request);
  if (!auth.success) return auth.response;

  const restrictions = await prisma.domainRestriction.findMany({
    where: { tenantId: auth.user.tenantId! },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ success: true, data: restrictions });
}

export async function POST(request: Request) {
  const auth = await requirePermission(P.INVITATIONS_MANAGE_ACCESS)(request);
  if (!auth.success) return auth.response;

  const body = await request.json();
  const { domain, type } = body;

  if (!domain || !['ALLOW', 'BLOCK'].includes(type)) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }

  // Remove @ if they included it
  const cleanDomain = domain.replace('@', '').trim().toLowerCase();

  try {
    const record = await prisma.domainRestriction.upsert({
      where: { tenantId_domain: { tenantId: auth.user.tenantId!, domain: cleanDomain } },
      update: { type },
      create: { tenantId: auth.user.tenantId!, domain: cleanDomain, type }
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        tenantId: auth.user.tenantId!,
        action: 'DOMAIN_RESTRICTION_CREATED',
        entity: 'TENANT',
        entityId: auth.user.tenantId!,
        metadata: { details: `Set domain ${cleanDomain} to ${type}` }
      }
    });

    return NextResponse.json({ success: true, data: record });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

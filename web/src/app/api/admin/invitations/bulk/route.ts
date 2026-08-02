import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { P } from '@/lib/permissions/registry';
import { requirePermission } from '@/lib/authorization';
import crypto from 'crypto';

export async function POST(request: Request) {
  const auth = await requirePermission(P.INVITATIONS_BULK_CREATE)(request);
  if (!auth.success) return auth.response;

  const body = await request.json();
  const { invitations } = body; // Array of { email, roleId, teams }

  if (!invitations || !Array.isArray(invitations) || invitations.length === 0) {
    return NextResponse.json({ success: false, error: 'Invitations array is required' }, { status: 400 });
  }

  const created = [];
  const errors = [];

  const restrictions = await prisma.domainRestriction.findMany({
    where: { tenantId: auth.user.tenantId! }
  });
  const allowedDomains = restrictions.filter((r: any) => r.type === 'ALLOW').map((r: any) => r.domain);
  const blockedDomains = restrictions.filter((r: any) => r.type === 'BLOCK').map((r: any) => r.domain);

  for (const inv of invitations) {
    const { email, roleId, teams } = inv;
    if (!email) {
      errors.push('Missing email in row');
      continue;
    }

    try {
      const existing = await prisma.organizationInvitation.findUnique({
        where: { email_tenantId: { email, tenantId: auth.user.tenantId! } }
      });

      if (existing) {
        if (existing.status === 'PENDING' || existing.status === 'ACCEPTED') {
          errors.push(`${email}: Already exists (${existing.status})`);
          continue;
        } else {
          await prisma.organizationInvitation.delete({ where: { id: existing.id } });
        }
      }

      const domain = email.split('@')[1];
      let isAllowed = true;
      if (blockedDomains.includes(domain)) isAllowed = false;
      if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) isAllowed = false;
      
      if (!isAllowed) {
        errors.push(`${email}: Domain restricted`);
        continue;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

      const invitation = await prisma.organizationInvitation.create({
        data: {
          email,
          tenantId: auth.user.tenantId!,
          roleId: roleId || null,
          invitedBy: auth.user.id,
          token,
          expiresAt,
          teams: {
            create: (teams || []).map((tId: string) => ({ teamId: tId }))
          }
        }
      });

      created.push(invitation);
    } catch (e: any) {
      errors.push(`${email}: Failed - ${e.message}`);
    }
  }

  if (created.length > 0) {
    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        tenantId: auth.user.tenantId!,
        action: 'BULK_INVITATION_CREATED',
        entity: 'INVITATION',
        entityId: 'BULK',
        metadata: { details: `Bulk invited ${created.length} members` }
      }
    });
  }

  return NextResponse.json({ 
    success: true, 
    data: created, 
    errors,
    message: `Created ${created.length} invitations. ${errors.length} failed.` 
  });
}

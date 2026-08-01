import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { P } from '@/lib/permissions/registry';
import { requirePermission } from '@/lib/authorization';
import crypto from 'crypto';

export async function GET(request: Request) {
  const auth = await requirePermission(P.INVITATIONS_VIEW)(request);
  if (!auth.success) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'ALL';
  const search = url.searchParams.get('search') || '';

  const where: any = { tenantId: auth.user.tenantId! };
  
  if (status !== 'ALL') {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const invitations = await prisma.organizationInvitation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      inviter: { select: { id: true, name: true, email: true } },
      systemRole: { select: { id: true, name: true } },
      teams: {
        include: { team: { select: { id: true, name: true } } }
      }
    }
  });

  const stats = {
    total: await prisma.organizationInvitation.count({ where: { tenantId: auth.user.tenantId! } }),
    pending: await prisma.organizationInvitation.count({ where: { tenantId: auth.user.tenantId!, status: 'PENDING' } }),
    accepted: await prisma.organizationInvitation.count({ where: { tenantId: auth.user.tenantId!, status: 'ACCEPTED' } }),
    expired: await prisma.organizationInvitation.count({ where: { tenantId: auth.user.tenantId!, status: 'EXPIRED' } }),
    revoked: await prisma.organizationInvitation.count({ where: { tenantId: auth.user.tenantId!, status: 'REVOKED' } }),
    failed: await prisma.organizationInvitation.count({ where: { tenantId: auth.user.tenantId!, status: 'FAILED' } }),
  };

  return NextResponse.json({ success: true, data: invitations, stats });
}

export async function POST(request: Request) {
  const auth = await requirePermission(P.INVITATIONS_CREATE)(request);
  if (!auth.success) return auth.response;

  const body = await request.json();
  const { emails, roleId, teams, expiresInDays, requireEmailVerification, requireMFA, requireAdminApproval } = body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ success: false, error: 'At least one email is required' }, { status: 400 });
  }

  const createdInvitations = [];
  const errors = [];

  for (const email of emails) {
    try {
      const existing = await prisma.organizationInvitation.findUnique({
        where: { email_tenantId: { email, tenantId: auth.user.tenantId! } }
      });

      if (existing) {
        if (existing.status === 'PENDING') {
          errors.push(`${email} already has a pending invitation.`);
          continue;
        } else if (existing.status === 'ACCEPTED') {
          errors.push(`${email} is already a member.`);
          continue;
        } else {
          // If revoked, failed, or expired, we can replace it. We'll just delete the old one.
          await prisma.organizationInvitation.delete({ where: { id: existing.id } });
        }
      }

      // Check Domain Restrictions
      const domain = email.split('@')[1];
      const restrictions = await prisma.domainRestriction.findMany({
        where: { tenantId: auth.user.tenantId! }
      });
      
      let isAllowed = true;
      if (restrictions.length > 0) {
          const allowedDomains = restrictions.filter(r => r.type === 'ALLOW').map(r => r.domain);
          const blockedDomains = restrictions.filter(r => r.type === 'BLOCK').map(r => r.domain);
          
          if (blockedDomains.includes(domain)) isAllowed = false;
          if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) isAllowed = false;
      }
      
      if (!isAllowed) {
          errors.push(`${email} domain is restricted.`);
          continue;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (parseInt(expiresInDays) || 7));

      const invitation = await prisma.organizationInvitation.create({
        data: {
          email,
          tenantId: auth.user.tenantId!,
          roleId: roleId || null,
          invitedBy: auth.user.id,
          token,
          expiresAt,
          requireEmailVerification: requireEmailVerification || false,
          requireMFA: requireMFA || false,
          requireAdminApproval: requireAdminApproval || false,
          teams: {
            create: (teams || []).map((tId: string) => ({ teamId: tId }))
          },
          lastSentAt: new Date(),
          deliveryStatus: 'DELIVERED' // Mock delivery success
        }
      });

      // Audit Log
      await prisma.activityLog.create({
        data: {
          userId: auth.user.id,
          tenantId: auth.user.tenantId!,
          action: 'INVITATION_CREATED',
          entity: 'INVITATION',
          entityId: invitation.id,
          details: `Sent invitation to ${email}`
        }
      });

      createdInvitations.push(invitation);
    } catch (e: any) {
      errors.push(`Failed to invite ${email}: ${e.message}`);
    }
  }

  return NextResponse.json({ 
    success: true, 
    data: createdInvitations, 
    message: `Sent ${createdInvitations.length} invitations. ${errors.length ? errors.join(', ') : ''}` 
  });
}

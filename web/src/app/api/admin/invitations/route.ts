import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { P } from '@/lib/permissions/registry';
import { requirePermission } from '@/lib/authorization';
import crypto from 'crypto';
import { emailService } from '@/lib/email';

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

      let deliveryStatus = 'SENDING';
      let failureReason: string | null = null;

      // Construct Invitation URL
      const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const inviteUrl = `${appUrl}/invite/${token}`;

      // Dispatch Email using Centralized Email Service
      try {
        const emailResponse = await emailService.sendEmail({
          to: email,
          subject: `You've been invited to join Stroovo`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #0f172a;">You're Invited!</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                You have been invited to join a workspace on Stroovo by an administrator.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">
                If you did not expect this invitation, you can safely ignore this email.
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">
                Stroovo Enterprise Platform
              </p>
            </div>
          `,
        });

        if (emailResponse.success) {
          deliveryStatus = 'DELIVERED';
        } else {
          deliveryStatus = 'FAILED';
          failureReason = emailResponse.error as string || 'Delivery failed via provider';
        }
      } catch (err: any) {
        console.error(`[INVITE ERROR] Failed to deliver to ${email}:`, err);
        deliveryStatus = 'FAILED';
        failureReason = err.message || 'Unknown Delivery Error';
      }

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
          deliveryStatus,
          failureReason
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
          metadata: { 
            details: `Created invitation for ${email}`,
            deliveryStatus,
            error: failureReason 
          }
        }
      });

      if (deliveryStatus === 'FAILED') {
        // We log the error but still create the DB record so admin can retry later.
        errors.push(`Created invitation but email failed to send to ${email}: ${failureReason}`);
      }
      
      createdInvitations.push(invitation);
    } catch (e: any) {
      errors.push(`Failed to create invitation for ${email}: ${e.message}`);
    }
  }

  return NextResponse.json({ 
    success: true, 
    data: createdInvitations, 
    message: `Sent ${createdInvitations.length} invitations. ${errors.length ? errors.join(', ') : ''}` 
  });
}

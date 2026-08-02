import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { P } from '@/lib/permissions/registry';
import { requirePermission } from '@/lib/authorization';
import crypto from 'crypto';
import * as React from 'react';
import { render } from '@react-email/render';
import { InvitationEmail } from '@/lib/email/templates/InvitationEmail';
import { emailService } from '@/lib/email/service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(P.INVITATIONS_VIEW)(request);
  if (!auth.success) return auth.response;

  const { id } = await params;
  const invitation = await prisma.organizationInvitation.findUnique({
    where: { id, tenantId: auth.user.tenantId! },
    include: {
      inviter: { select: { id: true, name: true, email: true } },
      systemRole: { select: { id: true, name: true, permissions: { include: { permission: true } } } },
      teams: {
        include: { team: { select: { id: true, name: true, description: true } } }
      }
    }
  });

  if (!invitation) return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: invitation });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const { action, roleId, teams, expiresInDays } = body; // action: 'REVOKE', 'RESEND', 'UPDATE_ACCESS', 'EXTEND'

  let requiredPerm: string = P.INVITATIONS_MANAGE_ACCESS;
  if (action === 'REVOKE') requiredPerm = P.INVITATIONS_REVOKE;
  if (action === 'RESEND') requiredPerm = P.INVITATIONS_CREATE;

  const auth = await requirePermission(requiredPerm)(request);
  if (!auth.success) return auth.response;

  const { id } = await params;
  const invitation = await prisma.organizationInvitation.findUnique({
    where: { id, tenantId: auth.user.tenantId! }
  });

  if (!invitation) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  let updated;

  if (action === 'REVOKE') {
    updated = await prisma.organizationInvitation.update({
      where: { id },
      data: { status: 'REVOKED', revokedAt: new Date() }
    });
    
    await prisma.activityLog.create({
      data: { userId: auth.user.id, tenantId: auth.user.tenantId!, action: 'INVITATION_REVOKED', entity: 'INVITATION', entityId: invitation.id, metadata: { details: `Revoked invitation for ${invitation.email}` } }
    });
  } 
  else if (action === 'RESEND') {
    const token = crypto.randomBytes(32).toString('hex'); // Invalidate old token on resend
    
    // Render the Email HTML
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/invite/${token}`;
    
    let deliveryStatus = 'SENDING';
    let failureReason = null;
    
    const html = await render(
      React.createElement(InvitationEmail, {
        inviteUrl,
        inviterName: auth.user.name || 'An administrator',
        roleName: 'Team Member', // Or fetch the actual role if available
      })
    );

    try {
      const emailResponse = await emailService.sendEmail({
        to: invitation.email,
        subject: `You've been invited to join Stroovo`,
        html,
      });

      if (emailResponse.success) {
        deliveryStatus = 'DELIVERED';
      } else {
        deliveryStatus = 'FAILED';
        failureReason = emailResponse.error as string || 'Delivery failed via provider';
      }
    } catch (err: any) {
      console.error(`[INVITE ERROR] Failed to deliver to ${invitation.email}:`, err);
      deliveryStatus = 'FAILED';
      failureReason = err.message || 'Unknown Delivery Error';
    }
    
    updated = await prisma.organizationInvitation.update({
      where: { id },
      data: { status: 'PENDING', token, lastSentAt: new Date(), deliveryStatus, failureReason }
    });
    
    await prisma.activityLog.create({
      data: { userId: auth.user.id, tenantId: auth.user.tenantId!, action: 'INVITATION_RESENT', entity: 'INVITATION', entityId: invitation.id, metadata: { details: `Resent invitation for ${invitation.email}` } }
    });
  }
  else if (action === 'UPDATE_ACCESS') {
    // Delete existing teams, re-create
    await prisma.invitationTeam.deleteMany({ where: { invitationId: id } });
    updated = await prisma.organizationInvitation.update({
      where: { id },
      data: {
        roleId: roleId || null,
        teams: {
          create: (teams || []).map((tId: string) => ({ teamId: tId }))
        }
      },
      include: { systemRole: true, teams: { include: { team: true } } }
    });
    
    await prisma.activityLog.create({
      data: { userId: auth.user.id, tenantId: auth.user.tenantId!, action: 'INVITATION_UPDATED', entity: 'INVITATION', entityId: invitation.id, metadata: { details: `Updated access for ${invitation.email}` } }
    });
  }
  else if (action === 'EXTEND') {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (parseInt(expiresInDays) || 7));
    updated = await prisma.organizationInvitation.update({
      where: { id },
      data: { expiresAt, status: 'PENDING' }
    });
  }
  else {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: updated, message: `Action ${action} completed successfully` });
}

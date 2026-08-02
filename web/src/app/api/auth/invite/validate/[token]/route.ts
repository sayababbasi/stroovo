import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        
        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const invitation = await prisma.organizationInvitation.findUnique({
            where: { token },
            include: {
                inviter: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!invitation) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        if (invitation.status !== 'PENDING') {
            return NextResponse.json({ error: 'This invitation is no longer valid' }, { status: 400 });
        }

        if (new Date(invitation.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: invitation.tenantId },
            select: { name: true }
        });

        return NextResponse.json({
            success: true,
            data: {
                email: invitation.email,
                invitedBy: invitation.inviter?.name || invitation.inviter?.email || 'an administrator',
                tenantName: tenant?.name || 'the organization',
                requireEmailVerification: invitation.requireEmailVerification,
                requireMFA: invitation.requireMFA
            }
        });

    } catch (error: any) {
        console.error('[GET /api/auth/invite/validate] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

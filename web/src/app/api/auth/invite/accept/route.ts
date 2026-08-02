import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import AuthenticationService from '@/lib/auth/auth-service';
import { generateSessionId, generateTokenPair } from '@/lib/auth/jwt';
import { extractIPAddress, extractUserAgent, parseDeviceInfo } from '@/lib/auth/security';
import { hashPassword } from '@/lib/auth/crypto';
import { AuthAction, AuthStatus } from '@/lib/auth/types';

const authService = new AuthenticationService(prisma);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        const { token, name, password } = await request.json();

        if (!token || !name || !password) {
            return NextResponse.json({ error: 'Token, name, and password are required' }, { status: 400 });
        }

        // 1. Validate the invitation
        const invitation = await prisma.organizationInvitation.findUnique({
            where: { token },
            include: { teams: true }
        });

        if (!invitation || invitation.status !== 'PENDING' || new Date(invitation.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
        }

        const email = invitation.email;

        // 2. Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        // If not, create them manually to assign the tenant ID immediately
        if (!user) {
            const passwordHash = await hashPassword(password);
            user = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email,
                    passwordHash,
                    role: 'USER', // Default Prisma system role
                    isActive: true,
                    isEmailVerified: true, // Auto-verified via invite
                    tenantId: invitation.tenantId
                }
            });

            await prisma.securitySetting.create({
                data: { userId: user.id }
            });
        } else {
            // Update existing user with new tenantId
            user = await prisma.user.update({
                where: { id: user.id },
                data: { tenantId: invitation.tenantId }
            });
        }

        // 3. Assign Role (MemberRole) if roleId was specified
        if (invitation.roleId) {
            // Remove any existing roles for this tenant
            await prisma.memberRole.deleteMany({
                where: { userId: user.id, role: { tenantId: invitation.tenantId } }
            });
            
            await prisma.memberRole.create({
                data: {
                    userId: user.id,
                    roleId: invitation.roleId,
                    assignedBy: invitation.invitedBy
                }
            });
        }

        // 4. Assign Teams
        if (invitation.teams && invitation.teams.length > 0) {
            const teamAssignments = invitation.teams.map(t => ({
                userId: user!.id,
                teamId: t.teamId,
                role: 'MEMBER' // Default team role
            }));
            
            await prisma.teamMember.createMany({
                data: teamAssignments,
                skipDuplicates: true
            });
        }

        // 5. Mark Invitation as ACCEPTED
        await prisma.organizationInvitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED', acceptedAt: new Date() }
        });

        // 6. Generate Auth Tokens and Session (Logging them in)
        const ipAddress = extractIPAddress(request);
        const userAgent = extractUserAgent(request);
        const deviceInfo = parseDeviceInfo(userAgent);
        
        const sessionId = generateSessionId();
        const tokens = generateTokenPair(user, sessionId);
        
        await prisma.session.create({
            data: {
                id: sessionId,
                userId: user.id,
                device: deviceInfo.device,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        await prisma.authLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                status: 'SUCCESS',
                ipAddress,
                userAgent,
                details: 'Login via invitation acceptance'
            }
        });

        // 7. Audit Log
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                tenantId: invitation.tenantId,
                action: 'INVITATION_ACCEPTED',
                entity: 'INVITATION',
                entityId: invitation.id,
                metadata: { details: `User ${email} accepted the invitation.` }
            }
        });

        const response = NextResponse.json({
            message: 'Invitation accepted successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                tenantId: user.tenantId,
            },
            accessToken: tokens.accessToken,
            expiresIn: tokens.expiresIn,
        }, { status: 200, headers: corsHeaders });

        response.cookies.set('accessToken', tokens.accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        response.cookies.set('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        return response;

    } catch (error: any) {
        console.error('[POST /api/auth/invite/accept] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

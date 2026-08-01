import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/tokens';
import AuthenticationService from '@/lib/auth/auth-service';
import { permissionSetForUser, getEffectiveRole } from '@/lib/authorization';

// Initialize auth service
const authService = new AuthenticationService(prisma);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
    try {
        // Get token from Authorization header or cookie
        const authHeader = request.headers.get('Authorization');
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('accessToken')?.value;
        
        const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : cookieToken;

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401, headers: corsHeaders }
            );
        }

        // Verify token
        const payload = verifyAccessToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401, headers: corsHeaders }
            );
        }

        // Get user data with full role/permission relations for RBAC
        const userId = (payload as any).id || payload.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId as string },
            include: {
                systemRole: {
                    include: {
                        permissions: { include: { permission: true } },
                    },
                },
                additionalRoles: {
                    include: {
                        role: {
                            include: { permissions: { include: { permission: true } } }
                        }
                    }
                },
                teamMembers: {
                    include: {
                        systemRole: {
                            include: { permissions: { include: { permission: true } } }
                        }
                    }
                },
                projectAccesses: {
                    include: {
                        role: {
                            include: { permissions: { include: { permission: true } } }
                        }
                    }
                },
            },
        });

        if (!user || !user.isActive) {
            return NextResponse.json(
                { error: 'User not found or inactive' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Validate session if sessionId is present
        if (payload.sessionId) {
            const sessionValid = await authService.validateSession(payload.sessionId, user.id);
            if (!sessionValid) {
                return NextResponse.json(
                    { error: 'Session expired or invalid' },
                    { status: 401, headers: corsHeaders }
                );
            }
        }

        // Compute effective permissions from RBAC system
        const permissions = permissionSetForUser(user as any);
        const effectiveRole = getEffectiveRole(user as any);

        // Return safe user object (without internal relation data)
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            title: user.title,
            contact: user.contact,
            image: user.image,
            tenantId: user.tenantId,
            createdAt: user.createdAt,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
        };

        return NextResponse.json({ 
            user: safeUser,
            permissions,
            effectiveRole,
            accessToken: token
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Get me error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

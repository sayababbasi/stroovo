import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/tokens';
import AuthenticationService from '@/lib/auth/auth-service';

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

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                title: true,
                contact: true,
                image: true,
                tenantId: true,
                createdAt: true,
                isActive: true,
                isEmailVerified: true,
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

        return NextResponse.json({ 
            user,
            accessToken: token // Include token for client-side use
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Get me error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

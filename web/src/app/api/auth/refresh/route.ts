import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';

export async function OPTIONS() {
    return NextResponse.json({});
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token not found' },
                { status: 401 }
            );
        }

        const payload = verifyRefreshToken(refreshToken);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
        }

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        });

        // Create response
        const response = NextResponse.json({
            message: 'Token refreshed',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                title: user.title,
                contact: user.contact,
                image: user.image,
                tenantId: user.tenantId,
            },
            accessToken: tokens.accessToken,
            expiresIn: 3600,
        });

        // Update refresh token cookie
        response.cookies.set('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
            domain: 'localhost'
        });

        // Update access token cookie
        response.cookies.set('accessToken', tokens.accessToken, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/',
            domain: 'localhost'
        });

        return response;

    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



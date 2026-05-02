import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
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

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        // Use enterprise authentication service for secure logout
        await authService.logout(accessToken, request);

        // Create response
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { headers: corsHeaders }
        );

        // Clear all auth cookies
        response.cookies.set('accessToken', '', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        
        // Still clear cookies even if logout fails
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { headers: corsHeaders }
        );

        response.cookies.set('accessToken', '', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    }
}

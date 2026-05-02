import { NextResponse } from 'next/server';
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
        const { name, email, password, role = 'USER' } = await request.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Use enterprise authentication service
        const result = await authService.signup(name, email, password, request);
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400, headers: corsHeaders }
            );
        }

        // Create response with tokens
        const response = NextResponse.json({
            message: 'User created successfully',
            user: {
                id: result.user!.id,
                name: result.user!.name,
                email: result.user!.email,
                role: result.user!.role,
                title: result.user!.title,
                contact: result.user!.contact,
                image: result.user!.image,
                tenantId: result.user!.tenantId,
                createdAt: result.user!.createdAt,
            },
            accessToken: result.tokens!.accessToken,
            expiresIn: result.tokens!.expiresIn,
        }, { status: 201, headers: corsHeaders });

        // Set secure cookies
        response.cookies.set('accessToken', result.tokens!.accessToken, {
            httpOnly: false, // Needed for client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        response.cookies.set('refreshToken', result.tokens!.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

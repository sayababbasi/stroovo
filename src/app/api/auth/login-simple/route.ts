import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateTokens } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    });

    // Set secure cookies
    const response = NextResponse.json({
      message: 'Login successful',
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
    });

    // Set secure cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: false, // For development - client needs to read this
      secure: false, // Allow in development
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
      domain: 'localhost' // Explicit domain for development
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false, // Allow in development
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      domain: 'localhost' // Explicit domain for development
    });

    return response;
  } catch (error: any) {
    console.error('[LOGIN_ERROR] Full error object:', error);
    console.error('[LOGIN_ERROR] Error message:', error.message);
    console.error('[LOGIN_ERROR] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        path: '/api/auth/login-simple'
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { passwordManager } from '@/lib/auth/password-manager';

// Initialize password manager
const passwordService = passwordManager(prisma);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Request password reset
    const result = await passwordService.requestPasswordReset(email, request);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset instructions sent to your email',
      // Only include token in development
      ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken })
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Reset password
    const result = await passwordService.resetPassword(token, newPassword, request);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset successfully',
      warnings: result.warnings
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

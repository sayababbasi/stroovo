import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { passwordManager } from '@/lib/auth/password-manager';
import { requireAuth } from '@/lib/auth/rbac';

// Initialize password manager
const passwordService = passwordManager(prisma);

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth()(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    const userId = authResult.user!.id;

    // Change password
    const result = await passwordService.changePassword(
      userId,
      currentPassword,
      newPassword,
      request
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password changed successfully',
      warnings: result.warnings
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth()(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const userId = authResult.user!.id;

    // Get password policy
    const policy = await passwordService.getPasswordPolicy(userId);

    // Check if password change is required
    const changeRequired = await passwordService.shouldChangePassword(userId);

    // Get password strength metrics
    const metrics = await passwordService.getPasswordStrengthMetrics(userId);

    return NextResponse.json({
      policy,
      changeRequired,
      metrics
    });

  } catch (error) {
    console.error('Password policy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

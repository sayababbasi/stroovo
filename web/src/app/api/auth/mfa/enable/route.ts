import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mfaService } from '@/lib/auth/mfa';
import { requireAuth } from '@/lib/auth/rbac';

// Initialize MFA service
const authService = mfaService(prisma);

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
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const userId = authResult.user!.id;

    // Enable MFA
    const result = await authService.enableMFA(userId, token);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'MFA enabled successfully',
      enabled: true
    });

  } catch (error) {
    console.error('MFA enable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

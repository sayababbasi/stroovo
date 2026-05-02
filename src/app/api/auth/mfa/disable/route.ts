import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mfaService } from '@/lib/auth/mfa';
import { requireAuth } from '@/lib/auth/rbac';

// Initialize MFA service
const authService = mfaService(prisma);

export async function POST(request: Request) {
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
    const { password, backupCode } = body;

    // Require either password or backup code
    if (!password && !backupCode) {
      return NextResponse.json(
        { error: 'Password or backup code is required to disable MFA' },
        { status: 400 }
      );
    }

    const userId = authResult.user!.id;

    // Disable MFA
    const result = await authService.disableMFA(userId, password, backupCode);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'MFA disabled successfully',
      enabled: false
    });

  } catch (error) {
    console.error('MFA disable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { token, backupCode } = body;

    // Require either token or backup code
    if (!token && !backupCode) {
      return NextResponse.json(
        { error: 'Verification token or backup code is required' },
        { status: 400 }
      );
    }

    const userId = authResult.user!.id;

    // Verify MFA token
    const result = await authService.verifyMFAToken(userId, token, backupCode);
    
    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'MFA verification successful',
      valid: true,
      usedBackupCode: result.usedBackupCode
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

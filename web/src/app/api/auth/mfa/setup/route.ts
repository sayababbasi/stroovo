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

    const userId = authResult.user!.id;

    // Check if user can setup MFA
    const validation = await authService.validateMFASetup(userId);
    if (!validation.canSetup) {
      return NextResponse.json(
        { 
          error: 'Cannot setup MFA', 
          requirements: validation.requirements 
        },
        { status: 400 }
      );
    }

    // Setup MFA
    const result = await authService.setupMFA(userId);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'MFA setup initiated',
      secret: result.secret,
      qrCode: result.qrCode,
      backupCodes: result.backupCodes,
      instructions: {
        step1: 'Scan the QR code with your authenticator app',
        step2: 'Enter the verification code to enable MFA',
        step3: 'Save the backup codes in a secure location',
      }
    });

  } catch (error) {
    console.error('MFA setup error:', error);
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

    // Get MFA status
    const status = await authService.getMFAStatus(userId);

    return NextResponse.json({
      enabled: status.enabled,
      type: status.type,
      hasBackupCodes: status.hasBackupCodes,
      backupCodeCount: status.backupCodeCount,
      canSetup: await authService.validateMFASetup(userId).then(v => v.canSetup),
    });

  } catch (error) {
    console.error('MFA status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

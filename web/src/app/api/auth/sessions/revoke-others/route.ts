import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sessionManager } from '@/lib/auth/session-manager';
import { requireAuth } from '@/lib/auth/rbac';

// Initialize session manager
const sessionService = sessionManager(prisma);

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
    const currentSessionId = authResult.context?.sessionId;

    if (!currentSessionId) {
      return NextResponse.json(
        { error: 'Current session ID not found' },
        { status: 400 }
      );
    }

    // Revoke all other sessions
    const revokedCount = await sessionService.revokeOtherSessions(userId, currentSessionId);

    return NextResponse.json({
      message: 'Other sessions revoked successfully',
      revokedCount,
      currentSessionId
    });

  } catch (error) {
    console.error('Revoke other sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

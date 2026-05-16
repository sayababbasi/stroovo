import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sessionManager } from '@/lib/auth/session-manager';
import { requireAuth } from '@/lib/auth/rbac';

// Initialize session manager
const sessionService = sessionManager(prisma);

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

    // Get user sessions
    const sessions = await sessionService.getUserSessions(userId);
    
    // Mark current session
    const currentSessionId = authResult.context?.sessionId;
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === currentSessionId
    }));

    // Get session statistics
    const stats = await sessionService.getSessionStats(userId);

    return NextResponse.json({
      sessions: sessionsWithCurrent,
      stats,
      maxSessions: 5 // This could come from user settings
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { sessionId, revokeAll = false } = body;
    const userId = authResult.user!.id;

    let revokedCount = 0;

    if (revokeAll) {
      // Revoke all sessions
      revokedCount = await sessionService.revokeAllSessions(userId);
    } else if (sessionId) {
      // Revoke specific session
      const success = await sessionService.revokeSession(sessionId, userId);
      revokedCount = success ? 1 : 0;
    } else {
      return NextResponse.json(
        { error: 'Session ID or revokeAll flag is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Sessions revoked successfully',
      revokedCount
    });

  } catch (error) {
    console.error('Revoke sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

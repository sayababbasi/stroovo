import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auditLogger } from '@/lib/auth/audit-logger';
import { requireRole } from '@/lib/auth/rbac';
import { UserRole } from '@prisma/client/index';

// Initialize audit logger
const auditService = auditLogger(prisma);

export async function GET(request: NextRequest) {
  try {
    // Require admin or super admin role
    const authResult = await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filter = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') as any,
      status: searchParams.get('status') as any,
      ipAddress: searchParams.get('ipAddress') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Get audit logs
    const result = await auditService.getAuditLogs(filter);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin or super admin role
    const authResult = await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, status, details, metadata } = body;

    if (!action || !status) {
      return NextResponse.json(
        { error: 'Action and status are required' },
        { status: 400 }
      );
    }

    // Log custom audit event
    await auditService.logAuthEvent({
      userId: authResult.user!.id,
      action,
      status,
      request,
      details,
      metadata
    });

    return NextResponse.json({
      message: 'Audit event logged successfully'
    });

  } catch (error) {
    console.error('Log audit event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

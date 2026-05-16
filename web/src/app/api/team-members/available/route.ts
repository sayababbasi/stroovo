import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team-members/available?teamId=xxx
 * Returns users in the tenant who are NOT already members of the given team.
 */
export async function GET(request: NextRequest) {
  try {
    const headerList = await headers();
    const tenantId = headerList.get('x-tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const search = searchParams.get('search') || '';

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    // Get IDs of users already in this team
    const existingMembers = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true }
    });
    const existingUserIds = existingMembers.map(m => m.userId);

    // Find users in the same tenant who are not already team members
    const whereClause: any = {
      tenantId,
      id: { notIn: existingUserIds.length > 0 ? existingUserIds : ['__none__'] }
    };

    // Optional search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const availableUsers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        department: true
      },
      orderBy: { name: 'asc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: availableUsers
    });
  } catch (error: any) {
    console.error('[GET /api/team-members/available] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch available users',
      details: error.message
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TeamRole } from '@/lib/rbac';


// GET /api/team-members - Get team members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: members,
      message: 'Team members retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch team members',
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/team-members - Add team member
export async function POST(request: NextRequest) {
  try {
    const { teamId, userId, email, role = TeamRole.MEMBER } = await request.json();

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    // If email is provided, find user by email
    let targetUserId = userId;
    if (email && !userId) {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ success: false, error: 'User is already a team member' }, { status: 409 });
    }

    // Add team member
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: targetUserId,
        role,
        joinedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: member,
      message: 'Team member added successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add team member',
      details: error.message 
    }, { status: 500 });
  }
}

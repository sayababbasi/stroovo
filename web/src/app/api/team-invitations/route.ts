import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TeamRole } from '@/lib/rbac';


// POST /api/team-invitations - Send team invitation
export async function POST(request: NextRequest) {
  try {
    const { teamId, email, role = TeamRole.MEMBER, invitedBy } = await request.json();

    if (!teamId || !email || !invitedBy) {
      return NextResponse.json({
        error: 'Team ID, email, and invitedBy are required'
      }, { status: 400 });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, create a pending user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use email prefix as temporary name
          role: 'TEAM_MEMBER', // Use existing enum value
          passwordHash: 'pending-invitation' // Required field
        } as any
      });
    }

    // Check if user is already a team member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 409 });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await (prisma as any).teamInvitation.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id
        }
      }
    });

    if (existingInvitation && existingInvitation.status === 'PENDING') {
      return NextResponse.json({ error: 'Invitation already sent' }, { status: 409 });
    }

    // Create invitation
    const invitation = await (prisma as any).teamInvitation.create({
      data: {
        teamId,
        userId: user.id,
        role,
        invitedBy,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    // TODO: Send invitation email
    // TODO: Emit WebSocket event for real-time updates

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error('Error sending team invitation:', error);
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
  }
}

// GET /api/team-invitations - Get team invitations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let whereClause: any = {};

    if (teamId) whereClause.teamId = teamId;
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;

    const invitations = await (prisma as any).teamInvitation.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching team invitations:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

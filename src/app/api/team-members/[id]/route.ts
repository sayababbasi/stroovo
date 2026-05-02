import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TeamRole } from '@/lib/rbac';

const prisma = new PrismaClient();

// GET /api/team-members/[id] - Get specific team member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.teamMember.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 });
  }
}

// PATCH /api/team-members/[id] - Update team member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role } = await request.json();

    if (!role || !Object.values(TeamRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // TODO: Emit WebSocket event for real-time updates
    // TODO: Send notification to user about role change

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE /api/team-members/[id] - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: params.id },
      include: {
        team: true
      }
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Check if this is the last admin
    if (existingMember.role === TeamRole.ADMIN) {
      const adminCount = await prisma.teamMember.count({
        where: {
          teamId: existingMember.teamId,
          role: TeamRole.ADMIN
        }
      });

      if (adminCount <= 1) {
        return NextResponse.json({
          error: 'Cannot remove the last admin. Transfer admin rights first.'
        }, { status: 400 });
      }
    }

    // Remove team member
    await prisma.teamMember.delete({
      where: { id: params.id }
    });

    // TODO: Emit WebSocket event for real-time updates
    // TODO: Send notification to user about removal

    return NextResponse.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}

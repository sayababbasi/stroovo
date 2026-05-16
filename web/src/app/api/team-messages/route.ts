import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createMessageSchema = z.object({
  teamId: z.string(),
  userId: z.string(),
  content: z.string().min(1).max(2000),
  type: z.enum(['TEXT', 'FILE', 'EMOJI']).default('TEXT'),
  threadId: z.string().optional(),
  replyToId: z.string().optional(),
});

// GET /api/team-messages - Get messages for a team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const threadId = searchParams.get('threadId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    const where: any = { teamId };
    if (threadId) where.threadId = threadId;

    const messages = await prisma.teamMessage.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json({ 
      success: true, 
      data: messages.reverse(),
      message: 'Messages retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching team messages:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch team messages',
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/team-messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Verify user exists before creating message
    let user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    });

    // Fallback: try looking up by email if the ID looks like an email or ID lookup failed
    if (!user && (validatedData.userId.includes('@') || validatedData.userId.length > 5)) {
      user = await prisma.user.findUnique({
        where: { email: validatedData.userId }
      });
      
      if (user) {
        // Update validatedData with the real ID for the rest of the logic
        validatedData.userId = user.id;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: validatedData.teamId }
    });

    if (!team) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    // Verify user is a member of the team
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: validatedData.teamId,
          userId: validatedData.userId
        }
      }
    });

    if (!teamMember) {
      return NextResponse.json({ success: false, error: 'User is not a member of this team' }, { status: 403 });
    }

    const message = await prisma.teamMessage.create({
      data: validatedData,
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
      data: message,
      message: 'Message sent successfully'
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error sending team message:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send team message', 
      details: error.message 
    }, { status: 500 });
  }
}

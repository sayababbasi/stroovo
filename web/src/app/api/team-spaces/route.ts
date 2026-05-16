import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSpaceSchema = z.object({
  teamId: z.string(),
  name: z.string().min(1).max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});

// GET /api/team-spaces - Get all spaces for a team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    const spaces = await prisma.teamSpace.findMany({
      where: { teamId },
      include: {
        lists: {
          orderBy: { createdAt: 'asc' }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: spaces,
      message: 'Team spaces retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching team spaces:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch team spaces',
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/team-spaces - Create a new space
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSpaceSchema.parse(body);

    const space = await prisma.teamSpace.create({
      data: validatedData,
      include: {
        lists: true,
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: space,
      message: 'Team space created successfully'
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error creating team space:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create team space',
      details: error.message 
    }, { status: 500 });
  }
}

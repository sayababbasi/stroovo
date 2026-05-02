import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSpaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});

// GET /api/team-spaces/[id] - Get a specific space
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const space = await prisma.teamSpace.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    return NextResponse.json(space);
  } catch (error) {
    console.error('Error fetching team space:', error);
    return NextResponse.json({ error: 'Failed to fetch team space' }, { status: 500 });
  }
}

// PUT /api/team-spaces/[id] - Update a space
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateSpaceSchema.parse(body);

    const space = await prisma.teamSpace.update({
      where: { id: params.id },
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

    return NextResponse.json(space);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error updating team space:', error);
    return NextResponse.json({ error: 'Failed to update team space' }, { status: 500 });
  }
}

// DELETE /api/team-spaces/[id] - Delete a space
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.teamSpace.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Space deleted successfully' });
  } catch (error) {
    console.error('Error deleting team space:', error);
    return NextResponse.json({ error: 'Failed to delete team space' }, { status: 500 });
  }
}

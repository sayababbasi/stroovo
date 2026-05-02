import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['TASKS', 'DOCS', 'ASSETS']).optional(),
});

// GET /api/team-lists/[id] - Get a specific list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const list = await prisma.teamList.findUnique({
      where: { id: params.id },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            team: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching team list:', error);
    return NextResponse.json({ error: 'Failed to fetch team list' }, { status: 500 });
  }
}

// PUT /api/team-lists/[id] - Update a list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateListSchema.parse(body);

    const list = await prisma.teamList.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        space: {
          select: {
            id: true,
            name: true,
            team: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(list);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error updating team list:', error);
    return NextResponse.json({ error: 'Failed to update team list' }, { status: 500 });
  }
}

// DELETE /api/team-lists/[id] - Delete a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.teamList.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting team list:', error);
    return NextResponse.json({ error: 'Failed to delete team list' }, { status: 500 });
  }
}

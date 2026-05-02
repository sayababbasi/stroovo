import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createListSchema = z.object({
  spaceId: z.string(),
  name: z.string().min(1).max(100),
  type: z.enum(['TASKS', 'DOCS', 'ASSETS']).default('TASKS'),
});

// GET /api/team-lists - Get all lists for a space
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');

    if (!spaceId) {
      return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
    }

    const lists = await prisma.teamList.findMany({
      where: { spaceId },
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
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching team lists:', error);
    return NextResponse.json({ error: 'Failed to fetch team lists' }, { status: 500 });
  }
}

// POST /api/team-lists - Create a new list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createListSchema.parse(body);

    const list = await prisma.teamList.create({
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

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error creating team list:', error);
    return NextResponse.json({ error: 'Failed to create team list' }, { status: 500 });
  }
}

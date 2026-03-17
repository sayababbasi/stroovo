import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const goals = await prisma.goal.findMany({
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                projects: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    }
                }
            },
            orderBy: {
                targetDate: 'asc',
            }
        });

        return NextResponse.json(goals);
    } catch (error) {
        console.error('Failed to fetch goals:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, status, progress, targetDate, ownerId } = body;

        let actualOwnerId = ownerId;
        if (!actualOwnerId) {
            const firstUser = await prisma.user.findFirst();
            actualOwnerId = firstUser?.id;
        }

        const goal = await prisma.goal.create({
            data: {
                title,
                description,
                status: status || 'ON TRACK',
                progress: progress || 0,
                targetDate: targetDate ? new Date(targetDate) : null,
                ownerId: actualOwnerId,
            }
        });

        return NextResponse.json(goal);
    } catch (error) {
        console.error('Failed to create goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const body = await request.json();
        const goal = await prisma.goal.update({
            where: { id },
            data: {
                ...body,
                targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
            }
        });

        return NextResponse.json(goal);
    } catch (error) {
        console.error('Failed to update goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.goal.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

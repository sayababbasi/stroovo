import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';



export async function OPTIONS() {
    return NextResponse.json({});
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cycleId = searchParams.get('cycleId');
        const type = searchParams.get('type');

        const whereClause: any = { parentId: null }; // Only fetch top-level goals by default
        if (cycleId) whereClause.cycleId = cycleId;
        if (type) whereClause.type = type;

        const goals = await prisma.goal.findMany({
            where: whereClause,
            include: {
                owner: { select: { id: true, name: true, email: true, image: true } },
                projects: { select: { id: true, name: true, status: true } },
                keyResults: true,
                subGoals: {
                    include: {
                        owner: { select: { id: true, name: true, image: true } },
                        keyResults: true,
                        projects: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
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
        const { title, description, type, status, targetDate, ownerId, cycleId, parentId, keyResults } = body;

        const goal = await prisma.goal.create({
            data: {
                title,
                description,
                // type: type || 'COMPANY',
                status: status || 'ON_TRACK',
                targetDate: targetDate ? new Date(targetDate) : null,
                ownerId,
                cycleId,
                parentId,
                keyResults: {
                    create: keyResults?.map((kr: any) => ({
                        title: kr.title,
                        initialValue: kr.initialValue || 0,
                        currentValue: kr.currentValue || 0,
                        targetValue: kr.targetValue,
                        unit: kr.unit || 'NUMBER',
                        weight: kr.weight || 1.0
                    }))
                }
            },
            include: {
                keyResults: true
            }
        });
        return NextResponse.json(goal);
    } catch (error: any) {
        console.error('Failed to create goal:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 });
    }
}

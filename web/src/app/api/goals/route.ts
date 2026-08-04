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

        const whereClause: any = { parentId: null };
        if (cycleId) whereClause.cycleId = cycleId;
        if (type) whereClause.type = type;

        const goals = await prisma.goal.findMany({
            where: whereClause,
            include: {
                owner: { select: { id: true, name: true, email: true, image: true } },
                projects: { select: { id: true, name: true, status: true } },
                objectives: {
                    include: {
                        owner: { select: { id: true, name: true, email: true, image: true } },
                        keyResults: true
                    },
                    orderBy: { createdAt: 'asc' }
                },
                keyResults: true,
                subGoals: {
                    include: {
                        owner: { select: { id: true, name: true, image: true } },
                        objectives: { include: { keyResults: true } },
                        keyResults: true,
                        projects: { select: { id: true, name: true } }
                    }
                }
            } as any,
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
        const { title, description, type, status, priority, currency, targetAmount, targetDate, ownerId, cycleId, parentId, objectives, keyResults } = body;

        const goal = await (prisma as any).goal.create({
            data: {
                title,
                description: description || null,
                type: type || 'COMPANY',
                status: status || 'ON_TRACK',
                priority: priority || 'HIGH',
                currency: currency || 'USD ($)',
                targetAmount: targetAmount !== undefined && targetAmount !== null ? parseFloat(targetAmount) : null,
                targetDate: targetDate ? new Date(targetDate) : null,
                ownerId,
                cycleId: cycleId || null,
                parentId: parentId || null,
                objectives: objectives && Array.isArray(objectives) ? {
                    create: objectives.filter((o: any) => o.title && o.title.trim()).map((o: any) => ({
                        title: o.title,
                        description: o.description || null,
                        status: o.status || 'ON_TRACK',
                        priority: o.priority || 'HIGH',
                        startDate: o.startDate ? new Date(o.startDate) : null,
                        targetDate: o.targetDate ? new Date(o.targetDate) : null,
                        ownerId: o.ownerId || ownerId,
                        keyResults: o.keyResults && Array.isArray(o.keyResults) ? {
                            create: o.keyResults.filter((k: any) => k.title && k.title.trim()).map((k: any) => ({
                                title: k.title,
                                description: k.description || null,
                                initialValue: parseFloat(k.initialValue) || 0,
                                currentValue: parseFloat(k.currentValue) || 0,
                                targetValue: parseFloat(k.targetValue) || 0,
                                unit: k.unit || 'NUMBER'
                            }))
                        } : undefined
                    }))
                } : undefined,
                keyResults: keyResults && Array.isArray(keyResults) ? {
                    create: keyResults.filter((kr: any) => kr.title && kr.title.trim()).map((kr: any) => ({
                        title: kr.title,
                        description: kr.description || null,
                        initialValue: parseFloat(kr.initialValue) || 0,
                        currentValue: parseFloat(kr.currentValue) || 0,
                        targetValue: parseFloat(kr.targetValue) || 0,
                        unit: kr.unit || 'NUMBER',
                        weight: kr.weight || 1.0
                    }))
                } : undefined
            },
            include: {
                objectives: { include: { keyResults: true, owner: true } },
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

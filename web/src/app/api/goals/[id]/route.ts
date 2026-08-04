import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const goal = await (prisma as any).goal.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true, image: true } },
                objectives: {
                    include: {
                        owner: { select: { id: true, name: true, email: true, image: true } },
                        keyResults: true
                    },
                    orderBy: { createdAt: 'asc' }
                },
                keyResults: true,
                projects: true,
                subGoals: true,
                parent: { select: { id: true, title: true } }
            }
        });

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json(goal, { headers: corsHeaders });
    } catch (error) {
        console.error('Failed to fetch goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, type, status, priority, currency, targetAmount, progress, targetDate, ownerId, cycleId, objectives, keyResults } = body;

        const data: any = { updatedAt: new Date() };
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (type !== undefined) data.type = type;
        if (status !== undefined) data.status = status;
        if (priority !== undefined) data.priority = priority;
        if (currency !== undefined) data.currency = currency;
        if (targetAmount !== undefined) data.targetAmount = targetAmount !== null ? parseFloat(targetAmount) : null;
        if (progress !== undefined) data.progress = progress;
        if (targetDate !== undefined) data.targetDate = targetDate ? new Date(targetDate) : null;
        if (ownerId !== undefined) data.ownerId = ownerId;
        if (cycleId !== undefined) data.cycleId = cycleId;

        // Synchronize Objectives & Key Results if provided
        if (objectives && Array.isArray(objectives)) {
            const existingObjs = await (prisma as any).objective.findMany({
                where: { goalId: id },
                include: { keyResults: true }
            });
            const incomingObjIds = objectives.map((o: any) => o.id).filter(Boolean);

            // Delete removed Objectives
            const toDeleteObjIds = existingObjs.filter((o: any) => !incomingObjIds.includes(o.id)).map((o: any) => o.id);
            if (toDeleteObjIds.length > 0) {
                await (prisma as any).objective.deleteMany({
                    where: { id: { in: toDeleteObjIds } }
                });
            }

            for (const obj of objectives) {
                if (!obj.title || !obj.title.trim()) continue;

                let objId = obj.id;
                if (objId && existingObjs.some((e: any) => e.id === objId)) {
                    await (prisma as any).objective.update({
                        where: { id: objId },
                        data: {
                            title: obj.title,
                            description: obj.description || null,
                            status: obj.status || 'ON_TRACK',
                            priority: obj.priority || 'HIGH',
                            startDate: obj.startDate ? new Date(obj.startDate) : null,
                            targetDate: obj.targetDate ? new Date(obj.targetDate) : null,
                            ownerId: obj.ownerId || null,
                            updatedAt: new Date()
                        }
                    });
                } else {
                    const createdObj = await (prisma as any).objective.create({
                        data: {
                            goalId: id,
                            title: obj.title,
                            description: obj.description || null,
                            status: obj.status || 'ON_TRACK',
                            priority: obj.priority || 'HIGH',
                            startDate: obj.startDate ? new Date(obj.startDate) : null,
                            targetDate: obj.targetDate ? new Date(obj.targetDate) : null,
                            ownerId: obj.ownerId || null
                        }
                    });
                    objId = createdObj.id;
                }

                // Handle Key Results for this Objective
                if (obj.keyResults && Array.isArray(obj.keyResults)) {
                    const existingKRs = objId ? await (prisma as any).keyResult.findMany({ where: { objectiveId: objId } }) : [];
                    const incomingKRIds = obj.keyResults.map((k: any) => k.id).filter(Boolean);

                    const toDeleteKRIds = existingKRs.filter((k: any) => !incomingKRIds.includes(k.id)).map((k: any) => k.id);
                    if (toDeleteKRIds.length > 0) {
                        await (prisma as any).keyResult.deleteMany({
                            where: { id: { in: toDeleteKRIds } }
                        });
                    }

                    for (const kr of obj.keyResults) {
                        if (!kr.title || !kr.title.trim()) continue;
                        if (kr.id && existingKRs.some((e: any) => e.id === kr.id)) {
                            await (prisma as any).keyResult.update({
                                where: { id: kr.id },
                                data: {
                                    title: kr.title,
                                    description: kr.description || null,
                                    targetValue: parseFloat(kr.targetValue) || 0,
                                    initialValue: parseFloat(kr.initialValue) || 0,
                                    currentValue: parseFloat(kr.currentValue) || 0,
                                    unit: kr.unit || 'NUMBER',
                                    updatedAt: new Date()
                                }
                            });
                        } else {
                            await (prisma as any).keyResult.create({
                                data: {
                                    objectiveId: objId,
                                    goalId: id,
                                    title: kr.title,
                                    description: kr.description || null,
                                    targetValue: parseFloat(kr.targetValue) || 0,
                                    initialValue: parseFloat(kr.initialValue) || 0,
                                    currentValue: parseFloat(kr.currentValue) || 0,
                                    unit: kr.unit || 'NUMBER',
                                }
                            });
                        }
                    }
                }
            }
        }

        // Execute Update
        let updatedGoal = await (prisma as any).goal.update({
            where: { id },
            data,
            include: {
                objectives: { include: { keyResults: true, owner: true } },
                keyResults: true
            }
        });

        return NextResponse.json(updatedGoal, { headers: corsHeaders });
    } catch (error: any) {
        console.error('Failed to update goal:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500, headers: corsHeaders });
    }
}

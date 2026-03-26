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
        const goal = await prisma.goal.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true, image: true } },
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
        const { title, description, status, progress, targetDate, ownerId, keyResults } = body;

        const data: any = {};
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (status !== undefined) data.status = status;
        if (progress !== undefined) data.progress = progress;
        if (targetDate !== undefined) data.targetDate = targetDate ? new Date(targetDate) : undefined;
        if (ownerId !== undefined) data.ownerId = ownerId;
        if (body.cycleId !== undefined) data.cycleId = body.cycleId;

        // Handle Key Results if provided
        if (keyResults && Array.isArray(keyResults)) {
            data.keyResults = {
                upsert: keyResults.map((kr: any) => ({
                    where: { id: kr.id || 'non_existent_id' },
                    create: {
                        title: kr.title,
                        targetValue: parseFloat(kr.targetValue) || 0,
                        unit: kr.unit || 'NUMBER',
                        currentValue: parseFloat(kr.currentValue) || 0
                    },
                    update: {
                        title: kr.title,
                        targetValue: parseFloat(kr.targetValue) || 0,
                        unit: kr.unit,
                        currentValue: parseFloat(kr.currentValue) || 0
                    }
                }))
            };
        }

        // Execute Update with Nested Key Results
        let updatedGoal = await prisma.goal.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            },
            include: { keyResults: true }
        });

        // Recalculate overall progress
        if (updatedGoal.keyResults.length > 0) {
            let totalKRProgress = 0;
            updatedGoal.keyResults.forEach(kr => {
                const krProgress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
                totalKRProgress += Math.min(Math.max(krProgress, 0), 100);
            });
            const newOverallProgress = Math.round(totalKRProgress / updatedGoal.keyResults.length);

            updatedGoal = await prisma.goal.update({
                where: { id },
                data: { progress: newOverallProgress },
                include: { keyResults: true }
            });
        }

        return NextResponse.json(updatedGoal, { headers: corsHeaders });
    } catch (error) {
        console.error('Failed to update goal:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as Error).message },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.goal.delete({
            where: { id }
        });
        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('Failed to delete goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}

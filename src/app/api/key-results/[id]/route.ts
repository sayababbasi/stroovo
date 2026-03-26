import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, currentValue, targetValue } = body;

        // 1. Update Key Result
        const updatedKR = await prisma.keyResult.update({
            where: { id },
            data: {
                title,
                currentValue,
                targetValue
            }
        });

        // 2. Recalculate Goal Progress
        const allKRs = await prisma.keyResult.findMany({
            where: { goalId: updatedKR.goalId }
        });

        let totalProgress = 0;
        let totalWeight = 0;

        for (const kr of allKRs) {
            let progress = 0;
            if (kr.targetValue !== 0) {
                // Simple percentage calculation. For boolean, handle separately if needed, but assuming standard numeric logic for now.
                // If unit is BOOLEAN, maybe target is 1 and current is 0 or 1.
                progress = (kr.currentValue / kr.targetValue) * 100;
            }
            if (progress > 100) progress = 100; // Cap at 100%
            if (progress < 0) progress = 0;

            totalProgress += progress * kr.weight;
            totalWeight += kr.weight;
        }

        const goalProgress = totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;

        // 3. Update Goal
        await prisma.goal.update({
            where: { id: updatedKR.goalId },
            data: { progress: goalProgress }
        });

        return NextResponse.json({ keyResult: updatedKR, goalProgress }, { headers: corsHeaders });
    } catch (error) {
        console.error('Failed to update Key Result:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.keyResult.delete({
            where: { id }
        });
        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}

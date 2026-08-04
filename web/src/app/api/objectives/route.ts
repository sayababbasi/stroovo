import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');

    const whereClause: any = {};
    if (goalId) whereClause.goalId = goalId;

    const objectives = await (prisma as any).objective.findMany({
      where: whereClause,
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        keyResults: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(objectives);
  } catch (error: any) {
    console.error('Objectives GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalId, title, description, status, targetDate, ownerId, keyResults } = body;

    if (!goalId || !title) {
      return NextResponse.json({ error: 'goalId and title are required' }, { status: 400 });
    }

    const objective = await (prisma as any).objective.create({
      data: {
        goalId,
        title,
        description: description || null,
        status: status || 'ON_TRACK',
        targetDate: targetDate ? new Date(targetDate) : null,
        ownerId: ownerId || null,
        progress: 0,
        keyResults: keyResults && Array.isArray(keyResults) ? {
          create: keyResults.map((kr: any) => ({
            title: kr.title,
            targetValue: parseFloat(kr.targetValue) || 0,
            initialValue: parseFloat(kr.initialValue) || 0,
            currentValue: parseFloat(kr.currentValue) || 0,
            unit: kr.unit || 'NUMBER'
          }))
        } : undefined
      },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        keyResults: true
      }
    });

    // Recalculate Objective & Goal progress
    if (objective.keyResults.length > 0) {
      let totalProg = 0;
      objective.keyResults.forEach((kr: any) => {
        const range = kr.targetValue - kr.initialValue;
        const p = range === 0 ? 0 : ((kr.currentValue - kr.initialValue) / range) * 100;
        totalProg += Math.min(Math.max(p, 0), 100);
      });
      const objProgress = Math.round(totalProg / objective.keyResults.length);
      await (prisma as any).objective.update({
        where: { id: objective.id },
        data: { progress: objProgress }
      });
    }

    // Rollup to parent Goal
    await recalculateGoalProgress(goalId);

    return NextResponse.json({ success: true, objective });
  } catch (error: any) {
    console.error('Objectives POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function recalculateGoalProgress(goalId: string) {
  const goal: any = await (prisma as any).goal.findUnique({
    where: { id: goalId },
    include: {
      objectives: { include: { keyResults: true } },
      keyResults: true
    }
  });

  if (!goal) return;

  let overallProgress = 0;

  if (goal.objectives && goal.objectives.length > 0) {
    const totalObjProg = goal.objectives.reduce((sum: number, obj: any) => {
      let objProg = obj.progress;
      if (obj.keyResults && obj.keyResults.length > 0) {
        let krSum = 0;
        obj.keyResults.forEach((kr: any) => {
          const range = kr.targetValue - kr.initialValue;
          const p = range === 0 ? 0 : ((kr.currentValue - kr.initialValue) / range) * 100;
          krSum += Math.min(Math.max(p, 0), 100);
        });
        objProg = Math.round(krSum / obj.keyResults.length);
      }
      return sum + objProg;
    }, 0);
    overallProgress = Math.round(totalObjProg / goal.objectives.length);
  } else if (goal.keyResults && goal.keyResults.length > 0) {
    let krSum = 0;
    goal.keyResults.forEach((kr: any) => {
      const range = kr.targetValue - kr.initialValue;
      const p = range === 0 ? 0 : ((kr.currentValue - kr.initialValue) / range) * 100;
      krSum += Math.min(Math.max(p, 0), 100);
    });
    overallProgress = Math.round(krSum / goal.keyResults.length);
  }

  await (prisma as any).goal.update({
    where: { id: goalId },
    data: { progress: overallProgress, updatedAt: new Date() }
  });
}

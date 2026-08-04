import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { recalculateGoalProgress } from '@/app/api/objectives/route';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentValue, title, targetValue, unit } = body;

    const updateData: any = { updatedAt: new Date() };
    if (currentValue !== undefined) updateData.currentValue = parseFloat(currentValue);
    if (title !== undefined) updateData.title = title;
    if (targetValue !== undefined) updateData.targetValue = parseFloat(targetValue);
    if (unit !== undefined) updateData.unit = unit;

    const kr: any = await prisma.keyResult.update({
      where: { id },
      data: updateData,
    });

    // If KR belongs to an Objective, recalculate Objective progress
    if (kr.objectiveId) {
      const objKRs = await (prisma.keyResult as any).findMany({ where: { objectiveId: kr.objectiveId } });
      if (objKRs.length > 0) {
        let total = 0;
        objKRs.forEach((k: any) => {
          const range = k.targetValue - k.initialValue;
          const p = range === 0 ? 0 : ((k.currentValue - k.initialValue) / range) * 100;
          total += Math.min(Math.max(p, 0), 100);
        });
        const objProgress = Math.round(total / objKRs.length);
        await (prisma as any).objective.update({
          where: { id: kr.objectiveId },
          data: { progress: objProgress }
        });
      }
    }

    // Rollup to parent Goal
    if (kr.goalId) {
      await recalculateGoalProgress(kr.goalId);
    } else if (kr.objectiveId) {
      const parentObj: any = await (prisma as any).objective.findUnique({ where: { id: kr.objectiveId } });
      if (parentObj) {
        await recalculateGoalProgress(parentObj.goalId);
      }
    }

    return NextResponse.json({ success: true, keyResult: kr });
  } catch (error: any) {
    console.error('KR PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kr: any = await prisma.keyResult.findUnique({ where: { id } });

    if (kr) {
      const goalId = kr.goalId;
      const objectiveId = kr.objectiveId;

      await prisma.keyResult.delete({ where: { id } });

      if (objectiveId) {
        const objKRs = await (prisma.keyResult as any).findMany({ where: { objectiveId } });
        let objProgress = 0;
        if (objKRs.length > 0) {
          let total = 0;
          objKRs.forEach((k: any) => {
            const range = k.targetValue - k.initialValue;
            const p = range === 0 ? 0 : ((k.currentValue - k.initialValue) / range) * 100;
            total += Math.min(Math.max(p, 0), 100);
          });
          objProgress = Math.round(total / objKRs.length);
        }
        await (prisma as any).objective.update({
          where: { id: objectiveId },
          data: { progress: objProgress }
        });
      }

      if (goalId) {
        await recalculateGoalProgress(goalId);
      } else if (objectiveId) {
        const parentObj: any = await (prisma as any).objective.findUnique({ where: { id: objectiveId } });
        if (parentObj) {
          await recalculateGoalProgress(parentObj.goalId);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('KR DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

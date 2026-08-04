import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { recalculateGoalProgress } from '../route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objective = await (prisma as any).objective.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        keyResults: true,
        goal: { select: { id: true, title: true } }
      }
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    return NextResponse.json(objective);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, targetDate, ownerId, keyResults } = body;

    const existing: any = await (prisma as any).objective.findUnique({
      where: { id },
      include: { keyResults: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (ownerId !== undefined) updateData.ownerId = ownerId || null;

    // Synchronize Key Results if passed
    if (keyResults && Array.isArray(keyResults)) {
      const existingKRs = existing.keyResults || [];
      const incomingIds = keyResults.map((kr: any) => kr.id).filter(Boolean);

      // Delete removed Key Results
      const toDelete = existingKRs.filter((kr: any) => !incomingIds.includes(kr.id)).map((kr: any) => kr.id);
      if (toDelete.length > 0) {
        await prisma.keyResult.deleteMany({
          where: { id: { in: toDelete } }
        });
      }

      // Upsert Key Results
      for (const kr of keyResults) {
        if (kr.id && existingKRs.some((e: any) => e.id === kr.id)) {
          await prisma.keyResult.update({
            where: { id: kr.id },
            data: {
              title: kr.title,
              targetValue: parseFloat(kr.targetValue) || 0,
              initialValue: parseFloat(kr.initialValue) || 0,
              currentValue: parseFloat(kr.currentValue) || 0,
              unit: kr.unit || 'NUMBER',
              updatedAt: new Date()
            }
          });
        } else {
          await (prisma.keyResult as any).create({
            data: {
              objectiveId: id,
              goalId: existing.goalId,
              title: kr.title,
              targetValue: parseFloat(kr.targetValue) || 0,
              initialValue: parseFloat(kr.initialValue) || 0,
              currentValue: parseFloat(kr.currentValue) || 0,
              unit: kr.unit || 'NUMBER',
            }
          });
        }
      }
    }

    // Recalculate Objective Progress
    const allKRs = await (prisma.keyResult as any).findMany({ where: { objectiveId: id } });
    let objProgress = 0;
    if (allKRs.length > 0) {
      let total = 0;
      allKRs.forEach((kr: any) => {
        const range = kr.targetValue - kr.initialValue;
        const p = range === 0 ? 0 : ((kr.currentValue - kr.initialValue) / range) * 100;
        total += Math.min(Math.max(p, 0), 100);
      });
      objProgress = Math.round(total / allKRs.length);
    }
    updateData.progress = objProgress;

    const updatedObjective = await (prisma as any).objective.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        keyResults: true
      }
    });

    // Rollup to parent Goal
    await recalculateGoalProgress(existing.goalId);

    return NextResponse.json({ success: true, objective: updatedObjective });
  } catch (error: any) {
    console.error('Objective PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objective: any = await (prisma as any).objective.findUnique({ where: { id } });
    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    const goalId = objective.goalId;
    await (prisma as any).objective.delete({ where: { id } });

    // Rollup to parent Goal
    await recalculateGoalProgress(goalId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Objective DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

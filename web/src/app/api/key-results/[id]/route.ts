import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const kr = await prisma.keyResult.update({
      where: { id },
      data: updateData,
    });

    // Recalculate parent goal progress
    const allKRs = await prisma.keyResult.findMany({ where: { goalId: kr.goalId } });
    if (allKRs.length > 0) {
      const totalWeight = allKRs.reduce((s: number, k: any) => s + (k.weight || 1), 0);
      const weightedProgress = allKRs.reduce((s: number, k: any) => {
        const range = k.targetValue - k.initialValue;
        const p = range === 0 ? 0 : ((k.currentValue - k.initialValue) / range) * 100;
        return s + Math.min(100, Math.max(0, p)) * (k.weight || 1);
      }, 0);
      const newProgress = Math.round(weightedProgress / totalWeight);
      await prisma.goal.update({
        where: { id: kr.goalId },
        data: { progress: newProgress, updatedAt: new Date() }
      });
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
    await prisma.keyResult.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

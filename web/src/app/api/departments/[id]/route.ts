import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const department = await (prisma as any).department.findUnique({
      where: { id },
      include: {
        head: { select: { id: true, name: true, email: true, image: true, role: true } },
        members: { select: { id: true, name: true, email: true, image: true, role: true, isActive: true } }
      }
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(department);
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
    const { name, code, description, headId, memberIds, budget, status } = body;

    const existing: any = await (prisma as any).department.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name.trim();
    if (code !== undefined) updateData.code = code ? code.trim().toUpperCase() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null;
    if (status !== undefined) updateData.status = status;
    if (headId !== undefined) updateData.headId = headId || null;

    if (memberIds && Array.isArray(memberIds)) {
      const currentMemberIds = (existing.members || []).map((m: any) => m.id);
      const toDisconnect = currentMemberIds.filter((mId: string) => !memberIds.includes(mId));

      if (toDisconnect.length > 0) {
        await (prisma as any).user.updateMany({
          where: { id: { in: toDisconnect } },
          data: { deptId: null, department: null }
        });
      }

      updateData.members = {
        set: memberIds.map((mId: string) => ({ id: mId }))
      };
    }

    const updatedDepartment = await (prisma as any).department.update({
      where: { id },
      data: updateData,
      include: {
        head: { select: { id: true, name: true, email: true, image: true, role: true } },
        members: { select: { id: true, name: true, email: true, image: true, role: true, isActive: true } }
      }
    });

    // Sync member department string field
    const finalName = updatedDepartment.name;
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      await (prisma as any).user.updateMany({
        where: { id: { in: memberIds } },
        data: { department: finalName }
      });
    }

    if (headId) {
      await (prisma as any).user.update({
        where: { id: headId },
        data: { department: finalName }
      });
    }

    return NextResponse.json({ success: true, department: updatedDepartment });
  } catch (error: any) {
    console.error('Department PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing: any = await (prisma as any).department.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Unassign members
    await (prisma as any).user.updateMany({
      where: { deptId: id },
      data: { deptId: null, department: null }
    });

    await (prisma as any).department.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Department DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

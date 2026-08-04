import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const departments = await (prisma as any).department.findMany({
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(departments);
  } catch (error: any) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, headId, memberIds, budget, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const existingName = await (prisma as any).department.findUnique({
      where: { name: name.trim() }
    });

    if (existingName) {
      return NextResponse.json({ error: 'A department with this name already exists' }, { status: 400 });
    }

    if (code && code.trim()) {
      const existingCode = await (prisma as any).department.findUnique({
        where: { code: code.trim().toUpperCase() }
      });
      if (existingCode) {
        return NextResponse.json({ error: 'A department with this code already exists' }, { status: 400 });
      }
    }

    const department = await (prisma as any).department.create({
      data: {
        name: name.trim(),
        code: code ? code.trim().toUpperCase() : null,
        description: description ? description.trim() : null,
        budget: budget ? parseFloat(budget) : null,
        status: status || 'ACTIVE',
        headId: headId || null,
        members: memberIds && Array.isArray(memberIds) && memberIds.length > 0 ? {
          connect: memberIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        head: { select: { id: true, name: true, email: true, image: true, role: true } },
        members: { select: { id: true, name: true, email: true, image: true, role: true, isActive: true } }
      }
    });

    // Synchronize string department field on User records for backward compatibility
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      await (prisma as any).user.updateMany({
        where: { id: { in: memberIds } },
        data: { department: department.name }
      });
    }

    if (headId) {
      await (prisma as any).user.update({
        where: { id: headId },
        data: { department: department.name }
      });
    }

    return NextResponse.json({ success: true, department });
  } catch (error: any) {
    console.error('Failed to create department:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

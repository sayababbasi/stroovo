import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

/**
 * POST /api/tasks/[id]/dependencies
 * Links a task as a dependency of the current task.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const authResult = await requirePermission('tasks.update.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { dependencyId } = await request.json();

        if (!dependencyId) {
            return NextResponse.json({ error: 'Dependency ID is required' }, { status: 400 });
        }

        if (id === dependencyId) {
            return NextResponse.json({ error: 'A task cannot depend on itself' }, { status: 400 });
        }

        // Add to taskDependencies (this task depends on dependencyId)
        const task = await (prisma.task as any).update({
            where: { id },
            data: {
                dependencies: {
                    connect: { id: dependencyId }
                }
            },
            include: {
                dependencies: {
                    select: { id: true, title: true, status: true }
                }
            }
        });

        return NextResponse.json(task.dependencies);
    } catch (error) {
        console.error('Failed to link dependency:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE /api/tasks/[id]/dependencies?dependencyId=...
 * Unlinks a dependency.
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const authResult = await requirePermission('tasks.update.own')(request as any);
    if (!authResult.success) return authResult.response;

    const { searchParams } = new URL(request.url);
    const dependencyId = searchParams.get('dependencyId');

    if (!dependencyId) {
        return NextResponse.json({ error: 'Dependency ID is required' }, { status: 400 });
    }

    try {
        const task = await (prisma.task as any).update({
            where: { id },
            data: {
                dependencies: {
                    disconnect: { id: dependencyId }
                }
            },
            include: {
                dependencies: {
                    select: { id: true, title: true, status: true }
                }
            }
        });

        return NextResponse.json(task.dependencies);
    } catch (error) {
        console.error('Failed to unlink dependency:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

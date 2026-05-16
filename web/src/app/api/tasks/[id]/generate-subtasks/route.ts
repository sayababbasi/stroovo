import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SubtaskGenerator } from '@/ai/subtask-generator';
import { canAccessTask, requirePermission } from '@/lib/authorization';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('ai.use')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const tenantId = request.headers.get('x-tenant-id') || 'SYSTEM';
        const userId = authResult.user.id;
        const payload = await request.json().catch(() => ({}));
        const regeneration = Boolean(payload?.regenerate);

        const { id } = await params;
        const rateLimit = checkRateLimit(`subtasks:${userId}:${id}`, 12, 60_000);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded for subtask generation' }, { status: 429 });
        }

        const parent = await prisma.task.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                priority: true,
                projectId: true,
                tenantId: true,
                assigneeId: true,
                teamId: true,
            }
        });
        if (!parent) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        if (!(await canAccessTask(authResult.user, parent, 'read'))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const generated = await SubtaskGenerator.generate(id, {
            regeneration,
            triggeredByUserId: userId,
        });

        if (!generated.subtasks.length) {
            return NextResponse.json({ error: 'No unique subtasks could be generated' }, { status: 409 });
        }

        const subtasks = await Promise.all(generated.subtasks.map(s => 
            prisma.task.create({
                data: {
                    title: s.title,
                    description: s.description,
                    status: 'TODO',
                    priority: s.priority || parent.priority,
                    projectId: parent.projectId,
                    parentId: id,
                    tenantId: parent.tenantId || tenantId,
                    assigneeId: null,
                    aiInsights: {
                        generatedByAI: true,
                        estimatedTime: s.estimatedTime,
                        semanticHash: s.semanticHash,
                        generatedAt: new Date().toISOString(),
                    }
                }
            })
        ));

        const allSubtasks = await prisma.task.findMany({ where: { parentId: id } });
        const doneSubtasks = allSubtasks.filter(t => t.status === 'DONE').length;
        const newProgress = allSubtasks.length > 0 ? Math.round((doneSubtasks / allSubtasks.length) * 100) : 0;
        
        await prisma.task.update({
            where: { id },
            data: { progress: newProgress }
        });

        await prisma.activityLog.create({
            data: {
                action: 'AI_SUBTASK_GENERATED',
                entity: 'TASK',
                entityId: id,
                tenantId: parent.tenantId || tenantId,
                userId,
                metadata: {
                    regeneration,
                    titles: generated.subtasks.map((item) => item.title),
                    fingerprints: generated.subtasks.map((item) => item.semanticHash),
                    previousGenerations: generated.history.length,
                }
            }
        });

        return NextResponse.json({
            subtasks,
            history: generated.history,
        });
    } catch (error: any) {
        console.error(`[AI Subtasks] Error:`, error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

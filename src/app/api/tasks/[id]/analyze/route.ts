import { NextResponse } from 'next/server';
import { RiskEngine } from '@/ai/risk-engine';
import prisma from '@/lib/prisma';
import { canAccessTask, requirePermission } from '@/lib/authorization';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requirePermission('ai.use')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const { id } = await params;
        const rateLimit = checkRateLimit(`risk:${authResult.user.id}:${id}`, 20, 60_000);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded for risk analysis' }, { status: 429 });
        }

        const task = await prisma.task.findUnique({
            where: { id },
            select: { id: true, assigneeId: true, teamId: true, tenantId: true }
        });
        if (!(await canAccessTask(authResult.user, task, 'read'))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const analysis = await RiskEngine.evaluateTaskRisk(id, {
            triggeredByUserId: authResult.user.id,
        });

        return NextResponse.json({
            success: true,
            insights: analysis.insights,
            riskScore: analysis.riskScore,
            delayProbability: analysis.delayProbability,
        });
    } catch (error: any) {
        console.error('[POST /api/tasks/:id/analyze] Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            success: false 
        }, { status: 500 });
    }
}

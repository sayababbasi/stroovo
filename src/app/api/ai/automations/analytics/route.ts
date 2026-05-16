import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
    const authResult = await requirePermission('analytics.read')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const tenantId = authResult.user.tenantId;

        if (!(prisma as any).automation || !(prisma as any).automationExecution) {
            console.error('[PRISMA DIAGNOSTIC] Automation models missing in analytics. Keys:', Object.keys(prisma));
            throw new Error('Database model synchronization failure.');
        }

        // Aggregate statistics
        const stats = await prisma.$transaction([
            // Total automations
            (prisma as any).automation.count({ where: { tenantId } }),
            // Total executions (all time)
            (prisma as any).automationExecution.count({ 
                where: { automation: { tenantId } } 
            }),
            // Success rate
            (prisma as any).automationExecution.count({ 
                where: { automation: { tenantId }, status: 'SUCCESS' } 
            }),
            // Total failures
            (prisma as any).automationExecution.count({ 
                where: { automation: { tenantId }, status: 'FAILED' } 
            }),
        ]);

        const [totalAutomations, totalExecutions, successCount, failureCount] = stats;
        const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 100;

        // Mock chart data for trends
        const trends = [
            { date: '2024-05-01', executions: 120, successRate: 98.5 },
            { date: '2024-05-02', executions: 145, successRate: 99.1 },
            { date: '2024-05-03', executions: 132, successRate: 97.8 },
            { date: '2024-05-04', executions: 168, successRate: 99.4 },
            { date: '2024-05-05', executions: 190, successRate: 99.8 },
        ];

        // Efficiency metrics
        const efficiency = {
            hoursSaved: 142.5,
            costReduction: 12400,
            autonomyScore: 94.2
        };

        return NextResponse.json({
            summary: {
                totalAutomations,
                totalExecutions,
                successRate: successRate.toFixed(2),
                failureCount,
            },
            trends,
            efficiency
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

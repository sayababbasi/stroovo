import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const headerList = await headers();
        const headerTenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id');

        let tenantId = headerTenantId;

        // Fallback: resolve tenant from authenticated user when proxy didn't inject x-tenant-id.
        if (!tenantId && userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { tenantId: true }
            });
            tenantId = user?.tenantId ?? null;
        }

        if (!tenantId) {
            return NextResponse.json({
                statusCounts: {},
                velocity: [],
                throughput14d: [],
                teamWorkload: [],
                totalTasks: 0,
                doneCount: 0,
                activeTasks: 0,
                completionRate: 0,
                avgCycleTimeDays: 0,
                overdueTasks: 0,
                dueSoonTasks: 0,
                avgDailyThroughput: 0,
                projectedDaysToClearBacklog: null,
                performanceScore: 0,
                riskLevel: 'HIGH',
                topContributors: [],
                actionSignals: []
            });
        }

        const now = new Date();
        const MS_IN_DAY = 24 * 60 * 60 * 1000;
        const last7Days = new Date(now.getTime() - 7 * MS_IN_DAY);
        const last14Days = new Date(now.getTime() - 14 * MS_IN_DAY);

        // Aggregate counts by status
        const statusCounts = await prisma.task.groupBy({
            by: ['status'],
            where: { tenantId },
            _count: true
        });

        // Weekly velocity (completed tasks per day for last 7 days)
        const completedTasks = await prisma.task.findMany({
            where: {
                tenantId,
                status: 'DONE',
                updatedAt: { gte: last7Days }
            },
            select: { updatedAt: true }
        });

        const velocity7d = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(last7Days);
            date.setDate(date.getDate() + i + 1);
            const count = completedTasks.filter(t => t.updatedAt.toDateString() === date.toDateString()).length;
            return { date: date.toLocaleDateString(undefined, { weekday: 'short' }), count };
        });

        // Throughput trend for last 14 days
        const completed14d = await prisma.task.findMany({
            where: {
                tenantId,
                status: 'DONE',
                updatedAt: { gte: last14Days }
            },
            select: { updatedAt: true }
        });

        const throughput14d = Array.from({ length: 14 }, (_, i) => {
            const date = new Date(last14Days);
            date.setDate(date.getDate() + i + 1);
            const count = completed14d.filter(t => t.updatedAt.toDateString() === date.toDateString()).length;
            return {
                dateLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                count
            };
        });

        // Cycle time estimate from completed tasks in last 30 days
        const doneTasksForCycle = await prisma.task.findMany({
            where: {
                tenantId,
                status: 'DONE',
                updatedAt: { gte: new Date(now.getTime() - 30 * MS_IN_DAY) }
            },
            select: {
                createdAt: true,
                updatedAt: true
            }
        });

        const cycleTimes = doneTasksForCycle
            .map(task => Math.max(0, Math.round((task.updatedAt.getTime() - task.createdAt.getTime()) / MS_IN_DAY)))
            .filter(days => Number.isFinite(days));

        const avgCycleTimeDays = cycleTimes.length
            ? Number((cycleTimes.reduce((sum, val) => sum + val, 0) / cycleTimes.length).toFixed(1))
            : 0;

        // Due-date health
        const dueDateTasks = await prisma.task.findMany({
            where: { tenantId },
            select: {
                id: true,
                status: true,
                dueDate: true
            }
        });

        const overdueTasks = dueDateTasks.filter(
            task => task.dueDate && task.status !== 'DONE' && new Date(task.dueDate).getTime() < now.getTime()
        ).length;

        const dueSoonTasks = dueDateTasks.filter(task => {
            if (!task.dueDate || task.status === 'DONE') return false;
            const dueTime = new Date(task.dueDate).getTime();
            return dueTime >= now.getTime() && dueTime <= now.getTime() + 3 * MS_IN_DAY;
        }).length;

        const doneCount = statusCounts
            .filter(entry => entry.status === 'DONE')
            .reduce((sum, entry) => sum + entry._count, 0);

        const totalTasks = statusCounts.reduce((sum, curr) => sum + curr._count, 0);
        const completionRate = totalTasks > 0 ? Number(((doneCount / totalTasks) * 100).toFixed(1)) : 0;

        // Team Workload
        // Team Workload
        const teamWorkload = await prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { tasks: { where: { status: { not: 'DONE' } } } }
                }
            }
        });

        const normalizedWorkload = teamWorkload.map(user => ({
            id: user.id,
            name: user.name || 'Unknown',
            count: user._count.tasks
        }));

        const workloadValues = normalizedWorkload.map(member => member.count);
        const workloadAvg = workloadValues.length
            ? workloadValues.reduce((sum, val) => sum + val, 0) / workloadValues.length
            : 0;
        const maxWorkload = workloadValues.length ? Math.max(...workloadValues) : 0;
        const minWorkload = workloadValues.length ? Math.min(...workloadValues) : 0;
        const workloadSkew = workloadAvg > 0 ? Number(((maxWorkload - minWorkload) / workloadAvg).toFixed(2)) : 0;

        const topContributors = [...normalizedWorkload]
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Lightweight forecast from 7d average
        const avgDailyThroughput = velocity7d.length
            ? velocity7d.reduce((sum, day) => sum + day.count, 0) / velocity7d.length
            : 0;

        const activeTasks = totalTasks - doneCount;
        const projectedDaysToClearBacklog = avgDailyThroughput > 0
            ? Number((activeTasks / avgDailyThroughput).toFixed(1))
            : null;

        // Composite performance score (0-100)
        const completionComponent = Math.min(100, completionRate);
        const cycleComponent = Math.max(0, 100 - avgCycleTimeDays * 12);
        const overloadPenalty = Math.min(35, overdueTasks * 2 + Math.max(0, workloadSkew * 8));
        const performanceScore = Math.max(
            0,
            Math.round((completionComponent * 0.45) + (cycleComponent * 0.35) + (100 - overloadPenalty) * 0.2)
        );

        const riskLevel = performanceScore >= 75 ? 'LOW' : performanceScore >= 50 ? 'MEDIUM' : 'HIGH';

        const actionSignals = [
            {
                type: overdueTasks > 0 ? 'risk' : 'info',
                title: 'Overdue Work',
                value: overdueTasks,
                message: overdueTasks > 0
                    ? `${overdueTasks} tasks are overdue and may delay delivery.`
                    : 'No overdue tasks detected in active delivery.'
            },
            {
                type: dueSoonTasks > 0 ? 'warning' : 'info',
                title: 'Due Soon (72h)',
                value: dueSoonTasks,
                message: dueSoonTasks > 0
                    ? `${dueSoonTasks} tasks are due in the next 72 hours.`
                    : 'No near-term due date pressure in next 72 hours.'
            },
            {
                type: workloadSkew > 1.5 ? 'warning' : 'info',
                title: 'Workload Balance',
                value: workloadSkew,
                message: workloadSkew > 1.5
                    ? 'Work allocation is uneven across the team. Rebalancing recommended.'
                    : 'Workload distribution is within a healthy range.'
            }
        ];

        return NextResponse.json({
            statusCounts: statusCounts.reduce((acc: any, curr) => ({ ...acc, [curr.status]: curr._count }), {}),
            velocity: velocity7d,
            throughput14d,
            teamWorkload: normalizedWorkload,
            totalTasks,
            doneCount,
            activeTasks,
            completionRate,
            avgCycleTimeDays,
            overdueTasks,
            dueSoonTasks,
            avgDailyThroughput: Number(avgDailyThroughput.toFixed(2)),
            projectedDaysToClearBacklog,
            performanceScore,
            riskLevel,
            topContributors,
            actionSignals
        });
    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

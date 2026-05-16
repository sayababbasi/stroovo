import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const now = new Date();

        // 1. Projects Breakdown
        const projects = await prisma.project.findMany({
            where: { tenantId },
            include: {
                _count: { select: { tasks: true } },
                tasks: { select: { status: true, dueDate: true } }
            }
        });

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
        
        // 2. Risk Detection
        const atRiskProjects = projects.filter(project => {
            const p = project as any;
            if (!p.tasks) return false;
            // Project is at risk if it has overdue tasks or no progress but near deadline
            const hasOverdue = p.tasks.some((t: any) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now);
            const totalTasks = p.tasks.length;
            const completedTasks = p.tasks.filter((t: any) => t.status === 'DONE').length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) : 1;
            const isNearEnd = p.endDate && (new Date(p.endDate).getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 days
            
            return hasOverdue || (isNearEnd && progress < 0.5);
        }).length;

        // 3. Overall Task Velocity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tasksCompleted = await prisma.task.count({
            where: {
                tenantId,
                status: 'DONE',
                updatedAt: { gte: sevenDaysAgo }
            }
        });

        // 4. Team Capacity
        const teamSize = await prisma.user.count({ where: { tenantId } });

        return NextResponse.json({
            stats: {
                totalProjects,
                activeProjects,
                atRiskProjects,
                tasksCompletedLastWeek: tasksCompleted,
                teamSize
            },
            projects: projects.map(project => {
                const p = project as any;
                const totalTasks = p.tasks?.length || 0;
                const completedTasks = p.tasks ? p.tasks.filter((t: any) => t.status === 'DONE').length : 0;
                return {
                    id: p.id,
                    name: p.name,
                    progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                    status: p.status
                };
            })
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

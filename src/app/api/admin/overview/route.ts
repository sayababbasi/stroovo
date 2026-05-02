import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const [userCount, taskCount, completedToday, aiActionsCount] = await Promise.all([
            prisma.user.count(),
            prisma.task.count(),
            prisma.task.count({ 
                where: { 
                    status: 'DONE',
                    updatedAt: {
                        gte: new Date(new Date().setHours(0,0,0,0))
                    }
                } 
            }),
            prisma.autoActionLog?.count() || Promise.resolve(0)
        ]);

        // Mocking some real-time stats for load and sessions as these typically come from Redis/Infra
        const activeSessions = Math.floor(Math.random() * 50) + 10;
        const systemLoad = Math.floor(Math.random() * 20) + 5;

        return NextResponse.json({
            totalUsers: userCount,
            activeSessions,
            totalTasks: taskCount,
            completedToday,
            aiActionsExecuted: aiActionsCount,
            systemLoad,
            trends: {
                users: 12,
                tasks: 5,
                ai: 24
            }
        });
    } catch (error) {
        console.error('Failed to fetch admin overview:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

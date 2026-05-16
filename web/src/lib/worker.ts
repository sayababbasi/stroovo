import { Worker, Job } from 'bullmq';
import redis from './redis';
import prisma from './prisma';
import aiService from '@/ai/service';
import { createNotification } from './notifications';

const QUEUE_NAME = 'stroovo-tasks';

export const startWorker = () => {
    const worker = new Worker(
        QUEUE_NAME,
        async (job: Job) => {
            console.log(`Processing job ${job.id}: ${job.name}`);

            if (job.name === 'generate-tasks') {
                const { projectId, tenantId, userId, title, description } = job.data;
                try {
                    const plan = await aiService.planTasks(`${title}: ${description || ''}`);
                    if (plan && plan.tasks) {
                        for (const taskData of plan.tasks) {
                            const task = await prisma.task.create({
                                data: {
                                    title: taskData.title,
                                    description: taskData.description,
                                    priority: taskData.priority || 'MEDIUM',
                                    status: 'TODO',
                                    type: 'TASK',
                                    projectId,
                                    tenantId,
                                    createdBy: userId
                                } as any
                            });

                            if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
                                for (const subtaskTitle of taskData.subtasks) {
                                    await prisma.task.create({
                                        data: {
                                            title: subtaskTitle,
                                            status: 'TODO',
                                            type: 'TASK',
                                            projectId,
                                            tenantId,
                                            parentId: task.id,
                                            createdBy: userId
                                        } as any
                                    });
                                }
                            }
                        }

                        await prisma.activityLog.create({
                            data: {
                                action: 'AI_PLAN_GENERATE',
                                entity: 'PROJECT',
                                entityId: projectId,
                                metadata: { taskCount: plan.tasks.length },
                                tenantId,
                                userId
                            }
                        });
                    }
                } catch (error) {
                    console.error('Failed to generate AI tasks:', error);
                }
            }

            if (job.name === 'analyze-project-risk') {
                const { projectId, tenantId, userId } = job.data;
                const project = await prisma.project.findUnique({
                    where: { id: projectId }
                });

                if (!project) return;

                // Run the comprehensive automation suite
                const { ProjectAutomation } = await import('./projects/project-automation');
                await ProjectAutomation.runSuite(projectId);
            }
        },
        { connection: redis, concurrency: 5 }
    );

    return worker;
};

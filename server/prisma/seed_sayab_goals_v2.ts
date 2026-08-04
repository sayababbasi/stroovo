import { PrismaClient } from '@prisma/client/index';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Cleaning up and Re-Seeding SAYAB Personal Goals ---');

    // 1. Find SAYAB User
    const sayab = await prisma.user.findUnique({
        where: { email: 'founder.revoticai@gmail.com' }
    });

    if (!sayab) {
        console.error("SAYAB user not found! Aborting.");
        return;
    }

    // Delete existing personal goals for SAYAB to make it idempotent
    const existingGoals = await prisma.goal.findMany({
        where: {
            ownerId: sayab.id,
            type: 'PERSONAL'
        }
    });

    for (const g of existingGoals) {
        await prisma.goal.delete({ where: { id: g.id } });
    }
    console.log('Cleaned up existing personal goals for SAYAB.');

    const targetDate = new Date('2026-12-31T23:59:59Z');

    const goalsData = [
        {
            title: 'Grow REVOTIC AI YouTube to 5,000 Subscribers',
            objectives: [
                {
                    title: 'Build Consistent Long-Form Content Engine',
                    krs: [
                        { title: 'Publish Quality YouTube Videos', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'NUMBER' },
                        { title: 'Maintain Weekly Publishing', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'VIDEOS' },
                        { title: 'Create Short-Form Content From Videos', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'VIDEOS' }
                    ]
                },
                {
                    title: 'Reach 5,000 YouTube Subscribers',
                    krs: [
                        { title: 'YouTube Subscribers', initialValue: 650, currentValue: 650, targetValue: 5000, unit: 'NUMBER' },
                        { title: 'New Subscribers', initialValue: 0, currentValue: 0, targetValue: 4350, unit: 'NUMBER' },
                        { title: 'Weekly Channel Analytics Reviews', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'REVIEWS' }
                    ]
                }
            ]
        },
        {
            title: 'Grow LinkedIn to 10,000',
            objectives: [
                {
                    title: 'Build Founder & AI Authority',
                    krs: [
                        { title: 'LinkedIn Posts Published', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'POSTS' },
                        { title: 'Weekly Quality Posts', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'WEEKS' },
                        { title: 'REVOTIC AI/Product Showcase Posts', initialValue: 0, currentValue: 0, targetValue: 20, unit: 'POSTS' }
                    ]
                },
                {
                    title: 'Grow Professional Audience',
                    krs: [
                        { title: 'LinkedIn Followers/Connections', initialValue: 1900, currentValue: 1900, targetValue: 10000, unit: 'NUMBER' },
                        { title: 'Meaningful Conversations', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'CONVERSATIONS' }
                    ]
                }
            ]
        },
        {
            title: 'Build REVOTIC AI Short-Form Audience',
            objectives: [
                {
                    title: 'Build Short-Form Content Engine',
                    krs: [
                        { title: 'Shorts/Reels Published', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'VIDEOS' },
                        { title: 'Weekly Shorts/Reels', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'WEEKS' },
                        { title: 'YouTube Content Repurposed', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'VIDEOS' }
                    ]
                },
                {
                    title: 'Grow Instagram',
                    krs: [
                        { title: 'Instagram Followers', initialValue: 200, currentValue: 200, targetValue: 2000, unit: 'NUMBER' },
                        { title: 'High-Performing Formats Identified', initialValue: 0, currentValue: 0, targetValue: 10, unit: 'FORMATS' },
                        { title: 'Weekly Analytics Reviews', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'REVIEWS' }
                    ]
                }
            ]
        },
        {
            title: 'Establish REVOTIC AI Social Presence',
            objectives: [
                {
                    title: 'Launch Distribution Channels',
                    krs: [
                        { title: 'Facebook Page Created', initialValue: 0, currentValue: 0, targetValue: 1, unit: 'NUMBER' },
                        { title: 'X Account Created', initialValue: 0, currentValue: 0, targetValue: 1, unit: 'NUMBER' },
                        { title: 'Secondary-Channel Posts', initialValue: 0, currentValue: 0, targetValue: 66, unit: 'POSTS' }
                    ]
                },
                {
                    title: 'Build Initial Audience',
                    krs: [
                        { title: 'Facebook Followers', initialValue: 0, currentValue: 0, targetValue: 1000, unit: 'NUMBER' },
                        { title: 'X Followers', initialValue: 0, currentValue: 0, targetValue: 1000, unit: 'NUMBER' }
                    ]
                }
            ]
        },
        {
            title: 'Turn 5 MVPs Into Production-Ready Products',
            objectives: [
                {
                    title: 'Product Hardening',
                    krs: [
                        { title: 'Products Audited', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'PRODUCTS' },
                        { title: 'Products Production-Ready', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'PRODUCTS' },
                        { title: 'Products Deployed', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'PRODUCTS' }
                    ]
                },
                {
                    title: 'Enterprise Readiness',
                    krs: [
                        { title: 'Products With RBAC', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'PRODUCTS' },
                        { title: 'Products With Audit Logs', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'PRODUCTS' },
                        { title: 'Products With Analytics', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'PRODUCTS' }
                    ]
                },
                {
                    title: 'Public Validation',
                    krs: [
                        { title: 'Products Publicly Launched', initialValue: 0, currentValue: 0, targetValue: 2, unit: 'PRODUCTS' },
                        { title: 'Combined Product Users/Testers', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'USERS' },
                        { title: 'Product Feedback Iterations', initialValue: 0, currentValue: 0, targetValue: 10, unit: 'ITERATIONS' }
                    ]
                }
            ]
        },
        {
            title: 'Build REVOTIC AI Owned Audience & Community',
            objectives: [
                {
                    title: 'Build Owned Audience',
                    krs: [
                        { title: 'Email/Community Members', initialValue: 0, currentValue: 0, targetValue: 500, unit: 'MEMBERS' },
                        { title: 'Newsletters Published', initialValue: 0, currentValue: 0, targetValue: 10, unit: 'NEWSLETTERS' },
                        { title: 'Lead Capture System', initialValue: 0, currentValue: 0, targetValue: 1, unit: 'SYSTEM' },
                        { title: 'Community/Email Infrastructure', initialValue: 0, currentValue: 0, targetValue: 1, unit: 'SYSTEM' }
                    ]
                }
            ]
        },
        {
            title: 'Build a Consistent Personal Execution System',
            objectives: [
                {
                    title: 'Maintain Weekly Execution',
                    krs: [
                        { title: 'REVOTIC AI/Content Hours', initialValue: 0, currentValue: 0, targetValue: 462, unit: 'HOURS' },
                        { title: 'Long-Form Videos Published', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'VIDEOS' },
                        { title: 'Weekly Planning Sessions', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'SESSIONS' },
                        { title: 'Weekly Analytics Reviews', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'REVIEWS' },
                        { title: 'Weekly Task Completion Rate', initialValue: 0, currentValue: 0, targetValue: 90, unit: 'PERCENTAGE' },
                        { title: 'Weekly Stroovo Progress Updates', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'UPDATES' }
                    ]
                }
            ]
        }
    ];

    for (const goalData of goalsData) {
        console.log(`[CREATE] Goal: ${goalData.title}`);
        
        let totalGoalProgress = 0;
        let objCount = 0;
        
        const parentGoal = await prisma.goal.create({
            data: {
                title: goalData.title,
                status: 'ON_TRACK',
                type: 'PERSONAL',
                targetDate,
                ownerId: sayab.id,
                progress: 0,
            }
        });

        for (const objData of goalData.objectives) {
            console.log(`  -> [CREATE] Objective (SubGoal): ${objData.title}`);
            
            let totalObjProgress = 0;
            let krCount = 0;
            
            const objective = await prisma.goal.create({
                data: {
                    title: objData.title,
                    status: 'ON_TRACK',
                    type: 'PERSONAL',
                    targetDate,
                    ownerId: sayab.id,
                    parentId: parentGoal.id,
                    progress: 0,
                }
            });

            for (const krData of objData.krs) {
                console.log(`    -> [CREATE] KR: ${krData.title}`);
                await prisma.keyResult.create({
                    data: {
                        title: krData.title,
                        initialValue: krData.initialValue,
                        currentValue: krData.currentValue,
                        targetValue: krData.targetValue,
                        unit: krData.unit,
                        goalId: objective.id,
                    }
                });
                
                let progress = 0;
                if (krData.targetValue !== krData.initialValue) {
                    progress = ((krData.currentValue - krData.initialValue) / (krData.targetValue - krData.initialValue)) * 100;
                    progress = Math.max(0, Math.min(100, progress));
                } else if (krData.currentValue >= krData.targetValue) {
                    progress = 100;
                }
                totalObjProgress += progress;
                krCount++;
            }
            
            const avgObjProgress = krCount > 0 ? Math.round(totalObjProgress / krCount) : 0;
            
            await prisma.goal.update({
                where: { id: objective.id },
                data: { progress: avgObjProgress }
            });
            
            totalGoalProgress += avgObjProgress;
            objCount++;
        }
        
        const avgGoalProgress = objCount > 0 ? Math.round(totalGoalProgress / objCount) : 0;
        await prisma.goal.update({
            where: { id: parentGoal.id },
            data: { progress: avgGoalProgress }
        });
    }

    console.log('--- Seeding Completed Successfully ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { PrismaClient } from '@prisma/client/index';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding SAYAB Personal Goals ---');

    // 1. Find SAYAB User
    const sayab = await prisma.user.findUnique({
        where: { email: 'founder.revoticai@gmail.com' }
    });

    if (!sayab) {
        console.error("SAYAB user not found! Aborting.");
        return;
    }

    const targetDate = new Date('2026-12-31T23:59:59Z');

    const goalsData = [
        {
            title: 'Grow REVOTIC AI YouTube to 5,000 Subscribers',
            objectives: [
                {
                    title: 'Build Consistent Long-Form Content Engine',
                    krs: [
                        { title: 'Publish 22+ quality videos', initialValue: 0, currentValue: 0, targetValue: 22, unit: 'NUMBER' },
                        { title: 'Maintain 1+ video/week', initialValue: 0, currentValue: 1, targetValue: 1, unit: 'NUMBER' },
                        { title: 'Create 4-7 Shorts from major videos per video', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'NUMBER' }
                    ]
                },
                {
                    title: 'Reach 5,000 Subscribers',
                    krs: [
                        { title: 'Reach 5,000 subscribers', initialValue: 650, currentValue: 650, targetValue: 5000, unit: 'NUMBER' },
                        { title: 'Review analytics weekly', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'PERCENTAGE' }
                    ]
                }
            ]
        },
        {
            title: 'Grow LinkedIn to 10,000',
            objectives: [
                {
                    title: 'Build Founder/AI Authority',
                    krs: [
                        { title: '100+ posts', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'NUMBER' },
                        { title: '4-5 posts/week', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'NUMBER' },
                        { title: '20+ REVOTIC AI/product posts', initialValue: 0, currentValue: 0, targetValue: 20, unit: 'NUMBER' }
                    ]
                },
                {
                    title: 'Grow Professional Audience',
                    krs: [
                        { title: '10,000 followers/connections', initialValue: 1900, currentValue: 1900, targetValue: 10000, unit: 'NUMBER' },
                        { title: '100+ meaningful conversations', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'NUMBER' }
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
                        { title: '100+ Shorts/Reels', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'NUMBER' },
                        { title: '5+ per week', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'NUMBER' }
                    ]
                },
                {
                    title: 'Grow Instagram',
                    krs: [
                        { title: '2,000+ followers', initialValue: 200, currentValue: 200, targetValue: 2000, unit: 'NUMBER' },
                        { title: 'Identify 10 high-performing formats', initialValue: 0, currentValue: 0, targetValue: 10, unit: 'NUMBER' }
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
                        { title: '3+ secondary-channel posts/week', initialValue: 0, currentValue: 0, targetValue: 3, unit: 'NUMBER' }
                    ]
                },
                {
                    title: 'Build Initial Audience',
                    krs: [
                        { title: 'Facebook 1,000+ followers', initialValue: 0, currentValue: 0, targetValue: 1000, unit: 'NUMBER' },
                        { title: 'X 1,000+ followers', initialValue: 0, currentValue: 0, targetValue: 1000, unit: 'NUMBER' }
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
                        { title: 'UI/UX, security, performance, production deployment', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'NUMBER' }
                    ]
                },
                {
                    title: 'Enterprise Readiness',
                    krs: [
                        { title: 'RBAC, audit logs, billing readiness', initialValue: 0, currentValue: 0, targetValue: 5, unit: 'NUMBER' }
                    ]
                },
                {
                    title: 'Public Validation',
                    krs: [
                        { title: 'Launch 2+ products publicly', initialValue: 0, currentValue: 0, targetValue: 2, unit: 'NUMBER' },
                        { title: '100+ combined users/testers', initialValue: 0, currentValue: 0, targetValue: 100, unit: 'NUMBER' }
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
                        { title: '100–500 email/community members', initialValue: 0, currentValue: 0, targetValue: 500, unit: 'NUMBER' },
                        { title: '2+ newsletters/month', initialValue: 0, currentValue: 0, targetValue: 2, unit: 'NUMBER' }
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
                        { title: '21+ REVOTIC AI/content hours/week', initialValue: 0, currentValue: 0, targetValue: 21, unit: 'HOURS' },
                        { title: '90%+ weekly task completion', initialValue: 0, currentValue: 0, targetValue: 90, unit: 'PERCENTAGE' }
                    ]
                }
            ]
        }
    ];

    for (const goalData of goalsData) {
        // Avoid duplicates by checking if the main goal exists for SAYAB
        const existingGoal = await prisma.goal.findFirst({
            where: {
                title: goalData.title,
                ownerId: sayab.id,
                type: 'PERSONAL'
            }
        });

        if (existingGoal) {
            console.log(`[SKIP] Goal already exists: ${goalData.title}`);
            continue;
        }

        console.log(`[CREATE] Goal: ${goalData.title}`);
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
            }
        }
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

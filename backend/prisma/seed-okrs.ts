import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Enterprise OKR Data...');

    // 1. Get or Create Tenant (Idempotent)
    let tenant = await prisma.tenant.findUnique({ where: { domain: 'acme.com' } });
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: 'Acme Corp',
                domain: 'acme.com',
            }
        });
        console.log('Created Tenant:', tenant.name);
    } else {
        console.log('Tenant already exists:', tenant.name);
    }

    // 2. Get or Create Cycle (Idempotent)
    let cycle = await prisma.cycle.findFirst({ where: { name: 'Q1 2026', tenantId: tenant.id } });
    if (!cycle) {
        cycle = await prisma.cycle.create({
            data: {
                name: 'Q1 2026',
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                status: 'ACTIVE',
                tenantId: tenant.id
            }
        });
        console.log('Created Cycle:', cycle.name);
    } else {
        console.log('Cycle already exists:', cycle.name);
    }

    // 3. Get Admin User
    let owner = await prisma.user.findFirst({ where: { email: 'admin@workflow.com' } });
    if (!owner) {
        owner = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@workflow.com',
                password: 'hashedpassword',
                role: 'ADMIN',
                tenantId: tenant.id
            }
        });
        console.log('Created Owner:', owner.name);
    } else {
        // Link to tenant if not linked
        if (owner.tenantId !== tenant.id) {
            await prisma.user.update({ where: { id: owner.id }, data: { tenantId: tenant.id } });
            console.log('Updated Owner Tenant Link');
        }
    }

    // 4. Create Company Objective (Idempotent check by title)
    let companyGoal = await prisma.goal.findFirst({ where: { title: 'Dominance: SaaS Market 2026', tenantId: tenant.id } });
    if (!companyGoal) {
        companyGoal = await prisma.goal.create({
            data: {
                title: 'Dominance: SaaS Market 2026',
                description: 'Acquire 500+ enterprise clients across APAC and EU.',
                type: 'COMPANY',
                status: 'ON_TRACK',
                progress: 35,
                targetDate: new Date('2026-12-31'),
                ownerId: owner.id,
                cycleId: cycle.id,
                tenantId: tenant.id,
                keyResults: {
                    create: [
                        {
                            title: 'Reach $10M ARR',
                            initialValue: 0,
                            currentValue: 3.5,
                            targetValue: 10,
                            unit: 'CURRENCY',
                            weight: 1.0
                        },
                        {
                            title: 'Capture 50 new Enterprise Logos',
                            initialValue: 0,
                            currentValue: 12,
                            targetValue: 50,
                            unit: 'NUMBER',
                            weight: 1.0
                        }
                    ]
                }
            }
        });
        console.log('Created Company Goal:', companyGoal.title);
    } else {
        console.log('Company Goal already exists');
    }

    // 5. Create Team Objective (Aligned to Company Goal)
    const teamGoalTitle = 'Security First Initiative';
    let teamGoal = await prisma.goal.findFirst({ where: { title: teamGoalTitle, tenantId: tenant.id } });

    if (!teamGoal) {
        if (companyGoal) {
            teamGoal = await prisma.goal.create({
                data: {
                    title: teamGoalTitle,
                    description: 'Achieve SOC2, ISO27001, and GDPR compliance.',
                    type: 'TEAM',
                    status: 'AT_RISK',
                    progress: 60,
                    targetDate: new Date('2026-06-30'),
                    ownerId: owner.id,
                    cycleId: cycle.id,
                    tenantId: tenant.id,
                    parentId: companyGoal.id, // Hierarchy Alignment
                    keyResults: {
                        create: [
                            {
                                title: 'Pass SOC2 Type II Audit',
                                initialValue: 0,
                                currentValue: 60,
                                targetValue: 100,
                                unit: 'PERCENTAGE',
                                weight: 1.0
                            }
                        ]
                    }
                }
            });
            console.log('Created Team Goal:', teamGoal.title);
        }
    } else {
        console.log('Team Goal already exists');
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

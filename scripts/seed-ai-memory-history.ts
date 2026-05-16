import prisma from '../src/lib/prisma';

async function main() {
    console.log('🌱 Seeding AI Memory & History Data...');

    // Find a tenant and user
    const tenant = await prisma.tenant.findFirst();
    const user = await prisma.user.findFirst();

    if (!tenant || !user) {
        console.error('❌ Tenant or User not found. Run standard seed first.');
        return;
    }

    console.log(`Using Tenant: ${tenant.id}, User: ${user.id}`);

    // 1. Seed AI Memories
    const memoriesData = [
        {
            title: 'Sprint Delay Root Cause',
            content: 'Backend dependencies and QA review cycle were primary blockers in Sprint 15.',
            type: 'OPERATIONAL',
            importance: 'HIGH',
            confidence: 0.95,
            tenantId: tenant.id,
            userId: user.id
        },
        {
            title: 'Team Alpha Overtime Pattern',
            content: 'Team works overtime every Thursday and Friday. High burnout risk detected.',
            type: 'USER',
            importance: 'MEDIUM',
            confidence: 0.88,
            tenantId: tenant.id,
            userId: user.id
        },
        {
            title: 'Automation Effectiveness Increase',
            content: 'AI automations reduced manual work by 24% across projects this quarter.',
            type: 'AI_LEARNING',
            importance: 'HIGH',
            confidence: 0.97,
            tenantId: tenant.id,
            userId: user.id
        },
        {
            title: 'Release 2.4.0 Risk Factors',
            content: '3 high risk factors identified that may impact release timeline and stability.',
            type: 'STRATEGIC',
            importance: 'HIGH',
            confidence: 0.93,
            tenantId: tenant.id,
            userId: user.id
        }
    ];

    for (const data of memoriesData) {
        try {
            const memory = await (prisma as any).aIMemory.create({ data });
            console.log(`- Created memory: ${memory.title}`);
            
            // Add relationships
            await (prisma as any).aIMemoryRelationship.create({
                data: {
                    memoryId: memory.id,
                    targetType: 'PROJECT',
                    targetId: 'dummy-project-id',
                    relationshipType: 'RELATED_TO',
                    strength: 0.8
                }
            });

            // Add events
            await (prisma as any).aIMemoryEvent.create({
                data: {
                    memoryId: memory.id,
                    eventType: 'LEARNED',
                    description: 'Pattern identified during weekly sprint analysis.'
                }
            });
        } catch (err: any) {
            console.error(`Error creating memory ${data.title}:`, err.message);
        }
    }

    // 2. Seed AI Decisions
    try {
        const decision = await (prisma as any).aIDecision.create({
            data: {
                action: 'Workforce Rebalancing - Team Alpha',
                reasoning: 'Detected high probability (84%) of sprint failure due to team overload.',
                confidence: 0.96,
                prediction: 'Maintain delivery commitment',
                outcome: 'SUCCESS',
                tenantId: tenant.id,
                userId: user.id,
                signals: {
                    metrics: ['Overtime', 'Response Time Lag'],
                    confidence: 0.96
                }
            }
        });
        console.log(`- Created decision: ${decision.action}`);

        // 3. Seed Timeline Events
        await (prisma as any).aITimelineEvent.createMany({
            data: [
                {
                    type: 'DECISION',
                    title: 'AI Decision: Workforce Rebalancing',
                    description: 'Reassigned 12 overdue tasks to reduce failure probability.',
                    severity: 'WARNING',
                    decisionId: decision.id,
                    tenantId: tenant.id
                },
                {
                    type: 'EXECUTION',
                    title: 'Automation Executed: Auto-Escalation',
                    description: 'Priority #124 escalated due to SLA violation.',
                    severity: 'INFO',
                    tenantId: tenant.id
                },
                {
                    type: 'ANOMALY',
                    title: 'Anomaly Detected: High API Latency',
                    description: 'Detected 240% increase in response times.',
                    severity: 'CRITICAL',
                    tenantId: tenant.id
                }
            ]
        });
        console.log('- Created timeline events');
    } catch (err: any) {
        console.error('Error creating decision/timeline:', err.message);
    }

    // 4. Seed AI History
    try {
        await (prisma as any).aIHistory.create({
            data: {
                action: 'MEMORY_SYNCHRONIZATION',
                entityType: 'WORKSPACE',
                details: 'Synchronized organizational context across 12 projects.',
                impact: 'POSITIVE',
                tenantId: tenant.id,
                userId: user.id
            }
        });
        console.log('- Created history entry');
    } catch (err: any) {
        console.error('Error creating history:', err.message);
    }

    console.log('✅ AI Memory & History Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

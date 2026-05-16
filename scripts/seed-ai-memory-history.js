const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env parser
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding AI Memory & History Data...');

    // Find a tenant and user
    const tenant = await prisma.tenant.findFirst();
    const user = await prisma.user.findFirst();

    if (!tenant || !user) {
        console.error('❌ Tenant or User not found. Run standard seed first.');
        return;
    }

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
        const memory = await prisma.aIMemory.create({ data });
        
        // Add relationships
        await prisma.aIMemoryRelationship.create({
            data: {
                memoryId: memory.id,
                targetType: 'PROJECT',
                targetId: 'dummy-project-id',
                relationshipType: 'RELATED_TO',
                strength: 0.8
            }
        });

        // Add events
        await prisma.aIMemoryEvent.create({
            data: {
                memoryId: memory.id,
                eventType: 'LEARNED',
                description: 'Pattern identified during weekly sprint analysis.'
            }
        });
    }

    // 2. Seed AI Decisions
    const decision = await prisma.aIDecision.create({
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

    // 3. Seed Timeline Events
    await prisma.aITimelineEvent.createMany({
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

    // 4. Seed AI History
    await prisma.aIHistory.create({
        data: {
            action: 'MEMORY_SYNCHRONIZATION',
            entityType: 'WORKSPACE',
            details: 'Synchronized organizational context across 12 projects.',
            impact: 'POSITIVE',
            tenantId: tenant.id,
            userId: user.id
        }
    });

    console.log('✅ AI Memory & History Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

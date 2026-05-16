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
  const tenant = await prisma.tenant.findFirst();
  const user = await prisma.user.findFirst({
    where: { email: 'admin@revoticai.com' }
  });

  if (!tenant || !user) {
    console.log('Tenant or User not found. Please run initial seed first.');
    return;
  }

  console.log('Seeding AI Automations...');

  const automationTemplates = [
    {
      name: 'Sprint Recovery Engine',
      description: 'Automatically redistributes overdue sprint tasks and rebalances team workload based on burnout risk.',
      type: 'OPERATIONAL',
      status: 'ACTIVE',
      isAutonomous: true,
      healthScore: 98,
      reliability: 99.8,
      executionCount: 124,
      successRate: 99.2,
      aiConfidence: 96,
    },
    {
      name: 'Smart Escalation Protocol',
      description: 'Escalates blockers to leadership after real-time AI risk analysis identifies critical path delays.',
      type: 'DECISION',
      status: 'ACTIVE',
      isAutonomous: false,
      healthScore: 94,
      reliability: 100,
      executionCount: 42,
      successRate: 100,
      aiConfidence: 91,
    },
    {
      name: 'Workload Rebalancer',
      description: 'Dynamically redistributes tasks based on real-time burnout probability and historical delivery speed.',
      type: 'PREDICTIVE',
      status: 'ACTIVE',
      isAutonomous: true,
      healthScore: 92,
      reliability: 97.5,
      executionCount: 89,
      successRate: 97.8,
      aiConfidence: 88,
    }
  ];

  for (const template of automationTemplates) {
    const automation = await prisma.automation.create({
      data: {
        ...template,
        tenantId: tenant.id,
        ownerId: user.id,
        analytics: {
          create: {
            timeSavedTotal: Math.random() * 100,
            efficiencyGain: Math.random() * 30,
            operationalAutonomy: Math.random() * 50 + 40
          }
        }
      }
    });

    console.log(`- Created automation: ${automation.name}`);

    // Create some mock nodes for each
    await prisma.automationNode.create({
      data: {
        automationId: automation.id,
        type: 'TRIGGER',
        subType: 'event_trigger',
        config: {},
        positionX: 400,
        positionY: 50
      }
    });

    await prisma.automationNode.create({
      data: {
        automationId: automation.id,
        type: 'AI',
        subType: 'analyze_risk',
        config: {},
        positionX: 400,
        positionY: 200
      }
    });

    // Create some mock executions
    for (let i = 0; i < 5; i++) {
      await prisma.automationExecution.create({
        data: {
          automationId: automation.id,
          status: Math.random() > 0.1 ? 'SUCCESS' : 'FAILED',
          startTime: new Date(Date.now() - Math.random() * 1000000000),
          duration: Math.floor(Math.random() * 2000),
          triggeredBy: 'system'
        }
      });
    }
  }

  console.log('Seeding completed successfully.');
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

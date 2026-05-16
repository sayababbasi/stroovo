import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const plans = [
    {
      name: 'Starter',
      slug: 'starter',
      priceMonthly: 0,
      priceYearly: 0,
      features: {
        ai_insights: false,
        ai_automation: false,
        advanced_dashboards: false,
        timeline_view: false,
        gantt_view: false,
        custom_workflows: false,
        api_access: false,
        role_permissions: false,
        time_tracking: false,
        sso_saml: false,
        audit_logs: false,
        soc2_ready: false,
        white_labeling: false,
        dedicated_support: false,
      },
      limits: {
        teamMembers: 5,
        workspaces: 3,
        tasks: 100,
        storage: 1073741824, // 1GB
        aiCredits: 50,
        automations: 10,
      },
    },
    {
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 29,
      priceYearly: 290,
      features: {
        ai_insights: true,
        ai_automation: true,
        advanced_dashboards: true,
        timeline_view: true,
        gantt_view: true,
        custom_workflows: true,
        api_access: true,
        role_permissions: true,
        time_tracking: true,
        sso_saml: false,
        audit_logs: false,
        soc2_ready: false,
        white_labeling: false,
        dedicated_support: false,
      },
      limits: {
        teamMembers: -1,
        workspaces: -1,
        tasks: -1,
        storage: 107374182400, // 100GB
        aiCredits: 1000,
        automations: 500,
      },
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      priceMonthly: 99,
      priceYearly: 990,
      features: {
        ai_insights: true,
        ai_automation: true,
        advanced_dashboards: true,
        timeline_view: true,
        gantt_view: true,
        custom_workflows: true,
        api_access: true,
        role_permissions: true,
        time_tracking: true,
        sso_saml: true,
        audit_logs: true,
        soc2_ready: true,
        white_labeling: true,
        dedicated_support: true,
      },
      limits: {
        teamMembers: -1,
        workspaces: -1,
        tasks: -1,
        storage: 1099511627776, // 1TB
        aiCredits: -1,
        automations: -1,
      },
    },
  ];

  for (const plan of plans) {
    await (prisma as any).plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  console.log('Billing plans seeded successfully.');
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

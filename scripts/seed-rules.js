
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding automation rules (JS)...');
    
    // Get first tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error('No tenant found. Run main seed first.');
        return;
    }

    // Use raw query or as any to bypass potential type issues in JS
    await prisma.$executeRaw`INSERT INTO "AutomationRule" ("id", "name", "triggerEvent", "action", "isActive", "tenantId", "updatedAt") VALUES ('rule_1', 'Notify Manager on Completion', 'TASK_COMPLETED', 'NOTIFY_MANAGER', true, ${tenant.id}, NOW()) ON CONFLICT DO NOTHING`;

    console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding automation rules...');
    
    // Get first tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error('No tenant found. Run main seed first.');
        return;
    }

    await (prisma as any).automationRule.create({
        data: {
            name: 'Notify Manager on Completion',
            triggerEvent: 'TASK_COMPLETED',
            action: 'NOTIFY_MANAGER',
            tenantId: tenant.id,
            isActive: true
        }
    });

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

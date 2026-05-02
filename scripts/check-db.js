const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking database state...');
  
  const tenants = await prisma.tenant.findMany({
    where: { id: { startsWith: 'test-tenant' } }
  });
  console.log(`Found ${tenants.length} test tenants:`, tenants.map(t => t.id));

  const users = await prisma.user.findMany({
    where: { id: { startsWith: 'test-user' } }
  });
  console.log(`Found ${users.length} test users:`, users.map(u => u.id));

  const notifications = await prisma.notification.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 60000) // Last minute
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(`Found ${notifications.length} recent notifications:`, notifications.map(n => ({
    id: n.id,
    title: n.title,
    userId: n.userId,
    tenantId: n.tenantId,
    createdAt: n.createdAt
  })));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

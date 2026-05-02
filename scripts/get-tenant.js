const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getSeedData() {
  try {
    const tenant = await prisma.tenant.findFirst();
    const user = await prisma.user.findFirst({
        where: { email: 'ceo@revoticai.com' }
    });
    
    console.log('--- SEED DATA ---');
    console.log('TENANT_ID:', tenant?.id || 'NOT_FOUND');
    console.log('USER_ID:', user?.id || 'NOT_FOUND');
    console.log('USER_TENANT_ID:', user?.tenantId || 'NOT_FOUND');
    console.log('-----------------');
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getSeedData();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.demoRequest.count();
    console.log('DemoRequest count:', count);
  } catch (err) {
    console.error('Error querying DemoRequest:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

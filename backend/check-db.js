const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, password: true } });
    console.log('OUTPUT_DATA_START');
    console.log(JSON.stringify(users));
    console.log('OUTPUT_DATA_END');
  } catch (err) {
    console.error('ERROR_DATA:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();

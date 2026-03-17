const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Connection successful.');

    console.log('Fetching projects...');
    const projects = await prisma.project.findMany();
    console.log('Projects:', projects.length);

    console.log('Fetching tasks...');
    const tasks = await prisma.task.findMany();
    console.log('Tasks:', tasks.length);

  } catch (e) {
    console.error('Prisma Error occurred:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

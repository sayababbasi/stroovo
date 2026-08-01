const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listTasks() {
  const tasks = await prisma.task.findMany({
    select: { id: true, title: true, parentId: true }
  });
  console.log('All tasks:', tasks);
  await prisma.$disconnect();
}
listTasks();

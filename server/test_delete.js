const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const taskId = 'cms9tdlpd000l6gexcsr8ax45'; // from the screenshot
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    console.log('Task in DB:', task);
    
    // Attempt deletion exactly as Express does
    // We need to know what req.user.tenantId would be, but let's just do normal delete to see if it works without tenantId.
    if (task) {
      await prisma.task.delete({
        where: { id: taskId }
      });
      console.log('Deleted successfully without tenantId check!');
    }
  } catch (err) {
    console.error('Error during deletion:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();

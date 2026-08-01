const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const updated = await prisma.task.updateMany({
        where: { title: 'Quantum UI Overhaul' },
        data: { title: 'Facebook' }
    });
    console.log('Updated tasks:', updated.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());

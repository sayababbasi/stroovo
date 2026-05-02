const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const project = await prisma.project.findUnique({
        where: { id: 'proj_seed_123' }
    });
    console.log(project);
}
main().finally(() => prisma.$disconnect());

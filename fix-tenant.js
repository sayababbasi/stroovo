const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Creating default tenant...');
        await prisma.$executeRaw`INSERT INTO "Tenant" (id, name, "updatedAt") VALUES ('default', 'Default', NOW()) ON CONFLICT DO NOTHING;`;

        console.log('Updating NULL tenantIds...');
        await prisma.$executeRaw`UPDATE "Task" SET "tenantId" = 'default' WHERE "tenantId" IS NULL;`;
        await prisma.$executeRaw`UPDATE "Project" SET "tenantId" = 'default' WHERE "tenantId" IS NULL;`;
        await prisma.$executeRaw`UPDATE "Goal" SET "tenantId" = 'default' WHERE "tenantId" IS NULL;`;
        await prisma.$executeRaw`UPDATE "Cycle" SET "tenantId" = 'default' WHERE "tenantId" IS NULL;`;
        
        console.log('Done fixing null tenantIds!');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

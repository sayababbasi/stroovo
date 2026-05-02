import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    const tenantId = 'test-tenant-1';
    console.log(`Setting all data to tenant: ${tenantId}`);

    const userUpdate = await prisma.user.updateMany({
        data: { tenantId }
    });
    console.log(`Updated ${userUpdate.count} users`);

    const projectUpdate = await prisma.project.updateMany({
        data: { tenantId }
    });
    console.log(`Updated ${projectUpdate.count} projects`);

    const taskUpdate = await prisma.task.updateMany({
        data: { tenantId }
    });
    console.log(`Updated ${taskUpdate.count} tasks`);

    const goalUpdate = await prisma.goal.updateMany({
        data: { tenantId }
    });
    console.log(`Updated ${goalUpdate.count} goals`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

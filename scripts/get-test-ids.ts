import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, tenantId: true }
    });
    console.log('Users:', JSON.stringify(users, null, 2));

    const tenants = await prisma.tenant.findMany({
        select: { id: true, name: true }
    });
    console.log('Tenants:', JSON.stringify(tenants, null, 2));

    const projects = await prisma.project.findMany({
        select: { id: true, name: true, tenantId: true }
    });
    console.log('Projects:', JSON.stringify(projects, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Running Simple Seed...');

    // 1. Tenant
    let tenant = await prisma.tenant.findUnique({ where: { domain: 'acme.com' } });
    if (!tenant) {
        tenant = await prisma.tenant.create({ data: { name: 'Acme Corp', domain: 'acme.com' } });
        console.log('Created Tenant');
    }

    // 2. Cycle
    let cycle = await prisma.cycle.findFirst({ where: { name: 'Q1 2026' } });
    if (!cycle) {
        cycle = await prisma.cycle.create({
            data: {
                name: 'Q1 2026',
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-03-31'),
                tenantId: tenant.id
            }
        });
        console.log('Created Cycle Q1 2026');
    } else {
        console.log('Cycle Q1 2026 exists');
    }

    // 3. Ensure Admin exists (we know it does, but good practice)
    // ...
    console.log('Simple seed done.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

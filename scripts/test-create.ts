import prisma from '../src/lib/prisma';

async function main() {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return;

    console.log('Testing aIMemory creation...');
    const memory = await (prisma as any).aIMemory.create({
        data: {
            title: 'Test Memory',
            type: 'OPERATIONAL',
            tenantId: tenant.id
        }
    });
    console.log('Created:', memory.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());

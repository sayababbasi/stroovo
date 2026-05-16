import prisma from '../src/lib/prisma';

async function main() {
    try {
        const tenant = await prisma.tenant.findFirst();
        if (!tenant) {
            console.log('No tenant found');
            return;
        }

        console.log('Testing aIMemory creation with Tenant:', tenant.id);
        const memory = await (prisma as any).aIMemory.create({
            data: {
                title: 'Test Memory',
                type: 'OPERATIONAL',
                tenantId: tenant.id
            }
        });
        console.log('Created Successfully:', memory.id);
    } catch (err: any) {
        console.error('--- FULL ERROR START ---');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Meta:', JSON.stringify(err.meta, null, 2));
        console.error('Stack:', err.stack);
        console.error('--- FULL ERROR END ---');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

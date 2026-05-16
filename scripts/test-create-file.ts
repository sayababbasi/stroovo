import prisma from '../src/lib/prisma';
import * as fs from 'fs';

async function main() {
    try {
        const tenant = await prisma.tenant.findFirst();
        if (!tenant) return;

        await (prisma as any).aIMemory.create({
            data: {
                title: 'Test Memory',
                type: 'OPERATIONAL',
                tenantId: tenant.id
            }
        });
    } catch (err: any) {
        const errorData = {
            message: err.message,
            code: err.code,
            meta: err.meta,
            stack: err.stack
        };
        fs.writeFileSync('scripts/error_report.json', JSON.stringify(errorData, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

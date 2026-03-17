import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client on disk...');

    // Attempt to use the new fields in a query (not actually executed against DB if we catch validation error, but we want to see if TS/Runtime allows it)
    // Actually, let's just inspect the model dmmf if possible, or just run a query.

    try {
        // We don't need to actually create, just see if it throws "Unknown argument"
        await prisma.goal.findFirst({
            where: {
                type: 'COMPANY', // This should trigger error if client is old
            }
        });
        console.log('SUCCESS: Prisma Client recognizes "type" field.');
    } catch (e: any) {
        console.log('ERROR MESSAGE:', e.message);
        if (e.message.includes('Unknown argument')) {
            console.log('FAIL: Prisma Client does NOT recognize "type".');
        } else {
            console.log('SUCCESS: "type" is recognized (error was something else like DB connection).');
        }
    }
}

main()
    .finally(() => prisma.$disconnect());

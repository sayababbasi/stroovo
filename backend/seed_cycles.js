const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const cycle = await prisma.cycle.create({
        data: {
            name: 'Q1 2026',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-03-31'),
            status: 'ACTIVE'
        }
    });
    console.log('Created cycle:', cycle);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

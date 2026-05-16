import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- PRISMA CLIENT DIAGNOSTIC ---');
    console.log('Available Models:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
}

main().catch(console.error).finally(() => prisma.$disconnect());

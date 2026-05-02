import prisma from './src/lib/prisma';

async function test() {
  // @ts-ignore
  console.log('Project fields:', Object.keys(prisma.project).filter(k => !k.startsWith('$')));
  // @ts-ignore
  console.log('Task fields:', Object.keys(prisma.task).filter(k => !k.startsWith('$')));
}

test().catch(console.error);

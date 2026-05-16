import prisma from '@/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, email: true, name: true }
  });
  console.log('Users in DB:', JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

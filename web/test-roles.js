const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log('Roles with icons:', roles.map(r => r.name + ' - ' + r.icon));
}

main().finally(() => prisma.$disconnect());

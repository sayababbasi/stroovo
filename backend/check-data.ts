import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log('Users:', JSON.stringify(users, null, 2));
    const tenants = await prisma.tenant.findMany();
    console.log('Tenants:', JSON.stringify(tenants, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

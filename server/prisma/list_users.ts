import { PrismaClient } from '@prisma/client/index';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
}

main().finally(() => prisma.$disconnect());

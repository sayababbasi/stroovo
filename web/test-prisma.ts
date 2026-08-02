import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const team = await prisma.team.findFirst({
        include: {
            members: {
                include: { user: { select: { id: true, name: true, email: true, image: true, status: true, isActive: true } }, systemRole: true }
            },
            spaces: true,
            tasks: { take: 5, orderBy: { createdAt: 'desc' } }
        }
    });
    console.log("Success:", !!team);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();

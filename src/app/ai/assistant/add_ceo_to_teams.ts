import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const ceo = await prisma.user.findUnique({
    where: { email: 'ceo@revoticai.com' }
  });

  if (!ceo) {
    console.error('CEO user not found');
    return;
  }

  const teams = await prisma.team.findMany();
  console.log(`Found ${teams.length} teams`);

  for (const team of teams) {
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: ceo.id
        }
      },
      update: { role: 'ADMIN' },
      create: {
        teamId: team.id,
        userId: ceo.id,
        role: 'ADMIN'
      }
    });
    console.log(`Added CEO to team: ${team.name}`);
  }

  console.log('Finished adding CEO to all teams');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

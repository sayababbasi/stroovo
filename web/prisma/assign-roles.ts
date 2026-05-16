import { PrismaClient, UserRole } from '@prisma/client/index';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter});

// Map existing user roles to new system roles
const ROLE_MAPPING: Record<UserRole, string> = {
  ADMIN: 'ADMIN',
  CEO: 'ADMIN',
  EXECUTIVE: 'ADMIN',
  SUPER_ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
  USER: 'TEAM_MEMBER',
};

async function main() {
  console.log('--- Assigning System Roles to Users ---');

  // Get all roles
  const systemRoles = await prisma.role.findMany({
    where: { name: { in: Object.values(ROLE_MAPPING) } }
  });

  const roleMap = new Map(
    systemRoles.map(role => [role.name, role.id])
  );

  // Get all users
  const users = await prisma.user.findMany({
    where: {
      role: { in: Object.keys(ROLE_MAPPING) as UserRole[] }
    }
  });

  console.log(`Found ${users.length} users to update`);

  // Update users with system role IDs
  for (const user of users) {
    const systemRoleName = ROLE_MAPPING[user.role];
    const systemRoleId = roleMap.get(systemRoleName);

    if (systemRoleId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roleId: systemRoleId }
      });

      console.log(`Updated user ${user.email} (${user.role}) -> ${systemRoleName}`);
    }
  }

  console.log('--- Role Assignment Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

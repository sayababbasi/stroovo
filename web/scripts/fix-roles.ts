import { PrismaClient, UserRole } from '@prisma/client';
import { P } from '../src/lib/permissions/registry';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- FIXING ROLES & PERMISSIONS ---');

  // 1. Create all permissions from Registry
  console.log('1. Creating Permissions...');
  const allPermissions = Object.entries(P).map(([key, value]) => ({
    key: value,
    module: value.split('.')[0],
    action: value.split('.')[1] || value,
    description: `Permission for ${value}`
  }));

  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm
    });
  }

  const allPermsInDb = await prisma.permission.findMany();

  // 2. Attach permissions to all roles
  console.log('2. Attaching permissions to roles...');
  const roles = await prisma.role.findMany();
  for (const role of roles) {
    for (const perm of allPermsInDb) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id
        }
      });
    }
  }

  // 3. Update UserRole ENUM for the users
  console.log('3. Updating UserRole ENUM...');
  await prisma.user.updateMany({
    where: { email: 'founder.revoticai@gmail.com' },
    data: { role: UserRole.CEO }
  });

  await prisma.user.updateMany({
    where: { email: 'cofounder.revoticai@gmail.com' },
    data: { role: UserRole.EXECUTIVE }
  });

  await prisma.user.updateMany({
    where: { email: 'sayababbasi806@gmail.com' },
    data: { role: UserRole.SUPER_ADMIN }
  });

  await prisma.user.updateMany({
    where: { email: 'management.revoticai@gmail.com' },
    data: { role: UserRole.ADMIN }
  });

  await prisma.user.updateMany({
    where: { email: 'sales.revoticai@gmail.com' },
    data: { role: UserRole.PROJECT_MANAGER }
  });

  console.log('--- DONE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

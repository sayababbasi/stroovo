import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS } from './src/lib/permissions/registry';

const prisma = new PrismaClient();

async function main() {
  console.log('Syncing permissions...');
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
      create: {
        key: perm.key,
        module: perm.module,
        action: perm.action,
        description: perm.description,
      }
    });
  }
  
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  if (adminRole) {
    console.log('Granting permissions to Admin role...');
    const allPerms = await prisma.permission.findMany();
    
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      });
    }
    console.log('Admin role updated.');
  } else {
    console.log('Admin role not found.');
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 1. Sync permissions
  const { permissionRegistry } = require('./src/lib/permissions/registry');
  
  console.log('Syncing permissions...');
  for (const perm of permissionRegistry) {
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
  
  // 2. Grant all to Admin role
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  if (adminRole) {
    console.log('Granting permissions to Admin role...');
    const allPerms = await prisma.permission.findMany();
    
    // Create role permissions
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

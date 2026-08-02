import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS } from '../src/lib/permissions/registry';

const prisma = new PrismaClient();

async function main() {
  const auditPerms = ALL_PERMISSIONS.filter(p => p.module === 'audit_logs');
  
  for (const perm of auditPerms) {
    const existing = await prisma.permission.findUnique({
      where: { key: perm.key }
    });

    if (!existing) {
      await prisma.permission.create({
        data: {
          key: perm.key,
          module: perm.module,
          action: perm.action,
          description: perm.description
        }
      });
      console.log(`Created permission: ${perm.key}`);
    }
  }

  // Assign to Admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Admin' }
  });

  if (adminRole) {
    for (const perm of auditPerms) {
      const dbPerm = await prisma.permission.findUnique({ where: { key: perm.key } });
      if (dbPerm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: dbPerm.id
            }
          },
          update: {},
          create: {
            roleId: adminRole.id,
            permissionId: dbPerm.id
          }
        });
        console.log(`Assigned ${perm.key} to Admin role`);
      }
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../src/lib/permissions/registry';

const prisma = new PrismaClient();

async function main() {
    console.log('Syncing permissions...');
    
    for (const perm of ALL_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { key: perm.key },
            update: {
                module: perm.module,
                action: perm.action,
                description: perm.description
            },
            create: {
                key: perm.key,
                module: perm.module,
                action: perm.action,
                description: perm.description
            }
        });
    }

    console.log('Upserted permissions.');

    const adminRole = await prisma.role.findFirst({
        where: { name: 'Admin', isSystem: true }
    });

    if (adminRole) {
        const hierarchyPerms = ALL_PERMISSIONS.filter(p => p.key.startsWith('teams.hierarchy.'));
        for (const perm of hierarchyPerms) {
            const pDb = await prisma.permission.findUnique({ where: { key: perm.key } });
            if (pDb) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: { roleId: adminRole.id, permissionId: pDb.id }
                    },
                    update: {},
                    create: { roleId: adminRole.id, permissionId: pDb.id }
                });
            }
        }
        console.log('Granted Hierarchy permissions to Admin role.');
    }

    console.log('Sync complete.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

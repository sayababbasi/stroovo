/**
 * STROOVO   Permission & Role Seeder
 * 
 * Seeds the database with:
 * 1. All permissions from the centralized registry
 * 2. Default system roles (Admin, CEO, CTO, COO, Manager, Employee)
 * 3. Role ↔ Permission mappings
 * 4. Auto-assigns existing users to matching roles based on their legacy `role` string
 * 
 * Run: npx tsx scripts/seed-permissions.ts
 * Safe to re-run (idempotent).
 */

import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, SystemRoleName } from '../src/lib/permissions/registry';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function main() {
  console.log('🔐 Stroovo Permission Seeder');
  console.log('═'.repeat(50));

  // ── Step 1: Seed all permissions ──
  console.log('\n📋 Step 1: Seeding permissions...');
  let created = 0;
  let existing = 0;

  for (const perm of ALL_PERMISSIONS) {
    const exists = await prisma.permission.findUnique({ where: { key: perm.key } });
    if (exists) {
      // Update description/module/action if changed
      await prisma.permission.update({
        where: { key: perm.key },
        data: { module: perm.module, action: perm.action, description: perm.description },
      });
      existing++;
    } else {
      await prisma.permission.create({
        data: { key: perm.key, module: perm.module, action: perm.action, description: perm.description },
      });
      created++;
    }
  }
  console.log(`   ✅ ${created} permissions created, ${existing} updated`);

  // ── Step 2: Seed system roles ──
  console.log('\n👥 Step 2: Seeding system roles...');

  const roleNames = Object.keys(DEFAULT_ROLE_PERMISSIONS) as SystemRoleName[];

  for (const roleName of roleNames) {
    const config = DEFAULT_ROLE_PERMISSIONS[roleName];

    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleName,
          description: config.description,
          isSystem: true,
        },
      });
      console.log(`   ✅ Created role: ${roleName}`);
    } else {
      // Update description and ensure isSystem flag
      await prisma.role.update({
        where: { id: role.id },
        data: { description: config.description, isSystem: true },
      });
      console.log(`   🔄 Updated role: ${roleName}`);
    }

    // ── Step 3: Assign permissions to role ──
    // Get all permission IDs for this role
    const permKeys = config.permissions;
    const permRecords = await prisma.permission.findMany({
      where: { key: { in: permKeys } },
      select: { id: true, key: true },
    });

    // Delete existing role-permission mappings and recreate
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    if (permRecords.length > 0) {
      await prisma.rolePermission.createMany({
        data: permRecords.map((p: any) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });
    }

    console.log(`   📦 ${roleName}: ${permRecords.length} permissions assigned`);
  }

  // ── Step 4: Auto-assign existing users to matching roles ──
  console.log('\n🔗 Step 4: Auto-assigning users to roles...');

  // Map legacy role strings to system role names
  const ROLE_STRING_MAP: Record<string, string> = {
    'Admin': 'Admin',
    'ADMIN': 'Admin',
    'Super Admin': 'Admin',
    'SUPER_ADMIN': 'Admin',
    'CEO': 'CEO',
    'CTO': 'CTO',
    'COO': 'COO',
    'Manager': 'Manager',
    'MANAGER': 'Manager',
    'Project Manager': 'Manager',
    'Employee': 'Employee',
    'EMPLOYEE': 'Employee',
    'Team Member': 'Employee',
    'MEMBER': 'Employee',
    'USER': 'Employee',
  };

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, role: true, roleId: true },
  });

  let assigned = 0;
  let skipped = 0;

  for (const u of allUsers) {
    // Skip if user already has a systemRole assigned
    if (u.roleId) {
      skipped++;
      continue;
    }

    const matchedRoleName = ROLE_STRING_MAP[u.role || ''];
    if (!matchedRoleName) {
      console.log(`   ⚠️  No match for user "${u.name}" (role: "${u.role}")   skipping`);
      skipped++;
      continue;
    }

    const targetRole = await prisma.role.findUnique({ where: { name: matchedRoleName } });
    if (!targetRole) {
      console.log(`   ⚠️  Role "${matchedRoleName}" not found in DB   skipping user "${u.name}"`);
      skipped++;
      continue;
    }

    await prisma.user.update({
      where: { id: u.id },
      data: { roleId: targetRole.id },
    });

    console.log(`   ✅ Assigned "${u.name}" → ${matchedRoleName}`);
    assigned++;
  }

  console.log(`   📊 ${assigned} users assigned, ${skipped} skipped`);

  // ── Summary ──
  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Seed complete!');

  const totalPerms = await prisma.permission.count();
  const totalRoles = await prisma.role.count();
  const totalMappings = await prisma.rolePermission.count();

  console.log(`   Permissions: ${totalPerms}`);
  console.log(`   Roles: ${totalRoles}`);
  console.log(`   Role-Permission mappings: ${totalMappings}`);
  console.log('═'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

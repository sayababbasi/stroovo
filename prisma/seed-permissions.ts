import { PrismaClient } from '@prisma/client/index';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// Define all permissions following module.action.scope format
const PERMISSIONS = [
  // Users
  { module: 'users', action: 'read', key: 'users.read.own', description: 'Read own user data' },
  { module: 'users', action: 'read', key: 'users.read.all', description: 'Read all users' },
  { module: 'users', action: 'create', key: 'users.create', description: 'Create new users' },
  { module: 'users', action: 'update', key: 'users.update.own', description: 'Update own user data' },
  { module: 'users', action: 'update', key: 'users.update.all', description: 'Update any user' },
  { module: 'users', action: 'delete', key: 'users.delete', description: 'Delete users' },
  
  // Tasks
  { module: 'tasks', action: 'create', key: 'tasks.create', description: 'Create tasks' },
  { module: 'tasks', action: 'assign', key: 'tasks.assign', description: 'Assign tasks to users' },
  { module: 'tasks', action: 'read', key: 'tasks.read.own', description: 'Read own tasks' },
  { module: 'tasks', action: 'read', key: 'tasks.read.team', description: 'Read team tasks' },
  { module: 'tasks', action: 'read', key: 'tasks.read.all', description: 'Read all tasks' },
  { module: 'tasks', action: 'update', key: 'tasks.update.own', description: 'Update own tasks' },
  { module: 'tasks', action: 'update', key: 'tasks.update.all', description: 'Update any task' },
  { module: 'tasks', action: 'delete', key: 'tasks.delete', description: 'Delete tasks' },
  
  // Teams
  { module: 'teams', action: 'create', key: 'teams.create', description: 'Create teams' },
  { module: 'teams', action: 'read', key: 'teams.read.own', description: 'Read own teams' },
  { module: 'teams', action: 'read', key: 'teams.read.all', description: 'Read all teams' },
  { module: 'teams', action: 'update', key: 'teams.update.own', description: 'Update own teams' },
  { module: 'teams', action: 'update', key: 'teams.update.all', description: 'Update any team' },
  { module: 'teams', action: 'delete', key: 'teams.delete', description: 'Delete teams' },
  { module: 'teams', action: 'manage_members', key: 'teams.manage_members', description: 'Manage team members' },
  
  // Projects
  { module: 'projects', action: 'create', key: 'projects.create', description: 'Create projects' },
  { module: 'projects', action: 'read', key: 'projects.read.own', description: 'Read own projects' },
  { module: 'projects', action: 'read', key: 'projects.read.all', description: 'Read all projects' },
  { module: 'projects', action: 'update', key: 'projects.update.own', description: 'Update own projects' },
  { module: 'projects', action: 'update', key: 'projects.update.all', description: 'Update any project' },
  { module: 'projects', action: 'delete', key: 'projects.delete', description: 'Delete projects' },
  { module: 'projects', action: 'manage', key: 'projects.manage', description: 'Manage projects' },
  
  // Roles
  { module: 'roles', action: 'read', key: 'roles.read', description: 'Read roles' },
  { module: 'roles', action: 'create', key: 'roles.create', description: 'Create roles' },
  { module: 'roles', action: 'update', key: 'roles.update', description: 'Update roles' },
  { module: 'roles', action: 'delete', key: 'roles.delete', description: 'Delete roles' },
  { module: 'roles', action: 'assign', key: 'roles.assign', description: 'Assign roles to users' },
  
  // System
  { module: 'system', action: 'logs', key: 'system.logs.read', description: 'Read system logs' },
  { module: 'system', action: 'delete', key: 'system.delete', description: 'Delete system data' },
  { module: 'system', action: 'security', key: 'system.security.monitor', description: 'Monitor security' },
  { module: 'system', action: 'settings', key: 'system.settings.update', description: 'Update system settings' },
  
  // AI
  { module: 'ai', action: 'execute', key: 'ai.execute', description: 'Use AI features' },
  { module: 'ai', action: 'auto', key: 'ai.auto.execute', description: 'Enable AI auto-execution' },
  { module: 'ai', action: 'override', key: 'ai.override', description: 'Override AI decisions' },
];

// Define role permission mappings
const ROLE_PERMISSIONS = {
  ADMIN: PERMISSIONS.map(p => p.key), // Admin gets all permissions
  MANAGER: [
    'users.read.all',
    'users.create',
    'users.update.all',
    'tasks.create',
    'tasks.assign',
    'tasks.read.team',
    'tasks.read.all',
    'tasks.update.all',
    'teams.create',
    'teams.read.all',
    'teams.update.all',
    'teams.manage_members',
    'projects.create',
    'projects.read.all',
    'projects.update.all',
    'projects.manage',
    'ai.execute',
  ],
  PROJECT_MANAGER: [
    'users.read.all',
    'tasks.create',
    'tasks.assign',
    'tasks.read.team',
    'tasks.update.all',
    'teams.read.all',
    'teams.manage_members',
    'projects.create',
    'projects.read.all',
    'projects.update.all',
    'projects.manage',
    'ai.execute',
  ],
  TEAM_LEAD: [
    'users.read.team',
    'tasks.create',
    'tasks.assign',
    'tasks.read.team',
    'tasks.update.own',
    'teams.read.own',
    'teams.update.own',
    'teams.manage_members',
    'projects.read.own',
    'projects.update.own',
    'ai.execute',
  ],
  TEAM_MEMBER: [
    'users.read.own',
    'users.update.own',
    'tasks.create',
    'tasks.read.own',
    'tasks.update.own',
    'teams.read.own',
    'projects.read.own',
    'ai.execute',
  ],
};

async function main() {
  console.log('--- Seeding Permissions and Roles ---');

  // 1. Create all permissions
  console.log('Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }
  console.log(`Created ${PERMISSIONS.length} permissions`);

  // 2. Create roles and assign permissions
  console.log('Creating roles and assigning permissions...');
  
  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`,
        isSystem: true,
      },
    });

    // Get permission IDs
    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    // Delete existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Create new role permissions
    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }

    console.log(`Role ${roleName} created with ${permissions.length} permissions`);
  }

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

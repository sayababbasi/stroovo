import { PrismaClient, UserRole, TaskStatus, TaskPriority } from '@prisma/client/index';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashPassword } from '@/lib/auth';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

// Sample user data for each role level
const sampleUsers = [
  // CEO Level - Full access
  {
    email: 'ceo@company.com',
    name: 'John Smith',
    role: 'CEO' as UserRole,
    title: 'Chief Executive Officer',
    contact: '+1-555-0101',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnCEO',
    isActive: true,
    isEmailVerified: true,
  },
  
  // SUPER_ADMIN Level - Full access
  {
    email: 'superadmin@company.com',
    name: 'Sarah Johnson',
    role: 'SUPER_ADMIN' as UserRole,
    title: 'Super Administrator',
    contact: '+1-555-0102',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahAdmin',
    isActive: true,
    isEmailVerified: true,
  },
  
  // ADMIN Level - Full access
  {
    email: 'admin@company.com',
    name: 'Mike Wilson',
    role: 'ADMIN' as UserRole,
    title: 'System Administrator',
    contact: '+1-555-0103',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MikeAdmin',
    isActive: true,
    isEmailVerified: true,
  },
  
  // EXECUTIVE Level - High management access
  {
    email: 'executive@company.com',
    name: 'David Brown',
    role: 'EXECUTIVE' as UserRole,
    title: 'Chief Operating Officer',
    contact: '+1-555-0104',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidExec',
    isActive: true,
    isEmailVerified: true,
  },
  
  // MANAGER Level - Department management
  {
    email: 'manager@company.com',
    name: 'Emily Davis',
    role: 'MANAGER' as UserRole,
    title: 'Project Manager',
    contact: '+1-555-0105',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyMgr',
    isActive: true,
    isEmailVerified: true,
  },
  
  // PROJECT_MANAGER Level - Project specific management
  {
    email: 'pm@company.com',
    name: 'Robert Taylor',
    role: 'PROJECT_MANAGER' as UserRole,
    title: 'Senior Project Manager',
    contact: '+1-555-0106',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RobertPM',
    isActive: true,
    isEmailVerified: true,
  },
  
  // TEAM_LEAD Level - Team management
  {
    email: 'teamlead@company.com',
    name: 'Lisa Anderson',
    role: 'TEAM_LEAD' as UserRole,
    title: 'Development Team Lead',
    contact: '+1-555-0107',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LisaLead',
    isActive: true,
    isEmailVerified: true,
  },
  
  // TEAM_MEMBER Level - Basic access
  {
    email: 'member@company.com',
    name: 'James Martinez',
    role: 'TEAM_MEMBER' as UserRole,
    title: 'Software Developer',
    contact: '+1-555-0108',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesDev',
    isActive: true,
    isEmailVerified: true,
  },
  
  // Additional TEAM_MEMBER for testing
  {
    email: 'developer@company.com',
    name: 'Jennifer White',
    role: 'TEAM_MEMBER' as UserRole,
    title: 'Frontend Developer',
    contact: '+1-555-0109',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JenniferDev',
    isActive: true,
    isEmailVerified: true,
  },
  
  // Inactive user for testing
  {
    email: 'inactive@company.com',
    name: 'Thomas Clark',
    role: 'TEAM_MEMBER' as UserRole,
    title: 'Junior Developer',
    contact: '+1-555-0110',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ThomasDev',
    isActive: false,
    isEmailVerified: false,
  },
];

async function seedSampleUsers() {
  console.log('🌱 Starting sample user seeding...');
  
  try {
    // Get existing roles to map user roles to system roles
    const roles = await prisma.role.findMany();
    const roleMap = new Map(roles.map(r => [r.name, r.id]));
    
    console.log('📋 Found roles:', Array.from(roleMap.keys()));
    
    // Create sample users
    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }
        
        // Generate a simple password for demo purposes
        const password = await hashPassword('demo123456');
        
        // Map user role to system role
        let systemRoleId: string | undefined;
        switch (userData.role) {
          case 'CEO':
            systemRoleId = roleMap.get('CEO');
            break;
          case 'SUPER_ADMIN':
          case 'ADMIN':
            systemRoleId = roleMap.get('ADMIN');
            break;
          case 'EXECUTIVE':
            systemRoleId = roleMap.get('EXECUTIVE');
            break;
          case 'PROJECT_MANAGER':
            systemRoleId = roleMap.get('PROJECT_MANAGER');
            break;
          case 'TEAM_MEMBER':
            systemRoleId = roleMap.get('TEAM_MEMBER');
            break;
        }
        
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            role: userData.role,
            title: userData.title,
            contact: userData.contact,
            image: userData.image,
            isActive: userData.isActive,
            isEmailVerified: userData.isEmailVerified,
            passwordHash: password,
            roleId: systemRoleId,
            tenantId: 'demo-tenant', // Default tenant for demo
          }
        });
        
        console.log(`✅ Created user: ${user.name} (${user.email}) with role: ${user.role}`);
        
      } catch (error: any) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
    
    // Create some sample teams
    console.log('\n👥 Creating sample teams...');
    
    const teams = [
      {
        name: 'Development Team',
        description: 'Core development team working on main product features',
        tenantId: 'demo-tenant',
      },
      {
        name: 'Design Team',
        description: 'UI/UX design team',
        tenantId: 'demo-tenant',
      },
      {
        name: 'Management Team',
        description: 'Project management and leadership team',
        tenantId: 'demo-tenant',
      },
    ];
    
    for (const teamData of teams) {
      try {
        const existingTeam = await prisma.team.findFirst({
          where: { name: teamData.name, tenantId: teamData.tenantId }
        });
        
        if (existingTeam) {
          console.log(`⚠️  Team ${teamData.name} already exists, skipping...`);
          continue;
        }
        
        const team = await prisma.team.create({ data: teamData });
        console.log(`✅ Created team: ${team.name}`);
      } catch (error: any) {
        console.error(`❌ Error creating team ${teamData.name}:`, error.message);
      }
    }
    
    // Get users for project assignment
    const allUsers = await prisma.user.findMany({
      where: { tenantId: 'demo-tenant' },
      select: { id: true, name: true, role: true }
    });
    
    // Create sample projects
    console.log('\n📁 Creating sample projects...');
    
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        status: 'ACTIVE',
        priority: 'HIGH',
        tenantId: 'demo-tenant',
        managerId: allUsers.find(u => u.role === 'PROJECT_MANAGER')?.id || '',
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        tenantId: 'demo-tenant',
        managerId: allUsers.find(u => u.role === 'PROJECT_MANAGER')?.id || '',
      },
      {
        name: 'API Integration',
        description: 'Third-party API integration project',
        status: 'ACTIVE',
        priority: 'LOW',
        tenantId: 'demo-tenant',
        managerId: allUsers.find(u => u.role === 'PROJECT_MANAGER')?.id || '',
      },
    ];
    
    for (const projectData of projects) {
      try {
        const existingProject = await prisma.project.findFirst({
          where: { name: projectData.name, tenantId: projectData.tenantId }
        });
        
        if (existingProject) {
          console.log(`⚠️  Project ${projectData.name} already exists, skipping...`);
          continue;
        }
        
        const project = await prisma.project.create({ data: projectData });
        console.log(`✅ Created project: ${project.name}`);
      } catch (error: any) {
        console.error(`❌ Error creating project ${projectData.name}:`, error.message);
      }
    }
    
    // Create sample tasks
    console.log('\n📋 Creating sample tasks...');
    
    // Get projects for task assignment
    const projectsFromDb = await prisma.project.findMany({
      where: { tenantId: 'demo-tenant' },
      select: { id: true, name: true }
    });
    
    const tasks = [
      {
        title: 'Design new landing page',
        description: 'Create mockups and wireframes for the new landing page',
        status: 'TODO' as TaskStatus,
        priority: 'HIGH' as TaskPriority,
        projectId: projectsFromDb[0]?.id,
        assigneeId: allUsers.find((u: any) => u.role === 'TEAM_MEMBER')?.id,
      },
      {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication to the application',
        status: 'IN_PROGRESS' as TaskStatus,
        priority: 'HIGH' as TaskPriority,
        projectId: projectsFromDb[0]?.id,
        assigneeId: allUsers.find((u: any) => u.role === 'TEAM_MEMBER')?.id,
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: 'TODO' as TaskStatus,
        priority: 'MEDIUM' as TaskPriority,
        projectId: projectsFromDb[1]?.id,
        assigneeId: allUsers.find((u: any) => u.role === 'PROJECT_MANAGER')?.id,
      },
      {
        title: 'Database optimization',
        description: 'Optimize database queries and add indexes',
        status: 'COMPLETED' as TaskStatus,
        priority: 'LOW' as TaskPriority,
        projectId: projectsFromDb[2]?.id,
        assigneeId: allUsers.find((u: any) => u.role === 'TEAM_MEMBER')?.id,
      },
      {
        title: 'Write API documentation',
        description: 'Create comprehensive API documentation',
        status: 'IN_PROGRESS' as TaskStatus,
        priority: 'MEDIUM' as TaskPriority,
        projectId: projectsFromDb[1]?.id,
        assigneeId: allUsers.find((u: any) => u.role === 'TEAM_MEMBER')?.id,
      },
    ];
    
    for (const taskData of tasks) {
      try {
        const task = await prisma.task.create({
          data: {
            ...taskData,
            tenantId: 'demo-tenant',
          }
        });
        console.log(`✅ Created task: ${task.title}`);
      } catch (error: any) {
        console.error(`❌ Error creating task ${taskData.title}:`, error.message);
      }
    }
    
    console.log('\n🎉 Sample data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${sampleUsers.length} sample users created`);
    console.log(`- Roles: All user levels covered (CEO, ADMIN, MANAGER, TEAM_LEAD, TEAM_MEMBER)`);
    console.log(`- Teams: ${teams.length} sample teams created`);
    console.log(`- Projects: ${projects.length} sample projects created`);
    console.log(`- Tasks: ${tasks.length} sample tasks created`);
    console.log('\n🔑 Demo credentials:');
    console.log('Email: ceo@company.com | Password: demo123456 (CEO Access)');
    console.log('Email: admin@company.com | Password: demo123456 (Admin Access)');
    console.log('Email: manager@company.com | Password: demo123456 (Manager Access)');
    console.log('Email: teamlead@company.com | Password: demo123456 (Team Lead Access)');
    console.log('Email: member@company.com | Password: demo123456 (Team Member Access)');
    
  } catch (error: any) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the seeding
seedSampleUsers()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

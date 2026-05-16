import prisma from '@/lib/prisma';

async function setupTestData() {
  console.log('Setting up test data...\n');

  try {
    // Create test tenant
    const tenant = await prisma.tenant.upsert({
      where: { id: 'test-tenant-456' },
      update: {},
      create: {
        id: 'test-tenant-456',
        name: 'Test Tenant',
        domain: 'test.example.com',
      },
    });

    console.log('✅ Tenant created/updated:', tenant.name);

    // Create test user
    const user = await prisma.user.upsert({
      where: { id: 'test-user-123' },
      update: {},
      create: {
        id: 'test-user-123',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        name: 'Test User',
        role: 'PROJECT_MANAGER',
        tenantId: 'test-tenant-456',
      },
    });

    console.log('✅ User created/updated:', user.name);

    // Create test project
    const project = await prisma.project.upsert({
      where: { id: 'test-project-123' },
      update: {},
      create: {
        id: 'test-project-123',
        name: 'Test Project',
        description: 'A project for testing AI task generation',
        status: 'ACTIVE',
        managerId: 'test-user-123',
        tenantId: 'test-tenant-456',
      },
    });

    console.log('✅ Project created/updated:', project.name);
    console.log('\nTest data setup complete!');
    
    return {
      tenantId: tenant.id,
      userId: user.id,
      projectId: project.id,
    };

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

async function cleanupTestData() {
  console.log('\nCleaning up test data...');
  
  try {
    // Delete in order of dependencies
    await prisma.task.deleteMany({
      where: { projectId: 'test-project-123' }
    });
    
    await prisma.project.delete({
      where: { id: 'test-project-123' }
    });
    
    await prisma.user.delete({
      where: { id: 'test-user-123' }
    });
    
    await prisma.tenant.delete({
      where: { id: 'test-tenant-456' }
    });
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'setup') {
    setupTestData();
  } else if (command === 'cleanup') {
    cleanupTestData();
  } else {
    console.log('Usage: npx tsx src/ai/test-db-setup.ts [setup|cleanup]');
  }
}

export { setupTestData, cleanupTestData };

async function testSaveTasksAPI() {
  console.log('Testing /api/ai/save-tasks API...\n');

  const jwt = require('jsonwebtoken');
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'USER',
    tenantId: 'test-tenant-456'
  };
  
  const testToken = jwt.sign(testPayload, 'revotic-workflow-production-v2-stable-2026', { expiresIn: '1h' });

  const testCases = [
    { 
      name: 'Valid request with all tasks',
      data: {
        goal: 'Build a customer dashboard',
        projectId: 'test-project-123',
      },
      expected: 'success'
    },
    { 
      name: 'Valid request with selected tasks',
      data: {
        goal: 'Optimize database performance',
        projectId: 'test-project-123',
        selectedTasks: [0, 1, 2], // Only save first 3 tasks
      },
      expected: 'success'
    },
    { 
      name: 'Missing goal',
      data: {
        projectId: 'test-project-123',
      },
      expected: 'error'
    },
    { 
      name: 'Missing project ID',
      data: {
        goal: 'Build a customer dashboard',
      },
      expected: 'error'
    },
    { 
      name: 'Empty goal',
      data: {
        goal: '',
        projectId: 'test-project-123',
      },
      expected: 'error'
    }
  ];

  const baseUrl = 'http://localhost:3000';

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/ai/save-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${testToken}`,
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Expected: ${testCase.expected}`);
      
      if (testCase.expected === 'success' && response.ok) {
        console.log(`✅ Success: Saved ${result.data?.totalSaved || 0} tasks`);
        console.log(`   First task: ${result.data?.createdTasks?.[0]?.title}`);
      } else if (testCase.expected === 'error' && !response.ok) {
        console.log(`✅ Error handled correctly: ${result.error}`);
      } else {
        console.log(`❌ Unexpected result`);
        console.log(`   Response:`, JSON.stringify(result, null, 2));
      }

    } catch (error) {
      console.error(`❌ Request failed:`, error);
    }
  }
}

if (require.main === module) {
  testSaveTasksAPI();
}

export { testSaveTasksAPI };

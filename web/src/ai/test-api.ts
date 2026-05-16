async function testGenerateTasksAPI() {
  console.log('Testing /api/ai/generate-tasks API...\n');

  const testCases = [
    { goal: 'Build a customer dashboard', expected: 'success' },
    { goal: '', expected: 'error' },
    { goal: 'a'.repeat(501), expected: 'error' },
    { goal: 'Optimize database performance', expected: 'success' }
  ];

  const baseUrl = 'http://localhost:3000';

  for (const testCase of testCases) {
    console.log(`\nTesting: "${testCase.goal.substring(0, 50)}${testCase.goal.length > 50 ? '...' : ''}"`);
    
    try {
      // Create a proper JWT token for testing
      const jwt = require('jsonwebtoken');
      const testPayload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'test-tenant-456'
      };
      
      const testToken = jwt.sign(testPayload, 'revotic-workflow-production-v2-stable-2026', { expiresIn: '1h' });
      
      const response = await fetch(`${baseUrl}/api/ai/generate-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${testToken}`,
        },
        body: JSON.stringify({ goal: testCase.goal }),
      });

      const result = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Expected: ${testCase.expected}`);
      
      if (testCase.expected === 'success' && response.ok) {
        console.log(`✅ Success: Generated ${result.taskCount} tasks`);
        console.log(`   First task: ${result.data.tasks[0]?.title}`);
      } else if (testCase.expected === 'error' && !response.ok) {
        console.log(`✅ Error handled correctly: ${result.error}`);
      } else {
        console.log(`❌ Unexpected result`);
      }

    } catch (error) {
      console.error(`❌ Request failed:`, error);
    }
  }
}

if (require.main === module) {
  testGenerateTasksAPI();
}

export { testGenerateTasksAPI };

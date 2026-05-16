async function testSuggestionsAPI() {
  console.log('Testing /api/ai/suggestions API...\n');

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
      name: 'General suggestions',
      data: {
        timeRange: 'week',
      },
      expected: 'success'
    },
    { 
      name: 'Project-specific suggestions',
      data: {
        projectId: 'test-project-123',
        timeRange: 'month',
      },
      expected: 'success'
    },
    { 
      name: 'User-specific suggestions',
      data: {
        userId: 'test-user-123',
        timeRange: 'week',
      },
      expected: 'success'
    },
    { 
      name: 'Invalid request (missing time range)',
      data: {},
      expected: 'success' // Should default to week
    },
  ];

  const baseUrl = 'http://localhost:3000';

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/ai/suggestions`, {
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
        console.log(`✅ Success: Generated ${result.data?.suggestions?.length || 0} suggestions`);
        console.log(`   Context: ${result.data?.context?.taskCount || 0} tasks, ${result.data?.context?.deadlineCount || 0} deadlines, ${result.data?.context?.userCount || 0} users`);
        
        if (result.data?.suggestions?.length > 0) {
          console.log(`   First suggestion: ${result.data.suggestions[0].action}`);
          console.log(`   Priority: ${result.data.suggestions[0].priority}`);
        }
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
  testSuggestionsAPI();
}

export { testSuggestionsAPI };

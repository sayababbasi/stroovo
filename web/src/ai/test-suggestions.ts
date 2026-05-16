import { suggestionEngine } from './suggestions';

async function testSuggestionsEngine() {
  console.log('Testing Suggestions Engine...\n');

  const testContexts = [
    {
      name: 'High workload context',
      context: {
        tasks: [
          { title: 'API Integration', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'user1', deadline: '2024-01-15' },
          { title: 'Database Migration', status: 'TODO', priority: 'HIGH', assignee: 'user1', deadline: '2024-01-20' },
          { title: 'UI Redesign', status: 'IN_PROGRESS', priority: 'MEDIUM', assignee: 'user2', deadline: '2024-01-25' },
        ],
        deadlines: [
          { taskId: 'task1', dueDate: '2024-01-15', priority: 'HIGH' },
          { taskId: 'task2', dueDate: '2024-01-20', priority: 'HIGH' },
        ],
        workload: [
          { userId: 'user1', userName: 'Alice', activeTasks: 8, capacity: 5 },
          { userId: 'user2', userName: 'Bob', activeTasks: 3, capacity: 5 },
        ],
      },
    },
    {
      name: 'Project deadline context',
      context: {
        tasks: [
          { title: 'Launch Campaign', status: 'TODO', priority: 'URGENT', assignee: 'user3', deadline: '2024-01-10' },
          { title: 'Marketing Materials', status: 'TODO', priority: 'HIGH', assignee: 'user3', deadline: '2024-01-10' },
        ],
        deadlines: [
          { taskId: 'task3', dueDate: '2024-01-10', priority: 'URGENT' },
        ],
        workload: [
          { userId: 'user3', userName: 'Charlie', activeTasks: 2, capacity: 5 },
        ],
      },
    },
  ];

  for (const testCase of testContexts) {
    console.log(`\nTesting: ${testCase.name}`);
    try {
      const suggestions = await suggestionEngine.generateSuggestions(testCase.context);
      console.log(`Generated ${suggestions.length} suggestions:`);
      
      suggestions.forEach((suggestion, index) => {
        console.log(`\n${index + 1}. ${suggestion.action}`);
        console.log(`   Priority: ${suggestion.priority}`);
        console.log(`   Reason: ${suggestion.reason}`);
        console.log(`   Impact: ${suggestion.impact}`);
      });

      const isValid = await suggestionEngine.validateSuggestions(suggestions);
      console.log(`\nValidation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    } catch (error) {
      console.error(`Error generating suggestions for "${testCase.name}":`, error);
    }
  }
}

if (require.main === module) {
  testSuggestionsEngine();
}

export { testSuggestionsEngine };

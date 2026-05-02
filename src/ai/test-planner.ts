import { taskPlanner } from './planner';

async function testTaskPlanner() {
  console.log('Testing Task Planner...\n');

  const testGoals = [
    'Build a mobile app for task management',
    'Launch a marketing campaign for Q4',
    'Set up a customer support system'
  ];

  for (const goal of testGoals) {
    console.log(`\nTesting goal: "${goal}"`);
    try {
      const plan = await taskPlanner.generateTasks(goal);
      console.log(`Generated ${plan.tasks.length} tasks:`);
      
      plan.tasks.forEach((task, index) => {
        console.log(`\n${index + 1}. ${task.title}`);
        console.log(`   Priority: ${task.priority}`);
        console.log(`   Description: ${task.description}`);
        console.log(`   Subtasks: ${task.subtasks.join(', ')}`);
      });

      const isValid = await taskPlanner.validateTaskPlan(plan);
      console.log(`\nValidation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    } catch (error) {
      console.error(`Error generating tasks for "${goal}":`, error);
    }
  }
}

if (require.main === module) {
  testTaskPlanner();
}

export { testTaskPlanner };

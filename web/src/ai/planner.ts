import { ollamaClient } from './ollama';

export interface Task {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subtasks: string[];
}

export interface TaskPlan {
  tasks: Task[];
}

export class TaskPlanner {
  private model = 'qwen2.5-coder:1.5b';

  async generateTasks(goal: string): Promise<TaskPlan> {
    const prompt = `You are an expert project manager and strategic planner.
    
    Analyze this goal: "${goal}"
    
    Generate a comprehensive list of tasks and subtasks required to achieve this goal.
    Focus on actionable, specific tasks that can be executed.
    
    Return STRICT JSON only with this exact structure:
    {
      "tasks": [
        {
          "title": "Clear, actionable task title",
          "description": "Detailed description of what needs to be done",
          "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          "subtasks": ["Specific subtask 1", "Specific subtask 2"]
        }
      ]
    }
    
    Rules:
    - Minimum 3 tasks, maximum 8 tasks
    - Each task must have at least 1 subtask
    - Priorities should reflect urgency and importance
    - Tasks should be logical and sequential where appropriate
    - No explanations, only valid JSON`;

    try {
      const response = await ollamaClient.generate(prompt, this.model, {
        temperature: 0.3,
        max_tokens: 2048,
      });

      const cleanedJson = this.extractJson(response.response);
      
      if (!cleanedJson) {
        throw new Error('Failed to extract valid JSON from AI response');
      }

      const parsed: TaskPlan = JSON.parse(cleanedJson);
      
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid response structure: missing tasks array');
      }

      return parsed;
    } catch (error) {
      console.error('Task generation error:', error);
      throw new Error(`Failed to generate tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractJson(text: string): string | null {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      
      const jsonStr = jsonMatch[0];
      JSON.parse(jsonStr);
      return jsonStr;
    } catch (error) {
      try {
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) return null;
        
        const jsonStr = text.substring(startIndex, endIndex + 1);
        JSON.parse(jsonStr);
        return jsonStr;
      } catch {
        return null;
      }
    }
  }

  async validateTaskPlan(plan: TaskPlan): Promise<boolean> {
    if (!plan.tasks || !Array.isArray(plan.tasks)) return false;
    
    for (const task of plan.tasks) {
      if (!task.title || typeof task.title !== 'string') return false;
      if (!task.description || typeof task.description !== 'string') return false;
      if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(task.priority)) return false;
      if (!task.subtasks || !Array.isArray(task.subtasks)) return false;
      if (task.subtasks.length === 0) return false;
    }
    
    return plan.tasks.length >= 3 && plan.tasks.length <= 8;
  }
}

export const taskPlanner = new TaskPlanner();

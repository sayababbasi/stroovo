import Groq from 'groq-sdk';

// Check if API key is available
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.warn('GROQ_API_KEY not found in environment variables. AI features will be limited.');
}

const groq = apiKey ? new Groq({ apiKey }) : null;

export const aiService = {
  /**
   * General purpose completion helper
   */
  async complete(prompt: string, model: string = 'llama-3.3-70b-versatile') {
    if (!groq) {
      console.warn('AI Service not available - no API key configured');
      return { error: 'AI service not available', fallback: true };
    }

    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI Service completion error:', error);
      // Return fallback response instead of throwing
      return { error: 'AI service temporarily unavailable', fallback: true };
    }
  },

  /**
   * Plan tasks based on a user goal
   */
  async planTasks(goal: string) {
    const prompt = `You are an expert project manager. 
    Analyze this goal: "${goal}"
    Generate a list of tasks and subtasks required to achieve it.
    Return a JSON object with this structure:
    {
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          "subtasks": ["string"]
        }
      ]
    }`;

    return this.complete(prompt);
  },

  /**
   * Suggest next actions
   */
  async suggestNextActions(context: any) {
    const prompt = `Based on the following project context, suggest the 3 most important next actions:
    ${JSON.stringify(context)}
    Return in JSON format: { "suggestions": ["string"] }`;

    return this.complete(prompt);
  },

  /**
   * Rank members for a task
   */
  async rankAssignees(task: { title: string; description?: string }, members: { id: string; name: string; skills: string[] }[]) {
    const prompt = `
        Task: ${task.title}
        Description: ${task.description || 'N/A'}

        Team Members:
        ${members.map(m => `- ${m.name} (ID: ${m.id}, Skills: ${m.skills.join(', ')})`).join('\n')}

        Rank the team members by suitability for this task based on their skills.
        Return ONLY a JSON object: { "bestMatchId": "user_id", "reason": "why they are the best fit" }
    `;

    return this.complete(prompt);
  },

  /**
   * Detect bottlenecks in project activity
   */
  async detectBottlenecks(context: any) {
    const prompt = `
        Analyze the following project activity and identify potential bottlenecks.
        Context: ${JSON.stringify(context)}

        Look for:
        - Tasks taking longer than average in specific statuses.
        - Team members with excessive workloads.
        - Repeated status reversions (e.g., REVIEW -> IN_PROGRESS).

        Return JSON: { "bottlenecks": [ { "level": "MEDIUM" | "HIGH" | "CRITICAL", "reason": "string", "suggestion": "string" } ] }
    `;

    return this.complete(prompt);
  }
};

export default aiService;

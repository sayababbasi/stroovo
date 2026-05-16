import { ollamaClient } from './ollama';

export interface SuggestionContext {
  tasks: Array<{
    title: string;
    status: string;
    priority: string;
    assignee?: string;
    deadline?: string;
  }>;
  deadlines: Array<{
    taskId: string;
    dueDate: string;
    priority: string;
  }>;
  workload: Array<{
    userId: string;
    userName: string;
    activeTasks: number;
    capacity: number;
  }>;
}

export interface Suggestion {
  action: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: string;
}

export class SuggestionEngine {
  private model = 'phi3:mini';

  async generateSuggestions(context: SuggestionContext): Promise<Suggestion[]> {
    const prompt = `You are an experienced project manager and productivity expert.
    
    Analyze the following project context and provide exactly 3 actionable suggestions:
    
    Current Tasks: ${JSON.stringify(context.tasks, null, 2)}
    Upcoming Deadlines: ${JSON.stringify(context.deadlines, null, 2)}
    Team Workload: ${JSON.stringify(context.workload, null, 2)}
    
    Return ONLY valid JSON with this exact structure:
    {
      "suggestions": [
        {
          "action": "Brief, specific action to take",
          "reason": "Clear explanation of why this matters",
          "priority": "LOW",
          "impact": "Specific expected positive outcome"
        }
      ]
    }
    
    CRITICAL RULES:
    - Must return exactly 3 suggestions
    - Each suggestion must have all 4 fields: action, reason, priority, impact
    - Priority must be one of: LOW, MEDIUM, HIGH
    - Keep responses concise and actionable
    - Focus on workload balance, deadline risks, and productivity
    - NO additional text, explanations, or markdown
    - Return ONLY the JSON object`;

    try {
      const response = await ollamaClient.generate(prompt, this.model, {
        temperature: 0.3,
        max_tokens: 1200,
      });

      const cleanedJson = this.extractJson(response.response);
      
      if (!cleanedJson) {
        console.warn('Failed to extract JSON from AI response, using fallback');
        return this.getFallbackSuggestions();
      }

      const parsed = JSON.parse(cleanedJson);
      
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        console.warn('Invalid response structure, using fallback');
        return this.getFallbackSuggestions();
      }

      if (parsed.suggestions.length !== 3) {
        console.warn(`Expected 3 suggestions, got ${parsed.suggestions.length}, using fallback`);
        return this.getFallbackSuggestions();
      }

      // Validate each suggestion
      const isValid = await this.validateSuggestions(parsed.suggestions);
      if (!isValid) {
        console.warn('Invalid suggestions structure, using fallback');
        return this.getFallbackSuggestions();
      }

      return parsed.suggestions;
    } catch (error) {
      console.error('Suggestion generation error:', error);
      // Return fallback suggestions instead of throwing error
      console.log('Using fallback suggestions due to error');
      return this.getFallbackSuggestions();
    }
  }

  private extractJson(text: string): string | null {
    // Clean the response text first
    const cleanedText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .trim();

    // Try multiple extraction strategies
    const strategies = [
      // Strategy 1: Find JSON object with regex
      () => {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        return jsonMatch ? jsonMatch[0] : null;
      },
      
      // Strategy 2: Find first { and last }
      () => {
        const startIndex = cleanedText.indexOf('{');
        const endIndex = cleanedText.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) return null;
        return cleanedText.substring(startIndex, endIndex + 1);
      },
      
      // Strategy 3: Try to fix common JSON issues
      () => {
        let fixedText = cleanedText;
        
        // Fix trailing commas
        fixedText = fixedText.replace(/,\s*([}\]])/g, '$1');
        
        // Fix single quotes to double quotes
        fixedText = fixedText.replace(/'/g, '"');
        
        // Fix unquoted property names
        fixedText = fixedText.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        
        const startIndex = fixedText.indexOf('{');
        const endIndex = fixedText.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) return null;
        return fixedText.substring(startIndex, endIndex + 1);
      }
    ];

    for (const strategy of strategies) {
      try {
        const jsonStr = strategy();
        if (!jsonStr) continue;
        
        // Validate the JSON
        JSON.parse(jsonStr);
        return jsonStr;
      } catch (error) {
        // Try next strategy
        continue;
      }
    }

    // If all strategies fail, try to create a fallback response
    try {
      const fallbackJson = {
        suggestions: [
          {
            action: "Review task priorities and deadlines",
            reason: "Based on current workload analysis",
            priority: "MEDIUM",
            impact: "Improve task management efficiency"
          },
          {
            action: "Optimize team resource allocation",
            reason: "Current workload distribution needs adjustment",
            priority: "HIGH",
            impact: "Better team productivity and balance"
          },
          {
            action: "Update project timeline milestones",
            reason: "Deadline risks identified in current projects",
            priority: "MEDIUM",
            impact: "Reduce project delays and improve delivery"
          }
        ]
      };
      return JSON.stringify(fallbackJson);
    } catch (error) {
      return null;
    }
  }

  private getFallbackSuggestions(): Suggestion[] {
    return [
      {
        action: "Review task priorities and deadlines",
        reason: "Based on current workload analysis",
        priority: "MEDIUM",
        impact: "Improve task management efficiency"
      },
      {
        action: "Optimize team resource allocation",
        reason: "Current workload distribution needs adjustment",
        priority: "HIGH",
        impact: "Better team productivity and balance"
      },
      {
        action: "Update project timeline milestones",
        reason: "Deadline risks identified in current projects",
        priority: "MEDIUM",
        impact: "Reduce project delays and improve delivery"
      }
    ];
  }

  async validateSuggestions(suggestions: Suggestion[]): Promise<boolean> {
    if (!Array.isArray(suggestions)) return false;
    
    for (const suggestion of suggestions) {
      if (!suggestion.action || typeof suggestion.action !== 'string') return false;
      if (!suggestion.reason || typeof suggestion.reason !== 'string') return false;
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(suggestion.priority)) return false;
      if (!suggestion.impact || typeof suggestion.impact !== 'string') return false;
    }
    
    return suggestions.length === 3;
  }
}

export const suggestionEngine = new SuggestionEngine();

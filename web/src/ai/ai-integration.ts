import prisma from '@/lib/prisma';
import { aiService } from './service';
import { RiskEngine } from './risk-engine';
import { WorkloadEngine } from './workload-engine';

/**
 * AI Integration Engine - Connects AI services with task management
 * Provides intelligent task suggestions, risk analysis, and workload optimization
 */

export interface AIInsights {
  riskAnalysis?: any;
  workloadSuggestions?: any;
  aiRecommendations?: string[];
  confidence: number;
}

export class AIIntegrationEngine {
  /**
   * Generate AI insights for a specific task
   */
  static async generateTaskInsights(taskId: string): Promise<AIInsights> {
    try {
      console.log('[AI Integration] Generating insights for task:', taskId);
      
      // Get task with full context
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignee: true,
          project: true,
          subTasks: true,
          dependencies: true,
        }
      });

      if (!task) {
        console.log('[AI Integration] Task not found:', taskId);
        throw new Error('Task not found');
      }

      console.log('[AI Integration] Task found:', task.title, 'status:', task.status);

      // Run risk analysis
      const riskAnalysis = await RiskEngine.evaluateTaskRisk(taskId);
      console.log('[AI Integration] Risk analysis completed:', riskAnalysis.riskScore);

      // Get AI recommendations if available
      let aiRecommendations: string[] = [];
      let confidence = 0.8;

      if (task.assignee) {
        const workloadAnalysis = await WorkloadEngine.evaluateUserWorkload(task.assignee.id);
        console.log('[AI Integration] Workload analysis completed for user:', task.assignee.name);
        
        // Get AI suggestions for task optimization
        const aiSuggestions = await this.getAISuggestions(task);
        aiRecommendations = aiSuggestions;
        console.log('[AI Integration] AI suggestions generated:', aiSuggestions.length, 'suggestions');
        
        // Adjust confidence based on data availability
        if (workloadAnalysis && aiSuggestions.length > 0) {
          confidence = 0.9;
        }
      } else {
        console.log('[AI Integration] No assignee found for task');
        // Add recommendations for unassigned tasks
        aiRecommendations = this.getFallbackSuggestions(task);
        confidence = 0.7;
      }

      const insights = {
        riskAnalysis,
        aiRecommendations,
        confidence
      };

      console.log('[AI Integration] Insights generated successfully, confidence:', confidence);
      return insights;

    } catch (error) {
      console.error('[AI Integration] Error generating insights:', error);
      return {
        riskAnalysis: { riskScore: 50, delayProbability: 30, insights: { riskLevel: 'MEDIUM', factors: ['Analysis failed'], suggestions: ['Please try again'] } },
        aiRecommendations: ['Unable to generate AI insights at this time'],
        confidence: 0
      };
    }
  }

  /**
   * Get AI-powered suggestions for task improvement
   */
  private static async getAISuggestions(task: any): Promise<string[]> {
    try {
      const context = {
        taskTitle: task.title,
        taskDescription: task.description,
        taskStatus: task.status,
        taskPriority: task.priority,
        assignee: task.assignee?.name,
        project: task.project?.name,
        subtaskCount: task.subTasks?.length || 0,
        dependencyCount: task.dependencies?.length || 0,
        dueDate: task.dueDate,
      };

      const result = await aiService.suggestNextActions(context);
      
      if (result.fallback) {
        // Return fallback suggestions when AI is not available
        return this.getFallbackSuggestions(task);
      }

      return result.suggestions || [];

    } catch (error) {
      console.error('[AI Integration] Error getting AI suggestions:', error);
      return this.getFallbackSuggestions(task);
    }
  }

  /**
   * Fallback suggestions when AI service is unavailable
   */
  private static getFallbackSuggestions(task: any): string[] {
    const suggestions: string[] = [];

    // Status-based suggestions
    if (task.status === 'TODO') {
      suggestions.push('Consider breaking this task into smaller subtasks');
      suggestions.push('Assign a due date to create urgency');
    } else if (task.status === 'IN_PROGRESS') {
      suggestions.push('Update progress regularly to maintain momentum');
      suggestions.push('Check for any blocking issues');
    } else if (task.status === 'BLOCKED') {
      suggestions.push('Identify and resolve blocking dependencies');
      suggestions.push('Consider reassigning if current assignee is stuck');
    }

    // Priority-based suggestions
    if (task.priority === 'URGENT' || task.priority === 'HIGH') {
      suggestions.push('Ensure adequate resources are allocated');
      suggestions.push('Monitor progress closely');
    }

    // Due date suggestions
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (daysUntilDue <= 3 && daysUntilDue > 0) {
        suggestions.push('Task is due soon - prioritize completion');
      } else if (daysUntilDue < 0) {
        suggestions.push('Task is overdue - escalate or renegotiate deadline');
      }
    }

    // Complexity suggestions
    if (task.subTasks && task.subTasks.length > 5) {
      suggestions.push('Consider breaking this into multiple main tasks');
    }

    if (task.dependencies && task.dependencies.length > 2) {
      suggestions.push('Monitor dependencies closely to avoid delays');
    }

    return suggestions;
  }

  /**
   * Suggest optimal assignee for a task
   */
  static async suggestTaskAssignee(taskId: string, teamId?: string): Promise<{userId: string, name: string, reason: string} | null> {
    try {
      // Get task details
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: true,
          team: true
        }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Get team members
      const teamMembers = await prisma.user.findMany({
        where: { 
          isActive: true,
          ...(teamId && { teamMemberships: { some: { teamId } } })
        },
        select: {
          id: true,
          name: true,
          skills: true,
          tasks: {
            where: {
              status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] }
            }
          }
        }
      });

      if (teamMembers.length === 0) {
        return null;
      }

      // Use AI to rank assignees if available
      const aiResult = await aiService.rankAssignees(
        { title: task.title, description: task.description || undefined },
        teamMembers.map((m: any) => ({
          id: m.id,
          name: m.name || 'Unknown',
          skills: m.skills || []
        }))
      );

      if (!aiResult.fallback && aiResult.bestMatchId) {
        const bestMember = teamMembers.find(m => m.id === aiResult.bestMatchId);
        if (bestMember) {
          return {
            userId: bestMember.id,
            name: bestMember.name || 'Unknown',
            reason: aiResult.reason || 'AI-recommended based on skills and workload'
          };
        }
      }

      // Fallback to workload-based suggestion
      const workloadSuggestion = await WorkloadEngine.suggestAssignee(teamId);
      if (workloadSuggestion) {
        return {
          userId: workloadSuggestion.userId,
          name: workloadSuggestion.name,
          reason: 'Recommended based on current workload capacity'
        };
      }

      return null;

    } catch (error) {
      console.error('[AI Integration] Error suggesting assignee:', error);
      return null;
    }
  }

  /**
   * Batch update AI insights for multiple tasks
   */
  static async batchUpdateInsights(taskIds: string[]): Promise<void> {
    console.log(`[AI Integration] Batch updating insights for ${taskIds.length} tasks`);

    for (const taskId of taskIds) {
      try {
        await this.generateTaskInsights(taskId);
      } catch (error) {
        console.error(`[AI Integration] Failed to update insights for task ${taskId}:`, error);
      }
    }
  }

  /**
   * Detect project bottlenecks using AI
   */
  static async detectProjectBottlenecks(projectId: string): Promise<any[]> {
    try {
      // Get project context
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tasks: {
            include: {
              assignee: true,
              subTasks: true
            }
          },
          manager: true
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const context = {
        projectName: project.name,
        projectStatus: project.status,
        taskCount: project.tasks.length,
        tasks: project.tasks.map(t => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          assignee: t.assignee?.name,
          subtaskCount: t.subTasks?.length || 0
        }))
      };

      const result = await aiService.detectBottlenecks(context);
      
      if (result.fallback) {
        return this.getFallbackBottlenecks(project.tasks);
      }

      return result.bottlenecks || [];

    } catch (error) {
      console.error('[AI Integration] Error detecting bottlenecks:', error);
      return [];
    }
  }

  /**
   * Fallback bottleneck detection
   */
  private static getFallbackBottlenecks(tasks: any[]): any[] {
    const bottlenecks: any[] = [];

    // Check for overdue tasks
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
    );

    if (overdueTasks.length > 0) {
      bottlenecks.push({
        level: 'HIGH',
        reason: `${overdueTasks.length} tasks are overdue`,
        suggestion: 'Review overdue tasks and reassign or update deadlines'
      });
    }

    // Check for users with too many high-priority tasks
    const userWorkload: { [key: string]: { name: string, urgentCount: number, totalCount: number }} = {};
    
    tasks.forEach(task => {
      if (task.assignee) {
        const userId = task.assignee.id;
        if (!userWorkload[userId]) {
          userWorkload[userId] = { name: task.assignee.name, urgentCount: 0, totalCount: 0 };
        }
        userWorkload[userId].totalCount++;
        if (task.priority === 'URGENT' || task.priority === 'HIGH') {
          userWorkload[userId].urgentCount++;
        }
      }
    });

    Object.values(userWorkload).forEach(workload => {
      if (workload.urgentCount > 3) {
        bottlenecks.push({
          level: 'MEDIUM',
          reason: `${workload.name} has ${workload.urgentCount} high-priority tasks`,
          suggestion: 'Redistribute some high-priority tasks to balance workload'
        });
      }
    });

    return bottlenecks;
  }
}

export default AIIntegrationEngine;

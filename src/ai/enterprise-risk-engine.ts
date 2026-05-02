import prisma from '@/lib/prisma';
import { aiService } from '@/ai/service';
import crypto from 'crypto';

// Types for risk analysis
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskAnalysis = {
  riskLevel: RiskLevel;
  delayProbability: number; // 0-1
  reasons: string[];
  recommendations: string[];
  factors: {
    deadlineProximity: number;
    priority: number;
    workload: number;
    historicalDelays: number;
    dependencies: number;
  };
  lastAnalyzed: Date;
  aiUsed: boolean;
};

export class EnterpriseRiskEngine {
  private static readonly RISK_THRESHOLDS = {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 1.0
  };

  /**
   * Main risk analysis function - deterministic + AI hybrid
   */
  static async analyzeTaskRisk(taskId: string, forceRefresh = false): Promise<RiskAnalysis> {
    try {
      console.log(`[RiskEngine] Analyzing task risk: ${taskId}, forceRefresh: ${forceRefresh}`);

      // Check cache first (unless forced refresh)
      if (!forceRefresh) {
        const cached = await this.getCachedRiskAnalysis(taskId);
        if (cached && this.isCacheValid(cached.lastAnalyzed)) {
          console.log(`[RiskEngine] Using cached risk analysis for task: ${taskId}`);
          return cached;
        }
      }

      // Get task with all required data
      const task = await this.getTaskWithDependencies(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Calculate deterministic factors
      const factors = await this.calculateRiskFactors(task);
      
      // Calculate base risk score deterministically
      let riskScore = this.calculateDeterministicRisk(factors);
      let aiUsed = false;
      let reasons = this.generateDeterministicReasons(factors);
      let recommendations = this.generateDeterministicRecommendations(factors);

      // Enhance with AI if available
      try {
        const aiInsights = await this.getAIInsights(task, factors);
        if (aiInsights) {
          // Blend AI insights with deterministic analysis
          riskScore = (riskScore * 0.7) + (aiInsights.riskScore * 0.3); // 70% deterministic, 30% AI
          reasons = [...reasons, ...aiInsights.reasons].slice(0, 8); // Limit to 8 reasons
          recommendations = [...recommendations, ...aiInsights.recommendations].slice(0, 6); // Limit to 6 recommendations
          aiUsed = true;
          console.log(`[RiskEngine] AI insights applied for task: ${taskId}`);
        }
      } catch (aiError) {
        console.warn(`[RiskEngine] AI analysis failed, using deterministic fallback:`, aiError);
        // Continue with deterministic analysis only
      }

      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);
      const delayProbability = Math.min(riskScore, 1.0);

      const analysis: RiskAnalysis = {
        riskLevel,
        delayProbability,
        reasons,
        recommendations,
        factors,
        lastAnalyzed: new Date(),
        aiUsed
      };

      // Cache the results
      await this.cacheRiskAnalysis(taskId, analysis);

      // Emit WebSocket event
      await this.emitRiskUpdate(taskId, analysis);

      console.log(`[RiskEngine] Risk analysis completed for task: ${taskId}, level: ${riskLevel}, score: ${riskScore.toFixed(3)}`);
      return analysis;

    } catch (error) {
      console.error(`[RiskEngine] Risk analysis failed for task: ${taskId}:`, error);
      
      // Return safe fallback analysis
      return this.getFallbackRiskAnalysis(taskId);
    }
  }

  /**
   * Calculate deterministic risk factors
   */
  private static async calculateRiskFactors(task: any): Promise<RiskAnalysis['factors']> {
    const now = new Date();
    
    // 1. Deadline proximity (0-1)
    let deadlineProximity = 0;
    if (task.dueDate) {
      const daysUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 0) {
        deadlineProximity = 1.0; // Overdue
      } else if (daysUntilDue < 1) {
        deadlineProximity = 0.9; // Due today/tomorrow
      } else if (daysUntilDue < 3) {
        deadlineProximity = 0.7; // Due within 3 days
      } else if (daysUntilDue < 7) {
        deadlineProximity = 0.5; // Due within a week
      } else if (daysUntilDue < 14) {
        deadlineProximity = 0.3; // Due within 2 weeks
      } else {
        deadlineProximity = 0.1; // Plenty of time
      }
    }

    // 2. Priority (0-1)
    const priorityMap = { LOW: 0.1, MEDIUM: 0.3, HIGH: 0.6, URGENT: 0.9 };
    const priority = priorityMap[task.priority as keyof typeof priorityMap] || 0.3;

    // 3. Assignee workload (0-1)
    let workload = 0;
    if (task.assigneeId) {
      const activeTasks = await prisma.task.count({
        where: {
          assigneeId: task.assigneeId,
          status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] },
          id: { not: task.id }
        }
      });
      workload = Math.min(activeTasks / 10, 1.0); // Normalize to 0-1 (10+ tasks = full workload)
    }

    // 4. Historical delay patterns (0-1)
    let historicalDelays = 0;
    if (task.assigneeId) {
      const completedTasks = await prisma.task.findMany({
        where: {
          assigneeId: task.assigneeId,
          status: 'DONE',
          dueDate: { not: null },
          completedAt: { not: null }
        },
        select: { dueDate: true, completedAt: true }
      });

      if (completedTasks.length > 0) {
        const delayedTasks = completedTasks.filter(t => 
          t.completedAt && t.dueDate && t.completedAt > t.dueDate
        );
        historicalDelays = delayedTasks.length / completedTasks.length;
      }
    }

    // 5. Dependencies (0-1)
    let dependencies = 0;
    if (task.taskDependencies && task.taskDependencies.length > 0) {
      const incompleteDeps = task.taskDependencies.filter((dep: any) => 
        dep.status !== 'DONE'
      ).length;
      dependencies = incompleteDeps / task.taskDependencies.length;
    }

    return {
      deadlineProximity,
      priority,
      workload,
      historicalDelays,
      dependencies
    };
  }

  /**
   * Calculate deterministic risk score from factors
   */
  private static calculateDeterministicRisk(factors: RiskAnalysis['factors']): number {
    // Weighted formula based on business logic
    const weights = {
      deadlineProximity: 0.35, // Most important
      priority: 0.20,
      workload: 0.20,
      historicalDelays: 0.15,
      dependencies: 0.10
    };

    return (
      factors.deadlineProximity * weights.deadlineProximity +
      factors.priority * weights.priority +
      factors.workload * weights.workload +
      factors.historicalDelays * weights.historicalDelays +
      factors.dependencies * weights.dependencies
    );
  }

  /**
   * Generate deterministic reasons based on factors
   */
  private static generateDeterministicReasons(factors: RiskAnalysis['factors']): string[] {
    const reasons: string[] = [];

    if (factors.deadlineProximity > 0.7) {
      reasons.push('Task is approaching deadline quickly');
    } else if (factors.deadlineProximity > 0.3) {
      reasons.push('Task has moderate deadline pressure');
    }

    if (factors.priority > 0.7) {
      reasons.push('High priority task requires attention');
    }

    if (factors.workload > 0.7) {
      reasons.push('Assignee has heavy current workload');
    } else if (factors.workload > 0.4) {
      reasons.push('Assignee has moderate workload');
    }

    if (factors.historicalDelays > 0.6) {
      reasons.push('Assignee has history of delayed tasks');
    }

    if (factors.dependencies > 0.5) {
      reasons.push('Task depends on incomplete dependencies');
    }

    if (reasons.length === 0) {
      reasons.push('Task appears to be on track');
    }

    return reasons;
  }

  /**
   * Generate deterministic recommendations
   */
  private static generateDeterministicRecommendations(factors: RiskAnalysis['factors']): string[] {
    const recommendations: string[] = [];

    if (factors.deadlineProximity > 0.7) {
      recommendations.push('Prioritize this task immediately');
      recommendations.push('Consider extending deadline if possible');
    }

    if (factors.workload > 0.7) {
      recommendations.push('Reassign some tasks to reduce workload');
      recommendations.push('Consider bringing in additional resources');
    }

    if (factors.dependencies > 0.5) {
      recommendations.push('Focus on completing dependencies first');
      recommendations.push('Review dependency chain for bottlenecks');
    }

    if (factors.historicalDelays > 0.6) {
      recommendations.push('Provide additional support to assignee');
      recommendations.push('Consider more frequent check-ins');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring task progress');
    }

    return recommendations;
  }

  /**
   * Get AI insights for enhanced analysis
   */
  private static async getAIInsights(task: any, factors: RiskAnalysis['factors']): Promise<{
    riskScore: number;
    reasons: string[];
    recommendations: string[];
  } | null> {
    if (!process.env.GROQ_API_KEY) {
      return null;
    }

    try {
      const prompt = `Analyze task risk and provide insights:
      
Task: ${task.title}
Description: ${task.description || 'No description'}
Status: ${task.status}
Priority: ${task.priority}
Due Date: ${task.dueDate || 'Not set'}
Assignee Workload: ${(factors.workload * 100).toFixed(0)}%
Historical Delay Rate: ${(factors.historicalDelays * 100).toFixed(0)}%
Dependencies: ${task.taskDependencies?.length || 0}

Current Risk Factors:
- Deadline Proximity: ${(factors.deadlineProximity * 100).toFixed(0)}%
- Priority Score: ${(factors.priority * 100).toFixed(0)}%
- Workload: ${(factors.workload * 100).toFixed(0)}%
- Historical Delays: ${(factors.historicalDelays * 100).toFixed(0)}%
- Dependencies: ${(factors.dependencies * 100).toFixed(0)}%

Provide JSON response:
{
  "riskScore": 0.5,
  "reasons": ["reason1", "reason2"],
  "recommendations": ["rec1", "rec2"]
}`;

      const response = await aiService.complete(prompt, {
        temperature: 0.3,
        maxTokens: 500
      });

      if (response && response.content) {
        try {
          const aiData = JSON.parse(response.content);
          return {
            riskScore: Math.max(0, Math.min(1, aiData.riskScore || 0.5)),
            reasons: Array.isArray(aiData.reasons) ? aiData.reasons : [],
            recommendations: Array.isArray(aiData.recommendations) ? aiData.recommendations : []
          };
        } catch (parseError) {
          console.warn('[RiskEngine] Failed to parse AI response:', parseError);
        }
      }
    } catch (error) {
      console.warn('[RiskEngine] AI service error:', error);
    }

    return null;
  }

  /**
   * Determine risk level from score
   */
  private static determineRiskLevel(score: number): RiskLevel {
    if (score <= this.RISK_THRESHOLDS.LOW) return 'LOW';
    if (score <= this.RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Get task with all dependencies for analysis
   */
  private static async getTaskWithDependencies(taskId: string) {
    return await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true } },
        taskDependencies: {
          select: { id: true, title: true, status: true, dueDate: true }
        },
        subTasks: {
          select: { id: true, status: true, assigneeId: true }
        }
      }
    });
  }

  /**
   * Cache risk analysis results
   */
  private static async cacheRiskAnalysis(taskId: string, analysis: RiskAnalysis) {
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          aiInsights: JSON.stringify(analysis),
          riskScore: analysis.delayProbability,
          updatedAt: new Date()
        }
      });
      console.log(`[RiskEngine] Cached risk analysis for task: ${taskId}`);
    } catch (error) {
      console.error(`[RiskEngine] Failed to cache risk analysis:`, error);
    }
  }

  /**
   * Get cached risk analysis
   */
  private static async getCachedRiskAnalysis(taskId: string): Promise<RiskAnalysis | null> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { aiInsights: true, updatedAt: true }
      });

      if (task?.aiInsights) {
        const analysis = JSON.parse(task.aiInsights) as RiskAnalysis;
        if (analysis.lastAnalyzed) {
          analysis.lastAnalyzed = new Date(analysis.lastAnalyzed);
        }
        return analysis;
      }
    } catch (error) {
      console.error(`[RiskEngine] Failed to get cached analysis:`, error);
    }
    return null;
  }

  /**
   * Check if cache is valid (less than 1 hour old)
   */
  private static isCacheValid(lastAnalyzed: Date): boolean {
    const cacheAge = Date.now() - lastAnalyzed.getTime();
    return cacheAge < (60 * 60 * 1000); // 1 hour
  }

  /**
   * Emit WebSocket event for risk update
   */
  private static async emitRiskUpdate(taskId: string, analysis: RiskAnalysis) {
    try {
      // This would integrate with your WebSocket system
      console.log(`[RiskEngine] Emitting RISK_UPDATED event for task: ${taskId}`);
      // TODO: Implement WebSocket emission
      // Example: riskEventBus.emit('RISK_UPDATED', { taskId, analysis });
    } catch (error) {
      console.error(`[RiskEngine] Failed to emit WebSocket event:`, error);
    }
  }

  /**
   * Get fallback risk analysis for errors
   */
  private static getFallbackRiskAnalysis(taskId: string): RiskAnalysis {
    return {
      riskLevel: 'MEDIUM',
      delayProbability: 0.5,
      reasons: ['Risk analysis temporarily unavailable', 'Using safe fallback assessment'],
      recommendations: ['Retry risk analysis later', 'Monitor task manually'],
      factors: {
        deadlineProximity: 0.5,
        priority: 0.5,
        workload: 0.5,
        historicalDelays: 0.5,
        dependencies: 0.5
      },
      lastAnalyzed: new Date(),
      aiUsed: false
    };
  }

  /**
   * Analyze multiple tasks (batch operation)
   */
  static async analyzeMultipleTasks(taskIds: string[]): Promise<Map<string, RiskAnalysis>> {
    const results = new Map<string, RiskAnalysis>();
    
    console.log(`[RiskEngine] Starting batch analysis for ${taskIds.length} tasks`);

    // Process in parallel with concurrency limit
    const concurrencyLimit = 5;
    for (let i = 0; i < taskIds.length; i += concurrencyLimit) {
      const batch = taskIds.slice(i, i + concurrencyLimit);
      
      const batchPromises = batch.map(async (taskId) => {
        try {
          const analysis = await this.analyzeTaskRisk(taskId);
          results.set(taskId, analysis);
        } catch (error) {
          console.error(`[RiskEngine] Batch analysis failed for task ${taskId}:`, error);
          results.set(taskId, this.getFallbackRiskAnalysis(taskId));
        }
      });

      await Promise.all(batchPromises);
    }

    console.log(`[RiskEngine] Batch analysis completed: ${results.size}/${taskIds.length} tasks analyzed`);
    return results;
  }
}

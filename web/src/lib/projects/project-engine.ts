import prisma from '@/lib/prisma';
import aiService from '@/ai/service';
import { Project, Task } from '@prisma/client';

export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';

export class ProjectEngine {
  /**
   * Calculate and update project progress based on tasks.
   */
  static async updateProgress(projectId: string): Promise<number> {
    const project = await (prisma.project as any).findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: {
            status: true,
            priority: true,
          }
        }
      }
    });

    if (!project || !project.tasks.length) return 0;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
    
    // Weighted progress based on priority
    // HIGH/URGENT tasks contribute more to the overall sense of completion? 
    // Or just a simple percentage for now to stay stable.
    const progress = Math.round((completedTasks / totalTasks) * 100);

    await (prisma.project as any).update({
      where: { id: projectId },
      data: { progress } as any
    });

    return progress;
  }

  /**
   * Determine project health status based on task deadlines and risks.
   */
  static async evaluateHealth(projectId: string): Promise<ProjectHealth> {
    const project = await (prisma.project as any).findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          where: { status: { not: 'DONE' } },
          select: {
            dueDate: true,
            riskScore: true,
          }
        }
      }
    });

    if (!project) return 'ON_TRACK';
    if (project.progress === 100 || project.status === 'COMPLETED') return 'COMPLETED';

    const now = new Date();
    const overdueTasks = project.tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now);
    const highRiskTasks = project.tasks.filter((t: any) => t.riskScore > 70);

    let health: ProjectHealth = 'ON_TRACK';

    if (overdueTasks.length > 3 || (project.tasks.length > 0 && overdueTasks.length / project.tasks.length > 0.3)) {
      health = 'DELAYED';
    } else if (overdueTasks.length > 0 || highRiskTasks.length > 0 || project.riskScore > 50) {
      health = 'AT_RISK';
    }

    await (prisma.project as any).update({
      where: { id: projectId },
      data: { healthStatus: health } as any
    });

    return health;
  }

  /**
   * Aggregate risk scores from tasks to project level.
   */
  static async aggregateRisk(projectId: string): Promise<number> {
    const project = await (prisma.project as any).findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          where: { status: { not: 'DONE' } },
          select: { riskScore: true }
        }
      }
    });

    if (!project || !project.tasks.length) return 0;

    const totalRisk = project.tasks.reduce((sum: number, t: any) => sum + (t.riskScore || 0), 0);
    const avgRisk = Math.round(totalRisk / project.tasks.length);
    
    // Add a boost factor if there are many tasks
    const riskScore = Math.min(100, avgRisk);

    await (prisma.project as any).update({
      where: { id: projectId },
      data: { riskScore } as any
    });

    return riskScore;
  }

  /**
   * Generate AI Insights for the project.
   */
  static async generateAIInsights(projectId: string) {
    const project = await (prisma.project as any).findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          take: 50,
          select: {
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            riskScore: true,
          }
        },
        manager: { select: { name: true } }
      }
    });

    if (!project) return null;

    try {
      const prompt = `
        Analyze this project and provide enterprise-grade insights.
        Project: ${project.name}
        Description: ${project.description}
        Status: ${project.status} (${project.healthStatus})
        Progress: ${project.progress}%
        Risk Score: ${project.riskScore}
        Task Summary: ${project.tasks.length} active tasks.
        
        Return JSON format:
        {
          "summary": "High-level overview",
          "risks": ["list of key risks"],
          "recommendations": ["actionable steps"],
          "nextActions": ["immediate tasks to focus on"],
          "predictedDelay": number (days)
        }
      `;

      const insights = await aiService.complete(prompt);
      
      await (prisma.project as any).update({
        where: { id: projectId },
        data: { 
          aiInsights: insights,
          predictedDelay: (insights as any).predictedDelay || 0
        } as any
      });

      return insights;
    } catch (error) {
      console.error('[ProjectEngine] AI Insights failed:', error);
      
      // Fallback rule-based insights
      const fallback = {
        summary: `${project.name} is currently ${project.healthStatus.toLowerCase().replace('_', ' ')}.`,
        risks: project.riskScore > 50 ? ["High aggregate risk across tasks"] : ["Standard project risks"],
        recommendations: ["Review overdue tasks", "Re-assign high-risk blockers"],
        nextActions: project.tasks.filter((t: any) => t.status !== 'DONE').slice(0, 2).map((t: any) => t.title),
        predictedDelay: project.healthStatus === 'DELAYED' ? 7 : 0
      };

      await (prisma.project as any).update({
        where: { id: projectId },
        data: { aiInsights: fallback } as any
      });

      return fallback;
    }
  }

  /**
   * Comprehensive project refresh.
   */
  static async refreshProject(projectId: string) {
    await this.updateProgress(projectId);
    await this.aggregateRisk(projectId);
    await this.evaluateHealth(projectId);
    return await this.generateAIInsights(projectId);
  }
}

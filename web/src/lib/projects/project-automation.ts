import prisma from '@/lib/prisma';
import { ProjectEngine } from './project-engine';
import { addJob } from '@/lib/queue';
import { createNotification } from '@/lib/notifications';

export class ProjectAutomation {
  /**
   * Auto update project status based on intelligence engine.
   */
  static async autoUpdateStatus(projectId: string) {
    const health = await ProjectEngine.evaluateHealth(projectId);
    
    // Map health to status if necessary. Currently status is ACTIVE/COMPLETED/etc.
    // If health is DELAYED, we might change status to DELAYED or AT_RISK.
    if (health === 'DELAYED' || health === 'AT_RISK') {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (project && project.status === 'ACTIVE') {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: health }
        });
        
        // Notify stakeholders
        await this.autoNotifyStakeholders(projectId, `Project status automatically updated to ${health} due to detected risks/delays.`);
      }
    }
  }

  /**
   * Auto trigger risk analysis for a project.
   */
  static async triggerRiskAnalysis(projectId: string) {
    // Re-aggregate risks
    const riskScore = await ProjectEngine.aggregateRisk(projectId);
    
    if (riskScore > 70) {
      // Regenerate AI insights due to high risk
      await ProjectEngine.generateAIInsights(projectId);
      await this.autoNotifyStakeholders(projectId, `High Risk Detected (Score: ${riskScore}). AI Insights have been updated with recommendations.`);
    }
  }

  /**
   * Auto notify stakeholders of important changes.
   */
  static async autoNotifyStakeholders(projectId: string, message: string) {
    const project = await (prisma.project as any).findUnique({
      where: { id: projectId },
      select: { managerId: true, tenantId: true, name: true, teamIds: true } as any
    });

    if (!project) return;

    // Notify Manager
    await createNotification({
      userId: project.managerId,
      tenantId: project.tenantId || 'default',
      type: 'WARNING',
      title: `Project Alert: ${project.name}`,
      message,
      link: `/projects/${projectId}`
    });

    // Notify Team (simplified - assumes teamIds are userIds for this context, 
    // or we'd need to fetch members of the teams)
    // For now, we'll queue a notification job or just notify manager.
  }

  /**
   * Run full automation suite on a project.
   */
  static async runSuite(projectId: string) {
    await ProjectEngine.refreshProject(projectId);
    await this.autoUpdateStatus(projectId);
    await this.triggerRiskAnalysis(projectId);
  }
}

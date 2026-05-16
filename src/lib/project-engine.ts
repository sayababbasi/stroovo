import prisma from '@/lib/prisma';

// AI & Risk Engine for Projects
export const ProjectEngine = {
  
  // 1. Calculate Project Risk Score
  calculateRiskScore: (project: any, tasks: any[], risks: any[]) => {
    let score = 0;
    
    // Factor 1: High severity risks logged
    const highRisks = risks.filter(r => r.impact === 'HIGH' && r.status === 'OPEN').length;
    score += highRisks * 15;
    
    // Factor 2: Delayed tasks
    const delayedTasks = tasks.filter(t => t.delayProbability > 50).length;
    score += delayedTasks * 10;
    
    // Factor 3: Progress vs Time elapsed
    const now = new Date().getTime();
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate || new Date()).getTime();
    
    if (end > start) {
      const timeElapsedPct = ((now - start) / (end - start)) * 100;
      if (timeElapsedPct > project.progress + 20) {
        score += 25; // Significantly behind schedule
      }
    }
    
    return Math.min(score, 100);
  },

  // 2. Predict Delay
  predictDelayDays: (project: any, tasks: any[]) => {
    if (!project.endDate) return 0;
    
    // Simplified model: if progress is behind time elapsed, calculate projected end date
    const now = new Date().getTime();
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    
    if (project.progress === 0 || now < start) return 0;
    
    const timeElapsed = now - start;
    const timePerPercent = timeElapsed / project.progress;
    
    const projectedTotalTime = timePerPercent * 100;
    const projectedEndDate = start + projectedTotalTime;
    
    if (projectedEndDate > end) {
      return Math.ceil((projectedEndDate - end) / (1000 * 60 * 60 * 24));
    }
    return 0;
  },

  // 3. Workload Engine
  analyzeWorkload: (tasks: any[]) => {
    const userLoads: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.assigneeId && t.status !== 'DONE') {
        userLoads[t.assigneeId] = (userLoads[t.assigneeId] || 0) + (t.estimatedHours || Math.max(t.progress, 1));
      }
    });
    
    const overloadedUsers = Object.entries(userLoads)
      .filter(([_, load]) => load > 40) // Threshold for overload
      .map(([id, load]) => ({ userId: id, load }));
      
    return overloadedUsers;
  },

  // 4. Recommendation Engine
  generateRecommendations: (project: any, tasks: any[], risks: any[], overloaded: any[]) => {
    const recs = [];
    
    if (overloaded.length > 0) {
      recs.push(`Reassign tasks from ${overloaded.length} overloaded team members.`);
    }
    
    const delayed = tasks.filter(t => t.delayProbability > 70);
    if (delayed.length > 0) {
      recs.push(`Accelerate development on ${delayed.length} delayed tasks.`);
    }
    
    if (project.riskScore > 60) {
      recs.push(`Move low-priority tasks to the next sprint to reduce scope.`);
    }
    
    if (recs.length === 0) {
      recs.push('Project is on track. Continue executing current plan.');
    }
    
    return recs;
  },

  // 5. Causal Analysis
  analyzeRootCause: (project: any, tasks: any[]) => {
    const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;
    const highRiskTasks = tasks.filter(t => t.riskScore > 70).length;
    
    const causes = [];
    if (blockedTasks > 0) causes.push(`${blockedTasks} tasks are currently blocked.`);
    if (highRiskTasks > 0) causes.push(`${highRiskTasks} high-risk tasks are slowing down progress.`);
    
    return causes;
  }
};

// AI-powered team insights and analytics

export interface TeamInsight {
  id: string;
  type: 'WORKLOAD_BALANCE' | 'PERFORMANCE_TREND' | 'RISK_DETECTION' | 'COLLABORATION_PATTERN' | 'PRODUCTIVITY_METRIC';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  data: any;
  recommendations: string[];
  createdAt: string;
}

export interface WorkloadAnalysis {
  memberId: string;
  memberName: string;
  currentTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalHours: number;
  efficiency: number;
  workloadScore: number;
  recommendations: string[];
}

export interface PerformanceTrend {
  period: string;
  completedTasks: number;
  avgCompletionTime: number;
  teamVelocity: number;
  qualityScore: number;
  bottlenecks: string[];
}

export interface RiskDetection {
  id: string;
  type: 'DEADLINE_RISK' | 'WORKLOAD_RISK' | 'DEPENDENCY_RISK' | 'SKILL_GAP' | 'RESOURCE_CONSTRAINT';
  title: string;
  description: string;
  probability: number;
  impact: number;
  affectedTasks: string[];
  mitigation: string[];
}

export interface CollaborationPattern {
  memberId: string;
  collaborationScore: number;
  communicationFrequency: number;
  peerReviews: number;
  knowledgeSharing: number;
  crossFunctionalWork: number;
  recommendations: string[];
}

export interface ProductivityMetric {
  metric: string;
  value: number;
  target: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  change: number;
  insights: string[];
}

class TeamInsightsEngine {
  // Generate comprehensive team insights
  async generateTeamInsights(teamId: string): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];
    
    try {
      // Fetch team data
      const teamData = await this.fetchTeamData(teamId);
      
      // Generate different types of insights
      const workloadInsights = await this.analyzeWorkload(teamData);
      const performanceInsights = await this.analyzePerformance(teamData);
      const riskInsights = await this.detectRisks(teamData);
      const collaborationInsights = await this.analyzeCollaboration(teamData);
      const productivityInsights = await this.calculateProductivityMetrics(teamData);
      
      insights.push(...workloadInsights, ...performanceInsights, ...riskInsights, ...collaborationInsights, ...productivityInsights);
      
      // Sort by severity and relevance
      return insights.sort((a, b) => {
        const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
      
    } catch (error) {
      console.error('Error generating team insights:', error);
      throw new Error('Failed to generate team insights');
    }
  }

  // Analyze team workload distribution
  private async analyzeWorkload(teamData: any): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];
    
    // Calculate workload distribution
    const workloads: WorkloadAnalysis[] = teamData.members.map((member: any) => {
      const memberTasks = teamData.tasks.filter((task: any) => task.assigneeId === member.id);
      const completedTasks = memberTasks.filter((task: any) => task.status === 'DONE');
      const overdueTasks = memberTasks.filter((task: any) => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
      );
      
      const workloadScore = this.calculateWorkloadScore(memberTasks.length, overdueTasks.length);
      const efficiency = completedTasks.length > 0 ? 
        completedTasks.length / memberTasks.length : 0;
      
      return {
        memberId: member.id,
        memberName: member.name,
        currentTasks: memberTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        totalHours: this.estimateTotalHours(memberTasks),
        efficiency,
        workloadScore,
        recommendations: this.generateWorkloadRecommendations(workloadScore, overdueTasks.length)
      };
    });

    // Identify workload imbalances
    const avgWorkload = workloads.reduce((sum, w) => sum + w.currentTasks, 0) / workloads.length;
    const overloadedMembers = workloads.filter(w => w.workloadScore > 0.8);
    const underloadedMembers = workloads.filter(w => w.workloadScore < 0.3);

    if (overloadedMembers.length > 0) {
      insights.push({
        id: `workload-overload-${Date.now()}`,
        type: 'WORKLOAD_BALANCE',
        title: 'Team Workload Imbalance Detected',
        description: `${overloadedMembers.length} team members are overloaded with tasks`,
        severity: overloadedMembers.length > workloads.length / 2 ? 'HIGH' : 'MEDIUM',
        data: { overloadedMembers, avgWorkload },
        recommendations: [
          'Redistribute tasks from overloaded members',
          'Consider bringing in additional resources',
          'Prioritize and defer non-critical tasks'
        ],
        createdAt: new Date().toISOString()
      });
    }

    if (underloadedMembers.length > 0) {
      insights.push({
        id: `workload-underload-${Date.now()}`,
        type: 'WORKLOAD_BALANCE',
        title: 'Underutilized Team Capacity',
        description: `${underloadedMembers.length} team members have low workload`,
        severity: 'LOW',
        data: { underloadedMembers, avgWorkload },
        recommendations: [
          'Assign more tasks to underloaded members',
          'Provide training and development opportunities',
          'Consider cross-training for better resource utilization'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }

  // Analyze team performance trends
  private async analyzePerformance(teamData: any): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];
    
    // Calculate performance metrics
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentTasks = teamData.tasks.filter((task: any) => 
      new Date(task.createdAt) >= last30Days
    );
    
    const completedTasks = recentTasks.filter((task: any) => task.status === 'DONE');
    const avgCompletionTime = this.calculateAvgCompletionTime(completedTasks);
    const teamVelocity = completedTasks.length / 4; // Weekly velocity
    const qualityScore = this.calculateQualityScore(completedTasks);

    // Identify performance trends
    const previousPeriod = new Date();
    previousPeriod.setDate(previousPeriod.getDate() - 60);
    
    const previousTasks = teamData.tasks.filter((task: any) => 
      new Date(task.createdAt) >= previousPeriod && new Date(task.createdAt) < last30Days
    );
    
    const previousCompleted = previousTasks.filter((task: any) => task.status === 'DONE');
    const previousVelocity = previousCompleted.length / 4;
    const velocityChange = ((teamVelocity - previousVelocity) / previousVelocity) * 100;

    if (velocityChange < -20) {
      insights.push({
        id: `performance-decline-${Date.now()}`,
        type: 'PERFORMANCE_TREND',
        title: 'Team Velocity Declining',
        description: `Team velocity has decreased by ${Math.abs(velocityChange).toFixed(1)}%`,
        severity: velocityChange < -40 ? 'HIGH' : 'MEDIUM',
        data: { currentVelocity: teamVelocity, previousVelocity, change: velocityChange },
        recommendations: [
          'Identify and remove blockers',
          'Review and optimize workflow processes',
          'Provide additional support and resources'
        ],
        createdAt: new Date().toISOString()
      });
    }

    if (avgCompletionTime > 7) { // Tasks taking more than a week
      insights.push({
        id: `completion-time-${Date.now()}`,
        type: 'PERFORMANCE_TREND',
        title: 'Extended Task Completion Times',
        description: `Average task completion time is ${avgCompletionTime.toFixed(1)} days`,
        severity: avgCompletionTime > 14 ? 'HIGH' : 'MEDIUM',
        data: { avgCompletionTime, tasksAnalyzed: completedTasks.length },
        recommendations: [
          'Break down large tasks into smaller subtasks',
          'Improve task definition and requirements clarity',
          'Implement daily standups to track progress'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }

  // Detect potential risks
  private async detectRisks(teamData: any): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];
    const risks: RiskDetection[] = [];

    // Deadline risks
    const upcomingDeadlines = teamData.tasks.filter((task: any) => {
      if (!task.dueDate || task.status === 'DONE') return false;
      const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue >= 0;
    });

    if (upcomingDeadlines.length > 0) {
      risks.push({
        id: `deadline-risk-${Date.now()}`,
        type: 'DEADLINE_RISK',
        title: 'Impending Deadlines',
        description: `${upcomingDeadlines.length} tasks have deadlines within 3 days`,
        probability: 0.8,
        impact: upcomingDeadlines.length > 5 ? 0.9 : 0.6,
        affectedTasks: upcomingDeadlines.map((task: any) => task.id),
        mitigation: [
          'Prioritize deadline-critical tasks',
          'Allocate additional resources if needed',
          'Communicate with stakeholders about potential delays'
        ]
      });
    }

    // Workload risks
    const overloadedMembers = teamData.members.filter((member: any) => {
      const memberTasks = teamData.tasks.filter((task: any) => task.assigneeId === member.id);
      return memberTasks.length > 10; // Threshold for overload
    });

    if (overloadedMembers.length > 0) {
      risks.push({
        id: `workload-risk-${Date.now()}`,
        type: 'WORKLOAD_RISK',
        title: 'Team Member Overload',
        description: `${overloadedMembers.length} team members are overloaded`,
        probability: 0.7,
        impact: 0.8,
        affectedTasks: overloadedMembers.flatMap((member: any) => 
          teamData.tasks.filter((task: any) => task.assigneeId === member.id).map((task: any) => task.id)
        ),
        mitigation: [
          'Redistribute workload across team',
          'Hire additional team members',
          'Implement workload caps'
        ]
      });
    }

    // Convert risks to insights
    risks.forEach(risk => {
      const severity = risk.probability * risk.impact > 0.6 ? 'HIGH' : 
                      risk.probability * risk.impact > 0.3 ? 'MEDIUM' : 'LOW';
      
      insights.push({
        id: risk.id,
        type: 'RISK_DETECTION',
        title: risk.title,
        description: risk.description,
        severity,
        data: risk,
        recommendations: risk.mitigation,
        createdAt: new Date().toISOString()
      });
    });

    return insights;
  }

  // Analyze collaboration patterns
  private async analyzeCollaboration(teamData: any): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];
    
    // This would analyze communication patterns, code reviews, shared documents, etc.
    // For now, we'll provide a placeholder implementation
    
    const collaborationScores = teamData.members.map((member: any) => ({
      memberId: member.id,
      collaborationScore: Math.random() * 100, // Placeholder - would calculate based on real data
      communicationFrequency: Math.floor(Math.random() * 50),
      peerReviews: Math.floor(Math.random() * 20),
      knowledgeSharing: Math.random() * 100,
      crossFunctionalWork: Math.floor(Math.random() * 10),
      recommendations: this.generateCollaborationRecommendations(Math.random() * 100)
    }));

    const lowCollaboration = collaborationScores.filter((score: any) => score.collaborationScore < 50);
    
    if (lowCollaboration.length > 0) {
      insights.push({
        id: `collaboration-low-${Date.now()}`,
        type: 'COLLABORATION_PATTERN',
        title: 'Low Team Collaboration Detected',
        description: `${lowCollaboration.length} team members show low collaboration metrics`,
        severity: 'MEDIUM',
        data: { lowCollaboration },
        recommendations: [
          'Encourage more team communication and knowledge sharing',
          'Implement regular team meetings and standups',
          'Create collaborative workspaces and tools'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }

  // Calculate productivity metrics
  private async calculateProductivityMetrics(teamData: any): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];
    
    const metrics: ProductivityMetric[] = [
      {
        metric: 'Tasks Completed per Week',
        value: teamData.tasks.filter((t: any) => t.status === 'DONE').length / 4,
        target: 20,
        trend: 'UP',
        change: 15,
        insights: ['Team is performing above target', 'Consider increasing targets']
      },
      {
        metric: 'Average Task Duration',
        value: this.calculateAvgCompletionTime(teamData.tasks.filter((t: any) => t.status === 'DONE')),
        target: 5,
        trend: 'DOWN',
        change: -10,
        insights: ['Task completion time is improving', 'Maintain current workflow']
      },
      {
        metric: 'Team Utilization',
        value: (teamData.tasks.filter((t: any) => t.status !== 'DONE').length / teamData.members.length) * 100,
        target: 80,
        trend: 'STABLE',
        change: 0,
        insights: ['Team utilization is optimal', 'Current workload is well-balanced']
      }
    ];

    // Generate insights for metrics that need attention
    metrics.forEach(metric => {
      if (metric.value < metric.target * 0.8) {
        insights.push({
          id: `productivity-${metric.metric.replace(/\s+/g, '-')}-${Date.now()}`,
          type: 'PRODUCTIVITY_METRIC',
          title: `${metric.metric} Below Target`,
          description: `Current value (${metric.value.toFixed(1)}) is below target (${metric.target})`,
          severity: 'MEDIUM',
          data: metric,
          recommendations: metric.insights,
          createdAt: new Date().toISOString()
        });
      }
    });

    return insights;
  }

  // Helper methods
  private async fetchTeamData(teamId: string): Promise<any> {
    // This would fetch real team data from the database
    // For now, return mock data
    return {
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
      ],
      tasks: [
        { id: '1', title: 'Task 1', status: 'DONE', assigneeId: '1', createdAt: new Date(), dueDate: new Date() },
        { id: '2', title: 'Task 2', status: 'IN_PROGRESS', assigneeId: '2', createdAt: new Date(), dueDate: new Date() },
        { id: '3', title: 'Task 3', status: 'TODO', assigneeId: '3', createdAt: new Date(), dueDate: new Date() }
      ]
    };
  }

  private calculateWorkloadScore(taskCount: number, overdueCount: number): number {
    // Simple algorithm to calculate workload score (0-1)
    const baseScore = Math.min(taskCount / 15, 1); // 15 tasks = full load
    const overduePenalty = overdueCount * 0.2;
    return Math.min(baseScore + overduePenalty, 1);
  }

  private generateWorkloadRecommendations(score: number, overdueCount: number): string[] {
    const recommendations: string[] = [];
    
    if (score > 0.8) {
      recommendations.push('Consider redistributing some tasks');
      recommendations.push('Prioritize overdue tasks');
    }
    
    if (overdueCount > 0) {
      recommendations.push('Address overdue tasks immediately');
      recommendations.push('Review task estimation process');
    }
    
    if (score < 0.3) {
      recommendations.push('Take on more challenging tasks');
      recommendations.push('Help overloaded team members');
    }
    
    return recommendations;
  }

  private estimateTotalHours(tasks: any[]): number {
    // Simple estimation: 2 hours per task + 1 hour per overdue task
    const overdueCount = tasks.filter(task => {
      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        return task.status !== 'DONE';
      }
      return false;
    }).length;
    
    return tasks.length * 2 + overdueCount * 1;
  }

  private calculateAvgCompletionTime(completedTasks: any[]): number {
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime();
      return sum + completionTime;
    }, 0);
    
    return totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private calculateQualityScore(completedTasks: any[]): number {
    // This would calculate quality based on rework, client feedback, etc.
    // For now, return a placeholder
    return Math.random() * 100;
  }

  private generateCollaborationRecommendations(score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 50) {
      recommendations.push('Increase team communication');
      recommendations.push('Participate in more code reviews');
      recommendations.push('Share knowledge with team members');
    }
    
    return recommendations;
  }
}

export const teamInsightsEngine = new TeamInsightsEngine();

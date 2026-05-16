import { TaskStatus, TaskPriority } from '@prisma/client';

// Enterprise Workload Engine for Team Optimization
// Analyzes team capacity, detects overload/underutilization, and suggests rebalancing

export interface UserWorkload {
  userId: string;
  userName: string;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalEstimatedHours: number;
  actualHoursSpent: number;
  utilizationRate: number; // 0-100%
  overloadRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  efficiency: number; // 0-100%, actual vs estimated time ratio
  skillCapacity: Map<string, number>; // Skills and their capacity
  availability: number; // 0-100%, availability for new tasks
  performance: {
    onTimeDelivery: number; // 0-100%
    qualityScore: number; // 0-100%
    avgTaskDuration: number; // hours
    throughput: number; // tasks per week
  };
}

export interface WorkloadAnalysis {
  teamId: string;
  totalTeamMembers: number;
  totalCapacity: number; // hours per week
  currentUtilization: number; // 0-100%
  workloadDistribution: UserWorkload[];
  imbalanceScore: number; // 0-100%, how imbalanced the workload is
  recommendations: WorkloadRecommendation[];
  riskFactors: string[];
  optimalAssignments: TaskAssignment[];
}

export interface WorkloadRecommendation {
  type: 'REASSIGN' | 'REDISTRIBUTE' | 'HIRE' | 'TRAIN' | 'PRIORITIZE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  impact: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  tasks: string[]; // Task IDs affected
  users: string[]; // User IDs affected
  estimatedBenefit: string;
}

export interface TaskAssignment {
  taskId: string;
  currentAssignee?: string;
  recommendedAssignee: string;
  confidence: number; // 0-100%
  reasons: string[];
  impact: {
    riskReduction: number; // percentage
    efficiencyGain: number; // percentage
    timeReduction: number; // hours
  };
}

export interface SkillMatch {
  userId: string;
  skillName: string;
  proficiency: number; // 0-100%
  experience: number; // years
  recentUsage: number; // 0-100%, how recently used
  capacity: number; // 0-100%, availability for this skill
}

export class WorkloadEngine {
  private static readonly WEEKLY_HOURS = 40;
  private static readonly UTILIZATION_TARGET = 85; // Target utilization rate
  private static readonly OVERLOAD_THRESHOLD = 100;
  private static readonly UNDERUTIL_THRESHOLD = 60;

  /**
   * Analyze team workload and capacity
   */
  public async analyzeTeamWorkload(
    tasks: any[],
    users: any[],
    historicalData?: any
  ): Promise<WorkloadAnalysis> {
    const userWorkloads = this.calculateUserWorkloads(tasks, users, historicalData);
    const teamMetrics = this.calculateTeamMetrics(userWorkloads);
    const recommendations = this.generateRecommendations(userWorkloads, tasks);
    const optimalAssignments = this.optimizeTaskAssignments(tasks, userWorkloads);
    const riskFactors = this.identifyRiskFactors(userWorkloads, teamMetrics);

    return {
      teamId: 'default-team', // Would come from context
      totalTeamMembers: users.length,
      totalCapacity: users.length * WorkloadEngine.WEEKLY_HOURS,
      currentUtilization: teamMetrics.utilization,
      workloadDistribution: userWorkloads,
      imbalanceScore: teamMetrics.imbalance,
      recommendations,
      riskFactors,
      optimalAssignments
    };
  }

  /**
   * Calculate individual user workloads
   */
  private calculateUserWorkloads(
    tasks: any[],
    users: any[],
    historicalData?: any
  ): UserWorkload[] {
    return users.map(user => {
      const userTasks = tasks.filter(task => task.assigneeId === user.id);
      const activeTasks = userTasks.filter(task => 
        task.status !== 'DONE' && task.status !== 'BACKLOG'
      );
      const completedTasks = userTasks.filter(task => task.status === 'DONE');

      const totalEstimatedHours = activeTasks.reduce((sum, task) => 
        sum + (task.estimatedHours || 8), 0
      );
      
      const actualHoursSpent = completedTasks.reduce((sum, task) => 
        sum + (task.actualHours || task.estimatedHours || 8), 0
      );

      const utilizationRate = (totalEstimatedHours / WorkloadEngine.WEEKLY_HOURS) * 100;
      const overloadRisk = this.determineOverloadRisk(utilizationRate, activeTasks.length);
      const efficiency = this.calculateEfficiency(completedTasks, historicalData);

      return {
        userId: user.id,
        userName: user.name,
        totalTasks: userTasks.length,
        activeTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        totalEstimatedHours,
        actualHoursSpent,
        utilizationRate: Math.min(100, utilizationRate),
        overloadRisk,
        efficiency,
        skillCapacity: this.calculateSkillCapacity(user, activeTasks),
        availability: Math.max(0, 100 - utilizationRate),
        performance: this.calculatePerformanceMetrics(user, userTasks, historicalData)
      };
    });
  }

  /**
   * Calculate team-level metrics
   */
  private calculateTeamMetrics(workloads: UserWorkload[]): {
    utilization: number;
    imbalance: number;
    overloadCount: number;
    underutilCount: number;
  } {
    const totalUtilization = workloads.reduce((sum, w) => sum + w.utilizationRate, 0);
    const utilization = totalUtilization / workloads.length;

    // Calculate imbalance (standard deviation of utilization rates)
    const avgUtilization = utilization;
    const variance = workloads.reduce((sum, w) => {
      return sum + Math.pow(w.utilizationRate - avgUtilization, 2);
    }, 0) / workloads.length;
    const imbalance = Math.sqrt(variance);

    const overloadCount = workloads.filter(w => w.utilizationRate > WorkloadEngine.OVERLOAD_THRESHOLD).length;
    const underutilCount = workloads.filter(w => w.utilizationRate < WorkloadEngine.UNDERUTIL_THRESHOLD).length;

    return { utilization, imbalance, overloadCount, underutilCount };
  }

  /**
   * Determine overload risk level
   */
  private determineOverloadRisk(utilizationRate: number, activeTasks: number): UserWorkload['overloadRisk'] {
    if (utilizationRate > 120 || activeTasks > 10) return 'CRITICAL';
    if (utilizationRate > 100 || activeTasks > 7) return 'HIGH';
    if (utilizationRate > 85 || activeTasks > 5) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate efficiency based on historical performance
   */
  private calculateEfficiency(completedTasks: any[], historicalData?: any): number {
    if (completedTasks.length === 0) return 85; // Default efficiency

    const totalEstimated = completedTasks.reduce((sum, task) => 
      sum + (task.estimatedHours || 8), 0
    );
    const totalActual = completedTasks.reduce((sum, task) => 
      sum + (task.actualHours || task.estimatedHours || 8), 0
    );

    // Efficiency: lower actual time vs estimated = higher efficiency
    const efficiency = totalEstimated > 0 ? (totalEstimated / totalActual) * 100 : 100;
    return Math.min(150, Math.max(50, efficiency)); // Clamp between 50-150%
  }

  /**
   * Calculate skill capacity for a user
   */
  private calculateSkillCapacity(user: any, activeTasks: any[]): Map<string, number> {
    const skillCapacity = new Map<string, number>();
    
    // Initialize with user's skills
    if (user.skills) {
      user.skills.forEach((skill: string) => {
        skillCapacity.set(skill, 100); // Full capacity for primary skills
      });
    }

    // Reduce capacity based on current task requirements
    activeTasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach((tag: string) => {
          const currentCapacity = skillCapacity.get(tag) || 0;
          skillCapacity.set(tag, Math.max(0, currentCapacity - 20)); // Reduce by 20% per task
        });
      }
    });

    return skillCapacity;
  }

  /**
   * Calculate performance metrics for a user
   */
  private calculatePerformanceMetrics(user: any, userTasks: any[], historicalData?: any): UserWorkload['performance'] {
    const completedTasks = userTasks.filter(task => task.status === 'DONE');
    
    // On-time delivery rate
    const onTimeTasks = completedTasks.filter(task => {
      if (!task.dueDate || !task.completedAt) return true;
      return new Date(task.completedAt) <= new Date(task.dueDate);
    });
    const onTimeDelivery = completedTasks.length > 0 ? 
      (onTimeTasks.length / completedTasks.length) * 100 : 85;

    // Quality score (would come from reviews/ratings in real system)
    const qualityScore = historicalData?.qualityScores?.[user.id] || 85;

    // Average task duration
    const avgTaskDuration = completedTasks.length > 0 ?
      completedTasks.reduce((sum, task) => sum + (task.actualHours || 8), 0) / completedTasks.length : 8;

    // Throughput (tasks per week)
    const weeksActive = historicalData?.weeksActive?.[user.id] || 1;
    const throughput = completedTasks.length / Math.max(1, weeksActive);

    return {
      onTimeDelivery,
      qualityScore,
      avgTaskDuration,
      throughput
    };
  }

  /**
   * Generate workload recommendations
   */
  private generateRecommendations(workloads: UserWorkload[], tasks: any[]): WorkloadRecommendation[] {
    const recommendations: WorkloadRecommendation[] = [];

    // Find overloaded users
    const overloadedUsers = workloads.filter(w => w.overloadRisk === 'HIGH' || w.overloadRisk === 'CRITICAL');
    const underutilizedUsers = workloads.filter(w => w.utilizationRate < WorkloadEngine.UNDERUTIL_THRESHOLD);

    // Reassignment recommendations
    overloadedUsers.forEach(overloaded => {
      const suitableTasks = tasks.filter(task => 
        task.assigneeId === overloaded.userId && 
        task.status !== 'DONE' && 
        task.status !== 'BACKLOG'
      );

      underutilizedUsers.forEach(underutilized => {
        if (suitableTasks.length > 0) {
          const taskToReassign = suitableTasks[0]; // Simplified - would use better matching
          
          recommendations.push({
            type: 'REASSIGN',
            priority: overloaded.overloadRisk === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
            description: `Reassign task "${taskToReassign.title}" from ${overloaded.userName} to ${underutilized.userName}`,
            impact: `Reduces ${overloaded.userName}'s workload by ${taskToReassign.estimatedHours || 8} hours`,
            effort: 'LOW',
            tasks: [taskToReassign.id],
            users: [overloaded.userId, underutilized.userId],
            estimatedBenefit: `${Math.round((taskToReassign.estimatedHours || 8) / WorkloadEngine.WEEKLY_HOURS * 100)}% workload reduction`
          });
        }
      });
    });

    // Hiring recommendations for chronic overload
    const chronicallyOverloaded = workloads.filter(w => 
      w.overloadRisk === 'HIGH' || w.overloadRisk === 'CRITICAL'
    );
    
    if (chronicallyOverloaded.length > 0 && underutilizedUsers.length === 0) {
      recommendations.push({
        type: 'HIRE',
        priority: 'MEDIUM',
        description: `Consider hiring additional team members to handle chronic workload imbalance`,
        impact: 'Addresses long-term capacity constraints and improves team scalability',
        effort: 'HIGH',
        tasks: [],
        users: chronicallyOverloaded.map(w => w.userId),
        estimatedBenefit: `Reduces team overload risk by ${chronicallyOverloaded.length * 20}%`
      });
    }

    // Training recommendations for skill gaps
    workloads.forEach(workload => {
      if (workload.efficiency < 70) {
        recommendations.push({
          type: 'TRAIN',
          priority: 'MEDIUM',
          description: `Provide training for ${workload.userName} to improve task efficiency`,
          impact: `Could improve efficiency by ${Math.round(100 - workload.efficiency)}%`,
          effort: 'MEDIUM',
          tasks: [],
          users: [workload.userId],
          estimatedBenefit: `${Math.round(100 - workload.efficiency)}% efficiency improvement`
        });
      }
    });

    return recommendations;
  }

  /**
   * Optimize task assignments across the team
   */
  private optimizeTaskAssignments(tasks: any[], workloads: UserWorkload[]): TaskAssignment[] {
    const assignments: TaskAssignment[] = [];
    const assignableTasks = tasks.filter(task => 
      task.status !== 'DONE' && 
      task.status !== 'BACKLOG' &&
      task.estimatedHours
    );

    assignableTasks.forEach(task => {
      const currentAssignee = workloads.find(w => w.userId === task.assigneeId);
      
      // Find better assignments if current assignee is overloaded
      if (currentAssignee && currentAssignee.overloadRisk !== 'LOW') {
        const betterAssignees = workloads.filter(w => 
          w.userId !== task.assigneeId &&
          w.utilizationRate < WorkloadEngine.OVERLOAD_THRESHOLD &&
          this.hasSkillMatch(w, task)
        );

        if (betterAssignees.length > 0) {
          const bestAssignee = betterAssignees.sort((a, b) => {
            // Prefer users with better performance and availability
            const scoreA = a.performance.onTimeDelivery * (a.availability / 100);
            const scoreB = b.performance.onTimeDelivery * (b.availability / 100);
            return scoreB - scoreA;
          })[0];

          assignments.push({
            taskId: task.id,
            currentAssignee: task.assigneeId,
            recommendedAssignee: bestAssignee.userId,
            confidence: this.calculateAssignmentConfidence(bestAssignee, task),
            reasons: [
              `Better availability (${bestAssignee.availability}% vs ${currentAssignee.availability}%)`,
              `Higher performance score (${bestAssignee.performance.onTimeDelivery}% vs ${currentAssignee.performance.onTimeDelivery}%)`
            ],
            impact: {
              riskReduction: Math.round((currentAssignee.utilizationRate - bestAssignee.utilizationRate) * 0.5),
              efficiencyGain: Math.round((bestAssignee.performance.onTimeDelivery - currentAssignee.performance.onTimeDelivery) * 0.3),
              timeReduction: Math.round(task.estimatedHours * (bestAssignee.efficiency - currentAssignee.efficiency) / 100)
            }
          });
        }
      }
    });

    return assignments;
  }

  /**
   * Check if user has skills matching task requirements
   */
  private hasSkillMatch(user: UserWorkload, task: any): boolean {
    if (!task.tags || task.tags.length === 0) return true; // No specific skill requirements
    
    return task.tags.some((tag: string) => 
      user.skillCapacity.has(tag) && user.skillCapacity.get(tag)! > 30
    );
  }

  /**
   * Calculate confidence score for task assignment
   */
  private calculateAssignmentConfidence(user: UserWorkload, task: any): number {
    let confidence = 50; // Base confidence

    // Availability factor
    confidence += (user.availability / 100) * 20;

    // Performance factor
    confidence += (user.performance.onTimeDelivery / 100) * 20;

    // Skill match factor
    if (task.tags) {
      const skillMatches = task.tags.filter((tag: string) => user.skillCapacity.has(tag)).length;
      confidence += (skillMatches / Math.max(1, task.tags.length)) * 10;
    }

    return Math.min(100, Math.round(confidence));
  }

  /**
   * Identify workload risk factors
   */
  private identifyRiskFactors(workloads: UserWorkload[], teamMetrics: any): string[] {
    const riskFactors: string[] = [];

    if (teamMetrics.overloadCount > 0) {
      riskFactors.push(`${teamMetrics.overloadCount} team members are overloaded`);
    }

    if (teamMetrics.underutilCount > 0) {
      riskFactors.push(`${teamMetrics.underutilCount} team members are underutilized`);
    }

    if (teamMetrics.imbalance > 30) {
      riskFactors.push('High workload imbalance across the team');
    }

    const lowPerformers = workloads.filter(w => w.performance.onTimeDelivery < 70);
    if (lowPerformers.length > 0) {
      riskFactors.push(`${lowPerformers.length} team members have low on-time delivery rates`);
    }

    const lowEfficiency = workloads.filter(w => w.efficiency < 70);
    if (lowEfficiency.length > 0) {
      riskFactors.push(`${lowEfficiency.length} team members have low task efficiency`);
    }

    return riskFactors;
  }

  /**
   * Get real-time workload status for a user
   */
  public async getUserWorkloadStatus(userId: string, tasks: any[]): Promise<UserWorkload | null> {
    const userTasks = tasks.filter(task => task.assigneeId === userId);
    if (userTasks.length === 0) return null;

    // This would typically fetch user data from database
    const mockUser = { id: userId, name: 'User', skills: [] };
    const workloads = this.calculateUserWorkloads(tasks, [mockUser]);
    
    return workloads[0] || null;
  }

  /**
   * Predict future workload based on upcoming tasks and trends
   */
  public async predictFutureWorkload(
    currentWorkloads: UserWorkload[],
    upcomingTasks: any[],
    weeksAhead: number = 4
  ): Promise<Map<string, number[]>> {
    const predictions = new Map<string, number[]>();

    currentWorkloads.forEach(workload => {
      const futureUtilization: number[] = [];
      let projectedHours = workload.totalEstimatedHours;

      for (let week = 1; week <= weeksAhead; week++) {
        // Add upcoming tasks for this week
        const weekTasks = upcomingTasks.filter(task => 
          task.assigneeId === workload.userId &&
          this.isTaskInWeek(task, week)
        );
        
        const weekHours = weekTasks.reduce((sum, task) => 
          sum + (task.estimatedHours || 8), 0
        );

        // Subtract completed tasks (simplified)
        const completedHours = (workload.actualHoursSpent / workload.completedTasks) * 
          Math.min(workload.activeTasks, 2); // Assume 2 tasks complete per week

        projectedHours = Math.max(0, projectedHours + weekHours - completedHours);
        const utilization = (projectedHours / WorkloadEngine.WEEKLY_HOURS) * 100;
        futureUtilization.push(Math.min(100, utilization));
      }

      predictions.set(workload.userId, futureUtilization);
    });

    return predictions;
  }

  /**
   * Check if a task falls within a specific future week
   */
  private isTaskInWeek(task: any, weekNumber: number): boolean {
    if (!task.startDate) return false;
    
    const now = new Date();
    const taskStart = new Date(task.startDate);
    const weekStart = new Date(now.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() + weekNumber * 7 * 24 * 60 * 60 * 1000);
    
    return taskStart >= weekStart && taskStart < weekEnd;
  }
}

// Singleton instance
export const workloadEngine = new WorkloadEngine();

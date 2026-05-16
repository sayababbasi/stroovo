/**
 * STROOVO STRATEGIC INTELLIGENCE ENGINE
 * Core decision-making layer for Goals & OKRs
 * Computes: risk_score, health_score, confidence_score, alerts, recommendations
 */

export interface KeyResultData {
  id: string;
  title: string;
  initialValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  weight: number;
  updatedAt: string | Date;
  goalId: string;
}

export interface GoalData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  progress: number;
  targetDate?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  ownerId: string;
  cycleId?: string | null;
  keyResults: KeyResultData[];
}

export interface ComputedKR {
  id: string;
  title: string;
  unit: string;
  weight: number;
  initialValue: number;
  currentValue: number;
  targetValue: number;
  progress: number;
  healthStatus: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' | 'COMPLETED';
  isStagnant: boolean;
  daysSinceUpdate: number;
  contribution: number; // percentage contribution to goal
}

export interface ComputedGoal {
  id: string;
  progress: number;
  riskScore: number;           // 0–100
  healthScore: number;         // 0–100
  confidenceScore: number;     // 0–100
  delayProbability: number;    // 0–100
  velocityScore: number;       // progress velocity (% per day)
  expectedCompletion: number;  // % expected at deadline
  daysRemaining: number;
  keyResults: ComputedKR[];
  riskFactors: RiskFactor[];
  alerts: StrategicAlert[];
  recommendations: Recommendation[];
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 0–100
  description: string;
}

export interface StrategicAlert {
  id: string;
  goalId: string;
  goalTitle: string;
  type: 'DEADLINE_RISK' | 'KR_STAGNATION' | 'VELOCITY_DROP' | 'UNBALANCED_KR' | 'CRITICAL_MISS' | 'ON_TRACK';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  detail?: string;
  timestamp: Date;
}

export interface Recommendation {
  id: string;
  action: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
  targetKR?: string;
}

export interface ExecutionSummary {
  activeGoals: number;
  atRiskGoals: number;
  criticalGoals: number;
  executionScore: number;       // 0–100
  avgConfidence: number;        // 0–100
  avgProgress: number;
  completionRate: number;
  velocityTrend: 'up' | 'down' | 'stable';
  totalAlerts: number;
  criticalAlerts: number;
}

// ─── Core Computation Functions ────────────────────────────────────────────────

export function computeKRProgress(kr: KeyResultData): number {
  const range = kr.targetValue - kr.initialValue;
  if (range === 0) return kr.currentValue >= kr.targetValue ? 100 : 0;
  const progress = ((kr.currentValue - kr.initialValue) / range) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function computeGoalProgress(keyResults: KeyResultData[]): number {
  if (!keyResults || keyResults.length === 0) return 0;
  const totalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 1), 0);
  const weightedProgress = keyResults.reduce((sum, kr) => {
    const progress = computeKRProgress(kr);
    return sum + progress * (kr.weight || 1);
  }, 0);
  return Math.round(weightedProgress / totalWeight);
}

function getDaysSinceUpdate(updatedAt: string | Date): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysRemaining(targetDate: string | Date | null | undefined): number {
  if (!targetDate) return 90; // default 90 days if no deadline
  const target = new Date(targetDate);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function computeVelocity(goal: GoalData): number {
  const createdAt = new Date(goal.createdAt);
  const now = new Date();
  const daysElapsed = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
  return goal.progress / daysElapsed; // % per day
}

function computeExpectedCompletion(goal: GoalData, daysRemaining: number): number {
  const velocity = computeVelocity(goal);
  return Math.min(100, Math.round(goal.progress + velocity * daysRemaining));
}

export function computeKRHealthStatus(kr: KeyResultData, progress: number, daysRemaining: number): 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' | 'COMPLETED' {
  if (progress >= 100) return 'COMPLETED';
  if (daysRemaining <= 0) return progress >= 100 ? 'COMPLETED' : 'CRITICAL';
  
  const daysSince = getDaysSinceUpdate(kr.updatedAt);
  if (daysSince >= 3 && progress < 50) return 'CRITICAL';
  if (daysSince >= 3) return 'AT_RISK';
  if (progress >= 70) return 'ON_TRACK';
  if (progress >= 40) return 'AT_RISK';
  return 'CRITICAL';
}

export function computeRiskScore(goal: GoalData, daysRemaining: number): number {
  let risk = 0;

  // Factor 1: Deadline pressure (0–30 pts)
  if (daysRemaining <= 0) risk += 30;
  else if (daysRemaining <= 7) risk += 25;
  else if (daysRemaining <= 14) risk += 15;
  else if (daysRemaining <= 30) risk += 8;

  // Factor 2: Progress deficit (0–35 pts)
  const velocity = computeVelocity(goal);
  const expectedAtDeadline = computeExpectedCompletion(goal, daysRemaining);
  if (expectedAtDeadline < 50) risk += 35;
  else if (expectedAtDeadline < 70) risk += 25;
  else if (expectedAtDeadline < 90) risk += 15;
  else if (expectedAtDeadline < 100) risk += 5;

  // Factor 3: KR stagnation (0–20 pts)
  const stagnantKRs = goal.keyResults.filter(kr => getDaysSinceUpdate(kr.updatedAt) >= 3);
  if (goal.keyResults.length > 0) {
    const stagnantRatio = stagnantKRs.length / goal.keyResults.length;
    risk += Math.round(stagnantRatio * 20);
  }

  // Factor 4: Low velocity (0–15 pts)
  if (velocity < 0.5 && daysRemaining > 14) risk += 15;
  else if (velocity < 1 && daysRemaining > 7) risk += 8;

  return Math.min(100, Math.round(risk));
}

export function computeHealthScore(goal: GoalData, riskScore: number, daysRemaining: number): number {
  // Health = inverse of risk + bonus for velocity + consistency
  const velocityScore = Math.min(30, Math.round(computeVelocity(goal) * 10));
  const progressScore = Math.round(goal.progress * 0.4); // up to 40 pts
  const riskPenalty = Math.round(riskScore * 0.7);        // scaled down
  const deadlineBonus = daysRemaining > 30 ? 10 : 0;

  const health = Math.max(0, Math.min(100, progressScore + velocityScore + deadlineBonus - riskPenalty + 30));
  return health;
}

export function computeConfidenceScore(goal: GoalData, healthScore: number, riskScore: number, expectedCompletion: number): number {
  // Confidence = reliability of prediction
  const krCount = goal.keyResults.length;
  const dataQuality = krCount > 0 ? Math.min(30, krCount * 6) : 10; // more KRs = more data = more confidence
  const healthContrib = Math.round(healthScore * 0.4);
  const riskPenalty = Math.round(riskScore * 0.3);
  const completionContrib = expectedCompletion >= 100 ? 30 : Math.round(expectedCompletion * 0.3);

  return Math.max(0, Math.min(100, dataQuality + healthContrib - riskPenalty + completionContrib - 20));
}

export function computeDelayProbability(riskScore: number, expectedCompletion: number, daysRemaining: number): number {
  if (expectedCompletion >= 100) return 0;
  const gap = 100 - expectedCompletion;
  const base = Math.min(90, gap + riskScore * 0.5);
  if (daysRemaining <= 0) return 95;
  return Math.round(Math.max(0, Math.min(95, base)));
}

export function generateRiskFactors(goal: GoalData, daysRemaining: number, velocity: number): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Velocity drop
  if (velocity < 0.3 && goal.progress < 80) {
    factors.push({
      factor: 'Low Execution Velocity',
      severity: velocity < 0.1 ? 'critical' : 'high',
      impact: Math.round((1 - velocity / 0.3) * 40),
      description: `Progress velocity is ${velocity.toFixed(2)}%/day — significantly below target pace`
    });
  }

  // KR Stagnation
  const stagnant = goal.keyResults.filter(kr => getDaysSinceUpdate(kr.updatedAt) >= 3);
  if (stagnant.length > 0) {
    factors.push({
      factor: 'Key Result Stagnation',
      severity: stagnant.length === goal.keyResults.length ? 'critical' : 'high',
      impact: Math.round((stagnant.length / Math.max(1, goal.keyResults.length)) * 35),
      description: `${stagnant.length} of ${goal.keyResults.length} KRs have had no progress updates in 3+ days`
    });
  }

  // Time pressure
  if (daysRemaining <= 14 && daysRemaining > 0 && goal.progress < 80) {
    factors.push({
      factor: 'Deadline Pressure',
      severity: daysRemaining <= 7 ? 'critical' : 'high',
      impact: Math.round((14 - daysRemaining) * 2.5),
      description: `Only ${daysRemaining} days remaining with ${goal.progress}% completion`
    });
  }

  // Overdue
  if (daysRemaining < 0) {
    factors.push({
      factor: 'Goal Overdue',
      severity: 'critical',
      impact: 100,
      description: `Deadline was ${Math.abs(daysRemaining)} days ago — immediate escalation required`
    });
  }

  // Unbalanced KRs
  if (goal.keyResults.length > 1) {
    const progresses = goal.keyResults.map(kr => computeKRProgress(kr));
    const max = Math.max(...progresses);
    const min = Math.min(...progresses);
    if (max - min > 50) {
      factors.push({
        factor: 'Unbalanced KR Contribution',
        severity: 'medium',
        impact: Math.round((max - min) * 0.3),
        description: `KR progress ranges from ${min}% to ${max}% — contribution is heavily skewed`
      });
    }
  }

  return factors;
}

export function generateAlerts(goal: GoalData, computed: Omit<ComputedGoal, 'alerts' | 'recommendations'>): StrategicAlert[] {
  const alerts: StrategicAlert[] = [];

  // Critical miss alert
  if (computed.delayProbability > 80) {
    alerts.push({
      id: `${goal.id}-critical-miss`,
      goalId: goal.id,
      goalTitle: goal.title,
      type: 'CRITICAL_MISS',
      severity: 'critical',
      message: `"${goal.title}" will miss deadline (${computed.delayProbability}% risk)`,
      detail: `Expected completion at deadline: ${computed.expectedCompletion}%`,
      timestamp: new Date()
    });
  } else if (computed.delayProbability > 50) {
    alerts.push({
      id: `${goal.id}-deadline-risk`,
      goalId: goal.id,
      goalTitle: goal.title,
      type: 'DEADLINE_RISK',
      severity: 'warning',
      message: `"${goal.title}" at risk of missing deadline (${computed.delayProbability}% probability)`,
      detail: `Current velocity: ${computed.velocityScore.toFixed(2)}%/day`,
      timestamp: new Date()
    });
  }

  // KR stagnation alerts
  const stagnantKRs = goal.keyResults.filter(kr => getDaysSinceUpdate(kr.updatedAt) >= 3);
  stagnantKRs.forEach(kr => {
    alerts.push({
      id: `${kr.id}-stagnation`,
      goalId: goal.id,
      goalTitle: goal.title,
      type: 'KR_STAGNATION',
      severity: getDaysSinceUpdate(kr.updatedAt) >= 7 ? 'critical' : 'warning',
      message: `KR stagnation detected: "${kr.title}" (${getDaysSinceUpdate(kr.updatedAt)} days with no progress)`,
      detail: `Current: ${kr.currentValue} / Target: ${kr.targetValue} ${kr.unit}`,
      timestamp: new Date()
    });
  });

  // Velocity drop
  if (computed.velocityScore < 0.3 && goal.progress < 90) {
    alerts.push({
      id: `${goal.id}-velocity`,
      goalId: goal.id,
      goalTitle: goal.title,
      type: 'VELOCITY_DROP',
      severity: 'warning',
      message: `Execution velocity dropped to ${computed.velocityScore.toFixed(2)}%/day for "${goal.title}"`,
      detail: 'Progress momentum has significantly slowed',
      timestamp: new Date()
    });
  }

  // Unbalanced KR distribution
  if (goal.keyResults.length > 1) {
    const progresses = goal.keyResults.map(kr => computeKRProgress(kr));
    const max = Math.max(...progresses);
    const min = Math.min(...progresses);
    if (max - min > 60) {
      alerts.push({
        id: `${goal.id}-unbalanced`,
        goalId: goal.id,
        goalTitle: goal.title,
        type: 'UNBALANCED_KR',
        severity: 'warning',
        message: `Unbalanced KR contribution in "${goal.title}"`,
        detail: `Range: ${min}%–${max}% — redistribute effort across KRs`,
        timestamp: new Date()
      });
    }
  }

  return alerts;
}

export function generateRecommendations(goal: GoalData, computed: Omit<ComputedGoal, 'recommendations'>): Recommendation[] {
  const recs: Recommendation[] = [];

  // Recommendation 1: Deadline / velocity issue
  if (computed.delayProbability > 60) {
    recs.push({
      id: `${goal.id}-rec-deadline`,
      action: computed.daysRemaining > 14 ? 'Double execution velocity on critical KRs immediately' : 'Adjust deadline or descope to avoid miss',
      rationale: `${computed.delayProbability}% chance of missing deadline at current pace`,
      priority: 'high',
    });
  }

  // Recommendation 2: Stagnant KR
  const mostStagnant = goal.keyResults
    .filter(kr => getDaysSinceUpdate(kr.updatedAt) >= 2)
    .sort((a, b) => getDaysSinceUpdate(b.updatedAt) - getDaysSinceUpdate(a.updatedAt))[0];

  if (mostStagnant) {
    recs.push({
      id: `${goal.id}-rec-kr`,
      action: `Increase effort on KR: "${mostStagnant.title}"`,
      rationale: `No progress in ${getDaysSinceUpdate(mostStagnant.updatedAt)} days — this KR is blocking overall goal`,
      priority: 'high',
      targetKR: mostStagnant.id
    });
  }

  // Recommendation 3: Rebalance
  if (goal.keyResults.length > 1) {
    const progresses = goal.keyResults.map(kr => ({ kr, p: computeKRProgress(kr) }));
    const fastest = progresses.reduce((a, b) => a.p > b.p ? a : b);
    const slowest = progresses.reduce((a, b) => a.p < b.p ? a : b);
    if (fastest.p - slowest.p > 50) {
      recs.push({
        id: `${goal.id}-rec-rebalance`,
        action: `Rebalance priorities — shift resources from "${fastest.kr.title}" to "${slowest.kr.title}"`,
        rationale: `${fastest.p}% vs ${slowest.p}% gap creates execution imbalance`,
        priority: 'medium',
        targetKR: slowest.kr.id
      });
    }
  }

  // Keep max 3 recommendations
  return recs.slice(0, 3);
}

// ─── Main Computation Entry Point ─────────────────────────────────────────────

export function computeGoalIntelligence(goal: GoalData): ComputedGoal {
  const daysRemaining = getDaysRemaining(goal.targetDate);
  const progress = goal.keyResults.length > 0 ? computeGoalProgress(goal.keyResults) : goal.progress;
  const velocity = computeVelocity({ ...goal, progress });
  const expectedCompletion = computeExpectedCompletion({ ...goal, progress }, daysRemaining);
  const riskScore = computeRiskScore({ ...goal, progress }, daysRemaining);
  const healthScore = computeHealthScore({ ...goal, progress }, riskScore, daysRemaining);
  const confidenceScore = computeConfidenceScore({ ...goal, progress }, healthScore, riskScore, expectedCompletion);
  const delayProbability = computeDelayProbability(riskScore, expectedCompletion, daysRemaining);
  const riskFactors = generateRiskFactors({ ...goal, progress }, daysRemaining, velocity);

  const computedKRs: ComputedKR[] = goal.keyResults.map((kr, idx) => {
    const krProgress = computeKRProgress(kr);
    const totalProgress = computeGoalProgress(goal.keyResults);
    return {
      id: kr.id,
      title: kr.title,
      unit: kr.unit,
      weight: kr.weight,
      initialValue: kr.initialValue,
      currentValue: kr.currentValue,
      targetValue: kr.targetValue,
      progress: krProgress,
      healthStatus: computeKRHealthStatus(kr, krProgress, daysRemaining),
      isStagnant: getDaysSinceUpdate(kr.updatedAt) >= 3,
      daysSinceUpdate: getDaysSinceUpdate(kr.updatedAt),
      contribution: totalProgress > 0 ? Math.round((krProgress * (kr.weight || 1)) / goal.keyResults.reduce((s, k) => s + (k.weight || 1), 0)) : 0
    };
  });

  const partialResult = {
    id: goal.id,
    progress,
    riskScore,
    healthScore,
    confidenceScore,
    delayProbability,
    velocityScore: velocity,
    expectedCompletion,
    daysRemaining,
    keyResults: computedKRs,
    riskFactors,
  };

  const alerts = generateAlerts(goal, partialResult);
  const recommendations = generateRecommendations(goal, { ...partialResult, alerts });

  return { ...partialResult, alerts, recommendations };
}

export function computeExecutionSummary(goals: GoalData[], computedGoals: ComputedGoal[]): ExecutionSummary {
  const active = goals.filter(g => g.status !== 'COMPLETED').length;
  const atRisk = computedGoals.filter(c => c.riskScore > 40).length;
  const critical = computedGoals.filter(c => c.riskScore > 70).length;
  const avgHealth = computedGoals.length > 0 ? Math.round(computedGoals.reduce((s, c) => s + c.healthScore, 0) / computedGoals.length) : 0;
  const avgConfidence = computedGoals.length > 0 ? Math.round(computedGoals.reduce((s, c) => s + c.confidenceScore, 0) / computedGoals.length) : 0;
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  const completionRate = goals.length > 0 ? Math.round(goals.filter(g => g.progress >= 100 || g.status === 'COMPLETED').length / goals.length * 100) : 0;
  const allAlerts = computedGoals.flatMap(c => c.alerts);

  // Velocity trend: compare avg velocity
  const velocities = computedGoals.map(c => c.velocityScore);
  const avgVel = velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;
  const velocityTrend: 'up' | 'down' | 'stable' = avgVel > 0.5 ? 'up' : avgVel < 0.2 ? 'down' : 'stable';

  return {
    activeGoals: active,
    atRiskGoals: atRisk,
    criticalGoals: critical,
    executionScore: avgHealth,
    avgConfidence,
    avgProgress,
    completionRate,
    velocityTrend,
    totalAlerts: allAlerts.length,
    criticalAlerts: allAlerts.filter(a => a.severity === 'critical').length
  };
}

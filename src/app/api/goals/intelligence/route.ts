import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  computeGoalIntelligence,
  computeExecutionSummary,
  GoalData
} from '@/engines/goals/intelligenceEngine';

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      where: { parentId: null },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        keyResults: true,
        projects: { select: { id: true, name: true, status: true } },
        cycle: { select: { id: true, name: true, startDate: true, endDate: true } },
        subGoals: {
          include: {
            owner: { select: { id: true, name: true, image: true } },
            keyResults: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute intelligence for each goal
    const computedGoals = goals.map(goal => computeGoalIntelligence(goal as GoalData));

    // Compute execution summary
    const summary = computeExecutionSummary(goals as GoalData[], computedGoals);

    // Merge computed intel back onto goals
    const enrichedGoals = goals.map((goal, idx) => ({
      ...goal,
      computed: computedGoals[idx]
    }));

    // Collect all alerts (global alert feed)
    const allAlerts = computedGoals.flatMap(c => c.alerts)
      .sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
      })
      .slice(0, 20); // cap at 20 alerts

    return NextResponse.json({
      goals: enrichedGoals,
      summary,
      alerts: allAlerts,
    });
  } catch (error) {
    console.error('Intelligence API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

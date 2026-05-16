import { NextRequest, NextResponse } from 'next/server';
import { teamInsightsEngine } from '@/lib/ai/team-insights';

// GET /api/team-insights - Get team insights
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Generate AI-powered team insights
    const insights = await teamInsightsEngine.generateTeamInsights(teamId);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating team insights:', error);
    return NextResponse.json({ error: 'Failed to generate team insights' }, { status: 500 });
  }
}

// POST /api/team-insights - Trigger insight generation (manual refresh)
export async function POST(request: NextRequest) {
  try {
    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Generate fresh insights
    const insights = await teamInsightsEngine.generateTeamInsights(teamId);

    // TODO: Emit WebSocket event for real-time updates
    // TODO: Cache insights for performance

    return NextResponse.json(insights, { status: 201 });
  } catch (error) {
    console.error('Error generating team insights:', error);
    return NextResponse.json({ error: 'Failed to generate team insights' }, { status: 500 });
  }
}

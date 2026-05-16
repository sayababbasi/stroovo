import { NextResponse } from 'next/server';
import { notificationTesting } from '@/notifications/testing';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { scenarioId } = body;
    
    if (scenarioId) {
      const scenarios = notificationTesting.getTestScenarios();
      const scenario = scenarios.find((s: any) => s.id === scenarioId);
      if (!scenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
      }
      const result = await notificationTesting.runTestScenario(scenario);
      return NextResponse.json(result);
    } else {
      const results = await notificationTesting.runAllTests();
      return NextResponse.json(results);
    }
  } catch (error: any) {
    console.error('Test API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const summary = notificationTesting.getTestSummary();
  const results = notificationTesting.getTestResults();
  const scenarios = notificationTesting.getTestScenarios();
  return NextResponse.json({ summary, results, scenarios });
}

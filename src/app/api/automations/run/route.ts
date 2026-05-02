import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const ruleId = String(body.ruleId || "");

    if (!ruleId) {
      return NextResponse.json({ error: "Rule id is required." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ruleId,
        status: "queued",
        message: "Automation run request accepted.",
        executedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in /api/automations/run:", error);
    return NextResponse.json(
      { error: "Failed to run automation." },
      { status: 500 },
    );
  }
}

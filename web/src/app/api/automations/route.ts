import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

interface StoredAutomationRule {
  id: string;
  name: string;
  description?: string | null;
  triggerEvent: string;
  condition?: unknown;
  action: string;
  isActive: boolean;
  updatedAt?: string | Date | null;
}

interface AutomationRuleDelegate {
  findMany: (args: {
    where: { tenantId: string };
    orderBy: { updatedAt: "desc" };
  }) => Promise<StoredAutomationRule[]>;
  update: (args: {
    where: { id: string };
    data: { isActive: boolean };
  }) => Promise<StoredAutomationRule>;
}

interface AutomationRuleDto {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastTriggered: string | null;
  triggerCount: number;
  source: "database" | "mock";
}

const mockRules: AutomationRuleDto[] = [
  {
    id: "mock-overdue-alert",
    name: "Task Overdue Alert",
    description: "Notify project owners when a task slips past its due date.",
    trigger: "TASK_OVERDUE",
    condition: "dueDate < now AND status != DONE",
    action: "NOTIFY_MANAGER",
    enabled: true,
    lastTriggered: null,
    triggerCount: 14,
    source: "mock",
  },
  {
    id: "mock-risk-escalation",
    name: "Risk Escalation",
    description: "Escalate high-risk projects for review.",
    trigger: "RISK_SCORE_HIGH",
    condition: "riskScore >= 75",
    action: "NOTIFY_MANAGER",
    enabled: true,
    lastTriggered: null,
    triggerCount: 7,
    source: "mock",
  },
  {
    id: "mock-new-task-routing",
    name: "New Task Routing",
    description: "Trigger the AI assignment flow when new urgent work arrives.",
    trigger: "TASK_CREATED",
    condition: "priority = URGENT",
    action: "SEND_WEBHOOK",
    enabled: false,
    lastTriggered: null,
    triggerCount: 2,
    source: "mock",
  },
];

function getAutomationDelegate(): AutomationRuleDelegate | null {
  const candidate = (prisma as unknown as { automationRule?: Partial<AutomationRuleDelegate> }).automationRule;
  if (!candidate?.findMany || !candidate?.update) return null;
  return candidate as AutomationRuleDelegate;
}

function mapRule(rule: StoredAutomationRule): AutomationRuleDto {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description || "Automation rule managed by the workflow engine.",
    trigger: rule.triggerEvent,
    condition:
      typeof rule.condition === "string"
        ? rule.condition
        : rule.condition
          ? JSON.stringify(rule.condition)
          : "No additional condition",
    action: rule.action,
    enabled: rule.isActive,
    lastTriggered: rule.updatedAt ? new Date(rule.updatedAt).toISOString() : null,
    triggerCount: 0,
    source: "database",
  };
}

export async function GET() {
  try {
    const headerList = await headers();
    const tenantId = headerList.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json({ success: true, data: mockRules });
    }

    const automationRule = getAutomationDelegate();
    if (!automationRule) {
      return NextResponse.json({ success: true, data: mockRules });
    }

    const rules = await automationRule.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" },
    });

    if (!Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json({ success: true, data: mockRules });
    }

    return NextResponse.json({
      success: true,
      data: rules.map(mapRule),
    });
  } catch (error) {
    console.error("Error in /api/automations:", error);
    return NextResponse.json({ success: true, data: mockRules });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const headerList = await headers();
    const tenantId = headerList.get("x-tenant-id");
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const id = String(body.id || "");
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: "enabled must be a boolean." }, { status: 400 });
    }
    const enabled = body.enabled;

    if (!id) {
      return NextResponse.json({ error: "Rule id is required." }, { status: 400 });
    }

    if (!tenantId) {
      return NextResponse.json({
        success: true,
        data: { id, enabled, source: "mock" },
      });
    }

    const automationRule = getAutomationDelegate();
    if (!automationRule) {
      return NextResponse.json({
        success: true,
        data: { id, enabled, source: "mock" },
      });
    }

    const rule = await automationRule.update({
      where: { id },
      data: { isActive: enabled },
    });

    return NextResponse.json({ success: true, data: mapRule(rule) });
  } catch (error) {
    console.error("Error updating automation rule:", error);
    return NextResponse.json(
      { error: "Failed to update automation rule." },
      { status: 500 },
    );
  }
}

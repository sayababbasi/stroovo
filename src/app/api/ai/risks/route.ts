import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { detectRisks } from "@/ai/risk";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");
    const tenantId = headerList.get("x-tenant-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [tasks, users] = await Promise.all([
      prisma.task.findMany({
        where: { tenantId: tenantId || undefined },
        include: {
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.user.findMany({
        where: { tenantId: tenantId || undefined },
        select: { id: true, name: true },
      }),
    ]);

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      assigneeId: task.assigneeId,
    }));

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
    }));

    const risks = await detectRisks({
      tasks: formattedTasks,
      users: formattedUsers,
    });

    return NextResponse.json({
      success: true,
      data: {
        risks,
        summary: {
          total: risks.length,
          high: risks.filter((risk) => risk.level === "HIGH").length,
          medium: risks.filter((risk) => risk.level === "MEDIUM").length,
          low: risks.filter((risk) => risk.level === "LOW").length,
          byType: {
            deadline: risks.filter((risk) => risk.type === "DEADLINE").length,
            workload: risks.filter((risk) => risk.type === "WORKLOAD").length,
            blocked: risks.filter((risk) => risk.type === "BLOCKED").length,
          },
        },
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/risks:", error);
    return NextResponse.json(
      {
        error: "Failed to detect risks",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Use GET to fetch risks." },
    { status: 405 },
  );
}

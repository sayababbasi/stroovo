import prisma from './prisma';
import { createNotification } from './notifications';

export type AutomationEvent = 'TASK_COMPLETED' | 'TASK_CREATED' | 'RISK_SCORE_HIGH' | 'STATUS_CHANGED';

export async function triggerAutomationEvent(
    event: AutomationEvent,
    tenantId: string,
    data: any
) {
    try {
        const rules = await (prisma as any).automationRule.findMany({
            where: {
                tenantId,
                triggerEvent: event,
                isActive: true
            }
        });

        for (const rule of rules) {
            // Basic condition check (if any)
            if (rule.condition) {
                const condition = rule.condition as any;
                // Simple equality check for now
                let match = true;
                for (const key in condition) {
                    if (data[key] !== condition[key]) {
                        match = false;
                        break;
                    }
                }
                if (!match) continue;
            }

            // Execute Action
            await executeAction(rule.action, tenantId, data, rule);
        }
    } catch (error) {
        console.error('Automation Engine Error:', error);
    }
}

async function executeAction(action: string, tenantId: string, data: any, rule: any) {
    switch (action) {
        case 'NOTIFY_MANAGER':
            // Find project manager if task-related
            if (data.projectId) {
                const project = await prisma.project.findUnique({
                    where: { id: data.projectId },
                    select: { managerId: true, name: true }
                });
                if (project?.managerId) {
                    await createNotification({
                        userId: project.managerId,
                        tenantId,
                        type: 'INFO',
                        title: `Automation: ${rule.name}`,
                        message: `Rule triggered by event on "${data.title || 'item'}".`,
                        link: data.id ? `/tasks?id=${data.id}` : undefined
                    });
                }
            }
            break;
        
        case 'SEND_WEBHOOK':
            // Placeholder for webhook support
            console.log(`[Automation] Sending webhook for rule ${rule.name}`);
            break;
            
        default:
            console.warn(`Unknown automation action: ${action}`);
    }
}

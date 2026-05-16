import { prisma } from '@/lib/prisma';
import { FeatureKey, PLANS } from './registry';

export async function getTenantPlan(tenantId: string) {
    const subscription = await (prisma as any).subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
    });

    if (!subscription || !subscription.plan) {
        return PLANS.STARTER;
    }

    return subscription.plan;
}

export async function hasFeatureAccess(tenantId: string, featureKey: FeatureKey): Promise<boolean> {
    const plan = await getTenantPlan(tenantId);
    
    // If it's a DB Plan model (it has features as a Json object)
    if (plan && typeof plan === 'object' && 'features' in plan) {
        const features = plan.features as Record<string, boolean>;
        return !!features[featureKey];
    }

    return false;
}

export async function checkUsageLimit(tenantId: string, limitKey: keyof typeof PLANS.STARTER.limits): Promise<boolean> {
    const plan = await getTenantPlan(tenantId);
    const usage = await (prisma as any).usageTracking.findUnique({
        where: { tenantId },
    });

    if (!usage) return true;

    if (!plan || typeof plan !== 'object') return true;

    const limits = (plan as any).limits as Record<string, number>;
    const limit = limits[limitKey];

    if (limit === undefined || limit === -1) return true; // Unlimited

    let currentUsage = 0;
    switch (limitKey) {
        case 'tasks':
            currentUsage = usage.tasksUsed;
            break;
        case 'teamMembers':
            currentUsage = usage.seatsUsed;
            break;
        case 'aiCredits':
            currentUsage = usage.aiCreditsUsed;
            break;
        case 'automations':
            currentUsage = usage.automationsUsed;
            break;
        case 'storage':
            currentUsage = Number(usage.storageUsed);
            break;
    }

    return currentUsage < limit;
}

import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('🚀 Seeding Executive Dashboard Data...');

    // Find a tenant and user to associate with
    const tenant = await prisma.tenant.findFirst();
    const user = await prisma.user.findFirst();

    if (!tenant || !user) {
        console.error('❌ Tenant or User not found. Please run core seed first.');
        return;
    }

    console.log(`Using Tenant: ${tenant.id}`);

    // 1. Seed Dashboard Metrics
    const metrics = [
        { name: 'Organization Health', value: 94, trend: 12, type: 'HEALTH', category: 'ORG' },
        { name: 'Execution Velocity', value: 82.4, trend: 8, type: 'VELOCITY', category: 'PROJECT' },
        { name: 'Risk Index', value: 14, trend: -18, type: 'RISK', category: 'AI' },
        { name: 'AI Efficiency Gain', value: 146.6, trend: 31, type: 'EFFICIENCY', category: 'AI' },
        { name: 'Revenue Impact', value: 428000, trend: 5.2, type: 'REVENUE', category: 'ORG' }
    ];

    for (const metric of metrics) {
        await (prisma as any).dashboardMetric.create({
            data: {
                ...metric,
                tenantId: tenant.id
            }
        });
    }

    // 2. Seed Executive Insights
    const insights = [
        {
            title: 'Backend Velocity Drop Detected',
            description: 'Velocity dropped 18% after workload increase. Potential burnout risk in 5 days if unaddressed.',
            impact: 'HIGH',
            category: 'WORKLOAD',
            confidence: 0.96,
            actionTaken: false
        },
        {
            title: 'Design System Bottleneck',
            description: 'QA review lag is delaying 3 critical path projects. AI suggests adding 1 peer reviewer.',
            impact: 'MEDIUM',
            category: 'BOTTLENECK',
            confidence: 0.92,
            actionTaken: true
        },
        {
            title: 'Efficiency Opportunity: QA',
            description: 'AI learned pattern: QA automation can handle 42% of manual regression tests. Saving 12hrs/week.',
            impact: 'HIGH',
            category: 'OPPORTUNITY',
            confidence: 0.89,
            actionTaken: false
        }
    ];

    for (const insight of insights) {
        await (prisma as any).executiveInsight.create({
            data: {
                ...insight,
                tenantId: tenant.id
            }
        });
    }

    console.log('✅ Executive Dashboard Data Seeded Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

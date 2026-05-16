import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StripeProvider } from '@/lib/billing/stripe';
import { BillingManager } from '@/lib/billing/provider';

const stripeProvider = new StripeProvider();
const billingManager = new BillingManager(stripeProvider);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
        return NextResponse.json({ success: false, error: 'Tenant ID is required' }, { status: 400 });
    }

    try {
        const subscription = await (prisma as any).subscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        });

        const usage = await (prisma as any).usageTracking.findUnique({
            where: { tenantId },
        });

        const invoices = await (prisma as any).invoice.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return NextResponse.json({
            success: true,
            subscription,
            usage,
            invoices,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { tenantId, planId, billingCycle, email, action } = body;

    try {
        if (action === 'subscribe') {
            const session = await billingManager.subscribe({
                tenantId,
                planId,
                billingCycle,
                email,
            });
            return NextResponse.json({ success: true, url: session.url });
        }

        if (action === 'portal') {
            const subscription = await prisma.subscription.findUnique({
                where: { tenantId },
            });
            
            if (!subscription?.stripeCustomerId) {
                return NextResponse.json({ success: false, error: 'No Stripe customer found' }, { status: 404 });
            }

            const session = await billingManager.openPortal(subscription.stripeCustomerId);
            return NextResponse.json({ success: true, url: session.url });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

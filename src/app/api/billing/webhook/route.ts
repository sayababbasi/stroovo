import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === 'checkout.session.completed') {
        const tenantId = session.metadata.tenantId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

        await prisma.subscription.update({
            where: { tenantId },
            data: {
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId,
                stripePriceId: stripeSubscription.items.data[0].price.id,
                status: 'ACTIVE',
                plan: 'PRO'
            }
        });
    }

    if (event.type === 'invoice.payment_succeeded') {
        // Handle renewal
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscriptionId = session.id;
        await prisma.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'CANCELED', plan: 'FREE' }
        });
    }

    return NextResponse.json({ received: true });
}

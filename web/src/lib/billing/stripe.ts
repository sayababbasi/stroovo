import Stripe from 'stripe';
import { PaymentProvider, SubscriptionParams } from './provider';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27' as any,
});

export class StripeProvider implements PaymentProvider {
    async createCheckoutSession(params: SubscriptionParams) {
        const session = await stripe.checkout.sessions.create({
            customer_email: params.email,
            client_reference_id: params.tenantId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: params.planId, // This would be the Stripe Price ID
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
            metadata: {
                tenantId: params.tenantId,
                planId: params.planId,
            },
        });

        return { url: session.url! };
    }

    async createPortalSession(customerId: string) {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
        });

        return { url: session.url };
    }

    async handleWebhook(payload: any, signature: string) {
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await this.handleSubscriptionCreated(session);
                break;
            case 'invoice.paid':
                const invoice = event.data.object as Stripe.Invoice;
                await this.handleInvoicePaid(invoice);
                break;
            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                await this.handleSubscriptionDeleted(subscription);
                break;
        }
    }

    async cancelSubscription(subscriptionId: string) {
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    }

    private async handleSubscriptionCreated(session: Stripe.Checkout.Session) {
        const tenantId = session.client_reference_id!;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        await (prisma as any).subscription.upsert({
            where: { tenantId },
            update: {
                stripeSubscriptionId,
                stripeCustomerId,
                status: 'ACTIVE',
            },
            create: {
                tenantId,
                stripeSubscriptionId,
                stripeCustomerId,
                status: 'ACTIVE',
            },
        });
    }

    private async handleInvoicePaid(invoice: Stripe.Invoice) {
        const stripeSubscriptionId = (invoice as any).subscription as string;
        
        if (stripeSubscriptionId) {
            await (prisma as any).subscription.update({
                where: { stripeSubscriptionId },
                data: {
                    status: 'ACTIVE',
                },
            });

            // Record Invoice in DB
            const subscription = await (prisma as any).subscription.findUnique({
                where: { stripeSubscriptionId },
            });

            if (subscription) {
                const line = invoice.lines.data[0];
                await (prisma as any).invoice.create({
                    data: {
                        tenantId: subscription.tenantId,
                        amount: invoice.amount_paid / 100,
                        currency: invoice.currency,
                        status: 'PAID',
                        invoiceUrl: invoice.hosted_invoice_url,
                        periodStart: line ? new Date(line.period.start * 1000) : new Date(),
                        periodEnd: line ? new Date(line.period.end * 1000) : new Date(),
                        paidAt: new Date(),
                    },
                });
            }
        }
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        await (prisma as any).subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: 'CANCELED',
                canceledAt: new Date(),
            } as any, // Cast to any because the client might still be refreshing
        });
    }
}

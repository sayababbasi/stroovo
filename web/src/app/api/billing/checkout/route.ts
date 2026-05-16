import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        const userId = headerList.get('x-user-id');

        if (!tenantId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { subscription: true }
        });

        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

        // Create or get Stripe Customer
        const t = tenant as any;
        let customerId = t.subscription?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                name: tenant.name,
                metadata: { tenantId }
            });
            customerId = customer.id;
            
            await prisma.subscription.upsert({
                where: { tenantId },
                update: { stripeCustomerId: customerId },
                create: { tenantId, stripeCustomerId: customerId }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PRICE_ID || 'price_placeholder',
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?canceled=true`,
            metadata: { tenantId }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

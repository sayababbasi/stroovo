export interface SubscriptionParams {
    tenantId: string;
    planId: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    email: string;
}

export interface PaymentProvider {
    createCheckoutSession(params: SubscriptionParams): Promise<{ url: string }>;
    createPortalSession(customerId: string): Promise<{ url: string }>;
    handleWebhook(payload: any, signature: string): Promise<void>;
    cancelSubscription(subscriptionId: string): Promise<void>;
}

export class BillingManager {
    private provider: PaymentProvider;

    constructor(provider: PaymentProvider) {
        this.provider = provider;
    }

    async subscribe(params: SubscriptionParams) {
        return this.provider.createCheckoutSession(params);
    }

    async openPortal(customerId: string) {
        return this.provider.createPortalSession(customerId);
    }
}

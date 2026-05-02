"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            const res = await fetch('/api/dashboard/summary');
            const data = await res.json();
            // Assuming we add subscription to the summary or fetch it separately
            setSubscription({ plan: 'FREE', status: 'ACTIVE' }); 
        };
        fetchSubscription();
    }, []);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/billing/checkout', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#172B4D' }}>Billing & Subscription</h1>
                <p style={{ color: '#6B778C', marginTop: '8px' }}>Manage your organization's plan and payment methods.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                {/* Current Plan */}
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#E6EFFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck color="#0052CC" size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6B778C' }}>Current Plan</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D' }}>{subscription?.plan || 'Free'} Plan</div>
                        </div>
                    </div>

                    <div style={{ fontSize: '14px', color: '#42526E', marginBottom: '32px' }}>
                        Your next billing date is not scheduled (Free Plan).
                    </div>

                    <button 
                        onClick={handleUpgrade}
                        disabled={loading}
                        style={{
                            background: '#0052CC',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading ? 'Processing...' : 'Upgrade to Pro'}
                        <CreditCard size={18} />
                    </button>
                </div>

                {/* Plan Details */}
                <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', marginBottom: '20px' }}>Pro Plan Features</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            'Unlimited Projects',
                            'AI-Powered Executive Insights',
                            'Advanced Team Analytics',
                            'Custom Branding',
                            'Priority Support'
                        ].map((feature, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#42526E' }}>
                                <div style={{ color: '#36B37E' }}><Check size={16} /></div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

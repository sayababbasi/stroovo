"use client";

import { useState, useEffect } from 'react';

export interface Branding {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
}

export function useBranding() {
    const [branding, setBranding] = useState<Branding>({
        logoUrl: '/logo.png',
        primaryColor: '#0052CC',
        secondaryColor: '#0747A6'
    });

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // In production, this would be fetched from /api/tenant/branding
                // or passed down from a context provider linked to the tenant
                const res = await fetch('/api/tenant/branding');
                if (res.ok) {
                    const data = await res.json();
                    setBranding({
                        logoUrl: data.logoUrl || '/logo.png',
                        primaryColor: data.primaryColor || '#0052CC',
                        secondaryColor: data.secondaryColor || '#0747A6'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch branding:', error);
            }
        };

        fetchBranding();
    }, []);

    return branding;
}

export const FEATURE_KEYS = {
    AI_INSIGHTS: 'ai_insights',
    AI_AUTOMATION: 'ai_automation',
    ADVANCED_DASHBOARDS: 'advanced_dashboards',
    TIMELINE_VIEW: 'timeline_view',
    GANTT_VIEW: 'gantt_view',
    CUSTOM_WORKFLOWS: 'custom_workflows',
    API_ACCESS: 'api_access',
    ROLE_PERMISSIONS: 'role_permissions',
    TIME_TRACKING: 'time_tracking',
    SSO_SAML: 'sso_saml',
    AUDIT_LOGS: 'audit_logs',
    SOC2_READY: 'soc2_ready',
    WHITE_LABELING: 'white_labeling',
    DEDICATED_SUPPORT: 'dedicated_support',
} as const;

export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];

export interface PlanDefinition {
    name: string;
    slug: string;
    priceMonthly: number;
    priceYearly: number;
    features: Record<FeatureKey, boolean>;
    limits: {
        teamMembers: number;
        workspaces: number;
        tasks: number;
        storage: number; // in bytes (e.g. 1GB = 1024 * 1024 * 1024)
        aiCredits: number;
        automations: number;
    };
}

export const PLANS: Record<string, PlanDefinition> = {
    STARTER: {
        name: 'Starter',
        slug: 'starter',
        priceMonthly: 0,
        priceYearly: 0,
        features: {
            [FEATURE_KEYS.AI_INSIGHTS]: false,
            [FEATURE_KEYS.AI_AUTOMATION]: false,
            [FEATURE_KEYS.ADVANCED_DASHBOARDS]: false,
            [FEATURE_KEYS.TIMELINE_VIEW]: false,
            [FEATURE_KEYS.GANTT_VIEW]: false,
            [FEATURE_KEYS.CUSTOM_WORKFLOWS]: false,
            [FEATURE_KEYS.API_ACCESS]: false,
            [FEATURE_KEYS.ROLE_PERMISSIONS]: false,
            [FEATURE_KEYS.TIME_TRACKING]: false,
            [FEATURE_KEYS.SSO_SAML]: false,
            [FEATURE_KEYS.AUDIT_LOGS]: false,
            [FEATURE_KEYS.SOC2_READY]: false,
            [FEATURE_KEYS.WHITE_LABELING]: false,
            [FEATURE_KEYS.DEDICATED_SUPPORT]: false,
        },
        limits: {
            teamMembers: 5,
            workspaces: 3,
            tasks: 100,
            storage: 1 * 1024 * 1024 * 1024, // 1GB
            aiCredits: 50,
            automations: 10,
        },
    },
    PRO: {
        name: 'Pro',
        slug: 'pro',
        priceMonthly: 29,
        priceYearly: 290, // 2 months free
        features: {
            [FEATURE_KEYS.AI_INSIGHTS]: true,
            [FEATURE_KEYS.AI_AUTOMATION]: true,
            [FEATURE_KEYS.ADVANCED_DASHBOARDS]: true,
            [FEATURE_KEYS.TIMELINE_VIEW]: true,
            [FEATURE_KEYS.GANTT_VIEW]: true,
            [FEATURE_KEYS.CUSTOM_WORKFLOWS]: true,
            [FEATURE_KEYS.API_ACCESS]: true,
            [FEATURE_KEYS.ROLE_PERMISSIONS]: true,
            [FEATURE_KEYS.TIME_TRACKING]: true,
            [FEATURE_KEYS.SSO_SAML]: false,
            [FEATURE_KEYS.AUDIT_LOGS]: false,
            [FEATURE_KEYS.SOC2_READY]: false,
            [FEATURE_KEYS.WHITE_LABELING]: false,
            [FEATURE_KEYS.DEDICATED_SUPPORT]: false,
        },
        limits: {
            teamMembers: -1, // Unlimited
            workspaces: -1,
            tasks: -1,
            storage: 100 * 1024 * 1024 * 1024, // 100GB
            aiCredits: 1000,
            automations: 500,
        },
    },
    ENTERPRISE: {
        name: 'Enterprise',
        slug: 'enterprise',
        priceMonthly: 99, // Starting price per org
        priceYearly: 990,
        features: {
            [FEATURE_KEYS.AI_INSIGHTS]: true,
            [FEATURE_KEYS.AI_AUTOMATION]: true,
            [FEATURE_KEYS.ADVANCED_DASHBOARDS]: true,
            [FEATURE_KEYS.TIMELINE_VIEW]: true,
            [FEATURE_KEYS.GANTT_VIEW]: true,
            [FEATURE_KEYS.CUSTOM_WORKFLOWS]: true,
            [FEATURE_KEYS.API_ACCESS]: true,
            [FEATURE_KEYS.ROLE_PERMISSIONS]: true,
            [FEATURE_KEYS.TIME_TRACKING]: true,
            [FEATURE_KEYS.SSO_SAML]: true,
            [FEATURE_KEYS.AUDIT_LOGS]: true,
            [FEATURE_KEYS.SOC2_READY]: true,
            [FEATURE_KEYS.WHITE_LABELING]: true,
            [FEATURE_KEYS.DEDICATED_SUPPORT]: true,
        },
        limits: {
            teamMembers: -1,
            workspaces: -1,
            tasks: -1,
            storage: 1024 * 1024 * 1024 * 1024, // 1TB
            aiCredits: -1, // Unlimited
            automations: -1,
        },
    },
};

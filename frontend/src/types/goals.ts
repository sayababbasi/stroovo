export interface Cycle {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'PLANNING';
}

export interface KeyResult {
    id: string;
    title: string;
    initialValue: number;
    currentValue: number;
    targetValue: number;
    unit: 'NUMBER' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';
    weight: number;
    goalId: string;
}

export interface Goal {
    id: string;
    title: string;
    description?: string;
    type: 'COMPANY' | 'TEAM' | 'INDIVIDUAL';
    status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
    progress: number;
    targetDate?: string;
    cycleId?: string | null;
    ownerId: string;
    owner: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    keyResults: KeyResult[];
    subGoals: Goal[];
    projects: { id: string; name: string; status: string }[];
    parentId?: string | null;
}

export interface Cycle {
  id: string;
  name: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  initialValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress?: number;
  healthStatus?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  progress: number;
  targetDate?: string | null;
  ownerId: string;
  cycleId?: string | null;
  owner?: { id: string; name?: string; email?: string; image?: string | null };
  cycle?: Cycle | null;
  keyResults?: KeyResult[];
  subGoals?: Goal[];
}

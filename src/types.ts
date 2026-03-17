export interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    startDate: string;
    endDate: string | null;
    managerId?: string;
    manager: {
        id?: string;
        name: string | null;
        email?: string;
    };
    tasks?: { id: string }[];
    isStarred?: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        tasks: number;
    };
}

export interface Task {
    id?: string;
    title: string;
    status: string;
    priority: string;
    type?: string;
    progress?: number;
    dueDate: string | null;
    createdAt?: string;
    description?: string;
    projectId?: string;
    project?: {
        id?: string;
        name: string;
    };
    assigneeId?: string;
    assignee?: {
        id?: string;
        name: string | null;
        image?: string | null;
    } | null;
    subTasks?: any[];
}

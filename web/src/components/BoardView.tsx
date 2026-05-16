'use client';

import KanbanBoard from '@/components/KanbanBoard';
import type { Task } from '@/types';

interface BoardViewProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, newStatus: string) => void;
}

export default function BoardView({ tasks, onTaskUpdate }: BoardViewProps) {
    return (
        <KanbanBoard
            tasks={tasks as any}
            onTaskUpdate={async (taskId, newStatus) => {
                onTaskUpdate(taskId, newStatus);
            }}
            onAddTask={() => {}}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
        />
    );
}

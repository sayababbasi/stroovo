"use client";

import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
    useDroppable
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, MessageSquare, Calendar, Users, Filter, LayoutGrid } from 'lucide-react';

import { Task } from '@/types';


interface BoardViewProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, newStatus: string) => void;
}

const getAvatarColor = (name: string | null | undefined) => {
    const colors = ['#36B37E', '#FFAB00', '#0052CC', '#FF5630', '#6554C0', '#00B8D9'];
    if (!name) return '#36B37E';
    return colors[name.charCodeAt(0) % colors.length];
};

const COLUMNS = [
    { id: 'TODO', title: 'New task', color: '#6B778C' },
    { id: 'SCHEDULED', title: 'Scheduled', color: '#FFAB00' },
    { id: 'IN_PROGRESS', title: 'In progress', color: '#0052CC' },
    { id: 'DONE', title: 'Completed', color: '#36B37E' },
];

// Droppable Column wrapper component
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { type: 'Column', columnId: id }
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                minHeight: '100px',
                background: isOver ? 'rgba(0, 82, 204, 0.08)' : 'transparent',
                borderRadius: '4px',
                transition: 'background 0.2s ease'
            }}
        >
            {children}
        </div>
    );
}

function SortableTaskItem({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id!,
        data: { type: 'Task', task, status: task.status }
    });

    const getTypeStyle = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'FEATURE': return { bg: '#F2F0FF', fg: '#6554C0', icon: 'F' };
            case 'BUG': return { bg: '#FFEBE6', fg: '#FF5630', icon: 'B' };
            case 'STORY': return { bg: '#FDF0F7', fg: '#C05494', icon: 'S' };
            case 'DESIGN': return { bg: '#E6EFFF', fg: '#0052CC', icon: 'D' };
            default: return { bg: '#E6FBFF', fg: '#00B8D9', icon: 'T' };
        }
    };

    const typeStyle = getTypeStyle(task.type || 'TASK');

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                background: 'white',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid #DFE1E6',
                marginBottom: '10px',
                cursor: 'grab',
                boxShadow: isDragging ? '0 8px 16px rgba(9, 30, 66, 0.15)' : '0 1px 2px rgba(9, 30, 66, 0.08)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}
            {...attributes}
            {...listeners}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: typeStyle.fg,
                    background: typeStyle.bg,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                }}>
                    {task.type || 'TASK'}
                </span>
                <button style={{ border: 'none', background: 'none', padding: '0', cursor: 'pointer', color: '#6B778C' }}>
                    <MoreHorizontal size={14} />
                </button>
            </div>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 500, color: '#172B4D', marginBottom: '16px', lineHeight: '1.4' }}>
                {task.title}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6B778C', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={12} />
                        <span>0</span>
                    </div>
                    {task.dueDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                </div>
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: getAvatarColor(task.assignee?.name),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: '2px solid #FFFFFF'
                }}>
                    {task.assignee?.name?.charAt(0) || 'U'}
                </div>
            </div>
        </div>
    );
}

// Task card for overlay (non-sortable version)
function TaskCard({ task }: { task: Task }) {
    return (
        <div
            style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #DFE1E6',
                cursor: 'grabbing',
                boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
                width: '100%'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#0052CC',
                    background: '#DEEBFF',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                }}>
                    {task.type || 'TASK'}
                </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#172B4D', marginBottom: '12px' }}>
                {task.title}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6B778C' }}>{task.project?.name || 'No Project'}</div>
            </div>
        </div>
    );
}

export default function BoardView({ tasks: initialTasks, onTaskUpdate }: BoardViewProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Sync local tasks with parent prop
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine the target column
        let targetColumn: string | null = null;

        // Check if dropped directly on a column
        if (COLUMNS.some(c => c.id === overId)) {
            targetColumn = overId;
        } else {
            // Dropped over a task - get that task's column
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                targetColumn = overTask.status;
            }
        }

        // Also check if the over element has column data
        if (!targetColumn && over.data.current?.type === 'Column') {
            targetColumn = over.data.current.columnId;
        }

        if (targetColumn && activeTask.status !== targetColumn) {
            // Optimistic update
            setTasks(prev => prev.map(t =>
                t.id === activeId ? { ...t, status: targetColumn! } : t
            ));
            onTaskUpdate(activeId, targetColumn);
        }
    };

    // Derived state for columns
    const columns = COLUMNS.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.status === col.id)
    }));

    // For drag overlay
    const activeTask = tasks.find(t => t.id === activeId);

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div style={{ display: 'flex', gap: '20px', overflowX: 'hidden', padding: '20px 0', alignItems: 'flex-start' }}>
                {columns.map(col => (
                    <div key={col.id} style={{ flex: 1, minWidth: '0', background: '#F4F5F7', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        textTransform: 'uppercase',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#42526E',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {col.title}
                                    </div>
                                    <div style={{
                                        background: '#EBECF0',
                                        borderRadius: '10px',
                                        padding: '2px 8px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#42526E'
                                    }}>
                                        {col.tasks.length}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px' }}>
                                        <Plus size={16} />
                                    </button>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px' }}>
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>

                        <DroppableColumn id={col.id}>
                            <SortableContext
                                id={col.id}
                                items={col.tasks.map(t => t.id!)}
                                strategy={verticalListSortingStrategy}
                            >
                                {col.tasks.length === 0 ? (
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#6B778C',
                                        fontSize: '12px',
                                        border: '2px dashed #DFE1E6',
                                        borderRadius: '4px',
                                        minHeight: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        Drop tasks here
                                    </div>
                                ) : (
                                    col.tasks.map(task => (
                                        <SortableTaskItem key={task.id} task={task} />
                                    ))
                                )}
                            </SortableContext>
                        </DroppableColumn>
                    </div>
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}

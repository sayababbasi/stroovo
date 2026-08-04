"use client";

import React, { useState, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Database, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

// Basic Type Definitions based on Prisma Schema includes
export type ProjectTask = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    type: string;
    dueDate: string | null;
    storyPoints: number | null;
    assignee: { id: string, name: string | null, image: string | null } | null;
    subtasks?: any[];
    subTasks?: any[];
    dependencies?: any[];
    dependedBy?: any[];
    riskScore: number;
    progress: number;
    _count?: { comments: number, files: number };
    delayProbability?: number;
    tags?: string[];
    startDate?: string | null;
};

// Task Card Component (Sortable item)
const SortableTaskCard = ({ task, onClick }: { task: ProjectTask, onClick?: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: task });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={{ ...style, padding: '14px', marginBottom: '10px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '8px', boxShadow: '0 1px 2px rgba(9,30,66,0.05)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '12px' }}
            {...attributes} 
            {...listeners}
            onClick={onClick}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', margin: '0 0 6px 0', lineHeight: 1.4 }}>{task.title}</h4>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0052CC', padding: '2px 6px', borderRadius: '4px', background: `#0052CC15` }}>{task.type}</span>
                </div>
                <MoreVertical size={14} color="#8A94A6" style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                {task.assignee?.image ? (
                    <img src={task.assignee.image} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                ) : (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                        {task.assignee?.name?.charAt(0) || '?'}
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {task.storyPoints != null && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 600, color: '#6B778C' }}>
                            <Database size={12} /> {task.storyPoints} SP
                        </span>
                    )}
                    {task.riskScore > 50 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px', fontWeight: 700, color: '#BF2600', background: '#FFF0F0', padding: '2px 6px', borderRadius: '4px' }}>
                            <AlertTriangle size={10} /> High Risk
                        </span>
                    )}
                    {task.status === 'DONE' && (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#36B37E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={10} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Column Component
const KanbanColumn = ({ id, name, tasks, color, active, onAddTask }: { id: string, name: string, tasks: ProjectTask[], color: string, active?: boolean, onAddTask: (status: string) => void }) => {
    const totalSP = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    return (
        <div className="k-col" style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="k-header" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0', border: '1px solid #DFE1E6', borderBottom: 'none', background: active ? '#FFFBEB' : 'white', borderColor: active ? '#F59E0B' : '#DFE1E6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{name}</span>
                    <span style={{ fontSize: 11, background: '#EBECF0', padding: '2px 6px', borderRadius: 10, color: '#42526E', fontWeight: 600 }}>{tasks.length}</span>
                </div>
                <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>{totalSP} SP</span>
            </div>
            
            <div className="k-body" style={{ padding: '10px', background: active ? '#FFFBEB' : '#F4F5F7', border: '1px solid #DFE1E6', borderTop: 'none', borderRadius: '0 0 8px 8px', minHeight: '400px', display: 'flex', flexDirection: 'column', borderColor: active ? '#F59E0B' : '#DFE1E6' }}>
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
                <button onClick={() => onAddTask(id)} style={{ background: 'transparent', border: 'none', color: '#6B778C', fontSize: 12, fontWeight: 600, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 'auto' }}>
                    <Plus size={14} /> Add Task
                </button>
            </div>
        </div>
    );
};

const DroppableColumn = ({ id, items, children }: { id: string, items: string[], children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef}>{children}</div>
        </SortableContext>
    );
};

export default function TaskBoard({ 
    tasks, 
    onTaskMove,
    onAddTask,
    onTaskClick
}: { 
    tasks: ProjectTask[], 
    onTaskMove: (taskId: string, newStatus: string) => void,
    onAddTask: (status: string) => void,
    onTaskClick?: (task: ProjectTask) => void
}) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const columns = useMemo(() => {
        return {
            TODO: tasks.filter(t => t.status === 'TODO'),
            IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
            REVIEW: tasks.filter(t => t.status === 'REVIEW'),
            DONE: tasks.filter(t => t.status === 'DONE'),
        };
    }, [tasks]);

    const activeTask = useMemo(() => tasks.find(t => t.id === activeId), [activeId, tasks]);

    // Sensors for DND
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the column the item was dropped into
        // overId could be a task ID or a column ID (TODO, IN_PROGRESS, etc)
        let newStatus = overId;
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
            newStatus = overTask.status;
        }

        const activeTask = tasks.find(t => t.id === activeId);
        if (activeTask && activeTask.status !== newStatus) {
            onTaskMove(activeId, newStatus);
        }
    };

    const statusColors: any = {
        TODO: { header: '#DFE1E6', line: '#8A94A6' },
        IN_PROGRESS: { header: '#DEEBFF', line: '#0052CC' },
        REVIEW: { header: '#EAE6FF', line: '#8B5CF6' },
        DONE: { header: '#E3FCEF', line: '#10B981' }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, paddingBottom: 16 }}>
                {Object.entries(columns).map(([columnId, columnTasks]) => (
                    <div key={columnId} style={{ display: 'flex', flexDirection: 'column', width: '320px', flexShrink: 0, background: '#F4F5F7', borderRadius: '10px', maxHeight: '100%' }}>
                        
                        {/* COLUMN HEADER */}
                        <div style={{ padding: '16px', borderBottom: `3px solid ${statusColors[columnId].line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', margin: 0 }}>{columnId.replace('_', ' ')}</h3>
                                <span style={{ background: '#DFE1E6', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: '#42526E' }}>{columnTasks.length}</span>
                            </div>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }} onClick={() => onAddTask(columnId)}><Plus size={16} /></button>
                        </div>
                        
                        {/* COLUMN BODY (DROPPABLE) */}
                        <DroppableColumn id={columnId} items={columnTasks.map(t => t.id)}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', minHeight: '100px' }}>
                                {columnTasks.map(task => (
                                    <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick && onTaskClick(task)} />
                                ))}
                            </div>
                        </DroppableColumn>
                    </div>
                ))}
            </div>
            
            {/* DRAG OVERLAY */}
            <DragOverlay>
                {activeTask ? <div style={{ opacity: 0.8 }}><SortableTaskCard task={activeTask} /></div> : null}
            </DragOverlay>
        </DndContext>
    );
}

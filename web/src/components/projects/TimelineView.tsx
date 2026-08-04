"use client";

import React, { useMemo } from 'react';
import { ProjectTask } from './TaskBoard';
import { format, differenceInDays, startOfDay, addDays, isWithinInterval } from 'date-fns';

export default function TimelineView({ 
    tasks,
    onTaskClick
}: { 
    tasks: ProjectTask[],
    onTaskClick?: (task: ProjectTask) => void
}) {
    // Basic timeline calculation
    // Find min and max dates
    const timelineData = useMemo(() => {
        let minDate = new Date();
        let maxDate = new Date();
        
        const validTasks = tasks.filter(t => t.startDate && t.dueDate).map(t => {
            const start = new Date(t.startDate!);
            const end = new Date(t.dueDate!);
            if (start < minDate) minDate = start;
            if (end > maxDate) maxDate = end;
            return { ...t, start, end };
        });

        // Add some padding
        minDate = addDays(startOfDay(minDate), -3);
        maxDate = addDays(startOfDay(maxDate), 14);

        const totalDays = differenceInDays(maxDate, minDate);
        
        // Generate an array of dates for the header
        const days = Array.from({ length: totalDays + 1 }).map((_, i) => addDays(minDate, i));

        return { minDate, maxDate, totalDays, days, validTasks };
    }, [tasks]);

    const { minDate, totalDays, days, validTasks } = timelineData;

    const statusColors: any = {
        TODO: '#0052CC',
        IN_PROGRESS: '#F59E0B',
        REVIEW: '#8B5CF6',
        DONE: '#10B981',
        BACKLOG: '#6B778C'
    };

    return (
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6', background: '#FAFBFC', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ width: 250, flexShrink: 0, borderRight: '1px solid #DFE1E6', padding: '12px 16px', fontWeight: 600, color: '#6B778C', fontSize: 12, display: 'flex', alignItems: 'center' }}>
                    Task
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                    {days.map((day, i) => (
                        <div key={i} style={{ 
                            minWidth: 40, flex: 1, padding: '8px 0', textAlign: 'center', 
                            borderRight: '1px solid #EBECF0', fontSize: 10, color: '#8A94A6',
                            background: [0, 6].includes(day.getDay()) ? '#F4F5F7' : 'transparent' 
                        }}>
                            <div>{format(day, 'MMM')}</div>
                            <div style={{ fontWeight: 700, color: '#172B4D', fontSize: 12, marginTop: 2 }}>{format(day, 'd')}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                {validTasks.map((task) => {
                    const leftOffsetDays = differenceInDays(task.start, minDate);
                    const durationDays = differenceInDays(task.end, task.start) + 1;
                    
                    const leftPercent = (leftOffsetDays / totalDays) * 100;
                    const widthPercent = (durationDays / totalDays) * 100;

                    return (
                        <div key={task.id} style={{ display: 'flex', borderBottom: '1px solid #EBECF0', minHeight: 48 }}>
                            {/* Task Name */}
                            <div style={{ 
                                width: 250, flexShrink: 0, borderRight: '1px solid #DFE1E6', padding: '0 16px', 
                                display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#172B4D',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: statusColors[task.status], marginRight: 8 }} />
                                {task.title}
                            </div>
                            
                            {/* Timeline Track */}
                            <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                                {/* Background grid */}
                                {days.map((day, i) => (
                                    <div key={i} style={{ 
                                        minWidth: 40, flex: 1, borderRight: '1px solid #F4F5F7',
                                        background: [0, 6].includes(day.getDay()) ? '#FAFBFC' : 'transparent' 
                                    }} />
                                ))}
                                
                                {/* Task Bar */}
                                <div 
                                    style={{ 
                                        position: 'absolute', top: 10, bottom: 10, 
                                        left: `calc(${leftPercent}% + 2px)`, width: `calc(${widthPercent}% - 4px)`, 
                                        background: `${statusColors[task.status]}15`, border: `1px solid ${statusColors[task.status]}`, 
                                        borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px',
                                        fontSize: 11, fontWeight: 600, color: statusColors[task.status], cursor: 'pointer',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden', whiteSpace: 'nowrap'
                                    }}
                                    onClick={() => onTaskClick && onTaskClick(task)}
                                >
                                    {task.title}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {validTasks.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#6B778C', fontSize: 13 }}>
                        No tasks with start and due dates found to display on timeline.
                    </div>
                )}
            </div>
        </div>
    );
}

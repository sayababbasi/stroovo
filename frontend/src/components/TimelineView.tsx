"use client";

import { useMemo } from 'react';

import { Task } from '@/types';


interface TimelineViewProps {
    tasks: Task[];
}

export default function TimelineView({ tasks }: TimelineViewProps) {
    const dates = useMemo(() => {
        const today = new Date();
        const days = [];
        // Show 7 days before and 21 days after today
        for (let i = -7; i < 21; i++) {
            const d = new Date(today);
            d.setHours(0, 0, 0, 0);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        return days;
    }, []);

    return (
        <div style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #DFE1E6', overflowX: 'auto' }}>
            {/* Timeline Header with Tabs */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #DFE1E6', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#172B4D' }}>Project Timeline</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', color: '#42526E', fontWeight: 500, background: 'white' }}>
                            <option>1 Day</option>
                        </select>
                        <button style={{ padding: '10px 20px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Add Task</button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {['Activity', 'Roadmap', 'Team'].map(tab => (
                            <div key={tab} style={{ 
                                padding: '8px 4px', 
                                fontSize: '14px', 
                                fontWeight: 600, 
                                color: tab === 'Roadmap' ? '#0052CC' : '#6B778C',
                                borderBottom: tab === 'Roadmap' ? '3px solid #0052CC' : '3px solid transparent',
                                cursor: 'pointer'
                            }}>{tab}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `250px repeat(${dates.length}, minmax(40px, 1fr))`,
                width: '100%',
                minWidth: '1000px'
            }}>
                {/* Header */}
                <div style={{ padding: '16px', background: '#F4F5F7', borderBottom: '1px solid #DFE1E6', fontWeight: 600, color: '#6B778C', fontSize: '11px', textTransform: 'uppercase', position: 'sticky', left: 0, zIndex: 20 }}>NAME</div>
                {dates.map((date, i) => (
                    <div key={i} style={{
                        padding: '12px 4px',
                        textAlign: 'center',
                        background: '#F4F5F7',
                        borderBottom: '1px solid #DFE1E6',
                        borderLeft: '1px solid #DFE1E6',
                        fontSize: '11px',
                        color: '#6B778C',
                        fontWeight: 600
                    }}>
                        <div style={{ fontSize: '10px' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                ))}

                {/* Body */}
                {tasks.map(task => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Use real dates if available, fallback to mock for demo
                    const endDate = task.dueDate ? new Date(task.dueDate) : new Date(today.getTime() + 86400000 * 5);
                    const startDate = task.createdAt ? new Date(task.createdAt) : new Date(endDate.getTime() - 86400000 * 3);
                    
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(0, 0, 0, 0);

                    const firstDate = dates[0];
                    const oneDay = 24 * 60 * 60 * 1000;

                    let startOffset = Math.round((startDate.getTime() - firstDate.getTime()) / oneDay);
                    let duration = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / oneDay));

                    // Bounds checking for the visible window
                    if (startOffset + duration < 0 || startOffset >= dates.length) return null;

                    // Clip to visible window
                    let displayOffset = Math.max(0, startOffset);
                    let displayDuration = duration;
                    
                    if (startOffset < 0) {
                        displayDuration += startOffset;
                    }
                    if (displayOffset + displayDuration > dates.length) {
                        displayDuration = dates.length - displayOffset;
                    }

                    return (
                        <div key={task.id} style={{ display: 'contents' }}>
                            <div style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #EBECF0',
                                fontSize: '13px',
                                color: '#172B4D',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                position: 'sticky',
                                left: 0,
                                background: 'white',
                                zIndex: 10,
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {task.title}
                            </div>

                            {/* Background Grid Cells */}
                            <div style={{
                                gridColumn: `2 / span ${dates.length}`,
                                borderBottom: '1px solid #EBECF0',
                                position: 'relative',
                                height: '48px'
                            }}>
                                {/* Vertical Grid Lines */}
                                {dates.map((_, i) => (
                                    <div key={i} style={{
                                        position: 'absolute',
                                        left: `${(i / dates.length) * 100}%`,
                                        top: 0,
                                        bottom: 0,
                                        width: '1px',
                                        background: '#EBECF0',
                                        zIndex: 0
                                    }}></div>
                                ))}

                                 {/* Task Bar */}
                                {duration > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: `${(startOffset / dates.length) * 100}%`,
                                        width: `${Math.min((duration / dates.length) * 100, 100 - (startOffset / dates.length) * 100)}%`,
                                        top: '12px',
                                        bottom: '12px',
                                        background: task.status === 'DONE' ? '#36B37E' : (task.priority === 'URGENT' ? '#FF5630' : '#0052CC'),
                                        borderRadius: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 4px 0 16px',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        zIndex: 1,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }} title={`${task.title}: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}>
                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {task.progress}%
                                        </span>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            borderRadius: '50%', 
                                            background: '#FFFFFF33',
                                            color: 'white', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontSize: '9px',
                                            fontWeight: 700,
                                            border: '1px solid rgba(255,255,255,0.4)',
                                            flexShrink: 0
                                        }}>
                                            {task.assignee?.name?.charAt(0) || 'U'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

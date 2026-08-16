
"use client";

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import { ProjectTask } from './TaskBoard';

export default function ProjectTimelineTab({ project, tasks }: { project: any, tasks: ProjectTask[] }) {
    const [zoom, setZoom] = useState('Month');
    
    // Sort tasks by start date or due date
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            const dateA = new Date(a.startDate || a.dueDate || (a as any).createdAt || Date.now()).getTime();
            const dateB = new Date(b.startDate || b.dueDate || (b as any).createdAt || Date.now()).getTime();
            return dateA - dateB;
        });
    }, [tasks]);

    // Simple Gantt calculation mock
    const today = new Date();
    const timelineStart = new Date(today);
    timelineStart.setDate(today.getDate() - 15); // 15 days ago
    
    const days = Array.from({length: 45}).map((_, i) => {
        const d = new Date(timelineStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ display: 'flex', background: '#F4F5F7', padding: 4, borderRadius: 8 }}>
                        {['Day', 'Week', 'Month', 'Quarter'].map(z => (
                            <div key={z} onClick={() => setZoom(z)} style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 6, background: zoom === z ? 'white' : 'transparent', color: zoom === z ? '#172B4D' : '#6B778C', boxShadow: zoom === z ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                                {z}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} color="#8A94A6" style={{ position: 'absolute', left: 12, top: 10 }} />
                        <input type="text" placeholder="Search tasks..." style={{ padding: '8px 12px 8px 32px', border: '1px solid #DFE1E6', borderRadius: 8, fontSize: 13, width: 200, outline: 'none' }} />
                    </div>
                    <button className="btn-secondary"><Filter size={14} /> Filter</button>
                    <button className="btn-secondary"><Calendar size={14} /> Today</button>
                    <button className="btn-primary"><Plus size={14} /> Add Milestone</button>
                </div>
            </div>

            <div className="p-panel" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6', background: '#F8F9FA' }}>
                    <div style={{ width: 300, flexShrink: 0, padding: '12px 16px', fontWeight: 700, fontSize: 12, color: '#5E6C84', borderRight: '1px solid #DFE1E6', display: 'flex', alignItems: 'center' }}>
                        Task
                    </div>
                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        {days.map((d, i) => (
                            <div key={i} style={{ flex: 1, minWidth: 40, borderRight: '1px solid #EBECF0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', background: d.toDateString() === today.toDateString() ? '#E6EFFF' : 'transparent' }}>
                                <span style={{ fontSize: 10, color: '#8A94A6', fontWeight: 700 }}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                                <span style={{ fontSize: 12, color: d.toDateString() === today.toDateString() ? '#0052CC' : '#172B4D', fontWeight: d.toDateString() === today.toDateString() ? 800 : 600 }}>{d.getDate()}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    {sortedTasks.map((task, idx) => {
                        // Calculate positions based on dates
                        const start = new Date(task.startDate || (task as any).createdAt || Date.now());
                        const end = new Date(task.dueDate || new Date(start.getTime() + 86400000 * 3));
                        
                        let startIndex = days.findIndex(d => d.toDateString() === start.toDateString());
                        if (startIndex === -1) startIndex = 5; // Default fallback
                        
                        let endIndex = days.findIndex(d => d.toDateString() === end.toDateString());
                        if (endIndex === -1) endIndex = startIndex + 5;
                        
                        const isOverdue = end < today && task.status !== 'DONE';

                        const duration = Math.max(1, endIndex - startIndex);

                        return (
                            <div key={task.id} style={{ display: 'flex', borderBottom: '1px solid #EBECF0', height: 48 }}>
                                <div style={{ width: 300, flexShrink: 0, padding: '0 16px', borderRight: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.status === 'DONE' ? '#10B981' : (task.status === 'IN_PROGRESS' ? '#0052CC' : '#F59E0B') }} />
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{task.title}</div>
                                    {task.assignee && (
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4C9AFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                            {(task.assignee.name || 'UN').substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                                    {/* Grid background */}
                                    {days.map((d, i) => (
                                        <div key={i} style={{ flex: 1, minWidth: 40, borderRight: '1px solid #EBECF0', background: d.toDateString() === today.toDateString() ? 'rgba(230, 239, 255, 0.3)' : 'transparent' }} />
                                    ))}
                                    
                                    {/* Gantt Bar */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: `calc(${startIndex} * (100% / ${days.length}))`, 
                                        width: `calc(${duration} * (100% / ${days.length}))`,
                                        top: 10, 
                                        bottom: 10, 
                                        background: isOverdue ? '#FFF0F0' : (task.status === 'DONE' ? '#E3FCEF' : '#E6EFFF'),
                                        border: `1px solid ${isOverdue ? '#EF4444' : (task.status === 'DONE' ? '#10B981' : '#0052CC')}`,
                                        borderRadius: 6,
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }} className="hover:opacity-80">
                                        <span style={{ fontSize: 11, fontWeight: 700, color: isOverdue ? '#BF2600' : (task.status === 'DONE' ? '#006644' : '#0052CC'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {task.title}
                                        </span>
                                        {isOverdue && <AlertTriangle size={12} color="#EF4444" style={{ marginLeft: 'auto' }} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

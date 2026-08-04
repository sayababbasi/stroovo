"use client";

import React from 'react';
import { Star, ChevronDown, Share, MoreHorizontal, Plus, AlertTriangle, Clock, Activity, Target, Zap, ShieldAlert, Calendar, Users } from 'lucide-react';
import { ProjectTask } from './TaskBoard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

type ProjectProps = {
    project: any;
    tasks: ProjectTask[];
    progress: number;
    riskScore: number;
    onAction: (action: string) => void;
};

export default function ProjectOverviewTab({ project, tasks, progress, riskScore, onAction }: ProjectProps) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Status counts for distribution
    const statusCounts = {
        DONE: completedTasks,
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
        TODO: tasks.filter(t => t.status === 'TODO').length,
        BACKLOG: tasks.filter(t => t.status === 'BACKLOG').length,
    };

    // Sprint velocity dummy data for now
    const velocityData = [
        { name: 'May 12', expected: 80, actual: 20 },
        { name: 'May 15', expected: 70, actual: 35 },
        { name: 'May 18', expected: 50, actual: 40 },
        { name: 'May 21', expected: 30, actual: 48 },
        { name: 'May 25', expected: 0, actual: 60 }
    ];

    // Get milestones (tasks of type MILESTONE)
    const milestones = tasks.filter(t => t.type === 'MILESTONE').slice(0, 3);
    if (milestones.length === 0) {
        // Fallback dummy milestones
        milestones.push(
            { id: '1', title: 'Core Platform', progress: 75, dueDate: 'May 20', status: 'IN_PROGRESS' } as any,
            { id: '2', title: 'Payment Integration', progress: 40, dueDate: 'May 30', status: 'TODO' } as any,
            { id: '3', title: 'Beta Release', progress: 10, dueDate: 'Jun 10', status: 'TODO' } as any
        );
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            {/* KPI ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                {[
                { label: 'Progress', val: `${calculatedProgress}%`, sub: `${completedTasks} / ${totalTasks} tasks done`, donut: calculatedProgress, color: '#0052CC' },
                { label: 'Execution Score', val: '78', span: '/100', sub: 'Good', icon: Star, color: '#10B981', trend: true },
                { label: 'Risk Score', val: riskScore > 50 ? 'High' : 'Low', span: ` ${riskScore}%`, sub: 'Active risks', icon: AlertTriangle, color: riskScore > 50 ? '#EF4444' : '#10B981', alert: riskScore > 50 },
                { label: 'Delay Prediction', val: '+5 days', sub: 'Predicted delay', icon: Clock, color: '#F59E0B' },
                { label: 'Team Load', val: '86%', sub: 'High Capacity', icon: Users, color: '#10B981' }
                ].map((k, i) => (
                <div key={i} className="p-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#6B778C', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {k.donut !== undefined ? (
                                <div style={{ position: 'relative', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', position: 'absolute' }}>
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EBECF0" strokeWidth="4" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={k.color} strokeWidth="4" strokeDasharray={`${k.donut}, 100`} />
                                    </svg>
                                    <Target size={12} color={k.color} />
                                </div>
                            ) : k.icon ? (
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${k.color}15`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <k.icon size={14} />
                                </div>
                            ) : null}
                            {k.label}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: k.alert ? '#EF4444' : '#172B4D', lineHeight: 1 }}>
                            {k.val}<span style={{ fontSize: 14, color: k.alert ? '#EF4444' : '#8A94A6', fontWeight: 600, marginLeft: 4 }}>{k.span}</span>
                        </div>
                        {k.trend && (
                            <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                                <path d="M0,15 L20,10 L40,12 L60,5 L80,8 L100,2" fill="none" stroke="#10B981" strokeWidth="2.5" />
                                <circle cx="100" cy="2" r="2.5" fill="#10B981" />
                            </svg>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 600, color: k.alert ? '#EF4444' : '#6B778C', marginTop: k.trend ? 4 : 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {k.alert && <AlertTriangle size={12} />} {k.sub}
                        </div>
                    </div>
                </div>
                ))}
            </div>

            {/* BOTTOM WIDGETS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                
                {/* Burndown */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Burndown</h3>
                        <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Sprint 8 <ChevronDown size={12} /></span>
                    </div>
                    <div style={{ flex: 1, position: 'relative', minHeight: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={velocityData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0052CC" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="expected" stroke="#8A94A6" strokeDasharray="4 4" fill="none" />
                                <Area type="monotone" dataKey="actual" stroke="#0052CC" strokeWidth={2.5} fill="url(#colorActual)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: '0 0 24px 0' }}>Status Distribution</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EBECF0" strokeWidth="4" />
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${(statusCounts.DONE/Math.max(1, totalTasks))*100} 100`} strokeDashoffset="0" />
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={`${(statusCounts.IN_PROGRESS/Math.max(1, totalTasks))*100} 100`} strokeDashoffset={`-${(statusCounts.DONE/Math.max(1, totalTasks))*100}`} />
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0052CC" strokeWidth="4" strokeDasharray={`${(statusCounts.TODO/Math.max(1, totalTasks))*100} 100`} strokeDashoffset={`-${((statusCounts.DONE + statusCounts.IN_PROGRESS)/Math.max(1, totalTasks))*100}`} />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 20, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{totalTasks}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: '#6B778C', marginTop: 4 }}>Tasks</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11, color: '#6B778C', fontWeight: 600, flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}/>Done</span><span style={{ color: '#172B4D', fontWeight: 700 }}>{statusCounts.DONE}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}/>In Progress</span><span style={{ color: '#172B4D', fontWeight: 700 }}>{statusCounts.IN_PROGRESS}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }}/>Review</span><span style={{ color: '#172B4D', fontWeight: 700 }}>{statusCounts.REVIEW}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0052CC' }}/>To Do</span><span style={{ color: '#172B4D', fontWeight: 700 }}>{statusCounts.TODO}</span></div>
                        </div>
                    </div>
                </div>

                {/* Sprint Velocity */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Velocity</h3>
                        <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Last 5 <ChevronDown size={12} /></span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: 6 }}>42 <span style={{ fontSize: 14, color: '#8A94A6' }}>SP</span></div>
                    <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ background: '#10B98120', padding: '2px 4px', borderRadius: 4 }}>+12%</span> vs last
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, position: 'relative' }}>
                        {[
                        { h: 40, v: 28 }, { h: 50, v: 34 }, { h: 55, v: 38 }, { h: 52, v: 37 }, { h: 65, v: 42, active: true }
                        ].map((b, i) => (
                        <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: b.active ? '#0052CC' : '#6B778C' }}>{b.v}</span>
                            <div style={{ width: '100%', height: `${b.h}px`, background: b.active ? '#0052CC' : '#E6EFFF', borderRadius: '4px 4px 0 0' }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#8A94A6' }}>S{i+8}</span>
                        </div>
                        ))}
                    </div>
                </div>

                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: '0 0 20px 0' }}>Milestones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'center' }}>
                        {milestones.map((m: any, i: number) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ color: '#172B4D', fontSize: 12, fontWeight: 600 }}>{m.title}</span>
                                    <span style={{ 
                                        color: m.status === 'DONE' ? '#10B981' : (m.status === 'IN_PROGRESS' ? '#0052CC' : '#F59E0B'),
                                        background: m.status === 'DONE' ? '#10B98115' : (m.status === 'IN_PROGRESS' ? '#0052CC15' : '#F59E0B15'),
                                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 
                                    }}>
                                        {m.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: 6, background: '#EBECF0', borderRadius: 3 }}>
                                    <div style={{ width: `${m.progress || (m.status === 'DONE' ? 100 : (m.status === 'IN_PROGRESS' ? 40 : 10))}%`, height: '100%', background: m.status === 'DONE' ? '#10B981' : (m.status === 'IN_PROGRESS' ? '#0052CC' : '#F59E0B'), borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

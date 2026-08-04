"use client";

import React from 'react';
import { Zap, AlertTriangle, ShieldAlert, Star, ChevronRight, Users, Calendar, Target, Plus, Activity } from 'lucide-react';
import { ProjectTask } from './TaskBoard';

export default function ProjectAIAssistant({ project, tasks, riskScore }: { project: any, tasks: ProjectTask[], riskScore: number }) {
    
    // Auto-generate some recommendations based on tasks
    const delayedTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE');
    
    // Find overloaded assignees
    const assignees = tasks.filter(t => t.status !== 'DONE' && t.assignee).reduce((acc: any, t) => {
        if (!t.assignee) return acc;
        acc[t.assignee.id] = (acc[t.assignee.id] || 0) + 1;
        return acc;
    }, {});
    
    const overloadedAssignee = Object.keys(assignees).find(id => assignees[id] > 5);

    const recommendations = [
        overloadedAssignee ? `Reassign tasks from overloaded user` : 'Accelerate API Development',
        delayedTasks.length > 0 ? `Review ${delayedTasks.length} delayed tasks` : 'Move 2 tasks to next sprint',
        'Schedule risk mitigation meeting'
    ];

    const isAtRisk = riskScore > 50 || delayedTasks.length > 3;

    return (
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* AI Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="#0052CC" />
                <span style={{ fontSize: 16, fontWeight: 800, color: '#172B4D' }}>AI Project Assistant</span>
                </div>
                <span style={{ fontSize: 11, background: '#E6EFFF', color: '#0052CC', padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>Stroovo AI</span>
            </div>

            {/* Project At Risk Alert */}
            {isAtRisk && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={16} color="#EF4444" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#BF2600' }}>Project at Risk</span>
                        </div>
                        <span style={{ fontSize: 10, background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>High</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#172B4D', margin: '0 0 16px 0', lineHeight: 1.5, fontWeight: 500 }}>
                        This project may miss the deadline by <strong>5 days</strong>.
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ flex: 1, height: 4, background: '#EBECF0', borderRadius: 2 }}>
                        <div style={{ width: `${riskScore}%`, height: '100%', background: '#EF4444', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#172B4D' }}>{riskScore}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6B778C', marginBottom: 16 }}>{riskScore}% probability of delay</div>
                    
                    <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View full analysis →</a>
                </div>
            )}

            {/* Top Recommendations */}
            <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} color="#0052CC" /> Top Recommendations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {recommendations.map((rec, i) => (
                    <div key={i} style={{ background: 'white', border: '1px solid #DFE1E6', padding: '12px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E6EFFF', color: '#0052CC', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{rec}</span>
                    </div>
                    <ChevronRight size={14} color="#8A94A6" />
                    </div>
                ))}
                </div>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 16 }}>View all recommendations →</a>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#8B5CF6' }}>
                <Zap size={14} /> Apply All
                </button>
            </div>

            {/* Key Issues */}
            <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={14} color="#EF4444" /> Key Issues
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {delayedTasks.length > 0 && (
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} /> {delayedTasks.length} tasks are delayed
                    </li>
                )}
                {overloadedAssignee && (
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} /> A team member is overloaded
                    </li>
                )}
                {!isAtRisk && delayedTasks.length === 0 && (
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10B981', fontWeight: 500 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> No major issues detected!
                    </li>
                )}
                </ul>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all issues →</a>
            </div>

            {/* Quick Actions Grid */}
            <div className="p-panel" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 16px 0' }}>Quick Actions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                    { l: 'Optimize Project', i: Zap, c: '#8B5CF6' },
                    { l: 'Rebalance Workload', i: Users, c: '#0052CC' },
                    { l: 'Adjust Timeline', i: Calendar, c: '#F59E0B' },
                    { l: 'Auto Plan Tasks', i: Target, c: '#10B981' },
                    { l: 'Add Milestone', i: Plus, c: '#6B778C' },
                    { l: 'Generate Report', i: Activity, c: '#0052CC' },
                ].map(a => (
                    <div key={a.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F4F5F7', color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} className="hover:bg-gray-200">
                        <a.i size={16} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#42526E', lineHeight: 1.2 }}>{a.l}</span>
                    </div>
                ))}
                </div>
            </div>

        </div>
    );
}

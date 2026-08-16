
"use client";

import React, { useState } from 'react';
import { Zap, Plus, Activity, Play, Settings2, MoreHorizontal } from 'lucide-react';

export default function ProjectAutomationTab({ project }: { project: any }) {
    
    // Mock automations stored on project layer
    const automations = [
        { id: '1', name: 'Overdue Alert', trigger: 'Task becomes overdue', action: 'Notify project owner', status: 'ACTIVE', runs: 12, lastRun: '2 hours ago' },
        { id: '2', name: 'Progress Sync', trigger: 'Task moved to Done', action: 'Update project progress', status: 'ACTIVE', runs: 145, lastRun: '10 mins ago' },
        { id: '3', name: 'Risk Escalation', trigger: 'Risk becomes Critical', action: 'Ping Slack channel', status: 'PAUSED', runs: 0, lastRun: 'Never' },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', gap: 24, height: '100%' }}>
            
            {/* Left: Automations List */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#172B4D', margin: 0 }}>Active Automations</h3>
                    <button className="btn-primary" style={{ background: '#8B5CF6' }}><Zap size={14} /> Create Automation</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {automations.map(a => (
                        <div key={a.id} className="p-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: a.status === 'ACTIVE' ? '#EDE9FE' : '#F4F5F7', color: a.status === 'ACTIVE' ? '#8B5CF6' : '#8A94A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#172B4D', marginBottom: 6 }}>{a.name}</div>
                                    <div style={{ fontSize: 13, color: '#5E6C84', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontWeight: 700, color: '#0052CC' }}>WHEN</span> {a.trigger} <span style={{ fontWeight: 700, color: '#10B981', marginLeft: 8 }}>THEN</span> {a.action}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#8A94A6' }}>Runs: {a.runs}</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6B778C' }}>Last: {a.lastRun}</span>
                                </div>
                                
                                <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 24 }}>
                                    <input type="checkbox" checked={a.status === 'ACTIVE'} readOnly style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: a.status === 'ACTIVE' ? '#10B981' : '#DFE1E6', transition: '.4s', borderRadius: 24 }}>
                                        <span style={{ position: 'absolute', height: 18, width: 18, left: a.status === 'ACTIVE' ? 18 : 3, bottom: 3, backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                                    </span>
                                </label>
                                
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><MoreHorizontal size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Activity & Templates */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="p-panel" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} color="#0052CC" /> Recent Execution Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { name: 'Progress Sync', time: '10 mins ago', stat: 'SUCCESS' },
                            { name: 'Progress Sync', time: '1 hour ago', stat: 'SUCCESS' },
                            { name: 'Overdue Alert', time: '2 hours ago', stat: 'SUCCESS' },
                        ].map((log, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                                    <span style={{ fontWeight: 600, color: '#172B4D' }}>{log.name}</span>
                                </div>
                                <span style={{ color: '#8A94A6', fontWeight: 500 }}>{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-panel" style={{ padding: 24, background: '#F8F9FA' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Settings2 size={16} /> Recommended Templates</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['Auto-assign tasks by category', 'Send weekly digest to client', 'Archive done tasks after 30 days'].map((t, i) => (
                            <div key={i} style={{ padding: 12, background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#42526E', cursor: 'pointer' }} className="hover:border-blue-500">
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}

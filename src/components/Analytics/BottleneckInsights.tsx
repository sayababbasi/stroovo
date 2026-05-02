"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowUpRight, ShieldAlert } from 'lucide-react';

export default function BottleneckInsights() {
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // AI-simulated analysis
        setInsights([
            {
                level: 'HIGH',
                reason: 'Frontend Review Lag',
                description: 'Tasks in "REVIEW" are taking 4.2 days on average, up 20% this week.',
                suggestion: 'Assign a secondary reviewer to the Frontend team.'
            },
            {
                level: 'MEDIUM',
                reason: 'Workload Imbalance',
                description: 'User "Alex" has 12 active tasks while the team average is 5.',
                suggestion: 'Reassign 3 low-priority tasks to "Sarah".'
            }
        ]);
        setLoading(false);
    }, []);

    if (loading) return <div>Analyzing bottlenecks...</div>;

    return (
        <div style={{ background: '#FFFAE6', padding: '24px', borderRadius: '12px', border: '1px solid #FFE380' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <ShieldAlert size={20} color="#FF8B00" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', margin: 0 }}>AI Bottleneck Detection</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {insights.map((insight, i) => (
                    <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #FFE380' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: insight.level === 'HIGH' ? '#FF5630' : '#FF8B00' }}>
                                {insight.level} PRIORITY
                            </span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', margin: '0 0 4px 0' }}>{insight.reason}</h4>
                        <p style={{ fontSize: '13px', color: '#42526E', margin: '0 0 12px 0' }}>{insight.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0052CC', fontWeight: 600 }}>
                            <ArrowUpRight size={14} /> {insight.suggestion}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

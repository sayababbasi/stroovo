"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Users, FolderKanban, AlertTriangle } from 'lucide-react';

export default function ExecutiveOverview() {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', color: '#172B4D', margin: '0 0 8px' }}>
                    Welcome back, {user?.name || 'Executive'}
                </h1>
                <p style={{ color: '#6B778C', margin: 0, fontSize: '16px' }}>
                    Here's the high-level overview of your organization.
                </p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '24px',
                marginBottom: '32px' 
            }}>
                {[
                    { title: 'Total Revenue (MRR)', value: '$1.2M', trend: '+12%', icon: TrendingUp, color: '#36B37E' },
                    { title: 'Active Employees', value: '450', trend: '+5%', icon: Users, color: '#0052CC' },
                    { title: 'Active Projects', value: '84', trend: 'Stable', icon: FolderKanban, color: '#FFAB00' },
                    { title: 'Critical Issues', value: '3', trend: '-2', icon: AlertTriangle, color: '#DE350B' }
                ].map((stat, i) => (
                    <div key={i} style={{ 
                        background: 'white', 
                        padding: '24px', 
                        borderRadius: '12px', 
                        boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ background: `${stat.color}15`, padding: '12px', borderRadius: '8px' }}>
                                <stat.icon color={stat.color} size={24} />
                            </div>
                            <span style={{ 
                                fontSize: '13px', 
                                fontWeight: 600, 
                                color: stat.trend.startsWith('+') ? '#36B37E' : (stat.trend.startsWith('-') ? '#DE350B' : '#6B778C'),
                                background: stat.trend.startsWith('+') ? '#E3FCEF' : (stat.trend.startsWith('-') ? '#FFEBE6' : '#DFE1E6'),
                                padding: '4px 8px',
                                borderRadius: '4px'
                            }}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 style={{ color: '#6B778C', fontSize: '14px', margin: '0 0 8px', fontWeight: 500 }}>{stat.title}</h3>
                        <p style={{ color: '#172B4D', fontSize: '28px', margin: 0, fontWeight: 700 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)', minHeight: '400px' }}>
                    <h2 style={{ fontSize: '18px', color: '#172B4D', margin: '0 0 24px' }}>Organization Performance Overview</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#6B778C', border: '1px dashed #DFE1E6', borderRadius: '8px' }}>
                        Chart Visualization Placeholder
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)' }}>
                    <h2 style={{ fontSize: '18px', color: '#172B4D', margin: '0 0 24px' }}>Attention Required</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { title: 'Server capacity reaching 90%', time: '2 hours ago', type: 'System' },
                            { title: 'Project Alpha delayed by 2 weeks', time: '5 hours ago', type: 'Delivery' },
                            { title: 'Unusual login activity detected', time: '1 day ago', type: 'Security' }
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '12px', border: '1px solid #DFE1E6', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0052CC' }}>{item.type}</span>
                                    <span style={{ fontSize: '12px', color: '#8993A4' }}>{item.time}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#172B4D' }}>{item.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

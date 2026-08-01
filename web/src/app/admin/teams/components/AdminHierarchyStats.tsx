"use client";

import React from 'react';
import { Users, Layers, AlertCircle, Share2, CornerDownRight } from 'lucide-react';

export default function AdminHierarchyStats({ stats, loading }: { stats: any, loading: boolean }) {
    
    if (loading || !stats) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #DFE1E6', height: '100px', opacity: 0.5 }}>
                        Loading...
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { title: 'Total Teams', value: stats.totalTeams, icon: <Layers size={20} color="#0052CC" />, bg: '#DEEBFF' },
        { title: 'Root Teams', value: stats.rootTeams, icon: <Share2 size={20} color="#36B37E" />, bg: '#E3FCEF' },
        { title: 'Nested Teams', value: stats.nestedTeams, icon: <CornerDownRight size={20} color="#FFAB00" />, bg: '#FFFAE6' },
        { title: 'Max Depth', value: stats.maxDepth, icon: <Layers size={20} color="#6554C0" />, bg: '#EAE6FF' },
        { title: 'Total Members', value: stats.totalMembers, icon: <Users size={20} color="#42526E" />, bg: '#F4F5F7' },
        { 
            title: 'Unassigned/Archived', 
            value: stats.unassignedTeams, 
            icon: <AlertCircle size={20} color={stats.unassignedTeams > 0 ? "#FF5630" : "#42526E"} />, 
            bg: stats.unassignedTeams > 0 ? '#FFEBE6' : '#F4F5F7',
            alert: stats.unassignedTeams > 0
        },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {cards.map((c, i) => (
                <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {c.icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.title}</p>
                            <h3 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: c.alert ? '#FF5630' : '#172B4D' }}>{c.value}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

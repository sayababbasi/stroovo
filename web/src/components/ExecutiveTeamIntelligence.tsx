"use client";

import React from 'react';
import { Award, User, Users } from 'lucide-react';

export default function ExecutiveTeamIntelligence({ analytics }: { analytics: any }) {
    // Competitor standard: Dynamic workload visualization and performance ranking
    const teams = analytics?.teamHealth || [
        { name: 'Engineering', activeTasks: 15, health: 70 },
        { name: 'Product', activeTasks: 8, health: 85 },
        { name: 'Design', activeTasks: 12, health: 60 }
    ];

    const topPerformer = analytics?.topPerformers?.[0] || { name: 'Mark Stevens', role: 'Senior DevOps', score: 98 };
    const idleMember = analytics?.idleMembers?.[0] || { name: 'Kristy Mckinsey', role: 'Product Designer' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '320px' }}>
            {/* Workload Distribution */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #EBECF0', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Users size={18} color="#0052CC" />
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', margin: 0 }}>Team Intelligence</h4>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#6B778C' }}>Workload Distribution</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {teams.map((team: any, i: number) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                                    <span style={{ color: '#42526E', fontWeight: 600 }}>{team.name}</span>
                                    <span style={{ color: '#6B778C' }}>{team.activeTasks} tasks · {team.health}% health</span>
                                </div>
                                <div style={{ height: '6px', background: '#F4F5F7', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${team.health}%`, 
                                        height: '100%',
                                        background: team.health < 50 ? '#FF5630' : team.health < 80 ? '#0052CC' : '#36B37E',
                                        borderRadius: '4px'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Performer */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #EBECF0', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Award size={18} color="#FFAB00" />
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', margin: 0 }}>Top Performer</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E3FCEF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="#36B37E" />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{topPerformer.name}</div>
                        <div style={{ fontSize: '11px', color: '#6B778C' }}>{topPerformer.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#36B37E' }}>{topPerformer.score}%</div>
                    </div>
                </div>
            </div>

            {/* Idle Members */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #EBECF0', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', margin: 0 }}>Idle Members</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={18} color="#6B778C" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{idleMember.name}</div>
                        <div style={{ fontSize: '10px', color: '#6B778C' }}>{idleMember.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span style={{ fontSize: '10px', background: '#E3FCEF', color: '#006644', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>Available</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { MoreHorizontal, ShieldCheck, ShieldAlert, CheckCircle2, Archive, Settings } from 'lucide-react';
import AdminTeamDetailDrawer from './AdminTeamDetailDrawer';

interface AdminTeamTableProps {
    teams: any[];
    onRefresh: () => void;
}

export default function AdminTeamTable({ teams, onRefresh }: AdminTeamTableProps) {
    const [selectedTeam, setSelectedTeam] = useState<any>(null);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (teams.length === 0) {
        return (
            <div style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#8A94A6' }}>
                    <Archive size={24} />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>No Teams Found</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Adjust your filters or create a new team.</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Team</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Team Lead</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Members</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Projects</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tasks</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Created</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map((team) => (
                        <tr 
                            key={team.id}
                            onClick={() => setSelectedTeam(team)}
                            style={{ borderBottom: '1px solid #F4F5F7', cursor: 'pointer', transition: 'background 0.1s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Team */}
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E9F2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                                        {team.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', marginBottom: '2px' }}>{team.name}</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {team.status === 'ACTIVE' ? <ShieldCheck size={12} color="#36B37E" /> : <ShieldAlert size={12} color="#FF8B00" />}
                                            {team.status === 'ACTIVE' ? 'Healthy' : 'Restricted'}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Team Lead */}
                            <td style={{ padding: '16px' }}>
                                {team.owner ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {team.owner.image ? (
                                            <img src={team.owner.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                                                {team.owner.name?.substring(0,2).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>{team.owner.name}</span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '13px', color: '#97A0AF', fontStyle: 'italic' }}>No Owner</span>
                                )}
                            </td>

                            {/* Members */}
                            <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>
                                {team._count?.members || 0}
                            </td>

                            {/* Projects */}
                            <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>
                                {team._count?.spaces || 0}
                            </td>

                            {/* Tasks */}
                            <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>
                                {team._count?.tasks || 0}
                            </td>

                            {/* Status */}
                            <td style={{ padding: '16px' }}>
                                <span style={{
                                    padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                                    background: team.status === 'ACTIVE' ? '#E3FCEF' : '#FFEBE6',
                                    color: team.status === 'ACTIVE' ? '#006644' : '#DE350B',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                }}>
                                    {team.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <Archive size={12} />}
                                    {team.status}
                                </span>
                            </td>

                            {/* Created Date */}
                            <td style={{ padding: '16px', fontSize: '13px', color: '#42526E' }}>
                                {formatDate(team.createdAt)}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setSelectedTeam(team)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#6B778C', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Settings size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedTeam && (
                <AdminTeamDetailDrawer 
                    team={selectedTeam} 
                    onClose={() => setSelectedTeam(null)} 
                    onRefresh={onRefresh}
                />
            )}
        </div>
    );
}

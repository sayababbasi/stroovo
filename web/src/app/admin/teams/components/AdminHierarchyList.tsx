"use client";

import React, { useState } from 'react';
import { Users, Shield, Edit2, FolderTree } from 'lucide-react';
import Can from '@/components/auth/Can';
import { P } from '@/lib/permissions/registry';

export default function AdminHierarchyList({ teams, search, onRefresh }: { teams: any[], search: string, onRefresh: () => void }) {
    
    const filtered = teams.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        (t.teamType && t.teamType.toLowerCase().includes(search.toLowerCase())) ||
        (t.lead && t.lead.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #DFE1E6' }}>
                        <th style={{ padding: '12px 16px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Team</th>
                        <th style={{ padding: '12px 16px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Type</th>
                        <th style={{ padding: '12px 16px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Parent</th>
                        <th style={{ padding: '12px 16px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Lead</th>
                        <th style={{ padding: '12px 16px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Members</th>
                        <th style={{ padding: '12px 16px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Children</th>
                        <th style={{ padding: '12px 16px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(t => {
                        const parent = teams.find(p => p.id === t.parentTeamId);
                        return (
                            <tr key={t.id} style={{ borderBottom: '1px solid #DFE1E6' }}>
                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: '#172B4D' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#EAE6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FolderTree size={16} color="#6554C0" />
                                        </div>
                                        {t.name}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#42526E' }}>{t.teamType || 'TEAM'}</td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#42526E' }}>{parent ? parent.name : <span style={{ color: '#8A94A6', fontStyle: 'italic' }}>None (Root)</span>}</td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#42526E' }}>
                                    {t.lead ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={t.lead.image || `https://ui-avatars.com/api/?name=${t.lead.name}`} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                            {t.lead.name}
                                        </div>
                                    ) : <span style={{ color: '#8A94A6', fontStyle: 'italic' }}>Unassigned</span>}
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#42526E' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={14} color="#6B778C" /> {t._count.members}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#42526E' }}>{t._count.children}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                                        background: t.status === 'ACTIVE' ? '#E3FCEF' : '#FFEBE6',
                                        color: t.status === 'ACTIVE' ? '#006644' : '#BF2600'
                                    }}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6B778C' }}>
                                No teams match your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

import React from 'react';
import { MoreHorizontal, Play, Lock, AlertTriangle, Eye, Edit2, Trash2 } from 'lucide-react';

interface AccessPolicy {
    id: string;
    name: string;
    description: string | null;
    status: string;
    priority: string;
    effect: string;
    appliesToAll: boolean;
    createdAt: string;
    users: any[];
    roles: any[];
    teams: any[];
    resources: any[];
}

export default function AdminAccessPolicyTable({ policies, onRefresh, onView }: { policies: AccessPolicy[], onRefresh: () => void, onView: (id: string) => void }) {
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#E3FCEF', text: '#006644' };
            case 'DRAFT': return { bg: '#FFFAE6', text: '#FF8B00' };
            case 'PAUSED': return { bg: '#FFEBE6', text: '#DE350B' };
            case 'EXPIRED': return { bg: '#DFE1E6', text: '#42526E' };
            default: return { bg: '#DFE1E6', text: '#42526E' };
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return <AlertTriangle size={14} color="#DE350B" />;
            case 'HIGH': return <AlertTriangle size={14} color="#FF8B00" />;
            case 'MEDIUM': return <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0052CC' }} />;
            case 'LOW': return <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#008DA6' }} />;
            default: return null;
        }
    };

    const formatScope = (p: AccessPolicy) => {
        if (p.appliesToAll) return 'Organization-wide';
        const parts = [];
        if (p.roles?.length > 0) parts.push(`${p.roles.length} Role(s)`);
        if (p.teams?.length > 0) parts.push(`${p.teams.length} Team(s)`);
        if (p.users?.length > 0) parts.push(`${p.users.length} User(s)`);
        return parts.join(', ') || 'No subjects';
    };

    if (policies.length === 0) {
        return (
            <div style={{ padding: '64px', textAlign: 'center', color: '#6B778C' }}>
                <Lock size={48} color="#DFE1E6" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', margin: '0 0 8px' }}>No Access Policies Found</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>Create a policy to enforce strict access conditions.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Policy</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Priority</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Scope</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Effect</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {policies.map(policy => {
                        const statusColors = getStatusColor(policy.status);
                        return (
                            <tr key={policy.id} style={{ borderBottom: '1px solid #DFE1E6', background: 'white' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: policy.effect === 'DENY' ? '#FFEBE6' : '#E6FCFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: policy.effect === 'DENY' ? '#DE350B' : '#008DA6' }}>
                                            <Lock size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', marginBottom: '2px' }}>{policy.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C' }}>{policy.resources?.map(r => r.resource).join(', ') || 'All Resources'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                                        background: statusColors.bg, color: statusColors.text, fontSize: '11px', fontWeight: 700
                                    }}>
                                        {policy.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>
                                        {getPriorityIcon(policy.priority)}
                                        {policy.priority}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#172B4D' }}>
                                    {formatScope(policy)}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: policy.effect === 'DENY' ? '#DE350B' : '#006644' }}>
                                        {policy.effect}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button 
                                            onClick={() => onView(policy.id)}
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E', cursor: 'pointer' }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

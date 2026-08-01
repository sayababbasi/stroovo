import React from 'react';
import { MoreHorizontal, Mail, ShieldAlert, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface Invitation {
    id: string;
    email: string;
    status: string;
    roleId: string | null;
    expiresAt: string;
    lastSentAt: string | null;
    createdAt: string;
    deliveryStatus: string;
    systemRole?: { id: string, name: string } | null;
    inviter?: { id: string, name: string, email: string };
    teams?: Array<{ team: { id: string, name: string } }>;
}

export default function AdminInvitationTable({ 
    invitations, 
    onRefresh, 
    onView, 
    onRevoke, 
    onResend 
}: { 
    invitations: Invitation[], 
    onRefresh: () => void, 
    onView: (id: string) => void,
    onRevoke: (id: string) => void,
    onResend: (id: string) => void
}) {
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return { bg: '#E3FCEF', text: '#006644', icon: <CheckCircle size={14} /> };
            case 'PENDING': return { bg: '#FFF0B3', text: '#172B4D', icon: <Clock size={14} /> };
            case 'REVOKED': return { bg: '#FFEBE6', text: '#DE350B', icon: <ShieldAlert size={14} /> };
            case 'EXPIRED': return { bg: '#DFE1E6', text: '#42526E', icon: <XCircle size={14} /> };
            case 'FAILED': return { bg: '#FFEBE6', text: '#DE350B', icon: <AlertTriangle size={14} /> };
            default: return { bg: '#DFE1E6', text: '#42526E', icon: <Clock size={14} /> };
        }
    };

    if (invitations.length === 0) {
        return (
            <div style={{ padding: '64px', textAlign: 'center', color: '#6B778C' }}>
                <Mail size={48} color="#DFE1E6" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', margin: '0 0 8px' }}>No invitations found</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>Invite your first team member to start collaborating.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Member</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Access</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Sent / Expires</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invitations.map(inv => {
                        const statusColors = getStatusColor(inv.status);
                        const teamNames = inv.teams?.map(t => t.team.name).join(', ') || 'No Teams';
                        const roleName = inv.systemRole?.name || 'MEMBER';

                        return (
                            <tr key={inv.id} style={{ borderBottom: '1px solid #DFE1E6', background: 'white' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E', fontSize: '14px', fontWeight: 600 }}>
                                            {inv.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', marginBottom: '2px' }}>{inv.email}</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C' }}>Invited by {inv.inviter?.name || inv.inviter?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '13px', color: '#172B4D', fontWeight: 600 }}>{roleName}</div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '4px' }}>{teamNames}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px',
                                            background: statusColors.bg, color: statusColors.text, fontSize: '11px', fontWeight: 700
                                        }}>
                                            {statusColors.icon} {inv.status}
                                        </span>
                                        {inv.deliveryStatus === 'FAILED' && (
                                            <span style={{ fontSize: '11px', color: '#DE350B', fontWeight: 600 }}>Delivery Failed</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '13px', color: '#172B4D' }}>Sent: {inv.lastSentAt ? new Date(inv.lastSentAt).toLocaleDateString() : 'N/A'}</div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '4px' }}>Exp: {new Date(inv.expiresAt).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        {inv.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => onResend(inv.id)} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#0052CC', background: 'transparent', border: '1px solid #0052CC', borderRadius: '4px', cursor: 'pointer' }}>Resend</button>
                                                <button onClick={() => onRevoke(inv.id)} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#DE350B', background: 'transparent', border: '1px solid #DE350B', borderRadius: '4px', cursor: 'pointer' }}>Revoke</button>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => onView(inv.id)}
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E', cursor: 'pointer' }}
                                        >
                                            <MoreHorizontal size={16} />
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

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Mail, CheckCircle, Clock, XCircle, ShieldAlert, AlertTriangle, UploadCloud, Download } from 'lucide-react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminInvitationTable from './AdminInvitationTable';
import AdminInviteMemberModal from './AdminInviteMemberModal';
import AdminBulkInviteModal from './AdminBulkInviteModal';
import AdminInvitationDetailDrawer from './AdminInvitationDetailDrawer';
import Can from '@/components/auth/Can';
import { P } from '@/lib/permissions/registry';

function KpiCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number | string, color: string }) {
    return (
        <div style={{
            flex: 1, minWidth: '150px', background: 'white', borderRadius: '12px',
            border: '1px solid #DFE1E6', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px'
        }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: '4px' }}>
                    {value}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B778C' }}>{title}</div>
            </div>
        </div>
    );
}

export default function AdminInvitationsTab() {
    const [invitations, setInvitations] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'RESEND' | 'REVOKE' } | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchInvitations = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (statusFilter !== 'ALL') query.append('status', statusFilter);
            if (search) query.append('search', search);

            const res = await apiGet<any>(`/api/admin/invitations?${query.toString()}`, null);
            if (res.success && res.data) {
                setInvitations(res.data);
                if ((res as any).stats) setStats((res as any).stats);
            }
        } catch (error) {
            toast.error('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleRevoke = (id: string) => {
        setConfirmAction({ id, type: 'REVOKE' });
    };

    const handleResend = (id: string) => {
        setConfirmAction({ id, type: 'RESEND' });
    };

    const executeConfirmAction = async () => {
        if (!confirmAction) return;
        const { id, type } = confirmAction;
        setConfirmAction(null);
        
        try {
            const res = await apiPatch(`/api/admin/invitations/${id}`, null, { action: type });
            if (res.success) {
                toast.success(`Invitation ${type === 'RESEND' ? 'resent' : 'revoked'} successfully`);
                fetchInvitations();
            } else {
                toast.error(res.error || `Failed to ${type.toLowerCase()}`);
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#172B4D' }}>Invitations & Access</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>
                        Manage member invitations, onboarding access, expiration policies and invitation security.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Can permission={P.INVITATIONS_EXPORT}>
                        <button style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> Export
                        </button>
                    </Can>
                    <Can permission={P.INVITATIONS_BULK_CREATE}>
                        <button 
                            onClick={() => setIsBulkOpen(true)}
                            style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <UploadCloud size={16} /> Bulk Invite
                        </button>
                    </Can>
                    <Can permission={P.INVITATIONS_CREATE}>
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={16} /> Invite Member
                        </button>
                    </Can>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <KpiCard icon={<Mail size={20} />} title="Total Invitations" value={stats?.total || 0} color="#0052CC" />
                <KpiCard icon={<Clock size={20} />} title="Pending" value={stats?.pending || 0} color="#FF8B00" />
                <KpiCard icon={<CheckCircle size={20} />} title="Accepted" value={stats?.accepted || 0} color="#006644" />
                <KpiCard icon={<XCircle size={20} />} title="Expired" value={stats?.expired || 0} color="#42526E" />
                <KpiCard icon={<ShieldAlert size={20} />} title="Revoked" value={stats?.revoked || 0} color="#DE350B" />
                <KpiCard icon={<AlertTriangle size={20} />} title="Failed" value={stats?.failed || 0} color="#DE350B" />
            </div>

            {/* Table Container */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 4px rgba(9,30,66,0.04)' }}>
                {/* Toolbar */}
                <div style={{ padding: '20px', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchInvitations()}
                            placeholder="Search by name, email, role, or team..."
                            style={{
                                width: '100%', height: '38px', paddingLeft: '38px', paddingRight: '16px',
                                borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); }}
                        style={{
                            height: '38px', padding: '0 16px', borderRadius: '8px', border: '1px solid #DFE1E6',
                            fontSize: '14px', color: '#172B4D', outline: 'none', background: 'white', cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">Status: All</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="REVOKED">Revoked</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '64px', textAlign: 'center', color: '#6B778C' }}>Loading invitations...</div>
                ) : (
                    <AdminInvitationTable 
                        invitations={invitations} 
                        onRefresh={fetchInvitations} 
                        onView={(id) => setSelectedId(id)}
                        onRevoke={handleRevoke}
                        onResend={handleResend}
                    />
                )}
            </div>

            <AdminInviteMemberModal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                onSuccess={fetchInvitations} 
            />

            <AdminBulkInviteModal
                isOpen={isBulkOpen}
                onClose={() => setIsBulkOpen(false)}
                onSuccess={fetchInvitations}
            />

            <AdminInvitationDetailDrawer
                invitationId={selectedId}
                onClose={() => setSelectedId(null)}
                onRefresh={fetchInvitations}
            />

            {/* Custom Confirmation Modal */}
            {confirmAction && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.54)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: confirmAction.type === 'REVOKE' ? '#FFEBE6' : '#E6FCFF', color: confirmAction.type === 'REVOKE' ? '#DE350B' : '#00B8D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {confirmAction.type === 'REVOKE' ? <AlertTriangle size={20} /> : <Mail size={20} />}
                            </div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>
                                {confirmAction.type === 'REVOKE' ? 'Revoke Invitation' : 'Resend Invitation'}
                            </h2>
                        </div>
                        <p style={{ margin: '0 0 24px 0', color: '#42526E', fontSize: '14px', lineHeight: 1.5 }}>
                            {confirmAction.type === 'REVOKE' 
                                ? 'Are you sure you want to revoke this invitation? The link will immediately become invalid.'
                                : 'Are you sure you want to resend this invitation? A new email will be dispatched to the recipient.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setConfirmAction(null)}
                                style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: '#42526E', fontWeight: 500, cursor: 'pointer', borderRadius: '4px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeConfirmAction}
                                style={{ padding: '8px 16px', background: confirmAction.type === 'REVOKE' ? '#DE350B' : '#0052CC', border: 'none', color: 'white', fontWeight: 500, cursor: 'pointer', borderRadius: '4px' }}
                            >
                                {confirmAction.type === 'REVOKE' ? 'Revoke' : 'Resend Email'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

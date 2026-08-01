"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Trash2, Edit2, Archive, RefreshCw, Users, Key, Briefcase, Activity, CalendarDays, KeyRound, AlertTriangle } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminSuspendMemberModal from './AdminSuspendMemberModal';

interface AdminMemberDetailDrawerProps {
    user: any;
    onClose: () => void;
    onRefresh: () => void;
}

export default function AdminMemberDetailDrawer({ user, onClose, onRefresh }: AdminMemberDetailDrawerProps) {
    const [fullUser, setFullUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchUserDetails();
        }
    }, [user]);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            // Get full user with activity using new endpoint
            const res = await apiGet<any>(`/api/admin/users/${user.id}/activity`);
            if (res.success && res.data) {
                setFullUser(res.data.user);
                setActivityLogs(res.data.activityLogs || []);
            } else {
                setFullUser(user); // Fallback to provided basic user
            }
        } catch (e) {
            console.error(e);
            setFullUser(user);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (fullUser.isActive) {
            setIsSuspendModalOpen(true);
        } else {
            // Direct reactivate
            try {
                const res = await apiPatch(`/api/admin/users/${fullUser.id}`, null, { isActive: true });
                if (res.success) {
                    toast.success('Member reactivated');
                    fetchUserDetails();
                    onRefresh();
                } else {
                    toast.error(res.error || 'Failed to reactivate');
                }
            } catch (e) {
                toast.error('An error occurred');
            }
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)', zIndex: 1000 }} onClick={onClose} />
            <div style={{
                position: 'fixed', right: 0, top: 0, bottom: 0, width: '600px', maxWidth: '100vw',
                background: 'white', zIndex: 1001, boxShadow: '-4px 0 24px rgba(9,30,66,0.15)',
                display: 'flex', flexDirection: 'column'
            }}>
                
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {fullUser?.image ? (
                            <img src={fullUser.image} alt="" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '24px' }}>
                                {fullUser?.name?.substring(0,2).toUpperCase() || 'U'}
                            </div>
                        )}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: 0 }}>{fullUser?.name}</h2>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: fullUser?.isActive ? '#E3FCEF' : '#FFEBE6', color: fullUser?.isActive ? '#006644' : '#DE350B' }}>
                                    {fullUser?.isActive ? 'ACTIVE' : 'SUSPENDED'}
                                </span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#6B778C', margin: '0 0 4px' }}>{fullUser?.email}</p>
                            <p style={{ fontSize: '12px', color: '#8A94A6', margin: 0 }}>ID: {fullUser?.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6B778C' }}>Loading details...</div>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* Profile Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '16px', background: '#FAFBFC', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', marginBottom: '4px' }}>Global Role</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Shield size={14} color="#6554C0" />
                                    {fullUser?.role}
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: '#FAFBFC', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', marginBottom: '4px' }}>Joined</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CalendarDays size={14} color="#36B37E" />
                                    {formatDate(fullUser?.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Administrative Controls */}
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <KeyRound size={16} color="#0052CC" /> Administrative Controls
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '8px', border: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Edit Profile</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C' }}>Update member details and global role.</div>
                                    </div>
                                    <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '13px', fontWeight: 600, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
                                        <Edit2 size={14} /> Edit
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '8px', border: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{fullUser?.isActive ? 'Suspend Account' : 'Reactivate Account'}</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C' }}>{fullUser?.isActive ? 'Temporarily revoke access to the organization.' : 'Restore access to the organization.'}</div>
                                    </div>
                                    <button onClick={handleToggleStatus} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: fullUser?.isActive ? '#FF8B00' : '#36B37E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Archive size={14} /> {fullUser?.isActive ? 'Suspend' : 'Reactivate'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Team Memberships */}
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={16} /> Team Memberships ({fullUser?.teamMembers?.length || 0})
                            </h3>
                            {fullUser?.teamMembers?.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #DFE1E6', borderRadius: '8px', color: '#6B778C', fontSize: '13px' }}>
                                    Not a member of any teams yet.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {fullUser?.teamMembers?.map((tm: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#E9F2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                                                    {tm.team.name.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{tm.team.name}</div>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', background: '#F4F5F7', padding: '2px 8px', borderRadius: '4px' }}>
                                                {tm.role || 'MEMBER'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Project Access */}
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={16} /> Project Access ({fullUser?.projectAccesses?.length || 0})
                            </h3>
                            {fullUser?.projectAccesses?.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #DFE1E6', borderRadius: '8px', color: '#6B778C', fontSize: '13px' }}>
                                    No specific project access granted.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {fullUser?.projectAccesses?.map((pa: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{pa.project.name}</div>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', background: '#F4F5F7', padding: '2px 8px', borderRadius: '4px' }}>
                                                {pa.role?.name || 'VIEWER'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} /> Recent Administrative Activity
                            </h3>
                            {activityLogs.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #DFE1E6', borderRadius: '8px', color: '#6B778C', fontSize: '13px' }}>
                                    No recent administrative activity found.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #DFE1E6', marginLeft: '8px', paddingLeft: '16px' }}>
                                    {activityLogs.map((log: any, i: number) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-21px', top: '2px', width: '8px', height: '8px', borderRadius: '50%', background: '#0052CC' }} />
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{log.action}</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>{formatDate(log.createdAt)}</div>
                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <div style={{ marginTop: '6px', fontSize: '11px', color: '#42526E', background: '#FAFBFC', padding: '8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                                    {JSON.stringify(log.metadata)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>

            {isSuspendModalOpen && (
                <AdminSuspendMemberModal
                    user={fullUser}
                    onClose={() => setIsSuspendModalOpen(false)}
                    onSuccess={() => {
                        setIsSuspendModalOpen(false);
                        fetchUserDetails();
                        onRefresh();
                    }}
                />
            )}
        </>
    );
}

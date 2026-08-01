"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, Archive, Settings, Users, FolderKanban, Info } from 'lucide-react';
import AdminMemberDetailDrawer from './AdminMemberDetailDrawer';

interface AdminMemberTableProps {
    users: any[];
    onRefresh: () => void;
}

export default function AdminMemberTable({ users, onRefresh }: AdminMemberTableProps) {
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (users.length === 0) {
        return (
            <div style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#8A94A6' }}>
                    <Users size={24} />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>No Members Found</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Adjust your filters or invite a new member.</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Member</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Teams</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Projects</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last Active</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Joined</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr 
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            style={{ borderBottom: '1px solid #F4F5F7', cursor: 'pointer', transition: 'background 0.1s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Member */}
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {user.image ? (
                                        <img src={user.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                                            {user.name?.substring(0,2).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', marginBottom: '2px' }}>{user.name}</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C' }}>{user.email}</div>
                                    </div>
                                </div>
                            </td>

                            {/* Role */}
                            <td style={{ padding: '16px' }}>
                                <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>
                                    {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'User'}
                                </span>
                            </td>

                            {/* Teams */}
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Users size={14} color="#6B778C" />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{user.teamMembers?.length || 0}</span>
                                </div>
                            </td>

                            {/* Projects */}
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FolderKanban size={14} color="#6B778C" />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{user.projectAccesses?.length || 0}</span>
                                </div>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '16px' }}>
                                <span style={{
                                    padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                                    background: user.isActive ? '#E3FCEF' : '#FFEBE6',
                                    color: user.isActive ? '#006644' : '#DE350B',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                }}>
                                    {user.isActive ? <CheckCircle2 size={12} /> : <Archive size={12} />}
                                    {user.isActive ? 'Active' : 'Suspended'}
                                </span>
                            </td>

                            {/* Last Active */}
                            <td style={{ padding: '16px', fontSize: '13px', color: '#42526E' }}>
                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : <span style={{ fontStyle: 'italic', color: '#97A0AF' }}>Never</span>}
                            </td>

                            {/* Joined */}
                            <td style={{ padding: '16px', fontSize: '13px', color: '#42526E' }}>
                                {formatDate(user.createdAt)}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setSelectedUser(user)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#6B778C', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Settings size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedUser && (
                <AdminMemberDetailDrawer 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    onRefresh={onRefresh}
                />
            )}
        </div>
    );
}

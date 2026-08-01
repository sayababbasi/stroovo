"use client";

import React, { useState, useEffect } from 'react';
import { Search, UserMinus, UserPlus, ShieldAlert } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminEffectiveAccessViewer from './AdminEffectiveAccessViewer';

interface AdminRoleMembersProps {
    role: any;
    onRefresh: () => void;
}

export default function AdminRoleMembers({ role, onRefresh }: AdminRoleMembersProps) {
    const [search, setSearch] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    
    // For assigning new members, we need to search all users
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [assignSearch, setAssignSearch] = useState('');
    const [selectedForAssign, setSelectedForAssign] = useState<Set<string>>(new Set());
    const [assignScope, setAssignScope] = useState<'organization' | 'team' | 'project'>('organization');
    const [scopeId, setScopeId] = useState('');
    
    const [inspectUserId, setInspectUserId] = useState<{ id: string; name: string } | null>(null);

    const members = role.users || [];
    
    const filteredMembers = members.filter((m: any) => 
        m.name?.toLowerCase().includes(search.toLowerCase()) || 
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (isAssigning) {
            fetchAllUsers();
        }
    }, [isAssigning]);

    const fetchAllUsers = async () => {
        try {
            // Simplified fetch, in a real app this would be paginated and debounced
            const res = await apiGet<any>('/api/admin/users?limit=100', null);
            if (res.success && res.data) {
                setAllUsers(res.data.users || []);
            }
        } catch (e) {
            console.error('Failed to fetch users for assignment');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (role.name === 'Super Admin' && members.length === 1) {
            toast.error('Cannot remove the last Super Admin');
            return;
        }

        try {
            const res = await apiDelete(`/api/admin/roles/${role.id}/members`, null, { 
                body: JSON.stringify({ userIds: [userId] }) 
            });
            if (res.success) {
                toast.success('Member removed from role');
                onRefresh();
            } else {
                toast.error(res.error || 'Failed to remove member');
            }
        } catch (e) {
            toast.error('An error occurred');
        }
    };

    const handleAssignMembers = async () => {
        if (selectedForAssign.size === 0) return;

        try {
            const res = await apiPost(`/api/admin/roles/${role.id}/members`, null, {
                userIds: Array.from(selectedForAssign),
                scopeType: assignScope,
                scopeId: scopeId || undefined
            });
            if (res.success) {
                toast.success('Members assigned to role');
                setIsAssigning(false);
                setSelectedForAssign(new Set());
                onRefresh();
            } else {
                toast.error(res.error || 'Failed to assign members');
            }
        } catch (e) {
            toast.error('An error occurred');
        }
    };

    const availableToAssign = allUsers.filter(u => 
        !members.some((m: any) => m.id === u.id) &&
        (u.name?.toLowerCase().includes(assignSearch.toLowerCase()) || u.email?.toLowerCase().includes(assignSearch.toLowerCase()))
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search members in this role..."
                        style={{
                            width: '100%', height: '36px', paddingLeft: '34px', paddingRight: '12px',
                            borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none'
                        }}
                    />
                </div>
                
                <button onClick={() => setIsAssigning(!isAssigning)} style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserPlus size={16} /> Assign Members
                </button>
            </div>

            {/* Assign Panel */}
            {isAssigning && (
                <div style={{ background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Assign New Members</h3>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                        <input
                            value={assignSearch}
                            onChange={(e) => setAssignSearch(e.target.value)}
                            placeholder="Search by name or email to assign..."
                            style={{
                                width: '100%', height: '36px', paddingLeft: '34px', paddingRight: '12px',
                                borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #DFE1E6', borderRadius: '6px', background: 'white' }}>
                        {availableToAssign.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#6B778C', fontSize: '13px' }}>No available users found.</div>
                        ) : (
                            availableToAssign.map(u => (
                                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #F4F5F7' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedForAssign.has(u.id)}
                                        onChange={(e) => {
                                            const next = new Set(selectedForAssign);
                                            if (e.target.checked) next.add(u.id);
                                            else next.delete(u.id);
                                            setSelectedForAssign(next);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{u.name}</div>
                                    <div style={{ fontSize: '12px', color: '#6B778C' }}>{u.email}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button onClick={() => { setIsAssigning(false); setSelectedForAssign(new Set()); }} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleAssignMembers} disabled={selectedForAssign.size === 0} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '13px', fontWeight: 600, cursor: selectedForAssign.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedForAssign.size === 0 ? 0.6 : 1 }}>
                            Assign {selectedForAssign.size} Members
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div style={{ border: '1px solid #DFE1E6', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Member</th>
                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#6B778C', fontSize: '13px' }}>
                                    No members are currently assigned to this role.
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member: any) => (
                                <tr key={member.id} style={{ borderBottom: '1px solid #F4F5F7' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {member.image ? (
                                                <img src={member.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                                                    {member.name?.substring(0,2).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', marginBottom: '2px' }}>{member.name}</div>
                                                <div style={{ fontSize: '12px', color: '#6B778C' }}>{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: member.isActive ? '#E3FCEF' : '#FFEBE6', color: member.isActive ? '#006644' : '#DE350B' }}>
                                            {member.isActive ? 'ACTIVE' : 'SUSPENDED'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => setInspectUserId({ id: member.id, name: member.name })}
                                            style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #0052CC', color: '#0052CC', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginRight: '8px' }}
                                        >
                                            Inspect
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveMember(member.id)}
                                            style={{ background: 'none', border: 'none', color: '#DE350B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <UserMinus size={14} /> Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {role.name === 'Super Admin' && (
                <div style={{ background: '#FFFAE6', border: '1px solid #FFC400', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FF8B00', fontSize: '13px', fontWeight: 600 }}>
                    <ShieldAlert size={16} /> Ensure you always have at least one Super Admin assigned to prevent lockout.
                </div>
            )}

            {inspectUserId && (
                <AdminEffectiveAccessViewer 
                    userId={inspectUserId.id} 
                    userName={inspectUserId.name} 
                    onClose={() => setInspectUserId(null)} 
                />
            )}
        </div>
    );
}

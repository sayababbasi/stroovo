"use client";

import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminAddTeamMemberModalProps {
    team: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminAddTeamMemberModal({ team, isOpen, onClose, onSuccess }: AdminAddTeamMemberModalProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        } else {
            setSelectedUserId('');
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await apiGet<any>('/api/admin/users', null);
            if (res.success && res.data) {
                setUsers(res.data.users || res.data || []);
            }
        } catch (e) {
            console.error('Failed to fetch users', e);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) return;

        setIsSubmitting(true);
        try {
            const res = await apiPost(`/api/admin/teams/${team.id}/members`, null, {
                userId: selectedUserId,
                role: 'MEMBER'
            });

            if (res.success) {
                toast.success('Member added successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Failed to add member');
            }
        } catch (e: any) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Filter out users that are already in the team
    const availableUsers = users.filter(u => !team.members?.some((m: any) => m.userId === u.id));

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: '12px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(9,30,66,0.20)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E3FCEF', color: '#006644', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Add Member</h2>
                            <p style={{ fontSize: '13px', color: '#6B778C', margin: '2px 0 0' }}>Assign a new member to {team.name}.</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Select User <span style={{ color: '#DE350B' }}>*</span></label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            disabled={loadingUsers || availableUsers.length === 0}
                            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                            required
                        >
                            <option value="">
                                {loadingUsers ? 'Loading users...' : availableUsers.length === 0 ? 'No available users' : 'Select a user...'}
                            </option>
                            {availableUsers.map((u: any) => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                        {availableUsers.length === 0 && !loadingUsers && (
                            <p style={{ fontSize: '12px', color: '#DE350B', marginTop: '4px' }}>All users are already in this team.</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !selectedUserId}
                            style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, fontSize: '14px', cursor: (isSubmitting || !selectedUserId) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !selectedUserId) ? 0.6 : 1 }}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

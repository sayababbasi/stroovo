"use client";

import React, { useState, useEffect } from 'react';
import { X, Network, Search } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminCreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isHierarchyContext?: boolean;
    allTeams?: any[];
}

export default function AdminCreateTeamModal({ isOpen, onClose, onSuccess, isHierarchyContext, allTeams }: AdminCreateTeamModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [visibility, setVisibility] = useState('PRIVATE');
    const [parentTeamId, setParentTeamId] = useState('');
    const [teamType, setTeamType] = useState('TEAM');
    
    // For selecting owner
    const [users, setUsers] = useState<any[]>([]);
    const [ownerId, setOwnerId] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        } else {
            // Reset form
            setName('');
            setDescription('');
            setStatus('ACTIVE');
            setVisibility('PRIVATE');
            setParentTeamId('');
            setTeamType('TEAM');
            setOwnerId('');
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await apiGet<any>('/api/admin/users', null); // Assuming this endpoint exists based on earlier phases
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
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await apiPost('/api/admin/teams', null, {
                name: name.trim(),
                description: description.trim(),
                status,
                visibility,
                ownerId: ownerId || undefined,
                leadId: ownerId || undefined, // Send leadId if in hierarchy context
                parentTeamId: parentTeamId || undefined,
                teamType: teamType

            });

            if (res.success) {
                toast.success('Team created successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Failed to create team');
            }
        } catch (e: any) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: '12px', width: '560px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(9,30,66,0.20)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E9F2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Network size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Create New Team</h2>
                            <p style={{ fontSize: '13px', color: '#6B778C', margin: '2px 0 0' }}>Configure a new team structure and assign an owner.</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Team Name <span style={{ color: '#DE350B' }}>*</span></label>
                        <input
                            autoFocus
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Core Engineering"
                            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is the purpose of this team?"
                            style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Team Lead / Owner</label>
                            <select
                                value={ownerId}
                                onChange={(e) => setOwnerId(e.target.value)}
                                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                            >
                                <option value="">Select a user...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                            >
                                <option value="ACTIVE">Active (Healthy)</option>
                                <option value="RESTRICTED">Restricted (No invites)</option>
                                <option value="ARCHIVED">Archived (Read-only)</option>
                            </select>
                        </div>
                    </div>

                    {isHierarchyContext && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Parent Team</label>
                                <select
                                    value={parentTeamId}
                                    onChange={(e) => setParentTeamId(e.target.value)}
                                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                                >
                                    <option value="">None (Root Team)</option>
                                    {allTeams?.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Team Type</label>
                                <select
                                    value={teamType}
                                    onChange={(e) => setTeamType(e.target.value)}
                                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                                >
                                    <option value="DEPARTMENT">Department</option>
                                    <option value="TRIBE">Tribe</option>
                                    <option value="SQUAD">Squad</option>
                                    <option value="TEAM">Team</option>
                                </select>
                            </div>
                        </div>
                    )}


                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Visibility & Security Policy</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                        >
                            <option value="PRIVATE">Private (Invite only, Strict access)</option>
                            <option value="INTERNAL">Internal (Visible to all org members)</option>
                            <option value="PUBLIC">Public (Visible externally via links)</option>
                        </select>
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6B778C' }}>This dictates default project access models within this team.</p>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={isSubmitting || !name} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: 'none', background: !name ? '#DFE1E6' : '#0052CC', color: !name ? '#97A0AF' : 'white', fontWeight: 600, fontSize: '14px', cursor: !name ? 'not-allowed' : 'pointer' }}>
                            {isSubmitting ? 'Creating...' : 'Create Team'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

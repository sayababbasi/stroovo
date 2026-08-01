"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminTransferOwnershipModalProps {
    team: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminTransferOwnershipModal({ team, onClose, onSuccess }: AdminTransferOwnershipModalProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [newOwnerId, setNewOwnerId] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const res = await apiGet<any>('/api/admin/users');
            if (res.success && res.data) {
                setUsers(res.data.users || res.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleTransfer = async () => {
        if (!newOwnerId) return;
        setIsSubmitting(true);
        try {
            const res = await apiPatch(`/api/admin/teams/${team.id}`, null, { newOwnerId });
            if (res.success) {
                toast.success('Ownership transferred successfully');
                onSuccess();
            } else {
                toast.error(res.error || 'Failed to transfer ownership');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1020, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: '12px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(9,30,66,0.20)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFF0B3', color: '#FF8B00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowRightLeft size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Transfer Ownership</h2>
                            <p style={{ fontSize: '13px', color: '#6B778C', margin: '2px 0 0' }}>Assign a new lead for {team.name}.</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: '#FAFBFC', border: '1px solid #DFE1E6' }}>
                        <ShieldAlert size={16} color="#42526E" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', color: '#42526E', margin: 0, lineHeight: 1.5 }}>
                            Transferring ownership will revoke the current owner's administrative responsibilities over this team and grant them to the selected user.
                        </p>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Select New Owner <span style={{ color: '#DE350B' }}>*</span></label>
                        <select
                            value={newOwnerId}
                            onChange={(e) => setNewOwnerId(e.target.value)}
                            disabled={isLoadingUsers}
                            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                        >
                            <option value="">{isLoadingUsers ? 'Loading users...' : 'Select a user...'}</option>
                            {users.map((u: any) => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                        <button 
                            type="button" 
                            onClick={handleTransfer}
                            disabled={isSubmitting || !newOwnerId} 
                            style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: 'none', background: !newOwnerId ? '#DFE1E6' : '#FFAB00', color: !newOwnerId ? '#97A0AF' : 'white', fontWeight: 600, fontSize: '14px', cursor: !newOwnerId ? 'not-allowed' : 'pointer' }}
                        >
                            {isSubmitting ? 'Transferring...' : 'Transfer Ownership'}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}

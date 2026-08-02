"use client";

import React, { useState } from 'react';
import { X, UserMinus, AlertTriangle } from 'lucide-react';
import { apiDelete } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminRemoveMemberModalProps {
    team: any;
    member: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminRemoveMemberModal({ team, member, onClose, onSuccess }: AdminRemoveMemberModalProps) {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async () => {
        setIsRemoving(true);

        try {
            const res = await apiDelete(`/api/admin/teams/${team.id}/members?userId=${member.user.id}`, null);
            if (res.success) {
                toast.success('Member removed successfully');
                onSuccess();
            } else {
                toast.error(res.error || 'Failed to remove member');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1010, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: '12px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(9,30,66,0.20)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFEBE6', color: '#DE350B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <UserMinus size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: '0 0 8px' }}>Remove Member?</h2>
                            <p style={{ fontSize: '14px', color: '#42526E', margin: 0, lineHeight: 1.5 }}>
                                Are you sure you want to remove <strong>{member.user.name || member.user.email}</strong> from <strong>{team.name}</strong>? They will lose access to all team spaces and tasks.
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#FAFBFC', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <button onClick={onClose} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                    <button 
                        onClick={handleRemove}
                        disabled={isRemoving} 
                        style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: 'none', background: '#DE350B', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {isRemoving ? 'Removing...' : 'Remove Member'}
                    </button>
                </div>

            </div>
        </div>
    );
}

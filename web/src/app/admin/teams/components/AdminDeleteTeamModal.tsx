"use client";

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { apiDelete } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminDeleteTeamModalProps {
    team: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminDeleteTeamModal({ team, onClose, onSuccess }: AdminDeleteTeamModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmText !== team.name) return;
        setIsDeleting(true);

        try {
            const res = await apiDelete(`/api/admin/teams/${team.id}`);
            if (res.success) {
                toast.success('Team permanently deleted');
                onSuccess();
            } else {
                toast.error(res.error || 'Failed to delete team');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1010, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: '12px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(9,30,66,0.20)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFEBE6', color: '#DE350B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: '0 0 8px' }}>Delete Team?</h2>
                            <p style={{ fontSize: '14px', color: '#42526E', margin: 0, lineHeight: 1.5 }}>
                                You are about to permanently delete <strong>{team.name}</strong>. This action is irreversible. All associated team configurations, explicit team spaces, and internal team mappings will be destroyed.
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '0 24px 24px', marginLeft: '64px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>
                        To confirm, type <strong>{team.name}</strong> below:
                    </label>
                    <input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={team.name}
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                    />
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#FAFBFC', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <button onClick={onClose} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting || confirmText !== team.name} 
                        style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: 'none', background: confirmText !== team.name ? '#FFBDAD' : '#DE350B', color: 'white', fontWeight: 600, fontSize: '14px', cursor: confirmText !== team.name ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                </div>

            </div>
        </div>
    );
}

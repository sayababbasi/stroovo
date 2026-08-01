"use client";

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { apiPatch } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminSuspendMemberModalProps {
    user: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminSuspendMemberModal({ user, onClose, onSuccess }: AdminSuspendMemberModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmation, setConfirmation] = useState('');

    const handleSuspend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmation !== user.email) return;

        setIsSubmitting(true);
        try {
            const res = await apiPatch(`/api/admin/users/${user.id}`, null, {
                isActive: false
            });

            if (res.success) {
                toast.success('Member suspended successfully');
                onSuccess();
            } else {
                toast.error(res.error || 'Failed to suspend member');
            }
        } catch (e: any) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: '12px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(9,30,66,0.20)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFEBE6', color: '#DE350B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Suspend Member</h2>
                            <p style={{ fontSize: '13px', color: '#6B778C', margin: '2px 0 0' }}>Temporarily revoke access for this user.</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#FFF7F5', border: '1px solid #FFBDAD', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px' }}>
                        <AlertTriangle size={16} color="#DE350B" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '13px', color: '#DE350B', lineHeight: 1.5 }}>
                            <strong>You are about to suspend {user.name}.</strong>
                            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                                <li>The user will be immediately logged out.</li>
                                <li>Active sessions will be revoked.</li>
                                <li>Team and project access will be temporarily blocked.</li>
                                <li>Historical data and tasks will remain intact.</li>
                            </ul>
                        </div>
                    </div>

                    <form onSubmit={handleSuspend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>
                                To confirm, type the user's email <strong style={{ userSelect: 'all' }}>{user.email}</strong> below:
                            </label>
                            <input
                                type="text"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                            <button type="button" onClick={onClose} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting || confirmation !== user.email}
                                style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: 'none', background: '#DE350B', color: 'white', fontWeight: 600, fontSize: '14px', cursor: (isSubmitting || confirmation !== user.email) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || confirmation !== user.email) ? 0.6 : 1 }}
                            >
                                {isSubmitting ? 'Suspending...' : 'Suspend Member'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

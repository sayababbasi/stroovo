"use client";

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminInviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminInviteMemberModal({ isOpen, onClose, onSuccess }: AdminInviteMemberModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('USER');
    
    // In a real implementation, you'd fetch available teams/projects.
    // For now we'll stick to core user creation matching `createUserSchema` from the backend.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        try {
            const res = await apiPost('/api/admin/users', null, {
                name,
                email,
                role,
                isActive: true
            });

            if (res.success || res.id) {
                toast.success('Member invited successfully');
                onSuccess();
                handleClose();
            } else {
                toast.error(res.error || 'Failed to invite member');
            }
        } catch (e: any) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setEmail('');
        setRole('USER');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div style={{ background: 'white', borderRadius: '12px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(9,30,66,0.20)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E3FCEF', color: '#006644', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Invite Member</h2>
                            <p style={{ fontSize: '13px', color: '#6B778C', margin: '2px 0 0' }}>Add a new user to your organization.</p>
                        </div>
                    </div>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Full Name <span style={{ color: '#DE350B' }}>*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Alex Johnson"
                            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Email Address <span style={{ color: '#DE350B' }}>*</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@example.com"
                            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>Global Role <span style={{ color: '#DE350B' }}>*</span></label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                            required
                        >
                            <option value="USER">User (Standard Access)</option>
                            <option value="ADMIN">Administrator</option>
                            <option value="SUPER_ADMIN">Super Administrator</option>
                        </select>
                        <p style={{ fontSize: '12px', color: '#6B778C', marginTop: '6px' }}>
                            {role === 'SUPER_ADMIN' ? 'Full unrestricted access to everything including billing and global security.' : 
                             role === 'ADMIN' ? 'Can manage users, teams, and most organization settings.' : 
                             'Standard access. Permissions determined by team and project assignments.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={handleClose} style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !name || !email}
                            style={{ padding: '0 20px', height: '40px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, fontSize: '14px', cursor: (isSubmitting || !name || !email) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !name || !email) ? 0.6 : 1 }}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

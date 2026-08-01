"use client";

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminCreateRoleModalProps {
    roles: any[];
    onClose: () => void;
    onSuccess: (newRole: any) => void;
}

export default function AdminCreateRoleModal({ roles, onClose, onSuccess }: AdminCreateRoleModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cloneFromRoleId, setCloneFromRoleId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Role name is required');
            return;
        }

        setLoading(true);
        try {
            const res = await apiPost<any>('/api/admin/roles', null, {
                name,
                description,
                cloneFromRoleId: cloneFromRoleId || undefined
            });

            if (res.success && res.data) {
                toast.success('Role created successfully');
                onSuccess(res.data);
            } else {
                toast.error(res.error || 'Failed to create role');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 30, 66, 0.54)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 16px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.31)', overflow: 'hidden' }}>
                
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Create Custom Role</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#42526E', marginBottom: '8px' }}>
                                Role Name <span style={{ color: '#DE350B' }}>*</span>
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. QA Engineer"
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#42526E', marginBottom: '8px' }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the purpose of this role..."
                                rows={3}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#42526E', marginBottom: '8px' }}>
                                Clone permissions from (Optional)
                            </label>
                            <select
                                value={cloneFromRoleId}
                                onChange={(e) => setCloneFromRoleId(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none', background: 'white' }}
                            >
                                <option value="">Start with blank permissions</option>
                                <optgroup label="System Roles">
                                    {roles.filter(r => r.isSystem).map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Custom Roles">
                                    {roles.filter(r => !r.isSystem).map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6B778C' }}>
                                This will copy the initial permission set to the new role. You can customize them later.
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #DFE1E6', background: '#FAFBFC', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || !name.trim()} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: (loading || !name.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !name.trim()) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={16} /> {loading ? 'Creating...' : 'Create Role'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { X, Network, Building2, Shield, Users, Check, AlertCircle } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminCreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isHierarchyContext?: boolean;
    allTeams?: any[];
}

interface DepartmentOption {
    id: string;
    name: string;
    code: string | null;
}

export default function AdminCreateTeamModal({ isOpen, onClose, onSuccess, isHierarchyContext, allTeams }: AdminCreateTeamModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [visibility, setVisibility] = useState('PRIVATE');
    const [departmentId, setDepartmentId] = useState('');
    const [parentTeamId, setParentTeamId] = useState('');
    const [teamType, setTeamType] = useState('TEAM');
    
    // For selecting owner and members
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [ownerId, setOwnerId] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    
    const [loadingData, setLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        } else {
            // Reset form
            setName('');
            setDescription('');
            setStatus('ACTIVE');
            setVisibility('PRIVATE');
            setDepartmentId('');
            setParentTeamId('');
            setTeamType('TEAM');
            setOwnerId('');
            setSelectedMemberIds([]);
            setError('');
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        setLoadingData(true);
        try {
            const [userRes, deptRes] = await Promise.all([
                apiGet<any>('/api/admin/users', null),
                fetch('/api/departments', { credentials: 'include' })
            ]);

            if (userRes.success && userRes.data) {
                setUsers(userRes.data.users || userRes.data || []);
            }

            if (deptRes.ok) {
                const dData = await deptRes.json();
                setDepartments(Array.isArray(dData) ? dData : []);
            }
        } catch (e) {
            console.error('Failed to fetch modal data', e);
        } finally {
            setLoadingData(false);
        }
    };

    const handleToggleMember = (userId: string) => {
        setSelectedMemberIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Team name is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await apiPost('/api/admin/teams', null, {
                name: name.trim(),
                description: description.trim(),
                status,
                visibility,
                departmentId: departmentId || undefined,
                ownerId: ownerId || undefined,
                leadId: ownerId || undefined,
                parentTeamId: parentTeamId || undefined,
                teamType: teamType,
                memberIds: selectedMemberIds
            });

            if (res.success) {
                toast.success('Enterprise Team created successfully!');
                onSuccess();
                onClose();
            } else {
                setError(res.error || 'Failed to create team');
            }
        } catch (e: any) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUserInitials = (userName?: string, email?: string) => {
        if (userName && userName.trim()) {
            const parts = userName.trim().split(' ');
            return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].substring(0, 2).toUpperCase();
        }
        return email ? email.substring(0, 2).toUpperCase() : 'U';
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(9, 30, 66, 0.54)',
            backdropFilter: 'blur(3px)'
        }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '640px',
                maxWidth: '95vw',
                maxHeight: '92vh',
                boxShadow: '0 24px 64px rgba(9,30,66,0.22)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'modalIn 0.2s ease-out'
            }}>
                
                {/* Modal Header */}
                <div style={{
                    padding: '24px 28px 18px',
                    borderBottom: '1px solid #DFE1E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FFFFFF'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: '#E9F2FF',
                            color: '#0052CC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Network size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: 0, letterSpacing: '-0.01em' }}>
                                Create Enterprise Team
                            </h2>
                            <p style={{ fontSize: '13px', color: '#6B778C', margin: '2px 0 0', fontWeight: 500 }}>
                                Configure organizational structure, assign department, and define access control.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #DFE1E6',
                            background: '#FFFFFF',
                            color: '#6B778C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {error && (
                        <div style={{
                            background: '#FFEBE6',
                            border: '1px solid #FF5630',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: '#BF2600',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Section 1: Team Name & Department */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                                Team Name <span style={{ color: '#DE350B' }}>*</span>
                            </label>
                            <input
                                autoFocus
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Core Engineering"
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #DFE1E6',
                                    fontSize: '13.5px',
                                    outline: 'none',
                                    background: '#FAFBFC',
                                    color: '#172B4D',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                                Department
                            </label>
                            <select
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #DFE1E6',
                                    fontSize: '13px',
                                    outline: 'none',
                                    background: '#FAFBFC',
                                    color: '#172B4D',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="">No Department (Independent)</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is the mission and purpose of this team?"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #DFE1E6',
                                fontSize: '13px',
                                outline: 'none',
                                resize: 'none',
                                background: '#FAFBFC',
                                color: '#172B4D',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Section 2: Team Lead & Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                                Team Lead / Owner
                            </label>
                            <select
                                value={ownerId}
                                onChange={(e) => setOwnerId(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #DFE1E6',
                                    fontSize: '13px',
                                    outline: 'none',
                                    background: '#FAFBFC',
                                    color: '#172B4D',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="">Select a Team Lead...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name || u.email} ({u.role})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #DFE1E6',
                                    fontSize: '13px',
                                    outline: 'none',
                                    background: '#FAFBFC',
                                    color: '#172B4D',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="ACTIVE">Active (Healthy)</option>
                                <option value="RESTRICTED">Restricted (No invites)</option>
                                <option value="ARCHIVED">Archived (Read-only)</option>
                            </select>
                        </div>
                    </div>

                    {/* Section 3: Team Function & Visibility */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                                Team Type / Function
                            </label>
                            <select
                                value={teamType}
                                onChange={(e) => setTeamType(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #DFE1E6',
                                    fontSize: '13px',
                                    outline: 'none',
                                    background: '#FAFBFC',
                                    color: '#172B4D',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="TEAM">Standard Team</option>
                                <option value="CORE_ENGINEERING">Core Engineering</option>
                                <option value="PRODUCT_DELIVERY">Product Delivery Squad</option>
                                <option value="SALES_OPS">Sales & Growth Ops</option>
                                <option value="CROSS_FUNCTIONAL">Cross-Functional Tribe</option>
                                <option value="QUALITY_ASSURANCE">Quality & Reliability</option>
                                <option value="STRATEGIC_OPS">Executive Strategy</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                                Visibility & Security Policy
                            </label>
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #DFE1E6',
                                    fontSize: '13px',
                                    outline: 'none',
                                    background: '#FAFBFC',
                                    color: '#172B4D',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="PRIVATE">Private (Invite only, Strict access)</option>
                                <option value="INTERNAL">Internal (Visible to all org members)</option>
                                <option value="PUBLIC">Public (Open access)</option>
                            </select>
                        </div>
                    </div>

                    {/* Section 4: Initial Member Roster */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E' }}>
                                Assign Team Members ({selectedMemberIds.length} selected)
                            </label>
                            {selectedMemberIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedMemberIds([])}
                                    style={{ fontSize: '11px', color: '#0052CC', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>

                        <div style={{
                            border: '1px solid #DFE1E6',
                            borderRadius: '8px',
                            maxHeight: '140px',
                            overflowY: 'auto',
                            padding: '6px',
                            background: '#FAFBFC'
                        }}>
                            {users.map(u => {
                                const isChecked = selectedMemberIds.includes(u.id);

                                return (
                                    <label
                                        key={u.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            background: isChecked ? '#E3F2FD' : 'transparent',
                                            cursor: 'pointer',
                                            marginBottom: '2px'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggleMember(u.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: '#0052CC',
                                            color: '#FFFFFF',
                                            fontSize: '9.5px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {getUserInitials(u.name, u.email)}
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#172B4D' }}>{u.name || u.email}</span>
                                            <span style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500 }}>{u.role}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 22px',
                                borderRadius: '8px',
                                border: '1px solid #DFE1E6',
                                background: '#FFFFFF',
                                color: '#42526E',
                                fontWeight: 600,
                                fontSize: '13.5px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            style={{
                                padding: '10px 28px',
                                borderRadius: '8px',
                                border: 'none',
                                background: isSubmitting || !name.trim() ? '#DFE1E6' : '#0052CC',
                                color: isSubmitting || !name.trim() ? '#97A0AF' : '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '13.5px',
                                cursor: isSubmitting || !name.trim() ? 'not-allowed' : 'pointer',
                                boxShadow: !name.trim() ? 'none' : '0 2px 6px rgba(0,82,204,0.25)'
                            }}
                        >
                            {isSubmitting ? 'Creating Team...' : 'Create Team'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

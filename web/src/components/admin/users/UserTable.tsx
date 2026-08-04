"use client";

import React, { useState } from 'react';
import { 
    MoreHorizontal, Mail, CheckCircle, XCircle, 
    Key, Trash2, Shield, Calendar, Clock,
    ArrowRight, Loader2, Edit3, Users, CheckSquare, Square
} from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    title: string | null;
    contact: string | null;
    image: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    _count: {
        tasks: number;
        managedProjects: number;
    };
    department?: string | null;
    designation?: string | null;
    experienceLevel?: string | null;
    workloadStatus?: 'Low' | 'Medium' | 'High' | null;
}

interface UserTableProps {
    users: User[];
    loading: boolean;
    onUserClick: (user: User) => void;
    onEditUser: (user: User) => void;
    onRoleChange: (userId: string, newRole: string) => void;
    onStatusToggle: (userId: string, currentStatus: boolean) => void;
    onDelete: (userId: string) => void;
    onResetPassword: (userId: string) => void;
    selectedUsers?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
}

const RoleBadge = ({ role }: { role: string }) => {
    const config: any = {
        SUPER_ADMIN: { color: '#FF5630', bg: '#FFEBE6', label: 'Super Admin' },
        ADMIN: { color: '#0052CC', bg: '#DEEBFF', label: 'Admin' },
        CEO: { color: '#6554C0', bg: '#EAE6FF', label: 'CEO' },
        EXECUTIVE: { color: '#00B8D9', bg: '#E6FCFF', label: 'Executive' },
        MANAGER: { color: '#FF9900', bg: '#FFF3E0', label: 'Manager' },
        PROJECT_MANAGER: { color: '#FFAB00', bg: '#FFF7E6', label: 'Manager' },
        TEAM_MEMBER: { color: '#36B37E', bg: '#E3FCEF', label: 'Member' },
    };
    const normalizedRole = (role || '').toUpperCase().replace(/\s+/g, '_');
    const item = config[normalizedRole] || config[role] || config.TEAM_MEMBER;
    return (
        <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px', 
            borderRadius: '6px', 
            background: item.bg, 
            color: item.color, 
            fontSize: '11px', 
            fontWeight: 800, 
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            lineHeight: '1.2'
        }}>
            {item.label}
        </span>
    );
};

const WorkloadBadge = ({ status }: { status?: 'Low' | 'Medium' | 'High' | null }) => {
    const config = {
        Low: { color: '#36B37E', label: 'Low' },
        Medium: { color: '#FFAB00', label: 'Medium' },
        High: { color: '#FF5630', label: 'High' }
    }[status || 'Low'];
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: config.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: config.color }}>{config.label}</span>
        </div>
    );
};

export default function UserTable({ 
    users, 
    loading, 
    onUserClick, 
    onEditUser,
    onRoleChange, 
    onStatusToggle,
    onDelete,
    onResetPassword,
    selectedUsers = [],
    onSelectionChange
}: UserTableProps) {
    const handleSelectAll = (checked: boolean) => {
        if (onSelectionChange) {
            onSelectionChange(checked ? users.map(u => u.id) : []);
        }
    };

    const handleSelectUser = (id: string, checked: boolean) => {
        if (onSelectionChange) {
            if (checked) {
                onSelectionChange([...selectedUsers, id]);
            } else {
                onSelectionChange(selectedUsers.filter(item => item !== id));
            }
        }
    };

    const allSelected = users.length > 0 && selectedUsers.length === users.length;

    if (loading) {
        return (
            <div style={{ background: 'white', borderRadius: '20px', padding: '64px', textAlign: 'center', border: '1px solid #EBECF0' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#0052CC', margin: '0 auto 16px' }} />
                <p style={{ color: '#6B778C', fontWeight: 600 }}>Loading team members...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div style={{ background: 'white', borderRadius: '20px', padding: '64px', textAlign: 'center', border: '1px solid #EBECF0' }}>
                <Users size={48} style={{ color: '#C1C7D0', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', marginBottom: '8px' }}>No users found</h3>
                <p style={{ color: '#6B778C', maxWidth: '300px', margin: '0 auto' }}>Try adjusting your filters or search terms to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            border: '1px solid #EBECF0', 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F8F9FB', borderBottom: '1px solid #EBECF0' }}>
                            <th style={{ textAlign: 'left', padding: '16px 24px', width: '40px' }}>
                                <input 
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                            </th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role & Dept</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workload</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, idx) => (
                            <motion.tr 
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: idx * 0.03 }}
                                onClick={() => onUserClick(user)}
                                style={{ 
                                    borderBottom: '1px solid #F4F5F7', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: selectedUsers.includes(user.id) ? '#F0F7FF' : 'transparent'
                                }}
                                onMouseEnter={(e) => { if (!selectedUsers.includes(user.id)) e.currentTarget.style.background = '#F8F9FB'; }}
                                onMouseLeave={(e) => { if (!selectedUsers.includes(user.id)) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <td style={{ padding: '16px 24px' }} onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name || 'User DP'}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    minWidth: '40px',
                                                    minHeight: '40px',
                                                    flexShrink: 0,
                                                    borderRadius: '12px',
                                                    objectFit: 'cover',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        ) : (
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                minWidth: '40px',
                                                minHeight: '40px',
                                                flexShrink: 0,
                                                borderRadius: '12px', 
                                                background: user.isActive ? '#0052CC' : '#6B778C', 
                                                color: 'white', 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontSize: '15px',
                                                fontWeight: 800,
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                            }}>
                                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#172B4D', lineHeight: '1.3' }}>{user.name || 'Anonymous'}</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C', lineHeight: '1.3' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                        <RoleBadge role={user.role} />
                                        <span style={{ fontSize: '12px', color: '#42526E', fontWeight: 600, display: 'inline-block' }}>{user.department || 'General'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ fontSize: '11px', color: '#6B778C', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#F4F5F7' }}>
                                        {user.experienceLevel || 'Mid'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <WorkloadBadge status={user.workloadStatus} />
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.isActive ? '#36B37E' : '#FF5630' }} />
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: user.isActive ? '#36B37E' : '#FF5630' }}>
                                            {user.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        <button 
                                            onClick={() => onEditUser(user)}
                                            style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#0052CC', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#E3F2FD'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            title="Edit & Manage User"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onResetPassword(user.id)}
                                            style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#6B778C', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#DEEBFF'; e.currentTarget.style.color = '#0052CC'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B778C'; }}
                                            title="Reset Password"
                                        >
                                            <Key size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onStatusToggle(user.id, user.isActive)}
                                            style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#6B778C', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = user.isActive ? '#FFEBE6' : '#E3FCEF'; e.currentTarget.style.color = user.isActive ? '#FF5630' : '#36B37E'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B778C'; }}
                                            title={user.isActive ? 'Suspend User' : 'Activate User'}
                                        >
                                            {user.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                        <button 
                                            onClick={() => onDelete(user.id)}
                                            style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#6B778C', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FFEBE6'; e.currentTarget.style.color = '#FF5630'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B778C'; }}
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

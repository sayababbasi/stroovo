'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    FiShield, FiUsers, FiLock, FiPlus, FiTrash2, 
    FiCopy, FiSave, FiCheckCircle, FiXCircle,
    FiSettings, FiActivity, FiCpu, FiLayout, FiUser
} from 'react-icons/fi';

interface Role {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    _count: {
        permissions: number;
        users: number;
    };
}

interface Permission {
    id: string;
    module: string;
    action: string;
    key: string;
    description: string | null;
}

interface RoleDetail extends Role {
    permissions: { permission: Permission }[];
    users: { id: string; name: string | null; email: string }[];
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [matrixLoading, setMatrixLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/admin/roles');
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
                // Select first role by default if none selected
                if (data.length > 0 && !selectedRole) {
                    fetchRoleDetail(data[0].id);
                }
            }
        } catch (err) {
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await fetch('/api/admin/permissions');
            if (res.ok) setPermissions(await res.json());
        } catch (err) {
            toast.error('Failed to load permissions');
        }
    };

    const fetchRoleDetail = async (id: string) => {
        setMatrixLoading(true);
        try {
            const res = await fetch(`/api/admin/roles/${id}`);
            if (res.ok) setSelectedRole(await res.json());
        } catch (err) {
            toast.error('Failed to load role details');
        } finally {
            setMatrixLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const handleTogglePermission = async (permKey: string) => {
        if (!selectedRole || selectedRole.isSystem && selectedRole.name === 'Admin') {
            toast.error('Admin permissions cannot be modified');
            return;
        }

        const currentKeys = selectedRole.permissions.map(p => p.permission.key);
        let newKeys: string[];

        if (currentKeys.includes(permKey)) {
            newKeys = currentKeys.filter(k => k !== permKey);
        } else {
            newKeys = [...currentKeys, permKey];
        }

        try {
            const res = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissionKeys: newKeys })
            });

            if (res.ok) {
                // Update local state
                fetchRoleDetail(selectedRole.id);
                toast.success('Permission updated');
            }
        } catch (err) {
            toast.error('Failed to update permission');
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRole)
            });
            if (res.ok) {
                toast.success('Role created');
                setIsCreating(false);
                setNewRole({ name: '', description: '' });
                fetchRoles();
            }
        } catch (err) {
            toast.error('Failed to create role');
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            const res = await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Role deleted');
                setSelectedRole(null);
                fetchRoles();
            }
        } catch (err) {
            toast.error('Failed to delete role');
        }
    };

    const modules = Array.from(new Set(permissions.map(p => p.module)));
    const actions = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXECUTE', 'MANAGE'];

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Permission Engine...</div>;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: '2px', background: '#F4F5F7', overflow: 'hidden' }}>
            {/* 1. ROLE LIST PANEL (LEFT) */}
            <div style={{ width: '320px', background: 'white', borderRight: '1px solid #EBECF0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #EBECF0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D' }}>Roles</h2>
                        <button 
                            onClick={() => setIsCreating(true)}
                            style={{ background: '#0052CC', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FiPlus /> Create
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {roles.map(role => (
                        <div 
                            key={role.id}
                            onClick={() => fetchRoleDetail(role.id)}
                            style={{ 
                                padding: '16px', 
                                borderRadius: '12px', 
                                cursor: 'pointer', 
                                marginBottom: '8px',
                                transition: 'all 0.2s ease',
                                background: selectedRole?.id === role.id ? '#F4F5F7' : 'transparent',
                                border: selectedRole?.id === role.id ? '1px solid #0052CC20' : '1px solid transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, color: selectedRole?.id === role.id ? '#0052CC' : '#172B4D', fontSize: '15px' }}>{role.name}</span>
                                {role.isSystem && <span style={{ fontSize: '10px', background: '#EAE6FF', color: '#403294', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>SYSTEM</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B778C' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiShield /> {role._count.permissions} perms</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUsers /> {role._count.users} users</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. PERMISSION MATRIX (CENTER) */}
            <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #EBECF0' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D' }}>
                        Permission Matrix: <span style={{ color: '#0052CC' }}>{selectedRole?.name || 'Select a Role'}</span>
                    </h2>
                    <p style={{ color: '#6B778C', fontSize: '14px', marginTop: '4px' }}>Define what this role can see and do across the system.</p>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {matrixLoading ? (
                        <div style={{ textAlign: 'center', padding: '100px', color: '#6B778C' }}>Loading Matrix...</div>
                    ) : selectedRole ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #F4F5F7' }}>
                                    <th style={{ padding: '12px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase' }}>Module</th>
                                    {actions.map(action => (
                                        <th key={action} style={{ padding: '12px', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>{action}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map(module => (
                                    <tr key={module} style={{ borderBottom: '1px solid #F4F5F7' }}>
                                        <td style={{ padding: '16px 12px', fontWeight: 700, color: '#172B4D' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {module === 'USERS' && <FiUsers color="#0052CC" />}
                                                {module === 'TASKS' && <FiLayout color="#36B37E" />}
                                                {module === 'AI' && <FiCpu color="#6554C0" />}
                                                {module === 'ADMIN' && <FiSettings color="#FF5630" />}
                                                {module === 'TEAMS' && <FiUsers color="#00B8D9" />}
                                                {module === 'ANALYTICS' && <FiActivity color="#FFAB00" />}
                                                {module}
                                            </div>
                                        </td>
                                        {actions.map(action => {
                                            const perm = permissions.find(p => p.module === module && p.action === action);
                                            const isAllowed = selectedRole.permissions.some(p => p.permission.key === perm?.key);
                                            
                                            if (!perm) return <td key={action} style={{ padding: '12px' }}></td>;

                                            return (
                                                <td key={action} style={{ padding: '12px', textAlign: 'center' }}>
                                                    <div 
                                                        onClick={() => handleTogglePermission(perm.key)}
                                                        style={{ 
                                                            display: 'inline-flex',
                                                            width: '40px',
                                                            height: '22px',
                                                            background: isAllowed ? '#36B37E' : '#DFE1E6',
                                                            borderRadius: '11px',
                                                            padding: '2px',
                                                            cursor: selectedRole.isSystem && selectedRole.name === 'Admin' ? 'not-allowed' : 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <div style={{ 
                                                            width: '18px',
                                                            height: '18px',
                                                            background: 'white',
                                                            borderRadius: '50%',
                                                            transition: 'all 0.2s ease',
                                                            transform: isAllowed ? 'translateX(18px)' : 'translateX(0)',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }} />
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}
                </div>
            </div>

            {/* 3. ROLE DETAIL PANEL (RIGHT) */}
            <div style={{ width: '380px', background: 'white', borderLeft: '1px solid #EBECF0', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    {selectedRole ? (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            key={selectedRole.id}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', marginBottom: '24px' }}>Role Settings</h3>
                            
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', display: 'block', marginBottom: '8px' }}>ROLE NAME</label>
                                <input 
                                    disabled={selectedRole.isSystem}
                                    value={selectedRole.name}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #EBECF0', outline: 'none', background: selectedRole.isSystem ? '#F4F5F7' : 'white', fontWeight: 600 }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', display: 'block', marginBottom: '8px' }}>DESCRIPTION</label>
                                <textarea 
                                    disabled={selectedRole.isSystem}
                                    value={selectedRole.description || ''}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #EBECF0', outline: 'none', minHeight: '80px', background: selectedRole.isSystem ? '#F4F5F7' : 'white' }}
                                />
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #EBECF0', background: 'white', fontWeight: 700, color: '#172B4D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <FiCopy /> Clone Role
                                </button>
                                {!selectedRole.isSystem && (
                                    <button 
                                        onClick={() => handleDeleteRole(selectedRole.id)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #FFEBE6', background: '#FFF5F2', fontWeight: 700, color: '#FF5630', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <FiTrash2 /> Delete Role
                                    </button>
                                )}
                            </div>

                            <div style={{ marginTop: '40px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#172B4D', marginBottom: '16px' }}>Assigned Users ({selectedRole.users.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedRole.users.map(user => (
                                        <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: '#F4F5F7' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                                {user.name?.charAt(0) || user.email.charAt(0)}
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                                                <div style={{ fontSize: '11px', color: '#6B778C' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ textAlign: 'center', paddingTop: '100px', color: '#6B778C' }}>Select a role to view details</div>
                    )}
                </AnimatePresence>
            </div>

            {/* CREATE MODAL */}
            {isCreating && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D', marginBottom: '24px' }}>Create New Role</h2>
                        <form onSubmit={handleCreateRole}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#42526E', marginBottom: '6px', display: 'block' }}>Role Name</label>
                                <input required value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #EBECF0', outline: 'none' }} placeholder="e.g. Content Moderator" />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#42526E', marginBottom: '6px', display: 'block' }}>Description</label>
                                <textarea value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #EBECF0', outline: 'none', minHeight: '80px' }} placeholder="What can this role do?" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #EBECF0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Create Role</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

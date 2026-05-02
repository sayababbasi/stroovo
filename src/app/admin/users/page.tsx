"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
    Users, UserPlus, Shield, 
    LayoutGrid, List, RefreshCw, 
    Sparkles, Search, Filter,
    CheckCircle2, XCircle, Info
} from 'lucide-react';

// Components
import UserStats from '@/components/admin/users/UserIntelligenceHeader';
import UserFilterBar from '@/components/admin/users/UserFilterBar';
import UserTable from '@/components/admin/users/UserTable';
import UserCard from '@/components/admin/users/UserCard';
import UserDetailDrawer from '@/components/admin/users/UserDetailDrawer';
import DemoRequestPipeline from '@/components/admin/users/DemoRequestPipeline';

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
    // Extended fields for enterprise HR system
    department?: string | null;
    designation?: string | null;
    experienceLevel?: string | null;
    location?: string | null;
    address?: string | null;
    skills?: string[];
    performanceScore?: number;
    workloadStatus?: 'Low' | 'Medium' | 'High' | null;
    managerId?: string | null;
}

interface DemoRequest {
    id: string;
    name: string;
    email: string;
    company: string | null;
    message: string | null;
    status: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [experienceFilter, setExperienceFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');
    
    // UI State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                const rawUsers = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
                
                // Real data from DB + minor UI helpers (performance/workload still mock for visualization)
                const processedUsers = rawUsers.map((u: any, idx: number) => ({
                    ...u,
                    department: u.department || 'General',
                    designation: u.designation || u.role,
                    experienceLevel: u.experienceLevel || 'Mid',
                    location: u.address || 'Remote',
                    performanceScore: u.performanceScore || Math.floor(Math.random() * (98 - 75) + 75),
                    workloadStatus: u.workloadStatus || ['Low', 'Medium', 'High'][idx % 3],
                    skills: u.skills || ['React', 'Collaboration', 'Productivity']
                }));
                
                setUsers(processedUsers);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Network error while syncing users');
        } finally {
            setLoading(false);
        }
    };

    const fetchDemoRequests = async () => {
        try {
            const res = await fetch('/api/admin/demo-requests', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setDemoRequests(data);
            }
        } catch (err) {
            console.error('Failed to fetch demo requests:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDemoRequests();
    }, []);

    // Memoized Stats for Header
    const stats = useMemo(() => {
        return {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            suspended: users.filter(u => !u.isActive).length,
            admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
            managers: users.filter(u => u.role === 'PROJECT_MANAGER').length,
        };
    }, [users]);

    // Filtering & Sorting Logic
    const filteredUsers = useMemo(() => {
        let result = users.filter(user => {
            const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.department?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'ALL' || 
                               (statusFilter === 'ACTIVE' && user.isActive) || 
                               (statusFilter === 'SUSPENDED' && !user.isActive);
            const matchesDept = departmentFilter === 'ALL' || user.department === departmentFilter;
            const matchesExp = experienceFilter === 'ALL' || user.experienceLevel === experienceFilter;
            
            return matchesSearch && matchesRole && matchesStatus && matchesDept && matchesExp;
        });

        // Sorting
        return result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'performance') return (b.performanceScore || 0) - (a.performanceScore || 0);
            if (sortBy === 'tasks') return b._count.tasks - a._count.tasks;
            if (sortBy === 'workload') {
                const weight = { High: 3, Medium: 2, Low: 1 };
                return weight[b.workloadStatus || 'Low'] - weight[a.workloadStatus || 'Low'];
            }
            return 0;
        });
    }, [users, searchTerm, roleFilter, statusFilter, departmentFilter, experienceFilter, sortBy]);

    // Action Handlers
    const handleRoleChange = async (userId: string, newRole: string) => {
        const promise = fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ role: newRole })
        }).then(res => {
            if (!res.ok) throw new Error('Update failed');
            fetchUsers();
        });
        toast.promise(promise, {
            loading: 'Updating permissions...',
            success: 'Role upgraded successfully',
            error: 'Failed to update role'
        });
    };

    const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
        const promise = fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ isActive: !currentStatus })
        }).then(res => {
            if (!res.ok) throw new Error('Toggle failed');
            fetchUsers();
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, isActive: !currentStatus });
            }
        });
        toast.promise(promise, {
            loading: 'Synchronizing security status...',
            success: `User account ${!currentStatus ? 'restored' : 'restricted'}`,
            error: 'Failed to update status'
        });
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Critical Action: Delete user identity? This cannot be undone.')) return;
        
        const promise = fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then(res => {
            if (!res.ok) throw new Error('Deletion failed');
            fetchUsers();
        });
        toast.promise(promise, {
            loading: 'Purging identity from system...',
            success: 'User purged successfully',
            error: 'Failed to delete user'
        });
    };

    const handleResetPassword = async (userId: string) => {
        if (!confirm('Generate temporary access credentials for this user?')) return;
        
        const promise = fetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            credentials: 'include'
        }).then(async res => {
            if (!res.ok) throw new Error('Reset failed');
            const data = await res.json();
            return data.tempPassword;
        });

        toast.promise(promise, {
            loading: 'Generating credentials...',
            success: (pw) => `Access restored. Temp key: ${pw}`,
            error: 'Failed to reset credentials'
        });
    };

    const handleApproveRequest = async (requestId: string) => {
        const promise = fetch(`/api/admin/demo-requests/${requestId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({})
        }).then(async res => {
            if (!res.ok) throw new Error('Approval failed');
            const data = await res.json();
            fetchDemoRequests();
            fetchUsers();
            return data.tempPassword;
        });

        toast.promise(promise, {
            loading: 'Onboarding organization...',
            success: (pw) => `Request approved. Access key: ${pw}`,
            error: 'Failed to onboard organization'
        });
    };

    const handleRejectRequest = async (requestId: string) => {
        if (!confirm('Are you sure you want to decline this request?')) return;
        const promise = fetch(`/api/admin/demo-requests/${requestId}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then(res => {
            if (!res.ok) throw new Error('Rejection failed');
            fetchDemoRequests();
        });

        toast.promise(promise, {
            loading: 'Archiving request...',
            success: 'Demo request declined',
            error: 'Failed to archive request'
        });
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Phase 1 & 2: Intelligence Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#172B4D', margin: '0 0 8px' }}>User Management</h1>
                    <p style={{ color: '#6B778C', margin: 0, fontSize: '16px' }}>Manage all users and their roles here</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={fetchUsers}
                        style={{ padding: '10px', borderRadius: '10px', background: 'white', border: '1px solid #EBECF0', color: '#6B778C', cursor: 'pointer' }}
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        style={{ 
                            padding: '12px 24px', 
                            background: '#0052CC', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '10px', 
                            fontSize: '14px', 
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)'
                        }}
                    >
                        <UserPlus size={18} /> Add New User
                    </button>
                </div>
            </header>

            <UserStats stats={stats} />

            {/* Middle Layer: Tabs & Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#F4F5F7', borderRadius: '12px', width: 'fit-content' }}>
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === 'users' ? 'white' : 'transparent',
                                color: activeTab === 'users' ? '#0052CC' : '#6B778C',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: activeTab === 'users' ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none'
                            }}
                        >
                            <Users size={16} /> All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === 'requests' ? 'white' : 'transparent',
                                color: activeTab === 'requests' ? '#0052CC' : '#6B778C',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: activeTab === 'requests' ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none'
                            }}
                        >
                            <Shield size={16} /> Demo Requests
                            {demoRequests.length > 0 && (
                                <span style={{ padding: '2px 6px', background: '#FF5630', color: 'white', borderRadius: '10px', fontSize: '10px' }}>
                                    {demoRequests.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'users' && (
                        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#F4F5F7', borderRadius: '10px' }}>
                            <button
                                onClick={() => setViewMode('table')}
                                style={{
                                    padding: '8px 12px',
                                    background: viewMode === 'table' ? 'white' : 'transparent',
                                    color: viewMode === 'table' ? '#0052CC' : '#6B778C',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: viewMode === 'table' ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none'
                                }}
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '8px 12px',
                                    background: viewMode === 'grid' ? 'white' : 'transparent',
                                    color: viewMode === 'grid' ? '#0052CC' : '#6B778C',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none'
                                }}
                            >
                                <LayoutGrid size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {activeTab === 'users' && (
                    <UserFilterBar 
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        roleFilter={roleFilter}
                        onRoleFilterChange={setRoleFilter}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        departmentFilter={departmentFilter}
                        onDepartmentFilterChange={setDepartmentFilter}
                        experienceFilter={experienceFilter}
                        onExperienceFilterChange={setExperienceFilter}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onReset={() => {
                            setSearchTerm('');
                            setRoleFilter('ALL');
                            setStatusFilter('ALL');
                            setDepartmentFilter('ALL');
                            setExperienceFilter('ALL');
                            setSortBy('newest');
                        }}
                    />
                )}
            </div>

            {/* Bottom Layer: Content */}
            <main>
                {activeTab === 'users' ? (
                    <>
                        {/* Bulk Actions Bar */}
                        {selectedUsers.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: '#0052CC',
                                    color: 'white',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)'
                                }}
                            >
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => {
                                            selectedUsers.forEach(id => handleStatusToggle(id, true));
                                            setSelectedUsers([]);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Activate All
                                    </button>
                                    <button
                                        onClick={() => {
                                            selectedUsers.forEach(id => handleDelete(id));
                                            setSelectedUsers([]);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete All
                                    </button>
                                    <button
                                        onClick={() => setSelectedUsers([])}
                                        style={{
                                            padding: '6px 12px',
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        
                        {viewMode === 'table' ? (
                            <UserTable 
                                users={filteredUsers}
                                loading={loading}
                                onUserClick={setSelectedUser}
                                onRoleChange={handleRoleChange}
                                onStatusToggle={handleStatusToggle}
                                onDelete={handleDelete}
                                onResetPassword={handleResetPassword}
                                selectedUsers={selectedUsers}
                                onSelectionChange={setSelectedUsers}
                            />
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                                {filteredUsers.map((user) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onClick={() => setSelectedUser(user)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <DemoRequestPipeline 
                        requests={demoRequests}
                        loading={loading}
                        onApprove={handleApproveRequest}
                        onReject={handleRejectRequest}
                    />
                )}
            </main>

            {/* Modals & Overlays */}
            <UserDetailDrawer 
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onStatusToggle={handleStatusToggle}
                onResetPassword={handleResetPassword}
                onDelete={handleDelete}
            />

            {showInviteModal && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
                    onClick={() => setShowInviteModal(false)}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '500px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid #EBECF0' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#172B4D', marginBottom: '8px', letterSpacing: '-0.02em' }}>Add New User</h2>
                        <p style={{ color: '#6B778C', marginBottom: '32px', fontSize: '15px' }}>Enter the details below to add a new person to your team.</p>
                        <InviteForm 
                            onSuccess={() => { setShowInviteModal(false); fetchUsers(); }}
                            onCancel={() => setShowInviteModal(false)}
                        />
                    </motion.div>
                </div>
            )}

            <style>{`
                @font-face {
                    font-family: 'Inter';
                    src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                }
                body {
                    font-family: 'Inter', sans-serif;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function InviteForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'TEAM_MEMBER',
        department: 'Engineering',
        designation: '',
        experienceLevel: 'Mid',
        address: '',
        contact: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.password) {
            toast.error('Please set a password');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success('User created and saved to DB');
                onSuccess();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to add user');
            }
        } catch (err) {
            toast.error('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #EBECF0',
        outline: 'none',
        fontSize: '14px',
        width: '100%',
        background: '#F8F9FB',
        transition: 'all 0.2s ease',
        fontWeight: 500
    };

    const labelStyle = {
        fontSize: '13px',
        fontWeight: 700,
        color: '#42526E',
        marginBottom: '4px',
        display: 'block'
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={labelStyle}>Full Name</label>
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="John Doe" />
                </div>
                <div>
                    <label style={labelStyle}>Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} placeholder="john@company.com" />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={labelStyle}>Set Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} placeholder="••••••••" />
                </div>
                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} style={inputStyle} placeholder="+1 234 567 890" />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={labelStyle}>Job Title</label>
                    <input required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} style={inputStyle} placeholder="Senior Engineer" />
                </div>
                <div>
                    <label style={labelStyle}>Department</label>
                    <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} style={inputStyle}>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                    </select>
                </div>
            </div>

            <div>
                <label style={labelStyle}>Office Address</label>
                <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} placeholder="123 Tech Avenue, Silicon Valley, CA" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={labelStyle}>Experience Level</label>
                    <select value={formData.experienceLevel} onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })} style={inputStyle}>
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid-Level</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Access Level</label>
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={inputStyle}>
                        <option value="TEAM_MEMBER">Member</option>
                        <option value="PROJECT_MANAGER">Manager</option>
                        <option value="EXECUTIVE">Executive</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'white', border: '1px solid #EBECF0', color: '#42526E', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
                <button disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#0052CC', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '15px', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)' }}>
                    {loading ? 'Saving to Database...' : 'Create Complete User'}
                </button>
            </div>
        </form>
    );
}

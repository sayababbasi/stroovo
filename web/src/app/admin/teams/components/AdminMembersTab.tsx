"use client";

import React, { useState, useEffect } from 'react';
import { Search, Users, Activity, UserPlus, FileDown, MoreHorizontal, ShieldCheck, ShieldAlert, CheckCircle2, Archive, Settings } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminMemberTable from './AdminMemberTable';
import AdminInviteMemberModal from './AdminInviteMemberModal';

const KpiCard = ({ icon, title, value, trend, color }: any) => (
    <div style={{ flex: '1 1 200px', background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 4px rgba(9,30,66,0.04)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B778C', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D', lineHeight: 1 }}>{value}</span>
                {trend && <span style={{ fontSize: '12px', fontWeight: 600, color: trend.startsWith('+') ? '#006644' : '#DE350B' }}>{trend}</span>}
            </div>
        </div>
    </div>
);

export default function AdminMembersTab() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter !== 'ALL') params.append('isActive', statusFilter === 'ACTIVE' ? 'true' : 'false');
            if (roleFilter !== 'ALL') params.append('role', roleFilter);
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const res = await apiGet<any>(`/api/admin/users?${params.toString()}`);
            if (res.success && res.data) {
                setUsers(res.data.users || []);
                setTotal(res.data.pagination?.total || 0);
                setTotalPages(res.data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search/filter change
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter, roleFilter]);

    // Fetch on page change
    useEffect(() => {
        fetchUsers();
    }, [page, limit]);

    // Stats
    const stats = {
        total: total,
        active: users.filter(u => u.isActive).length,
        admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
        suspended: users.filter(u => !u.isActive).length
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header section with actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600, color: '#172B4D' }}>Members</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Manage organization users, team memberships, roles, access and account status.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '0 16px', height: '36px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileDown size={16} /> Export
                    </button>
                    <button onClick={() => setIsInviteModalOpen(true)} style={{ padding: '0 16px', height: '36px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserPlus size={16} /> Invite Member
                    </button>
                </div>
            </div>

            {/* KPI Stats */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <KpiCard icon={<Users size={20} />} title="Total Members" value={stats.total} color="#0052CC" />
                <KpiCard icon={<Activity size={20} />} title="Active Members" value={stats.active} color="#36B37E" />
                <KpiCard icon={<ShieldCheck size={20} />} title="Administrators" value={stats.admins} color="#6554C0" />
                <KpiCard icon={<Archive size={20} />} title="Suspended" value={stats.suspended} color="#FF5630" />
            </div>

            {/* Main Content Area */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 4px rgba(9,30,66,0.04)' }}>
                {/* Toolbar */}
                <div style={{ padding: '20px', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    
                    <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email..."
                                style={{
                                    width: '100%', height: '38px', paddingLeft: '38px', paddingRight: '16px',
                                    borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none'
                                }}
                            />
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                height: '38px', padding: '0 16px', borderRadius: '8px', border: '1px solid #DFE1E6',
                                fontSize: '14px', color: '#172B4D', outline: 'none', background: 'white', cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">Status: All</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended / Inactive</option>
                        </select>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                height: '38px', padding: '0 16px', borderRadius: '8px', border: '1px solid #DFE1E6',
                                fontSize: '14px', color: '#172B4D', outline: 'none', background: 'white', cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">Role: All</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="ADMIN">Admin</option>
                            <option value="USER">User</option>
                        </select>
                    </div>

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#6B778C' }}>
                            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{ padding: '6px 10px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                style={{ padding: '6px 10px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1 }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading && users.length === 0 ? (
                    <div style={{ padding: '64px', textAlign: 'center', color: '#6B778C' }}>Loading members...</div>
                ) : (
                    <AdminMemberTable users={users} onRefresh={fetchUsers} />
                )}
            </div>

            {/* Invite Modal */}
            <AdminInviteMemberModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    );
}

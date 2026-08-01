"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Users, Plus, Search, ShieldCheck, Activity, Network, Archive, AlertCircle, FolderKanban, Shield
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import AdminTeamTable from './components/AdminTeamTable';
import AdminCreateTeamModal from './components/AdminCreateTeamModal';
import AdminMembersTab from './components/AdminMembersTab';
import AdminRolesTab from './components/AdminRolesTab';
import { toast } from 'react-hot-toast';

function KpiCard({ icon, title, value, trend, color }: {
  icon: React.ReactNode; title: string; value: number | string; trend?: string; color: string;
}) {
  return (
    <div style={{
      flex: 1, minWidth: '150px', background: 'white', borderRadius: '12px',
      border: '1px solid #DFE1E6', padding: '20px', boxShadow: '0 1px 4px rgba(9,30,66,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B778C' }}>{title}</div>
      {trend && (
        <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, color: trend.startsWith('+') ? '#36B37E' : '#97A0AF' }}>
          {trend}
        </div>
      )}
    </div>
  );
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Teams');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiGet<any>(`/api/admin/teams?stats=true`, null);
            if (res.success && res.data) {
                setTeams(res.data);
                if ((res as any).stats) setStats((res as any).stats);
            }
        } catch (error) {
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    // Handle Frontend Filtering (Backend can also do this, but frontend is snappy for small datasets)
    const filteredTeams = teams.filter(team => {
        if (statusFilter !== 'ALL' && team.status !== statusFilter) return false;
        if (search && !team.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const TABS = ['Teams', 'Members', 'Roles & Permissions', 'Access Policies', 'Invitations', 'Team Hierarchy', 'Audit Activity'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Network size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Teams Administration</h1>
                        <p style={{ fontSize: '14px', color: '#6B778C', margin: '4px 0 0' }}>Manage organization teams, members, access, roles and security.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ height: '40px', padding: '0 16px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        Export
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ height: '40px', padding: '0 16px', borderRadius: '8px', border: 'none', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={16} /> Create Team
                    </button>
                </div>
            </div>

            {/* KPI Stats */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <KpiCard icon={<Network size={20} />} title="Total Teams" value={stats?.totalTeams || 0} trend="+12% vs last month" color="#0052CC" />
                <KpiCard icon={<Users size={20} />} title="Total Members" value={stats?.totalMembers || 0} trend="+8% vs last month" color="#36B37E" />
                <KpiCard icon={<Activity size={20} />} title="Active Teams" value={stats?.activeTeams || 0} color="#6554C0" />
                <KpiCard icon={<FolderKanban size={20} />} title="Total Projects" value={stats?.totalProjects || 0} color="#FFAB00" />
                <KpiCard icon={<Archive size={20} />} title="Archived Teams" value={stats?.archivedTeams || 0} color="#97A0AF" />
                <KpiCard icon={<AlertCircle size={20} />} title="Access Issues" value={stats?.accessIssues || 0} color="#FF5630" />
            </div>

            {/* Navigation Tabs */}
            <div style={{ borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '1px' }}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #0052CC' : '2px solid transparent',
                            color: activeTab === tab ? '#0052CC' : '#6B778C',
                            fontSize: '14px',
                            fontWeight: activeTab === tab ? 600 : 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            {activeTab === 'Teams' ? (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 4px rgba(9,30,66,0.04)' }}>
                    
                    {/* Toolbar */}
                    <div style={{ padding: '20px', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search teams..."
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
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div style={{ padding: '64px', textAlign: 'center', color: '#6B778C' }}>Loading teams...</div>
                    ) : (
                        <AdminTeamTable teams={filteredTeams} onRefresh={fetchTeams} />
                    )}
                </div>
            ) : activeTab === 'Members' ? (
                <AdminMembersTab />
            ) : activeTab === 'Roles & Permissions' ? (
                <AdminRolesTab />
            ) : (
                <div style={{ padding: '64px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6' }}>
                    <Shield size={48} color="#DFE1E6" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', margin: '0 0 8px' }}>{activeTab} Module</h3>
                    <p style={{ color: '#6B778C', margin: 0 }}>This administrative section is currently under construction or restricted.</p>
                </div>
            )}

            <AdminCreateTeamModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchTeams}
            />
        </div>
    );
}

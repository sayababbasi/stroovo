"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Download, Network, List as ListIcon, FolderTree, LayoutTemplate } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { P } from '@/lib/permissions/registry';
import Can from '@/components/auth/Can';
import AdminCreateTeamModal from './AdminCreateTeamModal';
import AdminHierarchyStats from './AdminHierarchyStats';
import AdminHierarchyTree from './AdminHierarchyTree';
import AdminHierarchyList from './AdminHierarchyList';
import AdminHierarchyOrgChart from './AdminHierarchyOrgChart';

export default function AdminTeamHierarchyTab() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'TREE' | 'LIST' | 'ORG_CHART'>('TREE');
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Commands for the tree view
    const [expandAllFlag, setExpandAllFlag] = useState(0);
    const [collapseAllFlag, setCollapseAllFlag] = useState(0);

    const fetchHierarchy = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/teams/hierarchy');
            const data = await res.json();
            if (data.success) {
                setTeams(data.data);
                setStats(data.stats);
            } else {
                toast.error(data.error || 'Failed to load hierarchy');
            }
        } catch (error) {
            toast.error('Network error loading hierarchy');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const exportHierarchy = () => {
        if (!teams.length) return;
        const csvRows = [
            ['Team Name', 'Type', 'Parent Team', 'Lead', 'Members', 'Status']
        ];

        teams.forEach(t => {
            const parent = teams.find(p => p.id === t.parentTeamId);
            csvRows.push([
                t.name,
                t.teamType || 'TEAM',
                parent ? parent.name : 'None',
                t.lead ? t.lead.name : 'None',
                t._count?.members?.toString() || '0',
                t.status
            ]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "team_hierarchy.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Hierarchy exported successfully");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#172B4D', margin: '0 0 4px' }}>Team Hierarchy</h2>
                    <p style={{ color: '#6B778C', margin: 0, fontSize: '14px' }}>
                        Manage organizational structure, parent-child teams, reporting relationships and team access.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Can permission={P.TEAMS_HIERARCHY_EXPORT}>
                        <button 
                            onClick={exportHierarchy}
                            style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Download size={16} /> Export
                        </button>
                    </Can>
                    
                    {viewMode === 'TREE' && (
                        <>
                            <button 
                                onClick={() => setExpandAllFlag(f => f + 1)}
                                style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Expand All
                            </button>
                            <button 
                                onClick={() => setCollapseAllFlag(f => f + 1)}
                                style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Collapse All
                            </button>
                        </>
                    )}

                    <Can permission={P.TEAMS_HIERARCHY_CREATE}>
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={16} /> Create Team
                        </button>
                    </Can>
                </div>
            </div>

            {/* KPI Stats */}
            <AdminHierarchyStats stats={stats} loading={loading} />

            {/* View controls & Search */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                <div style={{ display: 'flex', background: '#F4F5F7', padding: '4px', borderRadius: '6px' }}>
                    <button 
                        onClick={() => setViewMode('TREE')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'TREE' ? 'white' : 'transparent', color: viewMode === 'TREE' ? '#0052CC' : '#6B778C', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: viewMode === 'TREE' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <FolderTree size={16} /> Tree View
                    </button>
                    <button 
                        onClick={() => setViewMode('ORG_CHART')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'ORG_CHART' ? 'white' : 'transparent', color: viewMode === 'ORG_CHART' ? '#0052CC' : '#6B778C', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: viewMode === 'ORG_CHART' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <Network size={16} /> Org Chart
                    </button>
                    <button 
                        onClick={() => setViewMode('LIST')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'LIST' ? 'white' : 'transparent', color: viewMode === 'LIST' ? '#0052CC' : '#6B778C', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: viewMode === 'LIST' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <ListIcon size={16} /> List View
                    </button>
                </div>

                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search teams by name, type, or lead..."
                        style={{ width: '100%', height: '36px', paddingLeft: '38px', paddingRight: '16px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Main Area */}
            {loading && !teams.length ? (
                <div style={{ padding: '64px', textAlign: 'center', color: '#6B778C', background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                    Loading hierarchy...
                </div>
            ) : teams.length === 0 ? (
                <div style={{ padding: '64px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6' }}>
                    <LayoutTemplate size={48} color="#DFE1E6" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', margin: '0 0 8px' }}>No team hierarchy yet</h3>
                    <p style={{ color: '#6B778C', margin: '0 0 16px' }}>Create your first team to build your organization's structure.</p>
                    <Can permission={P.TEAMS_HIERARCHY_CREATE}>
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={16} /> Create Team
                        </button>
                    </Can>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', padding: '24px', minHeight: '500px' }}>
                    {viewMode === 'TREE' && (
                        <AdminHierarchyTree 
                            teams={teams} 
                            search={search} 
                            expandAllFlag={expandAllFlag} 
                            collapseAllFlag={collapseAllFlag}
                            onRefresh={fetchHierarchy}
                        />
                    )}
                    {viewMode === 'LIST' && (
                        <AdminHierarchyList teams={teams} search={search} onRefresh={fetchHierarchy} />
                    )}
                    {viewMode === 'ORG_CHART' && (
                        <AdminHierarchyOrgChart teams={teams} search={search} />
                    )}
                </div>
            )}

            <AdminCreateTeamModal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchHierarchy}
                isHierarchyContext={true}
                allTeams={teams}
            />
        </div>
    );
}

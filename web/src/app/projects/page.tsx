
"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Folder, FolderCheck, AlertTriangle, CheckCircle,
  Search, SlidersHorizontal, ChevronDown,
  Star, MoreVertical, LayoutGrid, List, Clock,
  Calendar, ChevronRight, CheckSquare, Edit, Copy, Trash2
} from 'lucide-react';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import EditProjectModal from '@/components/projects/EditProjectModal';

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('All Projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/projects?search=${searchQuery}&status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        const projectsData = Array.isArray(data) ? data : (data.projects || []);
        if (data.activities) setActivities(data.activities);

        const formatted = projectsData.map((p: any, idx: number) => {
            const endDate = p.endDate ? new Date(p.endDate) : null;
            const diffDays = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
            const endSub = diffDays !== null ? (diffDays < 0 ? `${Math.abs(diffDays)} days overdue` : `in ${diffDays} days`) : '';
            
            const words = p.name.split(' ').filter(Boolean);
            const prefix = words.length >= 2 ? (words[0][0] + words[1][0] + (words[2]?.[0] || words[1][1] || 'X')).toUpperCase() : p.name.substring(0, 3).toUpperCase();
            const readableId = `${prefix}-${String(idx + 1).padStart(3, '0')}`;
            
            return {
                id: p.id,
                readableId,
                name: p.name,
                desc: p.description || '',
                owner: p.manager?.name || 'Unknown',
                ownerAvatar: p.manager?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.manager?.name || 'U')}&background=random`,
                status: p.status === 'ACTIVE' ? 'In Progress' : p.status === 'COMPLETED' ? 'Completed' : p.status === 'PLANNING' ? 'Planning' : 'On Hold',
                progress: p.progress || 0,
                health: p.healthStatus === 'ON_TRACK' ? 'On Track' : p.healthStatus === 'AT_RISK' ? 'At Risk' : p.healthStatus === 'OFF_TRACK' ? 'Off Track' : 'Good',
                healthColor: p.healthStatus === 'ON_TRACK' ? '#3B82F6' : p.healthStatus === 'AT_RISK' ? '#F59E0B' : p.healthStatus === 'OFF_TRACK' ? '#EF4444' : '#10B981',
                endStr: endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline',
                endSub: endSub,
                diffDays,
                team: p.teamIds?.map((id: string) => `https://ui-avatars.com/api/?name=${id.substring(0,2)}&background=random`) || [],
                lastUpdated: new Date(p.updatedAt).toLocaleDateString(),
                starred: p.isStarred || false,
                totalTasks: p._count?.tasks || 0,
                completedTasks: Math.floor((p.progress || 0) / 100 * (p._count?.tasks || 0)),
                raw: p
            };
        });
        setProjects(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStar = async (id: string, current: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, starred: !current } : p));
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !current })
      });
    } catch (err) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, starred: current } : p));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const p = projects.find(x => x.id === id);
      if (!p) return;
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...p.raw,
          name: p.name + ' (Copy)'
        })
      });
      fetchProjects();
    } catch (err) {
      alert('Failed to duplicate project');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  
  const filteredProjects = projects.filter(p => {
    let tabMatch = true;
    if (activeTab === 'Starred') tabMatch = p.starred;
    else if (activeTab === 'Archived') tabMatch = p.status === 'Archived';
    else if (activeTab === 'All Projects') tabMatch = p.status !== 'Archived';
    
    if (!tabMatch) return false;

    if (dateFilter !== 'ALL') {
      const pDate = new Date(p.raw.createdAt || p.raw.updatedAt || new Date());
      const now = new Date();
      if (dateFilter === 'TODAY') {
        if (pDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'THIS_WEEK') {
        const diffDays = (now.getTime() - pDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (dateFilter === 'THIS_MONTH') {
        if (pDate.getMonth() !== now.getMonth() || pDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  const overviewCounts = {
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    planning: projects.filter(p => p.status === 'Planning').length,
    inReview: projects.filter(p => p.status === 'In Review').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    onHold: projects.filter(p => p.status === 'On Hold').length,
  };
  
  const oInProgPct = totalProjects ? Math.round((overviewCounts.inProgress / totalProjects) * 100) : 0;
  const oPlanPct = totalProjects ? Math.round((overviewCounts.planning / totalProjects) * 100) : 0;
  const oRevPct = totalProjects ? Math.round((overviewCounts.inReview / totalProjects) * 100) : 0;
  const oCompPct = totalProjects ? Math.round((overviewCounts.completed / totalProjects) * 100) : 0;
  const oHoldPct = totalProjects ? Math.round((overviewCounts.onHold / totalProjects) * 100) : 0;

  let currentOffset = 0;
  const oDashInProg = `${oInProgPct} ${100 - oInProgPct}`;
  const oOffInProg = currentOffset;
  currentOffset -= oInProgPct;
  const oDashPlan = `${oPlanPct} ${100 - oPlanPct}`;
  const oOffPlan = currentOffset;
  currentOffset -= oPlanPct;
  const oDashRev = `${oRevPct} ${100 - oRevPct}`;
  const oOffRev = currentOffset;
  currentOffset -= oRevPct;
  const oDashComp = `${oCompPct} ${100 - oCompPct}`;
  const oOffComp = currentOffset;
  currentOffset -= oCompPct;
  const oDashHold = `${oHoldPct} ${100 - oHoldPct}`;
  const oOffHold = currentOffset;

  const upcomingDeadlines = [...projects]
    .filter(p => p.raw.endDate && p.status !== 'Completed')
    .sort((a, b) => new Date(a.raw.endDate).getTime() - new Date(b.raw.endDate).getTime())
    .slice(0, 4);

  const mockActivity = [
    { u: 'Asad Minhas', a: 'updated project progress', p: 'Stroovo Platform Development', t: '2m ago', img: 'https://ui-avatars.com/api/?name=AM&background=random' },
    { u: 'Zain Ali', a: 'added a new task', p: 'Marketing Automation System', t: '15m ago', img: 'https://ui-avatars.com/api/?name=ZA&background=random' },
    { u: 'Hassan Farooq', a: 'uploaded a file', p: 'REVOTIC AI Website Redesign', t: '1h ago', img: 'https://ui-avatars.com/api/?name=HF&background=random' },
    { u: 'You', a: 'created a new project', p: 'Mobile App for Stroovo', t: '2h ago', img: 'https://ui-avatars.com/api/?name=Y&background=random' }
  ];

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{`
        /* Global & Layout */
        .projects-layout { display: flex; gap: 24px; padding: 24px 32px; flex: 1; overflow-y: auto; min-width: 0; }
        .projects-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; }
        
        @media (max-width: 1200px) {
          .projects-layout { flex-direction: column; }
          .projects-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
          .projects-sidebar > div { flex: 1; min-width: 300px; }
        }

        /* KPI Cards */
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .p-stat-card { background: white; border: 1px solid #DFE1E6; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 3px rgba(9,30,66,0.02); transition: all 0.2s; }
        .p-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(9,30,66,0.06); border-color: #C1C7D0; }

        /* Tabs & Controls */
        .p-tab { padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; color: #6B778C; transition: all 0.2s; white-space: nowrap; }
        .p-tab.active { color: #0052CC; border-bottom-color: #0052CC; }
        .p-tab:hover:not(.active) { color: #172B4D; }

        /* Tables */
        .p-table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
        .p-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #6B778C; text-transform: uppercase; border-bottom: 1px solid #DFE1E6; background: #FAFBFC; white-space: nowrap; }
        .p-table td { padding: 16px; border-bottom: 1px solid #F4F5F7; vertical-align: middle; background: white; transition: background 0.2s; }
        .p-table tr:hover td { background: #F4F7FB; }
        .p-table tr:last-child td { border-bottom: none; }
        .p-table td:first-child { border-radius: 8px 0 0 8px; }
        .p-table td:last-child { border-radius: 0 8px 8px 0; }

        /* Avatars & Buttons */
        .p-avatar { width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; margin-left: -8px; }
        .p-avatar:first-child { margin-left: 0; }
        .btn-primary { background: #0052CC; color: white; border: none; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #0747A6; }
        .btn-secondary { background: white; color: #172B4D; border: 1px solid #DFE1E6; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-secondary:hover { background: #F4F5F7; border-color: #C1C7D0; }
        .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; display: inline-block; white-space: nowrap; }
        
        /* Forms & Inputs */
        .search-input { height: 36px; padding-left: 36px; padding-right: 16px; border-radius: 8px; border: 1px solid #DFE1E6; font-size: 13px; width: 240px; outline: none; background: #F4F5F7; transition: all 0.2s; }
        .search-input:focus { background: white; border-color: #0052CC; box-shadow: 0 0 0 2px rgba(0,82,204,0.1); }
        .filter-select { height: 36px; border: 1px solid #DFE1E6; border-radius: 8px; padding: 0 12px; font-size: 13px; font-weight: 600; color: #172B4D; background: white; cursor: pointer; outline: none; }
        .filter-select:hover { background: #F4F5F7; }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #C1C7D0; border-radius: 4px; }
      `}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* ── HEADER ── */}
        <div style={{ padding: '32px 32px 0 32px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172B4D', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Projects</h1>
              <p style={{ fontSize: 14, color: '#6B778C', margin: 0 }}>Plan, track and deliver successful outcomes across your organization.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#8A94A6" style={{ position: 'absolute', left: 12, top: 10 }} />
                <input type="text" className="search-input" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <div style={{ position: 'absolute', right: 8, top: 8, background: '#EBECF0', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#6B778C' }}>⌘K</div>
              </div>
              <button className="btn-secondary"><SlidersHorizontal size={14} /> Filters</button>
              <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="ALL">All Time</option>
                <option value="TODAY">Created Today</option>
                <option value="THIS_WEEK">Created This Week</option>
                <option value="THIS_MONTH">Created This Month</option>
              </select>
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PLANNING">Planning</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}><Folder size={14} /> Create Project</button>
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          <div className="kpi-grid">
            {([
              { title: 'Total Projects', value: totalProjects, sub: '↑ 12% vs last month', icon: Folder, color: '#0052CC', bg: '#E6EFFF' },
              { title: 'Active Projects', value: activeProjects, sub: '↑ 8% vs last month', icon: FolderCheck, color: '#10B981', bg: '#D1FAE5' },
              { title: 'Completed Projects', value: completedProjects, sub: '↑ 16% vs last month', icon: CheckCircle, color: '#8B5CF6', bg: '#EDE9FE' },
              { title: 'On Hold', value: overviewCounts.onHold, sub: '↓ 2% vs last month', icon: Clock, color: '#F59E0B', bg: '#FEF3C7' },
              { title: 'Overdue Projects', value: upcomingDeadlines.filter(p => p.diffDays !== null && p.diffDays < 0).length, sub: '↓ 25% vs last month', icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2', subColor: '#EF4444' }
            ] as Array<{ title: string; value: number; sub: string; icon: any; color: string; bg: string; subColor?: string; isGraph?: boolean }>).map(k => (
              <div key={k.title} className="p-stat-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <k.icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#5E6C84' }}>{k.title}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#172B4D', lineHeight: 1.2, marginTop: 4 }}>{k.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: k.subColor || '#36B37E', marginTop: 6 }}>{k.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── TABS & FILTERS ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DFE1E6', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['All Projects', 'Starred', 'My Projects', 'Shared With Me', 'Archived'].map(t => (
                <div key={t} className={`p-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, paddingBottom: 12, paddingRight: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                Group: <span style={{ color: '#172B4D', background: '#F4F5F7', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>None <ChevronDown size={14} /></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                Sort: <span style={{ color: '#172B4D', background: '#F4F5F7', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>Newest <ChevronDown size={14} /></span>
              </div>
              <div style={{ display: 'flex', gap: 2, background: '#F4F5F7', padding: 2, borderRadius: 8 }}>
                <button className={`btn-secondary ${viewMode === 'list' ? 'active' : ''}`} style={{ padding: '0 8px', height: 28, background: viewMode === 'list' ? 'white' : 'transparent', border: 'none', boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }} onClick={() => setViewMode('list')}><List size={14} color={viewMode === 'list' ? '#0052CC' : '#6B778C'} /></button>
                <button className={`btn-secondary ${viewMode === 'grid' ? 'active' : ''}`} style={{ padding: '0 8px', height: 28, background: viewMode === 'grid' ? 'white' : 'transparent', border: 'none', boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }} onClick={() => setViewMode('grid')}><LayoutGrid size={14} color={viewMode === 'grid' ? '#0052CC' : '#6B778C'} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="projects-layout">

          {/* ── MAIN AREA ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            {viewMode === 'list' ? (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', boxShadow: '0 1px 3px rgba(9,30,66,0.02)', overflow: 'hidden', overflowX: 'auto' }}>
                <table className="p-table" style={{ minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 40, paddingLeft: 24 }}></th>
                      <th style={{ width: '22%' }}>Project</th>
                      <th style={{ width: '12%' }}>Owner</th>
                      <th style={{ width: '10%' }}>Status</th>
                      <th style={{ width: '15%' }}>Progress</th>
                      <th style={{ width: '10%' }}>Health</th>
                      <th style={{ width: '12%' }}>Deadline</th>
                      <th style={{ width: '10%' }}>Team</th>
                      <th style={{ width: 48, paddingRight: 24 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(p => (
                      <tr key={p.id} onClick={() => window.location.href = `/projects/${p.id}`} style={{ cursor: 'pointer', position: 'relative' }}>
                        <td style={{ textAlign: 'center', paddingLeft: 24 }} onClick={(e) => toggleStar(p.id, p.starred, e)}>
                          <Star size={16} fill={p.starred ? "#FFAB00" : "none"} color={p.starred ? "#FFAB00" : "#C1C7D0"} style={{ cursor: 'pointer' }} />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#172B4D', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ color: '#6B778C', fontSize: 12, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.readableId}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={p.ownerAvatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#42526E' }}>{p.owner}</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-pill" style={{
                            background: p.status === 'In Progress' ? '#E6EFFF' : p.status === 'Completed' ? '#EDE9FE' : p.status === 'Planning' ? '#E3FCEF' : '#F4F5F7',
                            color: p.status === 'In Progress' ? '#0052CC' : p.status === 'Completed' ? '#8B5CF6' : p.status === 'Planning' ? '#006644' : '#42526E'
                          }}>{p.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, height: 6, background: '#EBECF0', borderRadius: 3 }}>
                              <div style={{ width: `${p.progress}%`, height: '100%', background: p.status === 'Completed' ? '#8B5CF6' : '#0052CC', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#42526E', width: 36 }}>{p.progress}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#172B4D' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.healthColor }} /> {p.health}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{p.endStr}</div>
                          <div style={{ fontSize: 11, color: '#6B778C', marginTop: 4 }}>{p.endSub}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex' }}>
                            {p.team.slice(0,3).map((img: string, i: number) => (
                              <img key={i} src={img} alt="" className="p-avatar" style={{ zIndex: 10 - i }} />
                            ))}
                            {p.team.length > 3 && (
                              <div className="p-avatar" style={{ background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#42526E', zIndex: 1 }}>+{p.team.length - 3}</div>
                            )}
                          </div>
                        </td>
                        <td style={{ position: 'relative', paddingRight: 24 }}>
                          <div style={{ padding: 6, borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === p.id ? null : p.id); }}>
                            <MoreVertical size={16} color="#8A94A6" />
                          </div>
                          {menuOpenId === p.id && (
                            <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', background: 'white', borderRadius: 8, boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)', border: '1px solid #DFE1E6', zIndex: 100, width: 160, padding: '4px 0' }} onClick={e => e.stopPropagation()}>
                              <div style={{ padding: '8px 12px', fontSize: 13, color: '#172B4D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => { e.stopPropagation(); setEditProjectId(p.id); setMenuOpenId(null); }}><Edit size={14} /> Edit Project</div>
                              <div style={{ padding: '8px 12px', fontSize: 13, color: '#172B4D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); setMenuOpenId(null); }}><Copy size={14} /> Duplicate</div>
                              <div style={{ height: 1, background: '#DFE1E6', margin: '4px 0' }} />
                              <div style={{ padding: '8px 12px', fontSize: 13, color: '#DE350B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => { e.stopPropagation(); handleDelete(p.id); setMenuOpenId(null); }}><Trash2 size={14} /> Delete</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                  <span style={{ fontSize: 13, color: '#5E6C84', fontWeight: 600 }}>Showing 1 to {Math.min(filteredProjects.length, 10)} of {filteredProjects.length} projects</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-secondary" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /></button>
                    <button className="btn-primary" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}>1</button>
                    <button className="btn-secondary" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {filteredProjects.map(p => (
                  <div key={p.id} onClick={() => window.location.href = `/projects/${p.id}`} style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 3px rgba(9,30,66,0.02)', transition: 'all 0.2s', position: 'relative' }} className="hover:shadow-md hover:border-gray-300">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="status-pill" style={{
                        background: p.status === 'In Progress' ? '#E6EFFF' : p.status === 'Completed' ? '#EDE9FE' : p.status === 'Planning' ? '#E3FCEF' : p.status === 'On Hold' ? '#FEF3C7' : '#F4F5F7',
                        color: p.status === 'In Progress' ? '#0052CC' : p.status === 'Completed' ? '#8B5CF6' : p.status === 'Planning' ? '#006644' : p.status === 'On Hold' ? '#974F0C' : '#42526E',
                      }}>{p.status}</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Star size={16} fill={p.starred ? "#FFAB00" : "none"} color={p.starred ? "#FFAB00" : "#C1C7D0"} onClick={(e) => toggleStar(p.id, p.starred, e)} />
                        <div style={{ position: 'relative' }}>
                          <div style={{ padding: 4, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === p.id ? null : p.id); }}>
                            <MoreVertical size={16} color="#8A94A6" />
                          </div>
                          {menuOpenId === p.id && (
                            <div style={{ position: 'absolute', right: 0, top: 24, background: 'white', borderRadius: 8, boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)', border: '1px solid #DFE1E6', zIndex: 100, width: 160, padding: '4px 0' }} onClick={e => e.stopPropagation()}>
                              <div style={{ padding: '8px 12px', fontSize: 13, color: '#172B4D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => { setEditProjectId(p.id); setMenuOpenId(null); }}><Edit size={14} /> Edit Project</div>
                              <div style={{ padding: '8px 12px', fontSize: 13, color: '#172B4D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => { handleDuplicate(p.id); setMenuOpenId(null); }}><Copy size={14} /> Duplicate</div>
                              <div style={{ height: 1, background: '#DFE1E6', margin: '4px 0' }} />
                              <div style={{ padding: '8px 12px', fontSize: 13, color: '#DE350B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => { handleDelete(p.id); setMenuOpenId(null); }}><Trash2 size={14} /> Delete</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#172B4D', lineHeight: 1.3 }}>{p.name}</h3>
                      <div style={{ fontSize: 12, color: '#6B778C', fontWeight: 600 }}>{p.readableId} • Owner: {p.owner}</div>
                    </div>
                    
                    <p style={{ margin: 0, fontSize: 13, color: '#42526E', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.desc || 'No description provided.'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#5E6C84' }}>Progress</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#172B4D' }}>{p.progress}%</span>
                      </div>
                      <div style={{ height: 4, background: '#EBECF0', borderRadius: 2, width: '100%' }}>
                        <div style={{ width: `${p.progress}%`, height: '100%', background: p.status === 'Completed' ? '#8B5CF6' : p.status === 'In Progress' ? '#0052CC' : p.status === 'Planning' ? '#10B981' : '#F59E0B', borderRadius: 2 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #DFE1E6', paddingTop: 16, marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5E6C84', fontWeight: 600 }}>
                        <Calendar size={14} /> {p.raw.endDate ? new Date(p.raw.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5E6C84', fontWeight: 600 }}>
                          <CheckSquare size={14} /> {p.completedTasks}/{p.totalTasks}
                        </div>
                        <div style={{ display: 'flex' }}>
                          {p.team.slice(0, 3).map((img: string, i: number) => (
                            <img key={i} src={img} alt="" className="p-avatar" style={{ width: 24, height: 24, zIndex: 10 - i }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="projects-sidebar">
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Overview</h3>
                <button className="btn-secondary" style={{ height: 24, fontSize: 11, padding: '0 8px' }}>This Month <ChevronDown size={12} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 24 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    {oInProgPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0052CC" strokeWidth="4" strokeDasharray={oDashInProg} strokeDashoffset={oOffInProg} />}
                    {oPlanPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray={oDashPlan} strokeDashoffset={oOffPlan} />}
                    {oRevPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={oDashRev} strokeDashoffset={oOffRev} />}
                    {oCompPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={oDashComp} strokeDashoffset={oOffComp} />}
                    {oHoldPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray={oDashHold} strokeDashoffset={oOffHold} />}
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{totalProjects}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0052CC' }} />In Progress</span>
                    <span style={{ display: 'flex', gap: 12 }}><span>{overviewCounts.inProgress}</span><span style={{ color: '#8A94A6', width: 32, textAlign: 'right' }}>{oInProgPct}%</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }} />Planning</span>
                    <span style={{ display: 'flex', gap: 12 }}><span>{overviewCounts.planning}</span><span style={{ color: '#8A94A6', width: 32, textAlign: 'right' }}>{oPlanPct}%</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />In Review</span>
                    <span style={{ display: 'flex', gap: 12 }}><span>{overviewCounts.inReview}</span><span style={{ color: '#8A94A6', width: 32, textAlign: 'right' }}>{oRevPct}%</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />Completed</span>
                    <span style={{ display: 'flex', gap: 12 }}><span>{overviewCounts.completed}</span><span style={{ color: '#8A94A6', width: 32, textAlign: 'right' }}>{oCompPct}%</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Upcoming Deadlines</h3>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.diffDays !== null && p.diffDays < 0 ? '#EF4444' : p.diffDays !== null && p.diffDays < 3 ? '#F59E0B' : '#C1C7D0', marginTop: 6, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', lineHeight: 1.3 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#6B778C', marginTop: 4 }}>{p.endSub}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#5E6C84', whiteSpace: 'nowrap' }}>
                      {p.endStr.split(',')[0]}
                    </div>
                  </div>
                )) : (
                  <div style={{ fontSize: 13, color: '#8A94A6', fontWeight: 500, textAlign: 'center', padding: '12px 0' }}>No upcoming deadlines</div>
                )}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Activity</h3>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {(activities.length > 0 ? activities : mockActivity).map((act, i) => (
                  <div key={act.id || i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <img src={act.userImage || act.img} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: 13, color: '#42526E', lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.user || act.u}</span> {act.action || act.a} <br />
                        <span style={{ fontWeight: 600, color: '#172B4D' }}>{act.entityId || act.p}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#8A94A6', marginTop: 4 }}>
                        {act.createdAt ? new Date(act.createdAt).toLocaleDateString() : act.t}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => { setIsCreateModalOpen(false); fetchProjects(); }} 
        />
      )}
      {editProjectId && (
        <EditProjectModal 
          projectId={editProjectId!} 
          onClose={() => setEditProjectId(null)} 
          onSuccess={() => { setEditProjectId(null); fetchProjects(); }} 
        />
      )}
    </main>
  );
}

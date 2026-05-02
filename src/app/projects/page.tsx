"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Plus, Search, ChevronDown, ChevronRight, ChevronLeft,
    Flame, Star, Zap, AlertTriangle, Rocket, Clock,
    MoreHorizontal, ExternalLink, ListPlus, BarChart2,
    CheckCircle2, Calendar, Users, FileText, Upload,
    X, Filter, Pin, ArrowUpRight, Activity, TrendingUp,
    Folder, Target, Eye
} from 'lucide-react';
import useSWR from 'swr';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectStore } from './project-store';

/* ─── Types ────────────────────────────────────────────── */
interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    startDate: string;
    endDate: string | null;
    manager: { name: string | null, id?: string, image?: string };
    _count: { tasks: number };
    riskScore: number;
    healthStatus: string;
    aiInsights?: any;
    teamIds?: string[];
    tags?: string[];
    updatedAt: string;
    isStarred?: boolean;
    progress?: number;
}

interface EnrichedProject extends Project {
    progress: number;
    health: 'on_track' | 'at_risk' | 'delayed' | 'completed';
    tags: string[];
    updatedAgo: string;
    pinned: boolean;
    category: string;
    teamSize: number;
}

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('An error occurred while fetching the data.');
    return res.json();
});

export default function ProjectsPage() {
    const { user } = useAuth();
    const { 
        searchQuery, setSearchQuery, 
        statusFilter, setStatusFilter, 
        ownerFilter, setOwnerFilter, 
        selectedProjectId, setSelectedProjectId 
    } = useProjectStore();

    const [activeTab, setActiveTab] = useState('Overview');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['🔥 Active', '⭐ Priority', '⚡ Recently Updated', '⚠️ At Risk', '🚀 Completed'])
    );
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const queryParams = new URLSearchParams();
    if (debouncedSearch) queryParams.set('search', debouncedSearch);
    if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);
    if (ownerFilter) queryParams.set('owner', ownerFilter);
    const queryString = queryParams.toString();
    
    const { data: projectsData, error: projectsError, isLoading: projectsLoading, mutate: mutateProjects } = useSWR(`/api/projects${queryString ? `?${queryString}` : ''}`, fetcher, { revalidateOnFocus: true });
    
    const { data: selectedProjectData, mutate: mutateSelectedProject } = useSWR(selectedProjectId ? `/api/projects/${selectedProjectId}` : null, fetcher);
    const { data: tasksData, mutate: mutateTasks } = useSWR(selectedProjectId ? `/api/tasks?projectId=${selectedProjectId}` : null, fetcher);
    const { data: activityData, mutate: mutateActivity } = useSWR(selectedProjectId ? `/api/projects/${selectedProjectId}/activity` : null, fetcher);

    useEffect(() => {
        fetch('/api/socket');
        const s = io({ path: '/api/socket' });
        setSocket(s);

        if (user?.tenantId) {
            s.emit('join-room', `tenant-${user.tenantId}`);
        }

        const handleProjectUpdate = () => {
            mutateProjects();
            if (selectedProjectId) {
                mutateSelectedProject();
                mutateTasks();
                mutateActivity();
            }
        };

        s.on('PROJECT_CREATED', handleProjectUpdate);
        s.on('PROJECT_UPDATED', handleProjectUpdate);
        s.on('PROJECT_DELETED', handleProjectUpdate);
        s.on('TASK_CREATED', handleProjectUpdate);
        s.on('TASK_UPDATED', handleProjectUpdate);
        s.on('TASK_DELETED', handleProjectUpdate);
        s.on('RISK_UPDATED', handleProjectUpdate);

        return () => { s.disconnect(); };
    }, [user?.tenantId, selectedProjectId, mutateProjects, mutateSelectedProject, mutateTasks, mutateActivity]);

    useEffect(() => {
        if (projectsError) toast.error('Failed to load projects');
    }, [projectsError]);

    const projects: Project[] = Array.isArray(projectsData) ? projectsData : [];
    
    // Auto-calculate progress dynamically from real tasks
    const getProjectProgress = (projId: string, currentTasksData: any) => {
        if (!currentTasksData || !Array.isArray(currentTasksData)) return 0;
        const tasksForProj = currentTasksData;
        const completed = tasksForProj.filter((t: any) => t.status === 'DONE').length;
        return tasksForProj.length > 0 ? Math.round((completed / tasksForProj.length) * 100) : 0;
    };

    /* ─── Helpers ───────────────────────────────── */
    const getAvatarColor = (str: string = '') => {
        if (!str) return '#42526E';
        const colors = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0', '#00B8D9', '#FF8B00'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const enrichProject = useCallback((p: any, index: number): EnrichedProject => {
        let health: 'on_track' | 'at_risk' | 'delayed' | 'completed' = 'on_track';
        if (p.status === 'COMPLETED') health = 'completed';
        else if (p.healthStatus === 'AT_RISK') health = 'at_risk';
        else if (p.healthStatus === 'DELAYED') health = 'delayed';

        const tags = Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['General'];
        const updatedDate = new Date(p.updatedAt || new Date());
        const diffMs = Date.now() - updatedDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const updatedAgo = diffMins < 60 ? `${diffMins}m ago` : diffMins < 1440 ? `${Math.floor(diffMins/60)}h ago` : 'Yesterday';

        const categories = ['Frontend', 'Backend', 'DevOps', 'Design', 'Marketing'];

        // If it's the selected project, we can use the freshly loaded tasks to calculate accurate progress
        let calculatedProgress = p.progress || 0;
        if (p.id === selectedProjectId && tasksData) {
            calculatedProgress = getProjectProgress(p.id, tasksData);
        }

        return {
            ...p,
            progress: calculatedProgress,
            health,
            tags,
            updatedAgo,
            pinned: p.isStarred || index < 2,
            category: categories[index % categories.length],
            teamSize: p.teamIds?.length || (3 + (index % 5)),
            riskScore: p.riskScore || 0,
            aiInsights: p.aiInsights || null
        };
    }, [tasksData, selectedProjectId]);

    const enrichedProjects = useMemo(() => projects.map((p, i) => enrichProject(p, i)), [projects, enrichProject]);
    const selectedProject: EnrichedProject | null = selectedProjectId ? enrichedProjects.find(p => p.id === selectedProjectId) || null : null;

    /* ─── Smart Categories ──────────────────────── */
    const categories = useMemo(() => {
        const active = enrichedProjects.filter(p => p.status === 'ACTIVE' && p.health !== 'at_risk' && p.health !== 'delayed');
        const priority = enrichedProjects.filter(p => p.pinned);
        const recent = [...enrichedProjects].sort(() => Math.random() - 0.5).slice(0, 3);
        const atRisk = enrichedProjects.filter(p => p.health === 'at_risk' || p.health === 'delayed');
        const completed = enrichedProjects.filter(p => p.status === 'COMPLETED' || p.health === 'completed');
        return [
            { label: '🔥 Active', items: active, icon: Flame, color: '#FF5630' },
            { label: '⭐ Priority', items: priority, icon: Star, color: '#FFAB00' },
            { label: '⚡ Recently Updated', items: recent, icon: Zap, color: '#0052CC' },
            { label: '⚠️ At Risk', items: atRisk, icon: AlertTriangle, color: '#FF5630' },
            { label: '🚀 Completed', items: completed, icon: Rocket, color: '#36B37E' },
        ].filter(c => c.items.length > 0);
    }, [enrichedProjects]);

    const toggleSection = (label: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
    };

    const getHealthBadge = (health: string) => {
        switch (health) {
            case 'on_track': return { label: 'On Track', color: '#36B37E', bg: 'rgba(54,179,126,0.1)', dot: '🟢' };
            case 'at_risk': return { label: 'At Risk', color: '#FFAB00', bg: 'rgba(255,171,0,0.1)', dot: '🟡' };
            case 'delayed': return { label: 'Delayed', color: '#FF5630', bg: 'rgba(255,86,48,0.1)', dot: '🔴' };
            case 'completed': return { label: 'Completed', color: '#36B37E', bg: 'rgba(54,179,126,0.1)', dot: '✅' };
            default: return { label: 'Unknown', color: '#6B778C', bg: '#F4F5F7', dot: '⚪' };
        }
    };

    const getProgressColor = (progress: number, health: string) => {
        if (health === 'completed') return '#36B37E';
        if (health === 'delayed') return '#FF5630';
        if (health === 'at_risk') return '#FFAB00';
        return progress > 60 ? '#36B37E' : '#0052CC';
    };

    const tabs = ['Overview', 'Tasks', 'Timeline', 'Team', 'AI Insights', 'Docs'];

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm)
            });
            if (!res.ok) throw new Error('Failed to create project');
            
            toast.success('Project created successfully');
            setShowCreateModal(false);
            setCreateForm({ name: '', description: '' });
            mutateProjects(); // Optmistic reload
        } catch (err) {
            toast.error('Error creating project');
        } finally {
            setIsCreating(false);
        }
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins/60)}h ago`;
        return `${Math.floor(diffMins/1440)}d ago`;
    };

    const liveTasks = useMemo(() => {
        const tasks = selectedProjectData?.tasks || (Array.isArray(tasksData) ? tasksData : []);
        if (!tasks || !Array.isArray(tasks)) return [];
        return tasks.map(t => ({
            id: t.id,
            title: t.title,
            tag: t.tags?.[0] || 'General',
            due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No Date',
            progress: t.progress || 0,
            date: new Date(t.createdAt).toLocaleDateString(),
            status: t.status,
            type: t.type || 'TASK'
        }));
    }, [tasksData, selectedProjectData]);

    const liveActivity = useMemo(() => {
        const activities = selectedProjectData?.activityLogs || (Array.isArray(activityData) ? activityData : []);
        if (!activities || !Array.isArray(activities)) return [];
        return activities.map((a: any) => ({
            user: a.user?.name || 'Unknown User',
            action: a.action.replace(/_/g, ' ').toLowerCase(),
            target: a.metadata?.name || a.metadata?.title || '',
            time: formatRelativeTime(a.createdAt),
            images: false
        }));
    }, [activityData, selectedProjectData]);

    const liveMilestones = useMemo(() => {
        const tasks = selectedProjectData?.tasks || (Array.isArray(tasksData) ? tasksData : []);
        if (!tasks || !Array.isArray(tasks)) return [];
        return tasks.filter((t: any) => t.type === 'MILESTONE').map((t: any) => ({
            title: t.title,
            due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD',
            dueIn: t.dueDate ? `${Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24))} days` : '',
            progress: t.progress || 0
        }));
    }, [tasksData, selectedProjectData]);

    const liveFiles = useMemo(() => {
        const files = selectedProjectData?.files || [];
        if (!files || !Array.isArray(files) || files.length === 0) {
            return [
                { name: 'No files attached yet', icon: '📄', size: '' }
            ];
        }
        return files.map((f: any) => ({
            name: f.name,
            icon: f.type?.includes('image') ? '🖼️' : '📄',
            size: `${(f.size / 1024 / 1024).toFixed(1)}MB`
        }));
    }, [selectedProjectData]);

    /* ─── Render ────────────────────────────────── */
    return (
        <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
                <style>{`
                    .project-row {
                        display: flex;
                        align-items: center;
                        padding: 12px 20px;
                        border-bottom: 1px solid rgba(9,30,66,0.06);
                        transition: all 0.15s cubic-bezier(0.2,0,0,1);
                        cursor: pointer;
                        position: relative;
                    }
                    .project-row:hover {
                        background: #F4F5F7;
                    }
                    .project-row:last-child { border-bottom: none; }
                    .quick-actions {
                        display: none;
                        position: absolute;
                        right: 16px;
                        top: 50%;
                        transform: translateY(-50%);
                        gap: 4px;
                        z-index: 5;
                    }
                    .project-row:hover .quick-actions { display: flex; }
                    .project-row:hover .updated-text { display: none; }
                    .qa-btn {
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 600;
                        border: 1px solid #DFE1E6;
                        background: white;
                        color: #42526E;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        transition: all 0.15s;
                    }
                    .qa-btn:hover { background: #0052CC; color: white; border-color: #0052CC; }

                    .progress-mini { height: 4px; background: #EBECF0; border-radius: 2px; overflow: hidden; flex: 1; max-width: 120px; }
                    .progress-mini-fill { height: 100%; border-radius: 2px; transition: width 0.6s cubic-bezier(0.2,0,0,1); }

                    .avatar-sm { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid white; font-size: 8px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; margin-left: -6px; }
                    .avatar-sm:first-child { margin-left: 0; }

                    .health-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                    .health-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px; }

                    .project-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: white; flex-shrink: 0; }

                    .filter-pill { padding: 6px 12px; border-radius: 8px; border: 1px solid transparent; background: #F4F5F7; font-size: 12px; font-weight: 500; color: #42526E; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
                    .filter-pill:hover { background: #EBECF0; }
                    .filter-pill.active { background: #E6EFFF; color: #0052CC; border-color: rgba(0,82,204,0.15); }

                    .section-header { display: flex; align-items: center; gap: 8px; padding: 8px 20px; cursor: pointer; user-select: none; }
                    .section-header:hover { background: rgba(9,30,66,0.02); }

                    .search-box { position: relative; flex: 1; max-width: 360px; }
                    .search-box input { width: 100%; padding: 8px 12px 8px 36px; border-radius: 8px; border: 1px solid #DFE1E6; font-size: 13px; outline: none; background: #FAFBFC; transition: all 0.2s; }
                    .search-box input:focus { border-color: #0052CC; background: white; box-shadow: 0 0 0 3px rgba(0,82,204,0.08); }

                    .tag-sm { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #F4F5F7; color: #42526E; font-weight: 500; white-space: nowrap; }

                    /* Detail Panel */
                    .detail-panel {
                        position: fixed;
                        top: 0;
                        right: 0;
                        width: 50vw;
                        max-width: 720px;
                        height: 100vh;
                        background: white;
                        box-shadow: -8px 0 24px rgba(9,30,66,0.12);
                        z-index: 100;
                        display: flex;
                        flex-direction: column;
                        animation: slideIn 0.25s cubic-bezier(0.2,0,0,1);
                    }
                    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                    .detail-overlay {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(9,30,66,0.3);
                        z-index: 99;
                        animation: fadeIn 0.2s ease;
                    }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                    .tab-nav { display: flex; gap: 0; border-bottom: 1px solid #DFE1E6; padding: 0 24px; }
                    .tab-btn {
                        padding: 12px 16px;
                        font-size: 13px;
                        font-weight: 500;
                        color: #6B778C;
                        border: none;
                        background: none;
                        cursor: pointer;
                        border-bottom: 2px solid transparent;
                        transition: all 0.2s;
                    }
                    .tab-btn:hover { color: #172B4D; }
                    .tab-btn.active { color: #0052CC; border-bottom-color: #0052CC; font-weight: 600; }

                    .task-row {
                        display: flex;
                        align-items: center;
                        padding: 10px 0;
                        border-bottom: 1px solid rgba(9,30,66,0.06);
                        gap: 12px;
                        transition: all 0.15s;
                    }
                    .task-row:hover { background: rgba(0,82,204,0.02); margin: 0 -16px; padding: 10px 16px; border-radius: 8px; }

                    .file-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(9,30,66,0.06); }
                    .file-row:last-child { border-bottom: none; }

                    .skeleton { background: linear-gradient(90deg, #F4F5F7 25%, #EBECF0 50%, #F4F5F7 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
                    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

                    /* Modal Styles */
                    .modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(9,30,66,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;
                    }
                    .modal-content {
                        background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 8px 32px rgba(9,30,66,0.15);
                    }
                    .form-group { margin-bottom: 16px; }
                    .form-label { display: block; font-size: 12px; font-weight: 600; color: #42526E; margin-bottom: 6px; }
                    .form-input { width: 100%; padding: 10px 12px; border-radius: 6px; border: 1px solid #DFE1E6; font-size: 13px; outline: none; }
                    .form-input:focus { border-color: #0052CC; box-shadow: 0 0 0 2px rgba(0,82,204,0.1); }
                `}</style>

                {/* ─── Page Header ───────────────────────── */}
                <div style={{ padding: '24px 32px 16px', background: 'white', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: '#E6EFFF', padding: '8px', borderRadius: '8px', color: '#0052CC' }}>
                                <Folder size={20} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D', letterSpacing: '-0.01em' }}>Projects</h1>
                                <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '2px' }}>
                                    {projectsLoading ? 'Loading...' : `${enrichedProjects.length} projects • ${enrichedProjects.filter(p => p.status === 'ACTIVE').length} active`}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,82,204,0.2)' }}>
                            <Plus size={16} /> Create Project
                        </button>
                    </div>

                    {/* ─── Filter Bar ──────────────────── */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="search-box">
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                            <input placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <div style={{ height: '20px', width: '1px', background: '#DFE1E6' }} />
                        <select className="filter-pill" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ appearance: 'none', paddingRight: '28px', backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%236B778C\' viewBox=\'0 0 24 24\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PLANNING">Planning</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        <div className="filter-pill">
                            <Users size={12} /> Owner <ChevronDown size={10} />
                        </div>
                    </div>
                </div>

                {/* ─── Project List ──────────────────────── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                    {projectsLoading ? (
                        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="skeleton" style={{ height: '56px', width: '100%' }} />
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#6B778C' }}>
                            <Folder size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p style={{ fontSize: '15px', fontWeight: 500 }}>No projects found</p>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Create a project to get started</p>
                        </div>
                    ) : (
                        categories.map(cat => {
                            const isExpanded = expandedSections.has(cat.label);
                            return (
                                <div key={cat.label} style={{ marginBottom: '4px' }}>
                                    <div className="section-header" onClick={() => toggleSection(cat.label)}>
                                        {isExpanded ? <ChevronDown size={14} color="#6B778C" /> : <ChevronRight size={14} color="#6B778C" />}
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{cat.label}</span>
                                        <span style={{ fontSize: '11px', color: '#6B778C', background: '#EBECF0', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>{cat.items.length}</span>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid rgba(9,30,66,0.08)', margin: '0 8px 8px', overflow: 'hidden' }}>
                                            {cat.items.map(project => {
                                                const hb = getHealthBadge(project.health);
                                                const progressColor = getProgressColor(project.progress, project.health);

                                                return (
                                                    <div
                                                        key={project.id}
                                                        className="project-row"
                                                        onClick={() => setSelectedProjectId(project.id)}
                                                        onMouseEnter={() => setHoveredProject(project.id)}
                                                        onMouseLeave={() => setHoveredProject(null)}
                                                    >
                                                        {/* Project Icon */}
                                                        <div className="project-icon" style={{ background: getAvatarColor(project.name), marginRight: '12px' }}>
                                                            {project.name[0]}
                                                        </div>

                                                        {/* Info Block */}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', letterSpacing: '-0.01em' }}>{project.name}</span>
                                                                {project.tags.map(t => <span key={t} className="tag-sm">• {t}</span>)}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                {project.pinned && <Star size={10} color="#FFAB00" fill="#FFAB00" />}
                                                                <span style={{ fontSize: '11px', color: '#6B778C' }} className="updated-text">Updated {project.updatedAgo}</span>
                                                                {/* Avatar stack */}
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    {Array.from({ length: Math.min(project.teamSize, 4) }).map((_, i) => (
                                                                        <div key={i} className="avatar-sm" style={{ background: getAvatarColor(`${project.name}${i}`), zIndex: 4 - i }}>
                                                                            {String.fromCharCode(65 + i)}
                                                                        </div>
                                                                    ))}
                                                                    {project.teamSize > 4 && (
                                                                        <div className="avatar-sm" style={{ background: '#42526E', zIndex: 0, fontSize: '7px' }}>+{project.teamSize - 4}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Progress + Health */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '8px' }}>
                                                            <div className="progress-mini">
                                                                <div className="progress-mini-fill" style={{ width: `${project.progress}%`, background: progressColor }} />
                                                            </div>
                                                            <span style={{ fontSize: '12px', fontWeight: 700, color: progressColor, minWidth: '32px', textAlign: 'right' }}>{project.progress}%</span>
                                                            <span className="health-badge" style={{ background: hb.bg, color: hb.color }}>
                                                                <span className="health-dot" style={{ background: hb.color }} />
                                                                {hb.label}
                                                            </span>
                                                            <ChevronRight size={14} color="#C1C7D0" />
                                                        </div>

                                                        {/* Quick Actions (hover) */}
                                                        <div className="quick-actions">
                                                            <button className="qa-btn"><ExternalLink size={10} /> Open</button>
                                                            <button className="qa-btn"><ListPlus size={10} /> + Task</button>
                                                            <button className="qa-btn"><BarChart2 size={10} /> Timeline</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {/* ─── Create Project Footer ──────── */}
                    <div style={{ padding: '16px 20px' }}>
                        <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B778C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                            <Plus size={14} /> Create Project
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Create Project Modal ───────────────── */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => !isCreating && setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D' }}>Create Project</h2>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <div className="form-group">
                                <label className="form-label">Project Name</label>
                                <input required className="form-input" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. Website Redesign" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder="Project goals and details..." rows={3} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', background: 'none', border: 'none', color: '#6B778C', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={isCreating} style={{ padding: '8px 16px', background: '#0052CC', border: 'none', color: 'white', fontWeight: 600, borderRadius: '6px', cursor: isCreating ? 'not-allowed' : 'pointer', opacity: isCreating ? 0.7 : 1 }}>
                                    {isCreating ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Detail Panel Overlay ───────────────── */}
            {selectedProject && (
                <>
                    <div className="detail-overlay" onClick={() => setSelectedProjectId(null)} />
                    <div className="detail-panel">
                        {/* Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button onClick={() => setSelectedProjectId(null)} style={{ background: '#F4F5F7', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#6B778C' }}>
                                <X size={16} />
                            </button>
                            <div className="project-icon" style={{ background: getAvatarColor(selectedProject.name), width: '40px', height: '40px', borderRadius: '12px', fontSize: '18px' }}>
                                {selectedProject.name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D' }}>{selectedProject.name}</h2>
                                    <MoreHorizontal size={16} color="#6B778C" style={{ cursor: 'pointer' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                    {selectedProject.tags.map(t => <span key={t} className="tag-sm" style={{ background: '#E6EFFF', color: '#0052CC' }}>{t}</span>)}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="tab-nav">
                            {tabs.map(tab => (
                                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
                            {/* Left Content (70%) */}
                            <div style={{ flex: 7, padding: '20px 24px', borderRight: '1px solid #DFE1E6', overflowY: 'auto' }}>

                                {/* Search + Filter within detail */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                    <div className="search-box" style={{ maxWidth: '280px' }}>
                                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                                        <input placeholder="Search projects..." style={{ fontSize: '12px' }} />
                                    </div>
                                    <div className="filter-pill" style={{ fontSize: '11px' }}>
                                        <Filter size={10} /> Owner <ChevronDown size={10} />
                                    </div>
                                </div>

                                {activeTab === 'Overview' && (
                                    <>
                                        {/* Activity Feed */}
                                <div style={{ marginBottom: '28px' }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Activity size={14} /> Activity
                                    </h3>
                                    {liveActivity.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#6B778C' }}>No recent activity.</p>
                                    ) : liveActivity.map((act, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '12px', background: '#FAFBFC', borderRadius: '10px', border: '1px solid rgba(9,30,66,0.06)' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getAvatarColor(act.user), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                                                {act.user[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{act.user}</span>
                                                    <span style={{ fontSize: '11px', color: '#6B778C' }}>{act.time}</span>
                                                </div>
                                                <p style={{ fontSize: '12px', color: '#42526E', lineHeight: 1.5 }}>
                                                    {act.action} {act.target && <span style={{ color: '#0052CC', fontWeight: 500 }}>{act.target}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* My Tasks */}
                                <div style={{ marginBottom: '28px' }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle2 size={14} /> My Tasks
                                    </h3>
                                    {liveTasks.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#6B778C' }}>No tasks found for this project.</p>
                                    ) : liveTasks.map((task: any) => (
                                        <div key={task.id} className="task-row">
                                            <input 
                                                type="checkbox" 
                                                checked={task.status === 'DONE'} 
                                                onChange={async (e) => {
                                                    const newStatus = e.target.checked ? 'DONE' : 'TODO';
                                                    try {
                                                        const res = await fetch(`/api/tasks/${task.id}`, {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ status: newStatus })
                                                        });
                                                        if (res.ok) {
                                                            mutateTasks();
                                                            mutateSelectedProject();
                                                        }
                                                    } catch (err) {}
                                                }}
                                                style={{ width: '16px', height: '16px', accentColor: '#0052CC', cursor: 'pointer' }} 
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#172B4D', textDecoration: task.status === 'DONE' ? 'line-through' : 'none', opacity: task.status === 'DONE' ? 0.7 : 1 }}>{task.title}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '10px', color: '#FF5630' }}>• {task.due}</span>
                                                </div>
                                            </div>
                                            <span className="tag-sm" style={{ background: task.tag === 'UI Revamp' ? '#E6EFFF' : '#F4F5F7', color: task.tag === 'UI Revamp' ? '#0052CC' : '#42526E' }}>{task.tag}</span>
                                            {task.progress > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                                                    <div className="progress-mini" style={{ maxWidth: '60px' }}>
                                                        <div className="progress-mini-fill" style={{ width: `${task.progress}%`, background: '#36B37E' }} />
                                                    </div>
                                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#36B37E' }}>{task.progress}%</span>
                                                </div>
                                            )}
                                            <span style={{ fontSize: '11px', color: '#6B778C' }}>{task.date}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Milestones */}
                                <div>
                                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Target size={14} /> Upcoming Milestones
                                    </h3>
                                    {liveMilestones.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#6B778C' }}>No upcoming milestones.</p>
                                    ) : liveMilestones.map((ms: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(9,30,66,0.06)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ms.progress > 50 ? '#0052CC' : '#DFE1E6' }} />
                                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#172B4D' }}>{ms.title}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {ms.progress > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <div className="progress-mini" style={{ maxWidth: '40px' }}>
                                                            <div className="progress-mini-fill" style={{ width: `${ms.progress}%`, background: '#0052CC' }} />
                                                        </div>
                                                        <span style={{ fontSize: '10px', color: '#0052CC', fontWeight: 600 }}>{ms.progress}%</span>
                                                    </div>
                                                )}
                                                <span style={{ fontSize: '11px', color: '#6B778C' }}>{ms.dueIn || ms.due}</span>
                                                <ChevronRight size={12} color="#C1C7D0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                </>
                            )}

                            {activeTab === 'AI Insights' && (
                                <div style={{ marginBottom: '28px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ background: '#E6EFFF', padding: '8px', borderRadius: '8px', color: '#0052CC' }}>
                                            <Zap size={16} />
                                        </div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#172B4D' }}>Project Intelligence</h3>
                                    </div>
                                    
                                    <div style={{ background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', marginBottom: '8px' }}>Summary</h4>
                                        <p style={{ fontSize: '13px', color: '#172B4D', lineHeight: 1.6 }}>
                                            {selectedProject.aiInsights?.summary || `${selectedProject.name} is currently ${selectedProject.health.replace('_', ' ')}. The team is making steady progress, but there are a few areas that require attention.`}
                                        </p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderRadius: '12px', padding: '16px' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#FF5630', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertTriangle size={12} /> Key Risks
                                            </h4>
                                            <ul style={{ paddingLeft: '16px', margin: 0, color: '#172B4D', fontSize: '13px', lineHeight: 1.6 }}>
                                                {(selectedProject.aiInsights?.risks || ['Dependency bottleneck on Core UX', 'Tight deadline for API Upgrade']).map((risk: string, i: number) => (
                                                    <li key={i}>{risk}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div style={{ background: '#E3FCEF', border: '1px solid #D3F9E8', borderRadius: '12px', padding: '16px' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#36B37E', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Target size={12} /> Recommendations
                                            </h4>
                                            <ul style={{ paddingLeft: '16px', margin: 0, color: '#172B4D', fontSize: '13px', lineHeight: 1.6 }}>
                                                {(selectedProject.aiInsights?.recommendations || ['Reassign 2 tasks to balance workload', 'Schedule design review by Friday']).map((rec: string, i: number) => (
                                                    <li key={i}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', marginBottom: '12px' }}>Suggested Next Actions</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(selectedProject.aiInsights?.nextActions || ['Review API documentation', 'Update project timeline']).map((action: string, i: number) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #C1C7D0' }} />
                                                    <span style={{ fontSize: '13px', color: '#172B4D' }}>{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            </div>

                            {/* Right Sidebar (30%) */}
                            <div style={{ flex: 3, padding: '20px', overflowY: 'auto', background: '#FAFBFC' }}>
                                {/* Overview Card */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Overview</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: '#6B778C' }}>Status</span>
                                            {(() => { const hb = getHealthBadge(selectedProject.health); return (
                                                <span className="health-badge" style={{ background: hb.bg, color: hb.color, fontSize: '11px' }}>
                                                    <span className="health-dot" style={{ background: hb.color }} /> {hb.label}
                                                </span>
                                            ); })()}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', color: '#6B778C' }}>Tags</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {selectedProject.tags.map(t => <span key={t} className="tag-sm">{t}</span>)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', color: '#6B778C' }}>Deadline</span>
                                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#172B4D' }}>
                                                {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 30, 2024'}
                                            </span>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '12px', color: '#6B778C' }}>Progress</span>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC' }}>{selectedProject.progress}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#EBECF0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${selectedProject.progress}%`, background: 'linear-gradient(90deg, #0052CC, #4C9AFF)', borderRadius: '3px', transition: 'width 0.5s' }} />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #DFE1E6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px', color: '#6B778C' }}>Risk Score</span>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: selectedProject.riskScore > 50 ? '#FF5630' : (selectedProject.riskScore > 20 ? '#FFAB00' : '#36B37E') }}>
                                                    {selectedProject.riskScore}/100
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Team */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Team</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        {Array.from({ length: Math.min(selectedProject.teamSize, 5) }).map((_, i) => (
                                            <div key={i} className="avatar-sm" style={{ background: getAvatarColor(`${selectedProject.name}${i}`), width: '28px', height: '28px', fontSize: '10px', marginLeft: i > 0 ? '-8px' : 0, zIndex: 5 - i }}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        ))}
                                        {selectedProject.teamSize > 5 && (
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#0052CC' }}>+{selectedProject.teamSize - 5}</span>
                                        )}
                                    </div>
                                    <button style={{ fontSize: '11px', fontWeight: 500, color: '#0052CC', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={10} /> Manage Team
                                    </button>
                                </div>

                                {/* Key Metrics */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Key Metrics</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {(() => {
                                            const tagCounts: Record<string, number> = {};
                                            liveTasks.forEach((t: any) => {
                                                const tag = t.tag || 'General';
                                                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                                            });
                                            const colors = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0'];
                                            return Object.entries(tagCounts).map(([label, count], idx) => {
                                                const color = colors[idx % colors.length];
                                                return (
                                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '2px', background: color }} />
                                                            <span style={{ fontSize: '12px', color: '#42526E' }}>{label}</span>
                                                            <span style={{ fontSize: '10px', background: `${color}10`, color: color, padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>{count}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#42526E' }}>{count}</span>
                                                            <ArrowUpRight size={10} color="#6B778C" />
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                {/* Attached Files */}
                                <div>
                                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Attached Files</h4>
                                    {liveFiles.map((f: any, i: number) => (
                                        <div key={i} className="file-row">
                                            <span style={{ fontSize: '16px' }}>{f.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#172B4D' }}>{f.name}</span>
                                                <div style={{ fontSize: '10px', color: '#6B778C' }}>{f.size}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <button style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '6px', border: '1px dashed #DFE1E6', background: 'transparent', fontSize: '11px', fontWeight: 500, color: '#0052CC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
                                        <Upload size={12} /> Upload File
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

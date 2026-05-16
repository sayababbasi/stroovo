"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ProjectModal from '@/components/ProjectModal';
import {
    Plus,
    ChevronDown,
    ChevronRight,
    FolderKanban,
    Calendar,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    Trash2,
    Edit2,
    Star
} from 'lucide-react';
import { Project } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function ProjectsPageContent() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeExpanded, setActiveExpanded] = useState(true);
    const [closedExpanded, setClosedExpanded] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchParams.get('create') === '1') {
            setSelectedProject(null);
            setIsModalOpen(true);
        }
    }, [searchParams]);

    const fetchProjects = () => {
        setLoading(true);
        fetch(`${API_URL}/api/projects`)
            .then(res => res.json())
            .then(data => {
                setProjects(Array.isArray(data) ? data : []);
                setLoading(false);
                window.dispatchEvent(new Event('projectsUpdated'));
            })
            .catch(err => {
                console.error('Failed to fetch projects:', err);
                setLoading(false);
            });
    };

    const fetchUsers = () => {
        fetch(`${API_URL}/api/users`)
            .then(res => res.json())
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(err => console.error('Failed to fetch users:', err));
    };

    const handleCreateProject = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const res = await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) fetchProjects();
        } catch (err) {
            console.error('Failed to delete project:', err);
        }
    };

    const handleSaveProject = async (projectData: any) => {
        try {
            const isEdit = !!projectData.id;
            const url = isEdit
                ? `${API_URL}/api/projects/${projectData.id}`
                : `${API_URL}/api/projects`;

            const res = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (res.ok) {
                fetchProjects();
                window.dispatchEvent(new Event('projectsUpdated'));
            }
        } catch (err) {
            console.error('Failed to save project:', err);
        }
    };

    const handleToggleStar = async (project: Project) => {
        // Optimistic update
        const originalProjects = [...projects];
        const updatedProjects = projects.map(p =>
            p.id === project.id ? { ...p, isStarred: !p.isStarred } : p
        );
        setProjects(updatedProjects);

        try {
            const res = await fetch(`${API_URL}/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isStarred: !project.isStarred })
            });
            if (!res.ok) {
                setProjects(originalProjects);
            } else {
                window.dispatchEvent(new Event('projectsUpdated'));
            }
        } catch (err) {
            console.error('Failed to toggle star:', err);
            setProjects(originalProjects);
        }
    };

    // Real progress calculation based on task counts
    const getProgress = (project: Project) => {
        const totalTasks = project._count?.tasks || 0;
        const doneTasks = project.tasks?.length || 0;

        if (totalTasks === 0) {
            return project.status === 'COMPLETED' ? 100 : 0;
        }

        const percentage = Math.round((doneTasks / totalTasks) * 100);
        return percentage;
    };

    const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'PLANNING' || p.status === 'ON_HOLD');
    const closedProjects = projects.filter(p => p.status === 'COMPLETED' || p.status === 'CLOSED');

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#DEEBFF', fg: '#0747A6', label: 'In Progress' };
            case 'PLANNING': return { bg: '#EAE6FF', fg: '#403294', label: 'Planning' };
            case 'COMPLETED': return { bg: '#E3FCEF', fg: '#006644', label: 'Completed' };
            case 'ON_HOLD': return { bg: '#FFF0B3', fg: '#172B4D', label: 'On Hold' };
            default: return { bg: '#F4F5F7', fg: '#42526E', label: status };
        }
    };

    return (
        <main style={{ display: 'flex' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: '240px', padding: '0', background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ padding: '20px 40px', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Projects</h1>
                        <button
                            onClick={handleCreateProject}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                        >
                            <Plus size={16} /> Add new
                        </button>
                    </div>
                </div>

                {/* Projects Table */}
                <div style={{ flex: 1, padding: '24px 40px' }}>

                    {/* Active Projects Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <div
                            onClick={() => setActiveExpanded(!activeExpanded)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}
                        >
                            {activeExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Active projects</h2>
                            <span style={{ background: '#EBECF0', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                                {activeProjects.length}
                            </span>
                        </div>

                        {activeExpanded && (
                            <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Table Header */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 140px 100px 120px 120px 140px 80px',
                                    background: '#F4F5F7',
                                    padding: '12px 16px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#6B778C',
                                    textTransform: 'uppercase',
                                    borderBottom: '1px solid #DFE1E6'
                                }}>
                                    <div>Project Name</div>
                                    <div>Project Status</div>
                                    <div>Progress</div>
                                    <div>Start Date</div>
                                    <div>Due Date</div>
                                    <div>Project Owner</div>
                                    <div>Actions</div>
                                </div>

                                {/* Table Rows */}
                                {loading ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>Loading projects...</div>
                                ) : activeProjects.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>No active projects found.</div>
                                ) : (
                                    activeProjects.map((project) => {
                                        const status = getStatusStyle(project.status);
                                        const progress = getProgress(project);

                                        return (
                                            <div
                                                key={project.id}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 140px 100px 120px 120px 140px 80px',
                                                    padding: '14px 16px',
                                                    fontSize: '13px',
                                                    borderBottom: '1px solid #EBECF0',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleStar(project); }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <Star
                                                            size={16}
                                                            color={project.isStarred ? "#FFD700" : "#6B778C"}
                                                            fill={project.isStarred ? "#FFD700" : "transparent"}
                                                        />
                                                    </button>
                                                    <FolderKanban size={16} color="#0052CC" />
                                                    <span style={{ fontWeight: 500 }}>{project.name}</span>
                                                </div>
                                                <div>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '3px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        background: status.bg,
                                                        color: status.fg,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <Clock size={10} />
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '6px', background: '#DFE1E6', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${progress}%`, height: '100%', background: '#36B37E' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: '#42526E', fontWeight: 600 }}>{progress}%</span>
                                                </div>
                                                <div style={{ color: '#42526E', fontSize: '12px' }}>
                                                    {new Date(project.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div style={{ color: '#42526E', fontSize: '12px' }}>
                                                    {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: '#0052CC',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '10px',
                                                        fontWeight: 700
                                                    }}>
                                                        {project.manager?.name?.[0] || 'U'}
                                                    </div>
                                                    <span style={{ fontSize: '12px' }}>{project.manager?.name?.split(' ')[0] || 'Unknown'}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleEditProject(project)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px' }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF5630', padding: '4px' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Add Project Button */}
                                <div style={{ padding: '12px 16px', color: '#6B778C', fontSize: '13px' }}>
                                    <span
                                        onClick={handleCreateProject}
                                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Plus size={14} />
                                        Add project
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Closed Projects Section */}
                    <div>
                        <div
                            onClick={() => setClosedExpanded(!closedExpanded)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}
                        >
                            {closedExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Closed projects</h2>
                            <span style={{ background: '#EBECF0', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                                {closedProjects.length}
                            </span>
                        </div>

                        {closedExpanded && (
                            <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '8px', overflow: 'hidden' }}>
                                {closedProjects.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B778C' }}>
                                        No closed projects yet.
                                    </div>
                                ) : (
                                    closedProjects.map(project => (
                                        <div key={project.id} style={{ padding: '14px 16px', borderBottom: '1px solid #EBECF0' }}>
                                            {/* Minimal closed project row or same as active */}
                                            {project.name}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                project={selectedProject}
                users={users}
            />
        </main>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <main style={{ display: 'flex' }}>
                <Sidebar />
                <div style={{ flex: 1, marginLeft: '240px', padding: '40px', background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                    Loading…
                </div>
            </main>
        }>
            <ProjectsPageContent />
        </Suspense>
    );
}

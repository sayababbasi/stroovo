"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Plus,
    ChevronDown,
    ChevronRight,
    FolderKanban,
    Calendar,
    MoreHorizontal,
    CheckCircle2,
    Clock
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    startDate: string;
    endDate: string | null;
    manager: { name: string | null };
    _count: { tasks: number };
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeExpanded, setActiveExpanded] = useState(true);
    const [closedExpanded, setClosedExpanded] = useState(true);

    useEffect(() => {
        fetch('/api/admin/projects')
            .then(res => res.json())
            .then(data => {
                setProjects(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, []);

    // Mock progress for demo - in production, calculate from tasks
    const getProgress = (projectId: string, index: number) => {
        const mockProgress = [86, 75, 72, 35, 58, 44, 37, 74, 80];
        return mockProgress[index % mockProgress.length];
    };

    const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'PLANNING');
    const closedProjects = projects.filter(p => p.status === 'COMPLETED' || p.status === 'CLOSED');

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#DEEBFF', fg: '#0747A6', label: 'In Progress' };
            case 'PLANNING': return { bg: '#EAE6FF', fg: '#403294', label: 'New project' };
            case 'COMPLETED': return { bg: '#E3FCEF', fg: '#006644', label: 'Completed' };
            default: return { bg: '#FFAB00', fg: '#172B4D', label: status };
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
                        <button className="btn btn-primary"><Plus size={16} /> Add new</button>
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
                                    gridTemplateColumns: '2fr 140px 100px 120px 120px 140px 48px',
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
                                    <div></div>
                                </div>

                                {/* Table Rows */}
                                {activeProjects.map((project, index) => {
                                    const status = getStatusStyle(project.status);
                                    const progress = getProgress(project.id, index);

                                    return (
                                        <div
                                            key={project.id}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 140px 100px 120px 120px 140px 48px',
                                                padding: '14px 16px',
                                                fontSize: '13px',
                                                borderBottom: '1px solid #EBECF0',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                                    {project.manager.name?.[0] || 'U'}
                                                </div>
                                                <span style={{ fontSize: '12px' }}>{project.manager.name?.split(' ')[0] || 'Unknown'}</span>
                                            </div>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}>
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Add Project Button */}
                                <div style={{ padding: '12px 16px', color: '#6B778C', fontSize: '13px' }}>
                                    <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

                        {closedExpanded && closedProjects.length > 0 && (
                            <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Closed projects would render here similarly */}
                                <div style={{ padding: '24px', textAlign: 'center', color: '#6B778C' }}>
                                    No closed projects yet.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

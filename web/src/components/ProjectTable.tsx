"use client";

import { useState, useEffect } from 'react';
import {
    FolderKanban,
    Search,
    Calendar,
    MoreVertical,
    Plus,
    Edit2,
    Trash2,
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
    manager: {
        name: string | null;
        email: string;
    };
    _count: {
        tasks: number;
    };
}

export default function ProjectTable() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/admin/projects');
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.manager.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading projects...</div>;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem 0.625rem 2.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            fontSize: '0.875rem'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <Plus size={18} />
                    <span>Create Project</span>
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Project</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Manager</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Timeline</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Tasks</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project) => (
                            <tr key={project.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            background: 'rgba(var(--primary-h), 85%, 55%, 0.1)',
                                            color: 'var(--primary)'
                                        }}>
                                            <FolderKanban size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{project.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {project.description}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {project.manager.name ? project.manager.name[0] : 'U'}
                                        </div>
                                        <span>{project.manager.name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: project.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                                        color: project.status === 'ACTIVE' ? '#22c55e' : '#f97316'
                                    }}>
                                        {project.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Calendar size={14} />
                                        {new Date(project.startDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <CheckCircle2 size={14} color="var(--muted-foreground)" />
                                        {project._count.tasks} Tasks
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.4rem' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn btn-ghost" style={{ padding: '0.4rem', color: '#ef4444' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

"use client";

import Sidebar from '@/components/Sidebar';
import { 
    Zap, 
    Plus, 
    Play, 
    Check, 
    Clock, 
    Search, 
    Filter, 
    Users, 
    Calendar,
    ChevronDown,
    MoreHorizontal,
    CheckCircle2
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface SprintTask {
    id: string;
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    assignees: string[];
    progress: number;
    status: 'Done' | 'In Progress' | 'To Do';
    tags: string[];
}

interface Sprint {
    id: string;
    name: string;
    dates: string;
    tasks: SprintTask[];
}

export default function SprintsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const sprintData: Sprint[] = [
        {
            id: 's7',
            name: 'Sprint 7',
            dates: 'April 08 - April 22',
            tasks: [
                { id: 't1', title: 'CRM Sync Optimization', priority: 'HIGH', category: 'Sprint 8', assignees: ['SK', 'B'], progress: 40, status: 'In Progress', tags: ['Sarhen K', 'Baran'] },
                { id: 't2', title: 'API Rate Limiting', priority: 'HIGH', category: 'Gate K', assignees: ['AG'], progress: 75, status: 'In Progress', tags: ['Adam G', '25%'] },
                { id: 't3', title: 'UI Polishing', priority: 'LOW', category: 'Alex B', assignees: ['AJ', 'JB'], progress: 50, status: 'To Do', tags: ['A James K', '30m'] }
            ]
        },
        {
            id: 's8',
            name: 'Sprint 8',
            dates: 'April 23 - May 07',
            tasks: [
                { id: 't4', title: 'Finalize Revotic AI Integration', priority: 'MEDIUM', category: 'Backend', assignees: ['WW', 'EK', 'SK'], progress: 100, status: 'Done', tags: ['Done', 'Tage', 'Sale%'] },
                { id: 't5', title: 'Error Handling Improvements', priority: 'HIGH', category: 'Web', assignees: ['EW', 'EK'], progress: 75, status: 'In Progress', tags: ['Emma W', '70%'] },
                { id: 't6', title: 'Develop Onboarding Flow', priority: 'HIGH', category: 'SaaS & Q', assignees: ['SG', 'DL', 'SK'], progress: 40, status: 'In Progress', tags: ['Sam G', 'David L', 'Sarah K'] }
            ]
        },
        {
            id: 's9',
            name: 'Sprint 9',
            dates: 'May 08 - May 20',
            tasks: [
                { id: 't7', title: 'User Feedback Analysis', priority: 'MEDIUM', category: 'Sprint #08', assignees: ['SP', 'UX'], progress: 30, status: 'To Do', tags: ['Saya P', 'UX'] },
                { id: 't8', title: 'Prototype Dashboard Redesign', priority: 'HIGH', category: '#66', assignees: ['AG', 'AV', 'JB'], progress: 25, status: 'In Progress', tags: ['Adam G', 'AVS', '25%'] }
            ]
        }
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': 
                return { 
                    bg: 'rgba(255, 86, 48, 0.1)', 
                    text: '#FF5630', 
                    icon: <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5630', marginRight: 4 }} /> 
                };
            case 'MEDIUM': 
                return { 
                    bg: 'rgba(0, 82, 204, 0.1)', 
                    text: '#0052CC',
                    icon: <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052CC', marginRight: 4 }} /> 
                };
            case 'LOW': 
                return { 
                    bg: 'rgba(54, 179, 126, 0.1)', 
                    text: '#36B37E',
                    icon: <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#36B37E', marginRight: 4 }} /> 
                };
            default: 
                return { 
                    bg: '#F4F5F7', 
                    text: '#6B778C',
                    icon: null
                };
        }
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        if (name.length <= 2) return name;
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Avatar color generator based on string
    const getAvatarColor = (str: string) => {
        const colors = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0', '#00B8D9'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F5F7' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
                <style>{`
                    .board-container {
                        padding: 32px;
                        flex: 1;
                        overflow-x: auto;
                        display: flex;
                        gap: 24px;
                        align-items: flex-start;
                        background: linear-gradient(180deg, #F4F5F7 0%, #FFFFFF 100%);
                    }
                    .board-column { 
                        min-width: 360px; 
                        max-width: 360px; 
                        display: flex;
                        flex-direction: column;
                    }
                    .task-card {
                        background: #FFFFFF;
                        border-radius: 12px;
                        padding: 20px;
                        border: 1px solid rgba(9, 30, 66, 0.08);
                        margin-bottom: 16px;
                        box-shadow: 0 1px 2px rgba(9, 30, 66, 0.05);
                        transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
                        position: relative;
                        cursor: grab;
                    }
                    .task-card:hover { 
                        border-color: rgba(0, 82, 204, 0.3); 
                        transform: translateY(-2px); 
                        box-shadow: 0 8px 16px rgba(9, 30, 66, 0.08), 0 0 0 1px rgba(0, 82, 204, 0.1); 
                    }
                    .task-card:active { cursor: grabbing; transform: translateY(0); }
                    
                    .priority-label { 
                        font-size: 10px; 
                        font-weight: 700; 
                        padding: 4px 8px; 
                        border-radius: 6px; 
                        text-transform: uppercase; 
                        letter-spacing: 0.05em; 
                        display: inline-flex;
                        align-items: center;
                    }
                    .category-tag { 
                        font-size: 11px; 
                        color: #6B778C; 
                        font-weight: 500; 
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        transition: color 0.2s;
                    }
                    .task-card:hover .category-tag { color: #0052CC; }
                    
                    .tag-chip { 
                        font-size: 11px; 
                        padding: 4px 8px; 
                        background: #F4F5F7; 
                        border-radius: 6px; 
                        color: #42526E; 
                        font-weight: 500; 
                        border: 1px solid transparent;
                    }
                    
                    .avatar-stack { display: flex; align-items: center; justify-content: flex-end; }
                    .avatar { 
                        width: 26px; 
                        height: 26px; 
                        border-radius: 50%; 
                        border: 2px solid white; 
                        color: white; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 10px; 
                        font-weight: 600; 
                        margin-left: -6px; 
                        box-shadow: 0 1px 2px rgba(0,0,0,0.1); 
                        transition: transform 0.2s;
                    }
                    .avatar:hover { transform: translateY(-2px); z-index: 10; }
                    .avatar:first-child { margin-left: 0; }
                    
                    .filter-dropdown { 
                        padding: 8px 12px; 
                        border-radius: 8px; 
                        border: 1px solid transparent; 
                        background: #F4F5F7; 
                        font-size: 13px; 
                        font-weight: 500; 
                        color: #42526E; 
                        cursor: pointer; 
                        display: flex; 
                        align-items: center; 
                        gap: 8px; 
                        transition: all 0.2s;
                    }
                    .filter-dropdown:hover { background: #EBECF0; color: #172B4D; }
                    .filter-dropdown.active { background: #E6EFFF; color: #0052CC; border-color: rgba(0, 82, 204, 0.2); }
                    
                    .search-container { position: relative; flex: 1; max-width: 320px; }
                    .search-input { 
                        width: 100%; 
                        padding: 8px 16px 8px 36px; 
                        border-radius: 8px; 
                        border: 1px solid #DFE1E6; 
                        font-size: 13px; 
                        outline: none; 
                        background: #FAFBFC; 
                        transition: all 0.2s; 
                    }
                    .search-input:focus { border-color: #0052CC; background: white; box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1); }
                    
                    .progress-bar-bg { height: 4px; background: #EBECF0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
                    .progress-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(0.2, 0, 0, 1); }
                    
                    .sprint-header {
                        margin-bottom: 20px;
                        padding-bottom: 12px;
                        border-bottom: 2px solid transparent;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                `}</style>

                {/* Header Section */}
                <div style={{ padding: '32px 40px 24px', background: 'white', borderBottom: '1px solid #DFE1E6', zIndex: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <div style={{ background: '#E6EFFF', padding: '8px', borderRadius: '8px', color: '#0052CC' }}>
                                    <Zap size={20} />
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D', letterSpacing: '-0.01em' }}>Sprint Planning</h1>
                            </div>
                            <p style={{ color: '#6B778C', fontSize: '14px', marginLeft: '44px' }}>Organize, prioritize, and track your agile iterations</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#42526E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MoreHorizontal size={16} /> Options
                            </button>
                            <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)' }}>
                                <Plus size={16} /> New Sprint
                            </button>
                        </div>
                    </div>

                    {/* Meta Filter Bar (Linear Inspired) */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="filter-dropdown active">
                            <Filter size={14} /> Active Sprints
                        </div>
                        <div className="filter-dropdown">
                            <Users size={14} /> Assignees <ChevronDown size={12} opacity={0.5} />
                        </div>
                        <div className="filter-dropdown">
                            <Calendar size={14} /> Timeline <ChevronDown size={12} opacity={0.5} />
                        </div>
                        
                        <div style={{ height: '24px', width: '1px', background: '#DFE1E6', margin: '0 8px' }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{ fontSize: '12px', color: '#6B778C', fontWeight: 500 }}>Projects:</span>
                            <div className="tag-chip" style={{ background: '#E6EFFF', color: '#0052CC', borderColor: '#B3D4FF' }}>Revotic AI Core</div>
                            <div className="tag-chip">Marketing Site</div>
                        </div>

                        <div className="search-container">
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                            <input className="search-input" placeholder="Search tasks... (Ctrl+K)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Board Area */}
                <div className="board-container">
                    {sprintData.map((sprint, index) => (
                        <div key={sprint.id} className="board-column">
                            {/* Linear-style Sprint Header */}
                            <div className="sprint-header">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', letterSpacing: '-0.01em' }}>{sprint.name}</h2>
                                        {index === 0 && (
                                            <span style={{ fontSize: '10px', background: '#E6EFFF', color: '#0052CC', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> {sprint.dates}
                                    </div>
                                </div>
                                <div style={{ 
                                    width: '24px', height: '24px', borderRadius: '6px', background: '#F4F5F7', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E',
                                    fontSize: '11px', fontWeight: 600 
                                }}>
                                    {sprint.tasks.length}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {sprint.tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((task) => {
                                    const { bg, text, icon } = getPriorityColor(task.priority);
                                    return (
                                        <div key={task.id} className="task-card">
                                            {/* Top Row: Priority & Category */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span className="priority-label" style={{ background: bg, color: text }}>
                                                    {icon}
                                                    {task.priority}
                                                </span>
                                                <span className="category-tag">
                                                    {task.category}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', marginBottom: '12px', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                                                {task.title}
                                            </h3>

                                            {/* Tags area */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                                {task.status === 'Done' && (
                                                    <span className="tag-chip" style={{ background: '#E3FCEF', color: '#006644', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px' }}>
                                                        <CheckCircle2 size={10} /> Done
                                                    </span>
                                                )}
                                                {task.tags.filter(t => t !== 'Done').map((tag, idx) => (
                                                    <span key={idx} className="tag-chip" style={{ padding: '2px 6px' }}>{tag}</span>
                                                ))}
                                            </div>

                                            {/* Bottom Row: Progress & Avatars */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                                                <div style={{ flex: 1, paddingRight: '16px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, color: task.status === 'Done' ? '#36B37E' : '#0052CC' }}>
                                                        {task.progress}%
                                                    </span>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ 
                                                            width: `${task.progress}%`, 
                                                            background: task.status === 'Done' ? '#36B37E' : 'linear-gradient(90deg, #0052CC 0%, #4C9AFF 100%)' 
                                                        }} />
                                                    </div>
                                                </div>
                                                <div className="avatar-stack">
                                                    {task.assignees.map((a, idx) => (
                                                        <div key={idx} className="avatar" style={{ background: getAvatarColor(a), zIndex: task.assignees.length - idx }}>
                                                            {getInitials(a)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

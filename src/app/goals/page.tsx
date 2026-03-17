"use client";

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Target, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle2, 
    Plus, 
    Search,
    Calendar,
    Edit2,
    Trash2,
    X,
    ArrowUpRight
} from 'lucide-react';

interface Goal {
    id: string;
    title: string;
    description: string | null;
    status: string;
    progress: number;
    targetDate: string | null;
    owner: { name: string | null; email: string };
    projects: { id: string; name: string; status: string }[];
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'ON TRACK',
        progress: 0,
        targetDate: ''
    });

    const fetchGoals = () => {
        setLoading(true);
        fetch('/api/goals')
            .then(res => res.json())
            .then(data => {
                setGoals(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const stats = useMemo(() => {
        return {
            total: goals.length,
            onTrack: goals.filter(g => g.status === 'ON TRACK').length,
            atRisk: goals.filter(g => g.status === 'AT RISK').length,
            offTrack: goals.filter(g => g.status === 'OFF TRACK').length,
        };
    }, [goals]);

    const filteredGoals = useMemo(() => {
        return goals.filter(goal => {
            const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                (goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesStatus = statusFilter === 'ALL' || goal.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [goals, searchQuery, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON TRACK': return '#36B37E';
            case 'AT RISK': return '#FFAB00';
            case 'OFF TRACK': return '#FF5630';
            default: return '#6B778C';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'ON TRACK': return '#E3FCEF';
            case 'AT RISK': return '#FFF0B3';
            case 'OFF TRACK': return '#FFEBE6';
            default: return '#F4F5F7';
        }
    };

    const handleAddGoal = () => {
        setEditingGoal(null);
        setFormData({
            title: '',
            description: '',
            status: 'ON TRACK',
            progress: 0,
            targetDate: formatToInputDate(new Date())
        });
        setShowModal(true);
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setFormData({
            title: goal.title,
            description: goal.description || '',
            status: goal.status,
            progress: goal.progress,
            targetDate: goal.targetDate ? formatToInputDate(new Date(goal.targetDate)) : ''
        });
        setShowModal(true);
    };

    const handleDeleteGoal = (id: string) => {
        setGoalToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteGoal = async () => {
        if (!goalToDelete) return;
        try {
            const res = await fetch(`/api/goals?id=${goalToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setShowDeleteModal(false);
                setGoalToDelete(null);
                fetchGoals();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingGoal ? `/api/goals?id=${editingGoal.id}` : '/api/goals';
        const method = editingGoal ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                fetchGoals();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const formatToInputDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    return (
        <main style={{ display: 'flex', minHeight: '100vh', background: '#F4F5F7' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
                <style>{`
                    .goal-card {
                        background: white;
                        border-radius: 12px;
                        padding: 24px;
                        border: 1px solid #DFE1E6;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                    }
                    .goal-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 24px rgba(9, 30, 66, 0.08);
                        border-color: #4C9AFF;
                    }
                    .btn-primary {
                        background: #0052CC;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s;
                    }
                    .btn-primary:hover { background: #0747A6; }
                    .stats-card {
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #DFE1E6;
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(9, 30, 66, 0.54);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        backdrop-filter: blur(4px);
                    }
                    .modal-content {
                        background: white;
                        width: 100%;
                        max-width: 500px;
                        border-radius: 12px;
                        padding: 32px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    }
                    .form-group { margin-bottom: 20px; }
                    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #42526E; }
                    .form-control {
                        width: 100%;
                        padding: 10px 12px;
                        border: 2px solid #DFE1E6;
                        border-radius: 6px;
                        outline: none;
                        transition: border-color 0.2s;
                    }
                    .form-control:focus { border-color: #4C9AFF; }
                `}</style>

                {/* Header Section */}
                <div style={{ padding: '40px 40px 20px', background: 'white', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#172B4D' }}>Goals & OKRs</h1>
                            <p style={{ color: '#6B778C', marginTop: '4px', fontSize: '16px' }}>Strategic outcomes for the next quarter</p>
                        </div>
                        <button className="btn-primary" onClick={handleAddGoal}>
                            <Plus size={20} /> New Goal
                        </button>
                    </div>

                    {/* Stats Header */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                        <div className="stats-card">
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Total Goals</span>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.total}</span>
                        </div>
                        <div className="stats-card" style={{ borderLeft: `4px solid #36B37E` }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>On Track</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={20} color="#36B37E" />
                                <span style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.onTrack}</span>
                            </div>
                        </div>
                        <div className="stats-card" style={{ borderLeft: `4px solid #FFAB00` }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>At Risk</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={20} color="#FFAB00" />
                                <span style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.atRisk}</span>
                            </div>
                        </div>
                        <div className="stats-card" style={{ borderLeft: `4px solid #FF5630` }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Off Track</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={20} color="#FF5630" />
                                <span style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.offTrack}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                            <input 
                                type="text"
                                placeholder="Search goals or descriptions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '10px 40px', borderRadius: '8px', border: '2px solid #DFE1E6', outline: 'none' }}
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '10px 16px', borderRadius: '8px', border: '2px solid #DFE1E6', background: 'white', color: '#42526E', fontWeight: 600, outline: 'none' }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ON TRACK">On Track</option>
                            <option value="AT RISK">At Risk</option>
                            <option value="OFF TRACK">Off Track</option>
                        </select>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                            <div>Loading...</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                            {filteredGoals.map((goal) => (
                                <div key={goal.id} className="goal-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ padding: '12px', borderRadius: '8px', background: '#F4F5F7', color: '#0052CC' }}>
                                            <Target size={24} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditGoal(goal)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><Edit2 size={18} /></button>
                                            <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><Trash2 size={18} /></button>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', marginBottom: '8px' }}>{goal.title}</h3>
                                    <p style={{ fontSize: '14px', color: '#6B778C', marginBottom: '24px', lineHeight: '1.5' }}>{goal.description}</p>

                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                                            <span style={{ color: '#42526E' }}>Overall Progress</span>
                                            <span style={{ color: getStatusColor(goal.status) }}>{goal.progress}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#EBECF0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${goal.progress}%`, 
                                                height: '100%', 
                                                background: getStatusColor(goal.status),
                                                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F4F5F7', paddingTop: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 800, 
                                                padding: '4px 8px', 
                                                borderRadius: '4px',
                                                background: getStatusBg(goal.status),
                                                color: getStatusColor(goal.status)
                                            }}>{goal.status}</span>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B778C', fontSize: '12px' }}>
                                                <Calendar size={14} />
                                                <span>{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No date'}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                                                {goal.owner.name?.[0] || 'U'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <ArrowUpRight size={20} style={{ position: 'absolute', right: '20px', bottom: '20px', color: '#EBECF0' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Goal Title</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Enter goal title..."
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        className="form-control" 
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                        placeholder="What are we trying to achieve?"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select 
                                            className="form-control"
                                            value={formData.status}
                                            onChange={e => setFormData({...formData, status: e.target.value})}
                                        >
                                            <option value="ON TRACK">On Track</option>
                                            <option value="AT RISK">At Risk</option>
                                            <option value="OFF TRACK">Off Track</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Target Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control"
                                            value={formData.targetDate}
                                            onChange={e => setFormData({...formData, targetDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Progress ({formData.progress}%)</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        style={{ width: '100%' }}
                                        value={formData.progress}
                                        onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #DFE1E6', background: 'white', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                                        {editingGoal ? 'Update Goal' : 'Save Goal'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ 
                                width: '64px', 
                                height: '64px', 
                                background: '#FFEBE6', 
                                color: '#FF5630', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <AlertTriangle size={32} />
                            </div>
                            
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', marginBottom: '12px' }}>Confirm Deletion</h2>
                            <p style={{ color: '#6B778C', marginBottom: '32px', lineHeight: '1.5' }}>
                                Are you sure you want to delete this goal? This action cannot be undone.
                            </p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #DFE1E6', background: 'white', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#42526E' }}>Cancel</button>
                                <button onClick={confirmDeleteGoal} style={{ flex: 1, padding: '12px', background: '#FF5630', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Delete Goal</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

"use client";

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { format, differenceInDays } from 'date-fns';
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

interface SubItem {
    title: string;
    owner: string;
    progress: number;
    status?: 'Done' | 'In Progress' | 'To Do';
}

interface Goal {
    id: string;
    title: string;
    description: string | null;
    status: 'ON TRACK' | 'AT RISK' | 'OFF TRACK';
    progress: number;
    targetDate: string | null;
    owner: { name: string | null; email: string };
    projects: { id: string; name: string; status: string }[];
    subItems?: SubItem[];
    keyResults?: any[];
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
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
            onTrack: goals.filter(g => g.status.replace('_', ' ') === 'ON TRACK').length,
            atRisk: goals.filter(g => g.status.replace('_', ' ') === 'AT RISK').length,
            offTrack: goals.filter(g => g.status.replace('_', ' ') === 'OFF TRACK').length,
        };
    }, [goals]);

    const filteredGoals = useMemo(() => {
        return goals.filter(goal => {
            const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesStatus = statusFilter === 'ALL' || goal.status.replace('_', ' ') === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [goals, searchQuery, statusFilter]);

    const getStatusColor = (status: string) => {
        const normalized = status.replace('_', ' ');
        switch (normalized) {
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
                        padding: 32px;
                        border: 1px solid #DFE1E6;
                        margin-bottom: 24px;
                        transition: all 0.2s ease;
                        position: relative;
                    }
                    .goal-card:hover { border-color: #0052CC; box-shadow: 0 4px 12px rgba(9, 30, 66, 0.08); }
                    .priority-badge { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: inline-block; }
                    .sub-item-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F4F5F7; }
                    .sub-item-row:last-child { border-bottom: none; }
                    .progress-bar-container { height: 8px; background: #EBECF0; border-radius: 10px; overflow: hidden; flex: 1; }
                    .progress-bar { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
                    .filter-dropdown { padding: 8px 12px; border-radius: 6px; border: 1px solid #DFE1E6; background: white; font-size: 13px; font-weight: 500; color: #42526E; cursor: pointer; display: flex; align-items: center; gap: 8px; outline: none; }
                    .filter-dropdown:hover { background: #F4F5F7; }
                    .stats-card {
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        border: 1px solid #DFE1E6;
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        position: relative;
                    }
                    .stats-card.active-blue { border-left: 4px solid #0052CC; background: linear-gradient(to right, #F8FAFC, white); }
                    .stats-card.active-green { border-left: 4px solid #36B37E; }
                    .stats-card.active-yellow { border-left: 4px solid #FFAB00; }
                    .stats-card.active-red { border-left: 4px solid #FF5630; }
                    
                    /* Modal & Form Styles */
                    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(9, 30, 66, 0.54); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); transition: all 0.3s ease; }
                    .modal-content { background: white; border-radius: 16px; width: 100%; max-width: 560px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: modalFadeIn 0.3s ease-out; position: relative; }
                    @keyframes modalFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    
                    .form-group { margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
                    .form-label { font-size: 11px; font-weight: 700; color: #6B778C; text-transform: uppercase; letter-spacing: 0.05em; }
                    .form-input, .form-select, .form-textarea { 
                        padding: 12px 16px; 
                        border-radius: 8px; 
                        border: 1px solid #DFE1E6; 
                        font-size: 14px; 
                        color: #172B4D; 
                        background: #F8FAFC;
                        transition: all 0.2s ease;
                        outline: none;
                        font-family: inherit;
                    }
                    .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #0052CC; background: white; box-shadow: 0 0 0 2px rgba(0, 82, 204, 0.2); }
                    
                    .custom-range {
                        -webkit-appearance: none;
                        width: 100%;
                        height: 6px;
                        background: #EBECF0;
                        border-radius: 5px;
                        outline: none;
                        margin: 15px 0;
                    }
                    .custom-range::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        background: #0052CC;
                        border-radius: 50%;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        transition: transform 0.1s ease;
                    }
                    .custom-range::-webkit-slider-thumb:hover { transform: scale(1.1); }
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
                        <div className="stats-card active-blue">
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Goals</span>
                            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172B4D' }}>{stats.total}</span>
                        </div>
                        <div className="stats-card active-green">
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>On Track</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={24} color="#36B37E" />
                                <span style={{ fontSize: '28px', fontWeight: 700, color: '#172B4D' }}>{stats.onTrack}</span>
                            </div>
                        </div>
                        <div className="stats-card active-yellow">
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>At Risk</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={24} color="#FFAB00" />
                                <span style={{ fontSize: '28px', fontWeight: 700, color: '#172B4D' }}>{stats.atRisk}</span>
                            </div>
                        </div>
                        <div className="stats-card active-red">
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Off Track</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={24} color="#FF5630" />
                                <span style={{ fontSize: '28px', fontWeight: 700, color: '#172B4D' }}>{stats.offTrack}</span>
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
                                style={{ width: '100%', padding: '10px 40px', borderRadius: '8px', border: '1px solid #DFE1E6', outline: 'none', background: '#F8FAFC' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select className="filter-dropdown" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="ALL">Statuses</option>
                                <option value="ON TRACK">On Track</option>
                                <option value="AT RISK">At Risk</option>
                                <option value="OFF TRACK">Off Track</option>
                            </select>
                            <select className="filter-dropdown">
                                <option value="">Owners</option>
                            </select>
                            <select className="filter-dropdown">
                                <option value="">Year</option>
                            </select>
                            <select className="filter-dropdown">
                                <option value="">Q1</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                            <div>Loading...</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {filteredGoals.map((goal) => {
                                // Map real keyResults to the sub-items view
                                const displayItems = goal.keyResults?.length ? goal.keyResults.map((kr: any) => ({
                                    title: kr.title,
                                    owner: goal.owner.name || 'Owner',
                                    progress: Math.round(((kr.currentValue - kr.initialValue) / (kr.targetValue - kr.initialValue)) * 100) || 0,
                                    status: kr.currentValue >= kr.targetValue ? 'Done' : 'In Progress'
                                })) : [
                                    { title: 'Launch new premium plan', owner: 'Sarah K', progress: 80, status: 'In Progress' },
                                    { title: 'Reach $50k MRR', owner: 'Alex M', progress: 55, status: 'In Progress' }
                                ];

                                return (
                                    <div key={goal.id} className="goal-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>{goal.title}</h3>
                                                    {goal.description && <span style={{ fontSize: '14px', color: '#6B778C', fontWeight: 400 }}>({goal.description})</span>}
                                                </div>
                                                <span className="priority-badge" style={{
                                                    background: goal.priority === 'HIGH' || !goal.priority ? '#FFEBE6' : '#E9F2FF',
                                                    color: goal.priority === 'HIGH' || !goal.priority ? '#BF2600' : '#0052CC',
                                                    marginTop: '8px'
                                                }}>
                                                    + {goal.priority || 'HIGH'} PRIORITY
                                                </span>
                                            </div>
                                            <div style={{ color: '#6B778C', fontSize: '13px', fontWeight: 500 }}>
                                                Due: <span style={{ color: '#172B4D' }}>{goal.targetDate ? format(new Date(goal.targetDate), 'MMM d, yyyy') : 'No date'}</span>
                                                {goal.targetDate && <span style={{ color: '#6B778C' }}> (in {differenceInDays(new Date(goal.targetDate), new Date())} days)</span>}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{
                                                    width: `${goal.progress}%`,
                                                    background: goal.status === 'ON TRACK' ? 'linear-gradient(90deg, #36B37E 0%, #0052CC 100%)' : (goal.status === 'AT RISK' ? '#FFAB00' : '#FF5630')
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', minWidth: '40px' }}>{goal.progress}%</span>
                                        </div>

                                        <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '16px' }}>
                                            {displayItems.map((item: any, idx: number) => (
                                                <div key={idx} className="sub-item-row">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                        {item.status === 'Done' ? <CheckCircle2 size={16} color="#36B37E" /> : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #DFE1E6' }}></div>}
                                                        <span style={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}>{item.title}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                                                        <span style={{ fontSize: '13px', color: '#6B778C', minWidth: '80px' }}>{item.owner}</span>
                                                        <div className="progress-bar-container" style={{ background: '#EBECF0', height: '6px', maxWidth: '120px' }}>
                                                            <div className="progress-bar" style={{ width: `${item.progress}%`, background: item.progress > 80 ? '#36B37E' : '#FFAB00', height: '100%' }} />
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#6B778C', minWidth: '30px' }}>{item.progress}%</span>
                                                        {item.status === 'Done' && <span style={{ fontSize: '10px', background: '#E3FCEF', color: '#006644', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>DONE</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Team Overlap Avatars */}
                                        <div style={{ position: 'absolute', right: '32px', top: '40px', display: 'flex' }}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} style={{
                                                    width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, marginLeft: i > 1 ? '-10px' : 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer'
                                                }}>
                                                    {i === 1 ? (goal.owner.name?.[0] || 'U') : String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Edit/Delete Actions overlay on hover or discrete icons */}
                                        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditGoal(goal)} style={{ padding: '6px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '4px', cursor: 'pointer', color: '#6B778C' }}><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '6px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '4px', cursor: 'pointer', color: '#6B778C' }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{editingGoal ? 'Edit Strategic Goal' : 'Create New Strategic Goal'}</h2>
                                    <p style={{ fontSize: '14px', color: '#6B778C', marginTop: '4px' }}>Define outcomes and track progress</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: '#F4F5F7', border: 'none', cursor: 'pointer', color: '#6B778C', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Goal Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Increase Market Share by 15%"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        style={{ minHeight: '80px', resize: 'none' }}
                                        placeholder="Detailed explanation of the objective..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Current Status</label>
                                        <select
                                            className="form-select"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="ON TRACK">On Track</option>
                                            <option value="AT RISK">At Risk</option>
                                            <option value="OFF TRACK">Off Track</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Target Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.targetDate}
                                            onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="form-label">Progress Percentage</label>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0052CC' }}>{formData.progress}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        className="custom-range"
                                        value={formData.progress}
                                        onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #DFE1E6', background: 'white', borderRadius: '8px', fontWeight: 600, color: '#42526E', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', height: 'auto', padding: '12px' }}>
                                        {editingGoal ? 'Update Objective' : 'Create Objective'}
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

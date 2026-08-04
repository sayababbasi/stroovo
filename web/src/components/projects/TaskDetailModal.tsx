"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, AlertTriangle, Paperclip, MessageSquare, MoreHorizontal, User, Tag, Plus, Calendar, GitMerge } from 'lucide-react';
import { format } from 'date-fns';
import { ProjectTask } from './TaskBoard';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function TaskDetailModal({ 
    task, 
    onClose,
    onTaskUpdated
}: { 
    task: ProjectTask, 
    onClose: () => void,
    onTaskUpdated: (task: ProjectTask) => void
}) {
    const [activeTab, setActiveTab] = useState('Overview');
    const [subtasks, setSubtasks] = useState<any[]>(task.subTasks || []);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingSubtasks, setLoadingSubtasks] = useState(false);
    
    // Add subtask
    const handleAddSubtask = async () => {
        const title = window.prompt("Enter subtask title:");
        if (!title) return;
        
        try {
            setLoadingSubtasks(true);
            const res = await axios.post(`/api/tasks/${task.id}/subtasks`, { title });
            setSubtasks([...subtasks, res.data]);
            toast.success("Subtask added");
            onTaskUpdated({ ...task, subTasks: [...subtasks, res.data] });
        } catch (error) {
            toast.error("Failed to add subtask");
        } finally {
            setLoadingSubtasks(false);
        }
    };

    const statusColors: any = {
        TODO: { bg: '#E6EFFF', text: '#0052CC' },
        IN_PROGRESS: { bg: '#FEF3C7', text: '#F59E0B' },
        REVIEW: { bg: '#F3E8FF', text: '#8B5CF6' },
        DONE: { bg: '#D1FAE5', text: '#10B981' }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.54)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div style={{ background: 'white', width: 900, height: '85vh', borderRadius: 12, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <div style={{ 
                                padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                                background: statusColors[task.status]?.bg || '#F4F5F7',
                                color: statusColors[task.status]?.text || '#42526E'
                            }}>
                                {task.status.replace('_', ' ')}
                            </div>
                            <span style={{ fontSize: 12, color: '#6B778C', fontWeight: 600 }}>ID: {task.id.slice(0, 8)}</span>
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D', margin: 0 }}>{task.title}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn-secondary" style={{ padding: '0 8px' }}><MoreHorizontal size={16} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }} onClick={onClose}><X size={24} /></button>
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Main Content */}
                    <div style={{ flex: 1, borderRight: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column' }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 24, padding: '0 24px', borderBottom: '1px solid #DFE1E6' }}>
                            {['Overview', 'Subtasks', 'Comments', 'Files'].map(t => (
                                <div key={t} 
                                    style={{ 
                                        padding: '16px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                        color: activeTab === t ? '#0052CC' : '#6B778C',
                                        borderBottom: `2px solid ${activeTab === t ? '#0052CC' : 'transparent'}`
                                    }}
                                    onClick={() => setActiveTab(t)}
                                >
                                    {t} {t === 'Subtasks' && subtasks.length > 0 && <span style={{ background: '#DFE1E6', padding: '2px 8px', borderRadius: 12, fontSize: 11, marginLeft: 6, color: '#172B4D' }}>{subtasks.length}</span>}
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
                            {activeTab === 'Overview' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div>
                                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', marginBottom: 12 }}>Description</h3>
                                        <p style={{ fontSize: 14, color: '#42526E', lineHeight: 1.6, margin: 0 }}>
                                            {task.description || "No description provided."}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div className="p-panel" style={{ flex: 1, padding: 16 }}>
                                            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#6B778C', margin: '0 0 12px 0' }}>Assignee</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#172B4D' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {task.assignee ? <img src={task.assignee.image || `https://ui-avatars.com/api/?name=${task.assignee.name}`} style={{ width: 32, height: 32, borderRadius: '50%' }} alt=""/> : <User size={16} />}
                                                </div>
                                                {task.assignee ? task.assignee.name : 'Unassigned'}
                                            </div>
                                        </div>
                                        <div className="p-panel" style={{ flex: 1, padding: 16 }}>
                                            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#6B778C', margin: '0 0 12px 0' }}>Due Date</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#172B4D' }}>
                                                <Calendar size={18} color="#8A94A6" />
                                                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Subtasks' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Subtasks</h3>
                                        <button className="btn-secondary" style={{ height: 28, fontSize: 12 }} onClick={handleAddSubtask} disabled={loadingSubtasks}>
                                            <Plus size={14} /> Add Subtask
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {subtasks.length === 0 ? (
                                            <div style={{ padding: 32, textAlign: 'center', color: '#8A94A6', fontSize: 13, background: '#F4F5F7', borderRadius: 8 }}>
                                                No subtasks yet.
                                            </div>
                                        ) : (
                                            subtasks.map((st, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid #DFE1E6', borderRadius: 8 }}>
                                                    <input type="checkbox" checked={st.isCompleted} onChange={() => {}} style={{ width: 16, height: 16 }} />
                                                    <span style={{ fontSize: 14, color: '#172B4D', flex: 1, textDecoration: st.isCompleted ? 'line-through' : 'none' }}>{st.title}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'Comments' && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8A94A6', fontSize: 13 }}>
                                    Comments UI - Coming Soon
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ width: 300, background: '#FAFBFC', padding: 24, overflowY: 'auto' }}>
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#6B778C', margin: '0 0 16px 0', textTransform: 'uppercase' }}>Details</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ width: 100, color: '#6B778C', fontWeight: 600 }}>Priority</span>
                                <span style={{ fontWeight: 600, color: '#172B4D' }}>{task.priority}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ width: 100, color: '#6B778C', fontWeight: 600 }}>Type</span>
                                <span style={{ fontWeight: 600, color: '#172B4D' }}>{task.type}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ width: 100, color: '#6B778C', fontWeight: 600 }}>Tags</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {task.tags?.map((t: string) => (
                                        <span key={t} style={{ background: '#DFE1E6', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#42526E' }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ width: 100, color: '#6B778C', fontWeight: 600 }}>Risk</span>
                                <span style={{ fontWeight: 600, color: task.riskScore > 50 ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {task.riskScore > 50 ? 'High Risk' : 'Low Risk'} ({task.riskScore}%)
                                </span>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #DFE1E6', margin: '24px 0' }} />
                        
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#6B778C', margin: '0 0 16px 0', textTransform: 'uppercase' }}>Dependencies</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {task.dependencies?.length === 0 ? (
                                <span style={{ fontSize: 13, color: '#8A94A6' }}>No dependencies</span>
                            ) : (
                                task.dependencies?.map((dep: any) => (
                                    <div key={dep.id} style={{ fontSize: 13, color: '#172B4D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <GitMerge size={14} color="#8A94A6" /> {dep.title}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

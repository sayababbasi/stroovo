"use client";

import React, { useState } from 'react';
import { 
    X, 
    MessageSquare, 
    Paperclip, 
    CheckSquare,
    ChevronDown,
    Plus,
    Clock,
    User,
    Flag,
    MoreHorizontal
} from 'lucide-react';
import { Task } from '@/types';

interface TaskPanelProps {
    task: Task | null;
    onClose: () => void;
    onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

const TABS = ['Activity', 'Subtasks', 'Files'];

const getAvatarColor = (name?: string | null) => {
    if (!name) return '#DFE1E6';
    const colors = ['#0052CC', '#36B37E', '#FFAB00', '#FF5630', '#00B8D9', '#6554C0'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function TaskPanel({ task, onClose, onUpdateTask }: TaskPanelProps) {
    const [activeTab, setActiveTab] = useState('Subtasks');

    if (!task) return null;

    const progress = task.progress || 0;
    const completedSubtasks = task.subTasks?.filter(st => st.status === 'DONE').length || 0;
    const totalSubtasks = task.subTasks?.length || 0;

    return (
        <>
            {/* Backdrop */}
            <div className="backdrop" onClick={onClose} />
            
            {/* Panel */}
            <div className="task-panel">
                <style jsx>{`
                    .backdrop {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(9, 30, 66, 0.4);
                        z-index: 1000;
                        backdrop-filter: blur(2px);
                        animation: fadeIn 0.2s ease-out;
                    }
                    .task-panel {
                        position: fixed;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        width: 480px;
                        background: #FFFFFF;
                        box-shadow: -4px 0 24px rgba(9, 30, 66, 0.15);
                        z-index: 1001;
                        display: flex;
                        flex-direction: column;
                        animation: slideIn 0.3s cubic-bezier(0.2, 0, 0, 1);
                        overflow: hidden;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }

                    .header-actions {
                        display: flex;
                        justify-content: space-between;
                        padding: 16px 20px;
                        border-bottom: 1px solid #DFE1E6;
                        align-items: center;
                    }
                    
                    .header-left {
                        display: flex;
                        gap: 8px;
                        align-items: center;
                    }

                    .btn-icon {
                        background: transparent;
                        border: none;
                        color: #505F79;
                        padding: 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .btn-icon:hover {
                        background: #EBECF0;
                        color: #172B4D;
                    }

                    .status-dropdown {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        background: #F4F5F7;
                        border: 1px solid #DFE1E6;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #42526E;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .status-dropdown:hover {
                        background: #EBECF0;
                    }

                    .scroll-content {
                        flex: 1;
                        overflow-y: auto;
                        padding: 24px 32px;
                    }

                    .title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #172B4D;
                        margin: 0 0 24px 0;
                        line-height: 1.3;
                    }

                    .properties-grid {
                        display: grid;
                        grid-template-columns: 120px 1fr;
                        gap: 16px;
                        margin-bottom: 32px;
                    }

                    .prop-label {
                        font-size: 13px;
                        font-weight: 600;
                        color: #6B778C;
                        display: flex;
                        align-items: center;
                    }

                    .prop-value {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                        color: #172B4D;
                    }

                    .avatar-small {
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 11px;
                        font-weight: 700;
                        color: white;
                    }

                    .progress-section {
                        margin-bottom: 32px;
                        padding: 20px;
                        background: #F4F5F7;
                        border-radius: 8px;
                        border: 1px solid #DFE1E6;
                    }
                    
                    .progress-header {
                        display: flex;
                        justify-content: space-between;
                        font-size: 13px;
                        font-weight: 600;
                        color: #172B4D;
                        margin-bottom: 12px;
                    }

                    .progress-bar-bg {
                        height: 8px;
                        background: #EBECF0;
                        border-radius: 4px;
                        overflow: hidden;
                    }

                    .progress-bar-fill {
                        height: 100%;
                        background: ${progress === 100 ? '#36B37E' : '#0052CC'};
                        border-radius: 4px;
                        transition: width 0.4s cubic-bezier(0.2, 0, 0, 1);
                    }

                    .tabs-header {
                        display: flex;
                        border-bottom: 2px solid #EBECF0;
                        margin-bottom: 20px;
                        gap: 24px;
                    }

                    .tab-btn {
                        padding: 12px 0;
                        font-size: 14px;
                        font-weight: 600;
                        color: #6B778C;
                        background: none;
                        border: none;
                        cursor: pointer;
                        position: relative;
                        transition: color 0.2s;
                    }

                    .tab-btn.active {
                        color: #0052CC;
                    }

                    .tab-btn.active::after {
                        content: '';
                        position: absolute;
                        bottom: -2px;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background: #0052CC;
                        border-radius: 2px 2px 0 0;
                    }

                    .tab-content {
                        min-height: 200px;
                    }

                    .subtask-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        border: 1px solid #DFE1E6;
                        border-radius: 6px;
                        margin-bottom: 8px;
                        transition: border-color 0.2s, box-shadow 0.2s;
                    }
                    .subtask-item:hover {
                        border-color: #B3BAC5;
                        box-shadow: 0 2px 4px rgba(9, 30, 66, 0.05);
                    }

                    .subtask-checkbox {
                        width: 18px;
                        height: 18px;
                        border-radius: 4px;
                        border: 2px solid #DFE1E6;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .subtask-item.done .subtask-checkbox {
                        background: #0052CC;
                        border-color: #0052CC;
                        color: white;
                    }

                    .subtask-title {
                        font-size: 14px;
                        color: #172B4D;
                        flex: 1;
                    }
                    .subtask-item.done .subtask-title {
                        text-decoration: line-through;
                        color: #8993A4;
                    }

                    .add-btn {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 10px 16px;
                        background: transparent;
                        border: 1px dashed #B3BAC5;
                        color: #505F79;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        justify-content: center;
                        transition: all 0.2s;
                        margin-top: 12px;
                    }
                    .add-btn:hover {
                        background: #F4F5F7;
                        border-color: #0052CC;
                        color: #0052CC;
                    }
                `}</style>
                
                <div className="header-actions">
                    <div className="header-left">
                        <button className="status-dropdown">
                            {task.status.replace('_', ' ')}
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon"><MoreHorizontal size={18} /></button>
                        <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                <div className="scroll-content">
                    <h2 className="title">{task.title}</h2>

                    <div className="properties-grid">
                        <div className="prop-label">Assignee</div>
                        <div className="prop-value">
                            <div 
                                className="avatar-small"
                                style={{ background: getAvatarColor(task.assignee?.name) }}
                            >
                                {task.assignee?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            {task.assignee?.name || 'Unassigned'}
                        </div>

                        <div className="prop-label">Due Date</div>
                        <div className="prop-value">
                            <Clock size={16} color="#6B778C" />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                        </div>

                        <div className="prop-label">Priority</div>
                        <div className="prop-value">
                            <Flag size={16} color="#6B778C" />
                            {task.priority || 'Normal'}
                        </div>
                    </div>

                    <div className="progress-section">
                        <div className="progress-header">
                            <span>Completion Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                        {totalSubtasks > 0 && (
                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#6B778C' }}>
                                <CheckSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                {completedSubtasks} of {totalSubtasks} subtasks completed
                            </div>
                        )}
                    </div>

                    <div className="tabs-header">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="tab-content">
                        {activeTab === 'Subtasks' && (
                            <div>
                                {task.subTasks?.map((subtask: any) => (
                                    <div key={subtask.id} className={`subtask-item ${subtask.status === 'DONE' ? 'done' : ''}`}>
                                        <div className="subtask-checkbox">
                                            {subtask.status === 'DONE' && <CheckCircle2 size={14} color="#FFF" />}
                                        </div>
                                        <span className="subtask-title">{subtask.title}</span>
                                        <div className="avatar-small" style={{ background: getAvatarColor(subtask.assignee?.name) }}>
                                            {subtask.assignee?.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    </div>
                                ))}
                                {(!task.subTasks || task.subTasks.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#8993A4', fontSize: '14px' }}>
                                        No subtasks yet. Break down this task into smaller steps.
                                    </div>
                                )}
                                <button className="add-btn">
                                    <Plus size={16} /> Add Subtask
                                </button>
                            </div>
                        )}
                        
                        {activeTab === 'Activity' && (
                            <div>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                    <div className="avatar-small" style={{ background: '#0052CC' }}>ME</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ padding: '12px', border: '1px solid #DFE1E6', borderRadius: '8px', marginBottom: '8px' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Add a comment..." 
                                                style={{ border: 'none', width: '100%', outline: 'none', fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {task.comments?.map((comment: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                        <div className="avatar-small" style={{ background: getAvatarColor(comment.user?.name) }}>
                                            {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 600, color: '#172B4D', marginRight: '8px' }}>{comment.user?.name || 'User'}</span>
                                                <span style={{ color: '#8993A4' }}>Just now</span>
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#172B4D' }}>
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Files' && (
                            <div>
                                <div style={{ 
                                    padding: '32px', 
                                    border: '2px dashed #DFE1E6', 
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    background: '#FAFBFC'
                                }}>
                                    <Paperclip size={24} color="#8993A4" style={{ marginBottom: '12px' }} />
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#42526E', marginBottom: '4px' }}>
                                        Drag & drop files to attach
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#8993A4' }}>
                                        or click to browse
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

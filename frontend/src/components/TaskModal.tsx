"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, Flag } from 'lucide-react';

// Local task interface for the modal
interface TaskFormData {
    id?: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    description?: string;
    projectId?: string;
}

interface Project {
    id: string;
    name: string;
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: TaskFormData) => Promise<void>;
    task?: TaskFormData | null; // If null, it's create mode
    projects?: Project[];
}

export default function TaskModal({ isOpen, onClose, onSave, task, projects = [] }: TaskModalProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: null,
        description: '',
        projectId: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            // Handle task data when editing - extract projectId from project if needed
            const taskWithProject = task as { project?: { id?: string } } & typeof task;
            setFormData({
                id: task.id,
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
                description: task.description || '',
                projectId: task.projectId || taskWithProject.project?.id || ''
            });
        } else {
            setFormData({
                title: '',
                status: 'TODO',
                priority: 'MEDIUM',
                dueDate: null,
                description: '',
                projectId: projects.length > 0 ? projects[0].id : ''
            });
        }
    }, [task, isOpen]);

    // Set default project when projects load and no project is selected
    useEffect(() => {
        if (projects.length > 0 && !formData.projectId) {
            setFormData(prev => ({ ...prev, projectId: projects[0].id }));
        }
    }, [projects]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save task', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(9, 30, 66, 0.54)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '8px',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }}>
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #EBECF0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#172B4D', margin: 0 }}>
                            {task ? 'Edit Task' : 'Create Task'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Title */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                Summary
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="What needs to be done?"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #DFE1E6',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    color: '#172B4D'
                                }}
                                required
                            />
                        </div>

                        {/* Project */}
                        {projects.length > 0 && (
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                    Project <span style={{ color: '#FF5630' }}>*</span>
                                </label>
                                <select
                                    value={formData.projectId || ''}
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #DFE1E6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#172B4D'
                                    }}
                                    required
                                >
                                    <option value="" disabled>Select a project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Row 1: Status & Priority */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #DFE1E6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#172B4D'
                                    }}
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="REVIEW">Review</option>
                                    <option value="DONE">Done</option>
                                    <option value="BACKLOG">Backlog</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                    Priority
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #DFE1E6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#172B4D'
                                    }}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add more details..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #DFE1E6',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Due Date */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate || ''}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #DFE1E6',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#172B4D'
                                }}
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '16px 24px',
                        background: '#F4F5F7',
                        borderTop: '1px solid #EBECF0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        borderRadius: '0 0 8px 8px'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#42526E',
                                fontSize: '14px',
                                fontWeight: 500
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: '#0052CC',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Saving...' : (task ? 'Save Changes' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

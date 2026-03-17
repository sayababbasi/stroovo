"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FolderKanban, Clock } from 'lucide-react';
import { Project } from '@/types';

interface ProjectFormData {
    id?: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string | null;
    managerId: string;
    isStarred: boolean;
}

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: ProjectFormData) => Promise<void>;
    project?: Project | null;
    users?: User[];
}

export default function ProjectModal({ isOpen, onClose, onSave, project, users = [] }: ProjectModalProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        status: 'PLANNING',
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        managerId: '',
        isStarred: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                id: project.id,
                name: project.name,
                description: project.description || '',
                status: project.status,
                startDate: new Date(project.startDate).toISOString().split('T')[0],
                endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : null,
                managerId: project.managerId || project.manager?.id || '',
                isStarred: project.isStarred || false
            });
        } else {
            setFormData({
                name: '',
                description: '',
                status: 'PLANNING',
                startDate: new Date().toISOString().split('T')[0],
                endDate: null,
                managerId: users.length > 0 ? users[0].id : '',
                isStarred: false
            });
        }
    }, [project, isOpen, users]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            window.dispatchEvent(new Event('projectsUpdated'));
            onClose();
        } catch (error) {
            console.error('Failed to save project', error);
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
                            {project ? 'Edit Project' : 'Create Project'}
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
                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                Project Name <span style={{ color: '#FF5630' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FolderKanban size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter project name"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 36px',
                                        border: '1px solid #DFE1E6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        color: '#172B4D'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Manager */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                Project Owner <span style={{ color: '#FF5630' }}>*</span>
                            </label>
                            <select
                                value={formData.managerId}
                                onChange={e => setFormData({ ...formData, managerId: e.target.value })}
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
                                <option value="" disabled>Select an owner</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
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
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What is this project about?"
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

                        {/* Dates */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
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
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '8px' }}>
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate || ''}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value || null })}
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

                        {/* Star Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, isStarred: !formData.isStarred })}>
                            <div style={{
                                width: '36px',
                                height: '20px',
                                background: formData.isStarred ? '#36B37E' : '#DFE1E6',
                                borderRadius: '10px',
                                position: 'relative',
                                transition: 'background 0.2s'
                            }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: formData.isStarred ? '18px' : '2px',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }}></div>
                            </div>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#42526E', cursor: 'pointer' }}>
                                Star this project (Priority)
                            </label>
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
                            {loading ? 'Saving...' : (project ? 'Save Changes' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

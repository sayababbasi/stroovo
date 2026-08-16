"use client";

import React, { useState } from 'react';
import { Save, AlertTriangle, Trash2, Settings, Users, Bell, Zap, Link as LinkIcon, Shield, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ProjectSettingsTab({ project, onProjectUpdated }: { project: any, onProjectUpdated: () => void }) {
    const [name, setName] = useState(project?.name || '');
    const [desc, setDesc] = useState(project?.description || '');
    const [status, setStatus] = useState(project?.status || 'ACTIVE');
    const [saving, setSaving] = useState(false);
    
    // Simulate active tab state
    const [activeSection, setActiveSection] = useState('General');

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch(`/api/projects/${project.id}`, {
                name,
                description: desc,
                status
            });
            toast.success("Settings saved successfully");
            onProjectUpdated();
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you ABSOLUTELY sure you want to delete this project? This cannot be undone.")) {
            toast.success("Project deletion simulated for demo.");
        }
    };

    const sidebarItems = [
        { label: 'General', icon: Settings },
        { label: 'Team & Access', icon: Users },
        { label: 'Workflow', icon: Zap },
        { label: 'Notifications', icon: Bell },
        { label: 'Integrations', icon: LinkIcon },
        { label: 'Advanced', icon: Shield },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', gap: 40, height: '100%', alignItems: 'flex-start', padding: '16px 24px 48px', maxWidth: 1200, margin: '0 auto' }}>
            
            {/* Sidebar Navigation */}
            <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, position: 'sticky', top: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#8A94A6', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 12 }}>Project Settings</div>
                {sidebarItems.map(m => {
                    const isActive = activeSection === m.label;
                    return (
                        <div 
                            key={m.label} 
                            onClick={() => setActiveSection(m.label)}
                            style={{ 
                                padding: '10px 14px', 
                                borderRadius: 8, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 12, 
                                cursor: 'pointer', 
                                background: isActive ? '#E6EFFF' : 'transparent', 
                                color: isActive ? '#0052CC' : '#42526E', 
                                fontWeight: isActive ? 700 : 500, 
                                fontSize: 14, 
                                transition: 'all 0.2s',
                                position: 'relative'
                            }} 
                            className="hover:bg-gray-100"
                        >
                            {isActive && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 4, background: '#0052CC', borderRadius: '0 4px 4px 0' }} />}
                            <m.icon size={18} style={{ color: isActive ? '#0052CC' : '#6B778C' }} />
                            {m.label}
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40 }}>
                
                {activeSection === 'General' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {/* Header */}
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>General Settings</h2>
                            <p style={{ fontSize: 14, color: '#5E6C84', margin: 0, lineHeight: 1.5 }}>
                                Update your project's core details. These changes will be visible to everyone on the team.
                            </p>
                        </div>

                        {/* Form Card */}
                        <div style={{ 
                            background: '#FFFFFF', 
                            border: '1px solid #DFE1E6', 
                            borderRadius: 12, 
                            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.05)',
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}>
                            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Project Name</label>
                                    <input 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="e.g. Q4 Marketing Campaign"
                                        style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #DFE1E6', 
                                            borderRadius: 8, 
                                            fontSize: 14, 
                                            fontWeight: 500, 
                                            color: '#172B4D', 
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            boxShadow: 'inset 0 1px 2px rgba(9,30,66,0.03)'
                                        }} 
                                        className="focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                                    />
                                    <div style={{ fontSize: 12, color: '#8A94A6' }}>The human-readable name of your project.</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Description</label>
                                    <textarea 
                                        value={desc} 
                                        onChange={e => setDesc(e.target.value)} 
                                        rows={4} 
                                        placeholder="Briefly describe the goals of this project..."
                                        style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #DFE1E6', 
                                            borderRadius: 8, 
                                            fontSize: 14, 
                                            color: '#172B4D', 
                                            outline: 'none', 
                                            resize: 'vertical',
                                            transition: 'all 0.2s',
                                            boxShadow: 'inset 0 1px 2px rgba(9,30,66,0.03)'
                                        }} 
                                        className="focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Project Status</label>
                                    <select 
                                        value={status} 
                                        onChange={e => setStatus(e.target.value)} 
                                        style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #DFE1E6', 
                                            borderRadius: 8, 
                                            fontSize: 14, 
                                            fontWeight: 500, 
                                            color: '#172B4D', 
                                            outline: 'none', 
                                            background: '#FFFFFF',
                                            cursor: 'pointer',
                                            boxShadow: 'inset 0 1px 2px rgba(9,30,66,0.03)'
                                        }} 
                                        className="focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="ACTIVE">Active (In Progress)</option>
                                        <option value="PLANNING">Planning</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="ON_HOLD">On Hold</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Card Footer for Save Action */}
                            <div style={{ 
                                padding: '16px 32px', 
                                background: '#F8F9FA', 
                                borderTop: '1px solid #DFE1E6', 
                                borderRadius: '0 0 12px 12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: 13, color: '#6B778C' }}>Ensure you save your changes before leaving this tab.</span>
                                <button 
                                    className="btn-primary" 
                                    onClick={handleSave} 
                                    disabled={saving}
                                    style={{ padding: '0 24px', height: 40, borderRadius: 8, fontWeight: 600, fontSize: 14, opacity: saving ? 0.7 : 1 }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#BF2600', margin: 0, letterSpacing: '-0.01em' }}>Danger Zone</h3>
                            <div style={{ 
                                border: '1px solid #FFC9C9', 
                                background: '#FFFDFD', 
                                borderRadius: 12,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                padding: 24,
                                boxShadow: '0 1px 3px rgba(191, 38, 0, 0.05)'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '70%' }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#172B4D' }}>Delete this project</div>
                                    <p style={{ fontSize: 14, color: '#5E6C84', margin: 0, lineHeight: 1.5 }}>
                                        Once you delete a project, there is no going back. Please be certain.
                                    </p>
                                </div>
                                <button 
                                    style={{ 
                                        background: '#FFFFFF', 
                                        color: '#DE350B', 
                                        border: '1px solid #DE350B', 
                                        borderRadius: 8, 
                                        padding: '0 20px', 
                                        height: 40, 
                                        fontSize: 14, 
                                        fontWeight: 600, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 8, 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }} 
                                    onClick={handleDelete} 
                                    className="hover:bg-red-50"
                                >
                                    Delete Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Fallback for other sections */}
                {activeSection !== 'General' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: '#8A94A6' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#172B4D', margin: '0 0 8px 0' }}>{activeSection}</h3>
                        <p style={{ fontSize: 14 }}>This section is currently under construction.</p>
                    </div>
                )}

            </div>
        </div>
    );
}

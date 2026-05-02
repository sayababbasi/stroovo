"use client";

import React, { useState } from 'react';
import { 
    X, Mail, Phone, MapPin, 
    Calendar, Shield, Key, Trash2, 
    Activity, History, UserCog, TrendingUp,
    CheckCircle, AlertCircle, ExternalLink,
    Briefcase, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    title: string | null;
    contact: string | null;
    image: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    _count: {
        tasks: number;
        managedProjects: number;
    };
    department?: string | null;
    designation?: string | null;
    experienceLevel?: string | null;
    location?: string | null;
    phone?: string | null;
    skills?: string[];
    performanceScore?: number;
    workloadStatus?: 'Low' | 'Medium' | 'High' | null;
    managerId?: string | null;
}

interface UserDetailDrawerProps {
    user: User | null;
    onClose: () => void;
    onStatusToggle: (id: string, current: boolean) => void;
    onResetPassword: (id: string) => void;
    onDelete: (id: string) => void;
}

type TabType = 'overview' | 'performance' | 'activity' | 'permissions' | 'security';

export default function UserDetailDrawer({ 
    user, 
    onClose,
    onStatusToggle,
    onResetPassword,
    onDelete
}: UserDetailDrawerProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    if (!user) return null;

    const tabs: { id: TabType, label: string, icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <UserCog size={14} /> },
        { id: 'performance', label: 'Performance', icon: <TrendingUp size={14} /> },
        { id: 'activity', label: 'Activity', icon: <Activity size={14} /> },
        { id: 'permissions', label: 'Permissions', icon: <Shield size={14} /> },
        { id: 'security', label: 'Security', icon: <Key size={14} /> },
    ];

    return (
        <AnimatePresence>
            {user && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.4)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ 
                            position: 'fixed', 
                            right: 0, 
                            top: 0, 
                            bottom: 0, 
                            width: '500px', 
                            background: '#F4F5F7', 
                            zIndex: 1001, 
                            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'white', padding: '24px', borderBottom: '1px solid #EBECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: 0 }}>Employee Profile</h3>
                                <p style={{ fontSize: '12px', color: '#6B778C', margin: '4px 0 0' }}>ID: {user.id}</p>
                            </div>
                            <button 
                                onClick={onClose}
                                style={{ padding: '8px', borderRadius: '50%', border: 'none', background: '#F4F5F7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={20} color="#42526E" />
                            </button>
                        </div>

                        {/* Profile Summary Card */}
                        <div style={{ padding: '24px 24px 0' }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #EBECF0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', gap: '20px' }}>
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '20px', 
                                    background: user.isActive ? '#0052CC' : '#6B778C', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '32px',
                                    fontWeight: 800,
                                    boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)'
                                }}>
                                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>{user.name || 'Anonymous'}</h4>
                                            <p style={{ fontSize: '14px', color: '#6B778C', margin: 0 }}>{user.designation || 'Team Specialist'}</p>
                                        </div>
                                        <div style={{ padding: '4px 12px', borderRadius: '20px', background: user.isActive ? '#E3FCEF' : '#FFEBE6', color: user.isActive ? '#36B37E' : '#FF5630', fontSize: '12px', fontWeight: 800 }}>
                                            {user.isActive ? 'ACTIVE' : 'SUSPENDED'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#42526E' }}>
                                            <Briefcase size={14} color="#6B778C" />
                                            {user.department || 'Operations'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#42526E' }}>
                                            <MapPin size={14} color="#6B778C" />
                                            {user.location || 'Remote'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div style={{ padding: '24px 24px 0', display: 'flex', gap: '4px' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '10px 10px 0 0',
                                        border: 'none',
                                        background: activeTab === tab.id ? 'white' : 'transparent',
                                        color: activeTab === tab.id ? '#0052CC' : '#6B778C',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: activeTab === tab.id ? '0 -4px 12px rgba(0,0,0,0.03)' : 'none'
                                    }}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Area */}
                        <div style={{ flex: 1, background: 'white', overflowY: 'auto', padding: '24px' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'overview' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <section>
                                                <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Contact Information</h5>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                    <div style={{ padding: '12px', background: '#F4F5F7', borderRadius: '10px' }}>
                                                        <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Email Address</div>
                                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Mail size={12} /> {user.email}
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: '12px', background: '#F4F5F7', borderRadius: '10px' }}>
                                                        <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Phone Number</div>
                                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Phone size={12} /> {user.phone || '+1 234 567 890'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section>
                                                <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Employment Details</h5>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                    <div style={{ padding: '12px', background: '#F4F5F7', borderRadius: '10px' }}>
                                                        <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Reporting Manager</div>
                                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Sarah Chen (VP Eng)</div>
                                                    </div>
                                                    <div style={{ padding: '12px', background: '#F4F5F7', borderRadius: '10px' }}>
                                                        <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Join Date</div>
                                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section>
                                                <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Skills & Expertise</h5>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {(user.skills || ['React', 'Next.js', 'Typescript', 'Node.js', 'System Architecture']).map(skill => (
                                                        <span key={skill} style={{ padding: '6px 12px', borderRadius: '8px', background: '#EAE6FF', color: '#403294', fontSize: '12px', fontWeight: 700 }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </section>
                                        </div>
                                    )}

                                    {activeTab === 'performance' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ padding: '20px', background: '#E3FCEF', borderRadius: '16px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#006644', textTransform: 'uppercase', marginBottom: '8px' }}>Efficiency</div>
                                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#006644' }}>{user.performanceScore || 94}%</div>
                                                </div>
                                                <div style={{ padding: '20px', background: '#DEEBFF', borderRadius: '16px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC', textTransform: 'uppercase', marginBottom: '8px' }}>Tasks Done</div>
                                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#0052CC' }}>{user._count.tasks + 12}</div>
                                                </div>
                                            </div>
                                            
                                            <section>
                                                <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Workload Distribution</h5>
                                                <div style={{ height: '200px', background: '#F4F5F7', borderRadius: '16px', display: 'flex', alignItems: 'flex-end', padding: '20px', gap: '12px', justifyContent: 'space-around' }}>
                                                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                        <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 80 ? '#FF5630' : '#0052CC', borderRadius: '4px', opacity: 0.8 }} />
                                                    ))}
                                                </div>
                                                <p style={{ fontSize: '12px', color: '#6B778C', textAlign: 'center', marginTop: '12px' }}>Weekly task completion vs capacity</p>
                                            </section>
                                        </div>
                                    )}

                                    {activeTab === 'security' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <button 
                                                onClick={() => onResetPassword(user.id)}
                                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#DEEBFF', border: 'none', color: '#0052CC', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}
                                            >
                                                <Key size={18} /> Reset Password
                                            </button>
                                            <button 
                                                onClick={() => onStatusToggle(user.id, user.isActive)}
                                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: user.isActive ? '#FFEBE6' : '#E3FCEF', border: 'none', color: user.isActive ? '#FF5630' : '#36B37E', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}
                                            >
                                                {user.isActive ? <X size={18} /> : <CheckCircle size={18} />}
                                                {user.isActive ? 'Suspend Account' : 'Activate Account'}
                                            </button>
                                            <div style={{ height: '1px', background: '#EBECF0', margin: '12px 0' }} />
                                            <button 
                                                onClick={() => onDelete(user.id)}
                                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#FF5630', border: 'none', color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} /> Delete Employee Record
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

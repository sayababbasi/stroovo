"use client";

import React from 'react';
import { 
    MoreHorizontal, Mail, MapPin, 
    Briefcase, Activity, Target,
    Shield, Clock, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    performanceScore?: number;
    workloadStatus?: 'Low' | 'Medium' | 'High' | null;
    skills?: string[];
}

interface UserCardProps {
    user: User;
    onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
    const workloadColor = {
        Low: '#36B37E',
        Medium: '#FFAB00',
        High: '#FF5630'
    }[user.workloadStatus || 'Low'];

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #EBECF0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Workload Indicator Line */}
            <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px', 
                background: workloadColor 
            }} />

            {/* Header: Avatar + Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '18px', 
                        background: user.isActive ? '#0052CC' : '#6B778C', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 800,
                        boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)'
                    }}>
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '-4px', 
                        right: '-4px', 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        background: user.isActive ? '#36B37E' : '#FF5630',
                        border: '3px solid white'
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        background: '#F4F5F7', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        color: '#6B778C',
                        textTransform: 'uppercase'
                    }}>
                        {user.experienceLevel || 'Mid-Level'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFAB00' }}>
                        <Star size={14} fill="#FFAB00" />
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>{user.performanceScore || 85}%</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>{user.name || 'Anonymous'}</h4>
                <p style={{ fontSize: '13px', color: '#6B778C', margin: '0 0 12px' }}>{user.designation || 'Specialist'}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#42526E' }}>
                        <Briefcase size={14} color="#6B778C" />
                        {user.department || 'General'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#42526E' }}>
                        <MapPin size={14} color="#6B778C" />
                        {user.location || 'Remote'}
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F4F5F7' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Active Tasks</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#172B4D' }}>{user._count.tasks}</span>
                        <div style={{ flex: 1, height: '6px', background: '#EBECF0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${Math.min(user._count.tasks * 10, 100)}%`, 
                                height: '100%', 
                                background: '#0052CC' 
                            }} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Workload</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={14} color={workloadColor} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: workloadColor }}>{user.workloadStatus || 'Medium'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

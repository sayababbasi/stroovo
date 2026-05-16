"use client";

import React from 'react';
import { Users, UserCheck, UserMinus, Shield, ShieldCheck, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: number | string;
    subtext: string;
    icon: React.ReactNode;
    color: string;
    delay: number;
}

const StatCard = ({ title, value, subtext, icon, color, delay }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #EBECF0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: `${color}15`, 
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div style={{ 
                padding: '4px 8px', 
                borderRadius: '6px', 
                background: '#F4F5F7', 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#6B778C' 
            }}>
                LIVE
            </div>
        </div>
        <div>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', margin: 0 }}>{title}</h4>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#172B4D', margin: '4px 0' }}>{value}</div>
            <p style={{ fontSize: '12px', color: '#6B778C', margin: 0 }}>{subtext}</p>
        </div>
    </motion.div>
);

interface UserStatsProps {
    stats: {
        total: number;
        active: number;
        suspended: number;
        admins: number;
        managers: number;
    };
}

export default function UserStats({ stats }: UserStatsProps) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <StatCard 
                title="Total Users" 
                value={stats.total} 
                subtext="Registered users" 
                icon={<Users size={20} />} 
                color="#0052CC" 
                delay={0.1}
            />
            <StatCard 
                title="Active Now" 
                value={stats.active} 
                subtext="Online recently" 
                icon={<UserCheck size={20} />} 
                color="#36B37E" 
                delay={0.2}
            />
            <StatCard 
                title="Suspended" 
                value={stats.suspended} 
                subtext="Blocked users" 
                icon={<UserMinus size={20} />} 
                color="#FF5630" 
                delay={0.3}
            />
            <StatCard 
                title="System Staff" 
                value={stats.admins} 
                subtext="Administrators" 
                icon={<ShieldCheck size={20} />} 
                color="#6554C0" 
                delay={0.4}
            />
            <StatCard 
                title="Managers" 
                value={stats.managers} 
                subtext="Team leaders" 
                icon={<UserCog size={20} />} 
                color="#FFAB00" 
                delay={0.5}
            />
        </div>
    );
}

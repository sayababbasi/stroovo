"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, TrendingUp, TrendingDown, Zap, 
    Target, Shield, Users, Sparkles, 
    AlertTriangle, BarChart3, Clock, ArrowUpRight
} from 'lucide-react';

const KPICard = ({ title, value, trend, icon: Icon, color, insight, prediction }: any) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${
                color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                color === 'rose' ? 'bg-rose-50 text-rose-600' :
                color === 'amber' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
            } group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
                trend > 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
                {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(trend)}%
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-50">
            <div className="flex items-start gap-2">
                <Sparkles size={12} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-gray-500 leading-relaxed italic line-clamp-2">
                    {insight}
                </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                <div className={`w-1.5 h-1.5 rounded-full ${trend > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Signal: {prediction}</span>
            </div>
        </div>

        {/* Decorative background element */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 blur-3xl opacity-10 rounded-full ${
            color === 'indigo' ? 'bg-indigo-500' :
            color === 'emerald' ? 'bg-emerald-500' :
            color === 'rose' ? 'bg-rose-500' :
            'bg-blue-500'
        }`} />
    </motion.div>
);

export const KPISection = ({ role }: { role: string }) => {
    const allKpis = [
        {
            title: 'Organization Health',
            value: '94/100',
            trend: 12,
            icon: Activity,
            color: 'emerald',
            insight: 'Deployment stability and team collaboration have reached a 6-month high.',
            prediction: 'Optimal Growth',
            roles: ['CEO', 'COO', 'CTO']
        },
        {
            title: 'Execution Velocity',
            value: '82.4%',
            trend: 8,
            icon: Zap,
            color: 'indigo',
            insight: 'Sprint completion rate increased significantly after AI workload rebalancing.',
            prediction: 'Accelerating',
            roles: ['COO', 'CTO', 'MANAGER']
        },
        {
            title: 'Revenue Impact',
            value: '$4.2M',
            trend: 5.2,
            icon: BarChart3,
            color: 'emerald',
            insight: 'Enterprise deal velocity increased 14% after automated lead scoring.',
            prediction: 'Bullish',
            roles: ['CEO']
        },
        {
            title: 'Risk Index',
            value: 'Low (14%)',
            trend: -18,
            icon: Shield,
            color: 'blue',
            insight: 'Potential burnout detected in Team Beta; AI suggests minor task redistribution.',
            prediction: 'Stabilized',
            roles: ['COO', 'MANAGER', 'CEO']
        },
        {
            title: 'AI Productivity Gain',
            value: '146.6 hrs',
            trend: 31,
            icon: Sparkles,
            color: 'indigo',
            insight: 'Automated documentation and PR reviews saved equivalent of 2 full-time devs.',
            prediction: 'Increasing',
            roles: ['CTO', 'CEO', 'COO']
        }
    ];

    const filteredKpis = allKpis.filter(kpi => kpi.roles.includes(role.toUpperCase())).slice(0, 4);

    return (
        <section className="grid grid-cols-4 gap-6">
            {filteredKpis.map((kpi, i) => (
                <KPICard key={i} {...kpi} />
            ))}
        </section>
    );
};

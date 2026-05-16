"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Briefcase, Activity, Target, Clock, 
    ArrowUpRight, AlertTriangle, Users, 
    Zap, Brain, ChevronRight, Sparkles,
    ShieldAlert, Box, LayoutGrid
} from 'lucide-react';

const ProjectCard = ({ name, health, progress, probability, risk, team, color }: any) => (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
        <div className="flex items-center justify-between mb-6">
            <div className={`p-2.5 rounded-xl ${
                color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                color === 'rose' ? 'bg-rose-50 text-rose-600' :
                'bg-blue-50 text-blue-600'
            } group-hover:scale-110 transition-transform`}>
                <Box size={18} />
            </div>
            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                health === 'On Track' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                health === 'At Risk' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
                {health}
            </div>
        </div>

        <h3 className="text-[13px] font-black text-gray-900 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{name}</h3>
        <div className="flex items-center gap-2 mb-6">
            <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                        {String.fromCharCode(64 + i)}
                    </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600">
                    +{team}
                </div>
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{team + 3} contributors</span>
        </div>

        <div className="space-y-4 mb-8">
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Execution Progress</span>
                    <span className="text-[11px] font-black text-gray-900">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${color === 'indigo' ? 'bg-indigo-600' : color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
            <div className="p-3 bg-gray-50/50 rounded-2xl">
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Brain size={10} className="text-indigo-500" />
                    Delivery Prob.
                </div>
                <div className="text-sm font-black text-gray-900">{probability}%</div>
            </div>
            <div className="p-3 bg-gray-50/50 rounded-2xl">
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <ShieldAlert size={10} className="text-rose-500" />
                    AI Risk Score
                </div>
                <div className="text-sm font-black text-gray-900">{risk}</div>
            </div>
        </div>

        <button className="w-full mt-6 flex items-center justify-between px-4 py-3 bg-white border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 rounded-2xl transition-all group/btn">
            <span className="text-[10px] font-black text-gray-500 group-hover/btn:text-indigo-600 uppercase tracking-widest">View Deep Audit</span>
            <ChevronRight size={14} className="text-gray-300 group-hover/btn:text-indigo-600 transition-transform group-hover/btn:translate-x-1" />
        </button>
    </div>
);

export const ProjectGrid = ({ role }: { role: string }) => {
    const projects = [
        {
            name: 'Quantum UI System Overhaul',
            health: 'On Track',
            progress: 74,
            probability: 92,
            risk: '0.12',
            team: 12,
            color: 'indigo'
        },
        {
            name: 'Enterprise Data Lake Migration',
            health: 'At Risk',
            progress: 42,
            probability: 68,
            risk: '0.45',
            team: 8,
            color: 'emerald'
        },
        {
            name: 'AI Agent Workforce v2.4',
            health: 'On Track',
            progress: 88,
            probability: 95,
            risk: '0.08',
            team: 15,
            color: 'blue'
        }
    ];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-gray-100 rounded-xl">
                        <LayoutGrid size={18} className="text-gray-400" />
                    </div>
                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Active Project Control</h3>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Projects</button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {projects.map((project, i) => (
                    <ProjectCard key={i} {...project} />
                ))}
            </div>
        </section>
    );
};

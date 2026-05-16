"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Play, Zap, Brain, 
    Target, Briefcase, FileText, BarChart3,
    Clock, Activity, Search, Command,
    ChevronRight, Sparkles, Network, Globe
} from 'lucide-react';

const ActionButton = ({ title, desc, icon: Icon, color }: any) => (
    <button className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group text-left">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
            color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
            'bg-blue-50 text-blue-600'
        } group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-0.5">{title}</div>
            <div className="text-[10px] font-bold text-gray-400 truncate">{desc}</div>
        </div>
        <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
    </button>
);

export const ActionCenter = ({ role }: { role: string }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                        <Zap size={18} className="text-gray-400" />
                    </div>
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Smart Action Center</h3>
                </div>
            </div>

            <div className="space-y-3">
                <ActionButton 
                    title="Launch Project" 
                    desc="Initialize new project with AI setup" 
                    icon={Plus} 
                    color="indigo" 
                />
                <ActionButton 
                    title="Run AI Audit" 
                    desc="Complete strategic org analysis" 
                    icon={Sparkles} 
                    color="indigo" 
                />
                <ActionButton 
                    title="Rebalance Load" 
                    desc="AI-driven task redistribution" 
                    icon={Network} 
                    color="emerald" 
                />
                <ActionButton 
                    title="Generate Report" 
                    desc="Executive operational summary" 
                    icon={FileText} 
                    color="blue" 
                />
            </div>

            <div className="mt-8 p-6 bg-gray-900 rounded-[24px] text-white relative overflow-hidden group cursor-pointer hover:bg-black transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full -mr-8 -mt-8" />
                <div className="flex items-center gap-3 mb-2">
                    <Command size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Command</span>
                </div>
                <div className="text-[13px] font-black mb-1">Press Cmd + K</div>
                <div className="text-[10px] font-bold text-gray-400">To open AI Mission Control</div>
            </div>
        </div>
    );
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Activity, Shield, Target, TrendingUp, 
    Cpu, BrainCircuit, Rocket, ZapOff, CheckCircle2,
    Clock, MousePointer2, Sparkles, ChevronRight
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, {
    headers: {
        'x-tenant-id': 'default-tenant',
        'x-user-id': 'admin@revoticai.com'
    }
}).then(res => res.json());

const SignalCard = ({ title, value, trend, icon: Icon, color }: any) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-all group">
        <div className={`p-2.5 rounded-xl ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'} group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                {trend && (
                    <span className={`text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <h4 className="text-lg font-black text-gray-900">{value}</h4>
                {title.includes('Time') && <span className="text-[10px] font-bold text-gray-400">hrs</span>}
            </div>
            {title === 'AI Learning Status' && (
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Continuously improving</span>
                </div>
            )}
        </div>
    </div>
);

export const AutomationHero = () => {
    const { data: analytics, isLoading } = useSWR('/api/ai/automations/analytics', fetcher);

    const score = analytics?.efficiency?.autonomyScore || 94;
    const timeSaved = analytics?.efficiency?.hoursSaved || 146.6;
    const activeFlows = analytics?.summary?.totalAutomations || 84;
    const totalExec = analytics?.summary?.totalExecutions || 312;
    const failures = analytics?.summary?.failureCount || 3;

    if (isLoading) {
        return <div className="h-[300px] bg-white border border-gray-100 rounded-[40px] animate-pulse mb-8" />;
    }

    return (
        <section className="grid grid-cols-3 gap-6 mb-8">
            {/* SCORE GAUGE */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Operations Score</h3>
                
                <div className="relative mb-6">
                    <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="68"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={427}
                            initial={{ strokeDashoffset: 427 }}
                            animate={{ strokeDashoffset: 427 * (1 - score / 100) }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="text-indigo-600"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black text-gray-900 leading-none"
                        >
                            {Math.round(score)}
                        </motion.span>
                        <span className="text-sm font-bold text-gray-400">/100</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Excellent</div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span>+12 pts</span>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full -mb-24 -mr-24" />
                
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">AI Summary</h3>
                        <Sparkles size={14} className="text-indigo-500" />
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium mb-6">
                        Running <span className="text-gray-900 font-bold">{activeFlows} automations</span>.
                        AI reduced work by <span className="text-indigo-600 font-bold">31%</span> this month while improving consistency by <span className="text-indigo-600 font-bold">18%</span>.
                    </p>
                </div>

                <button className="flex items-center justify-between w-full px-5 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Executive Report</span>
                    <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* SIGNALS GRID */}
            <div className="grid grid-cols-2 gap-3">
                <SignalCard title="Active" value={activeFlows} trend="+16" icon={Target} color="emerald" />
                <SignalCard title="Optimized" value="67" trend="+22" icon={Cpu} color="indigo" />
                <SignalCard title="Failed" value={failures} trend="+7" icon={ZapOff} color="rose" />
                <SignalCard title="Saved" value={timeSaved} trend="+31%" icon={Clock} color="blue" />
                <SignalCard title="Decisions" value={totalExec} trend="+45" icon={BrainCircuit} color="indigo" />
                <SignalCard title="Learning" value="Active" icon={Activity} color="emerald" />
            </div>
        </section>
    );
};

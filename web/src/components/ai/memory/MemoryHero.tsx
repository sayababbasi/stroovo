"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Brain, Sparkles, TrendingUp, Cpu, 
    Target, Clock, Activity, BrainCircuit,
    ChevronRight, Globe, Shield, Database,
    Layers, Network
} from 'lucide-react';

const SignalCard = ({ title, value, trend, icon: Icon, color }: any) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-all group">
        <div className={`p-2.5 rounded-xl ${
            color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
            color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
            color === 'rose' ? 'bg-rose-50 text-rose-600' : 
            color === 'amber' ? 'bg-amber-50 text-amber-600' :
            'bg-blue-50 text-blue-600'
        } group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-0.5">
                        <TrendingUp size={10} />
                        {trend}
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <h4 className="text-lg font-black text-gray-900">{value}</h4>
            </div>
        </div>
    </div>
);

export const MemoryHero = () => {
    return (
        <section className="grid grid-cols-3 gap-6 mb-8">
            {/* INTELLIGENCE SCORE */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Organizational Intelligence Score</h3>
                
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
                            animate={{ strokeDashoffset: 427 * (1 - 93 / 100) }}
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
                            93
                        </motion.span>
                        <span className="text-sm font-bold text-gray-400">/100</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Excellent</div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span>+11 pts vs last 30 days</span>
                    </div>
                </div>
            </div>

            {/* AI MEMORY NARRATIVE */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full -mb-24 -mr-24" />
                
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">AI Memory Overview</h3>
                        <Sparkles size={14} className="text-indigo-500" />
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium mb-6">
                        Stroovo AI has learned <span className="text-gray-900 font-bold">4,281 operational patterns</span> and improved automation accuracy by <span className="text-indigo-600 font-bold">24%</span> this month. Context understanding is continuously improving.
                    </p>
                </div>

                <button className="flex items-center justify-between w-full px-5 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">View Memory Report</span>
                    <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* SIGNALS GRID */}
            <div className="grid grid-cols-2 gap-3">
                <SignalCard title="Active Memories" value="4,281" trend="18%" icon={Database} color="blue" />
                <SignalCard title="Learned Behaviors" value="1,842" trend="21%" icon={BrainCircuit} color="emerald" />
                <SignalCard title="Stored Insights" value="2,735" trend="16%" icon={Sparkles} color="amber" />
                <SignalCard title="AI Context Accuracy" value="91.6%" trend="7.4%" icon={Shield} color="indigo" />
                <SignalCard title="Knowledge Connections" value="12.4K" trend="23%" icon={Network} color="purple" />
                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Health</div>
                    <div className="text-sm font-black text-indigo-900">Optimal</div>
                </div>
            </div>
        </section>
    );
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Sparkles, MessageSquare, 
    ChevronRight, CheckCircle2, Clock,
    TrendingUp, MousePointer2, User,
    ArrowRight, Workflow, Target, Shield,
    Activity, Brain, Network, Database
} from 'lucide-react';

const PatternCard = ({ title, impact, icon: Icon }: any) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-indigo-100 hover:shadow-lg transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Icon size={14} />
            </div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                impact === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
                {impact} Impact
            </span>
        </div>
        <h4 className="text-[11px] font-black text-gray-900 mb-1 leading-tight">{title}</h4>
        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
            View Analysis
        </button>
    </div>
);

const MemoryTimelineItem = ({ title, time, type }: any) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Database size={14} className="text-gray-400" />
            </div>
            <div>
                <div className="text-[11px] font-black text-gray-900">{title}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{time}</div>
            </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
            type === 'Operational' ? 'bg-rose-50 text-rose-600 border-rose-100' :
            type === 'User' ? 'bg-amber-50 text-amber-600 border-amber-100' :
            'bg-indigo-50 text-indigo-600 border-indigo-100'
        }`}>
            {type}
        </span>
    </div>
);

export const MemoryExtra = () => {
    return (
        <section className="grid grid-cols-12 gap-8 mt-12 pb-12">
            {/* AI PATTERN DETECTION */}
            <div className="col-span-3">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">AI Pattern Detection</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                    <PatternCard 
                        title="Overtime Pattern Detected" 
                        impact="High" 
                        icon={Activity}
                    />
                    <PatternCard 
                        title="Bottleneck Pattern Detected" 
                        impact="High" 
                        icon={Target}
                    />
                    <PatternCard 
                        title="Risk Pattern Detected" 
                        impact="Medium" 
                        icon={Shield}
                    />
                </div>
            </div>

            {/* RECENT MEMORIES */}
            <div className="col-span-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Recent Memories</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm divide-y divide-gray-50">
                    <MemoryTimelineItem title="Sprint 15 Delay Root Cause" time="2 min ago" type="Operational" />
                    <MemoryTimelineItem title="Team Alpha Overtime Pattern" time="15 min ago" type="User" />
                    <MemoryTimelineItem title="Automation Effectiveness" time="1 hr ago" type="AI Learning" />
                    <MemoryTimelineItem title="Release 2.4.0 Risk Factors" time="3 hrs ago" type="Strategic" />
                </div>
            </div>

            {/* MEMORY TIMELINE CHART */}
            <div className="col-span-5 bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Memory Timeline</h3>
                    <select className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest text-gray-600 focus:outline-none">
                        <option>This Month</option>
                    </select>
                </div>
                
                <div className="h-40 flex items-end justify-between gap-1 mb-6 relative">
                    {/* SVG Curve Background */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2 }}
                            d="M 0 140 Q 50 120 100 130 T 200 80 T 300 100 T 400 40 T 500 20"
                            fill="none"
                            stroke="rgba(79, 70, 229, 0.2)"
                            strokeWidth="3"
                        />
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 0.5 }}
                            d="M 0 140 Q 50 120 100 130 T 200 80 T 300 100 T 400 40 T 500 20"
                            fill="none"
                            stroke="rgb(79, 70, 229)"
                            strokeWidth="2"
                        />
                    </svg>

                    {[20, 35, 30, 45, 40, 55, 50, 65, 60, 75, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group z-10">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mb-1" />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">
                    <span>May 1</span>
                    <span>May 7</span>
                    <span>May 14</span>
                    <span>May 21</span>
                    <span>May 28</span>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-[9px] font-black text-gray-400 uppercase">Total Memories</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-gray-900">4,281</span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-0.5">
                            <TrendingUp size={10} />
                            18%
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Send, Sparkles, Cpu, 
    ArrowUpRight, Target, Clock,
    Zap, Activity, TrendingUp, ChevronRight,
    Brain, Network, Shield, MessageSquare,
    Workflow, Database, Plus, Search
} from 'lucide-react';

const ImpactStat = ({ icon: Icon, label, value, trend }: any) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50 text-gray-400">
                <Icon size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-right">
            <div className="text-xs font-black text-gray-900">{value}</div>
            <div className="text-[9px] font-bold text-emerald-500 uppercase flex items-center justify-end gap-0.5">
                <ArrowUpRight size={10} />
                {trend}
            </div>
        </div>
    </div>
);

const MemoryConnection = ({ title, count, icon: Icon }: any) => (
    <div className="flex items-center justify-between py-2 group cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                <Icon size={14} />
            </div>
            <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{title}</span>
        </div>
        <span className="text-[11px] font-black text-gray-900">{count}</span>
    </div>
);

export const MemoryAssistant = () => {
    const [prompt, setPrompt] = useState('');

    return (
        <div className="space-y-6">
            {/* AI MEMORY ASSISTANT CHAT */}
            <div className="bg-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <Brain size={16} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">AI Memory Assistant</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest">Beta</span>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                        <Database size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-100">Hi Sayab! I'm your AI Memory Assistant.</p>
                        <p className="text-xs font-black">How can I help you today?</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-left">
                        Find related memories
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-left">
                        Explain this pattern
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-left">
                        Summarize intelligence
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-left">
                        Suggest optimizations
                    </button>
                </div>

                <div className="relative">
                    <input 
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask anything about your memory..."
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-xs font-medium placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all pr-12"
                    />
                    <button className="absolute right-2 top-2 bottom-2 px-3 bg-white text-indigo-600 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* MEMORY HEALTH */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Memory Health</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Details</button>
                </div>
                
                <div className="flex items-center gap-8 mb-6">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 * 0.08} className="text-emerald-500" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-gray-900 leading-none">92%</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Healthy</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Healthy</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-900">68 (74%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Warning</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-900">17 (18%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Critical</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-900">7 (8%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOP MEMORY CONNECTIONS */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Top Memory Connections</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                
                <div className="space-y-1 divide-y divide-gray-50">
                    <MemoryConnection title="Team Alpha ↔ Sprint 15 Delivery Delay" count={23} icon={Workflow} />
                    <MemoryConnection title="Backend Dependencies ↔ Release 2.4.0" count={19} icon={Network} />
                    <MemoryConnection title="AI Workload Rebalancer ↔ Team Alpha" count={17} icon={Brain} />
                    <MemoryConnection title="QA Review Bottleneck ↔ Sprint 15" count={14} icon={Target} />
                    <MemoryConnection title="Escalation Rule Set ↔ Overdue Tasks" count={12} icon={Database} />
                </div>
            </div>

            {/* RECENT LEARNINGS */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Recent Learnings</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                
                <div className="space-y-4">
                    {[
                        { title: 'New pattern detected', desc: 'Repetitive task reassignments', icon: Activity, color: 'indigo' },
                        { title: 'Insight stored', desc: 'QA Review Bottleneck identified', icon: Target, color: 'emerald' },
                        { title: 'AI learning update', desc: 'Context accuracy improved', icon: Brain, color: 'purple' },
                        { title: 'Memory connected', desc: 'Team Alpha ↔ Sprint 15', icon: Network, color: 'blue' }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                            <div className={`w-8 h-8 rounded-lg bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0`}>
                                <item.icon size={14} />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-gray-900">{item.title}</div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Zap, Shield, Target, Activity, Clock, 
    CheckCircle2, AlertTriangle, Users, MessageSquare,
    Layers, Search, Plus, Calendar, Download,
    MoreHorizontal, ChevronRight, Layout, PieChart as PieIcon,
    BarChart2, Settings, Globe, Info, History, Maximize2,
    Terminal, Database, Network, Cpu, Radio, List, 
    ArrowRight, Mic, Paperclip, Slash, Sparkle,
    FileText, Briefcase, TrendingUp, AlertCircle, Share2,
    Eye, MoreVertical, Trash2, Edit3, Check, X, Bell,
    User, ChevronDown, Rocket, Coffee, Code, Terminal as TerminalIcon,
    PanelRight, Filter, SortAsc, ZapOff, Bot, BrainCircuit,
    ArrowUpRight, ArrowDownRight, CheckCircle, BarChart3,
    Command, Send, ShieldCheck, Cpu as CpuIcon
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';

// --- Types ---

interface AIAgent {
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'Idle' | 'Busy' | 'Learning';
    lastActive: string;
    tasksCompleted: number;
    successRate: number;
    skills: string[];
    description: string;
    avatar: string;
    metrics: {
        efficiency: number;
        accuracy: number;
        autonomy: number;
    };
}

// --- Mock Data ---

const MOCK_AGENTS: AIAgent[] = [
    {
        id: '1',
        name: 'Nexus-01',
        role: 'Operations Architect',
        status: 'Active',
        lastActive: 'Just now',
        tasksCompleted: 1428,
        successRate: 99.2,
        skills: ['Workflow Optimization', 'Resource Allocation', 'Risk Mitigation'],
        description: 'Autonomous orchestrator for complex multi-team delivery pipelines.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nexus',
        metrics: { efficiency: 98, accuracy: 99, autonomy: 95 }
    },
    {
        id: '2',
        name: 'Aura-04',
        role: 'Quality Engineer',
        status: 'Busy',
        lastActive: '5 min ago',
        tasksCompleted: 842,
        successRate: 98.7,
        skills: ['Code Review', 'Automated Testing', 'Security Audit'],
        description: 'AI-driven code quality and security reinforcement agent.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aura',
        metrics: { efficiency: 92, accuracy: 99, autonomy: 88 }
    },
    {
        id: '3',
        name: 'Atlas-09',
        role: 'Strategy Analyst',
        status: 'Idle',
        lastActive: '12 min ago',
        tasksCompleted: 342,
        successRate: 94.5,
        skills: ['Market Prediction', 'Competitor Analysis', 'Growth Modeling'],
        description: 'Strategic intelligence agent for executive decision support.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Atlas',
        metrics: { efficiency: 85, accuracy: 94, autonomy: 82 }
    },
    {
        id: '4',
        name: 'Echo-02',
        role: 'Customer Success',
        status: 'Active',
        lastActive: 'Just now',
        tasksCompleted: 2421,
        successRate: 97.8,
        skills: ['Sentiment Analysis', 'Issue Resolution', 'Knowledge Retrieval'],
        description: 'Intelligent front-line support and resolution orchestration agent.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Echo',
        metrics: { efficiency: 96, accuracy: 97, autonomy: 91 }
    }
];

// --- Sub-Components ---

const AgentCard = ({ agent }: { agent: AIAgent }) => (
    <motion.div 
        layout
        className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
    >
        <div className="flex items-start justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        <img src={agent.avatar} alt={agent.name} className="w-12 h-12" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        agent.status === 'Active' ? 'bg-emerald-500' : 
                        agent.status === 'Busy' ? 'bg-amber-500' : 'bg-gray-400'
                    }`} />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            agent.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                            agent.status === 'Busy' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-gray-600 bg-gray-50 border-gray-100'
                        }`}>
                            {agent.status}
                        </span>
                    </div>
                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">{agent.role}</p>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">{agent.description}</p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Success Rate</div>
                        <div className="text-lg font-black text-gray-900">{agent.successRate}%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Tasks</div>
                        <div className="text-lg font-black text-gray-900">{agent.tasksCompleted}</div>
                    </div>
                </div>
                <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-900 hover:bg-gray-100 transition-all">
                    <MoreHorizontal size={18} />
                </button>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
            {[
                { label: 'Efficiency', val: agent.metrics.efficiency, icon: Zap, color: 'indigo' },
                { label: 'Accuracy', val: agent.metrics.accuracy, icon: ShieldCheck, color: 'emerald' },
                { label: 'Autonomy', val: agent.metrics.autonomy, icon: CpuIcon, color: 'blue' },
            ].map(m => (
                <div key={m.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                            <m.icon size={10} className={`text-${m.color}-500`} />
                            <span>{m.label}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-900">{m.val}%</span>
                    </div>
                    <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                        <div className={`h-full bg-${m.color}-500`} style={{ width: `${m.val}%` }} />
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
            {agent.skills.map(skill => (
                <span key={skill} className="px-2.5 py-1 bg-indigo-50/50 text-indigo-600 text-[9px] font-black uppercase tracking-wider rounded-lg border border-indigo-100/50">
                    {skill}
                </span>
            ))}
        </div>
        
        {/* Background Neural Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <BrainCircuit size={200} />
        </div>
    </motion.div>
);

// --- Main Page ---

export default function AiAgentsPage() {
    return (
        <main className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300 relative min-w-0 h-screen overflow-hidden">
                {/* HEADER */}
                <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Agents</h1>
                                <div className="p-1 bg-indigo-50 rounded-lg">
                                    <Bot className="text-indigo-600" size={16} />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Deploy and manage your autonomous AI workforce.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
                                <Plus size={14} className="text-indigo-600" />
                                <span>Deploy New Agent</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
                                <Terminal size={14} />
                                <span>Agent Console</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 bg-gray-50/50 text-gray-400 hover:text-gray-900 transition-all rounded-xl border border-transparent hover:border-gray-100"><Bell size={18} /></button>
                            <button className="p-2.5 bg-gray-50/50 text-gray-400 hover:text-gray-900 transition-all rounded-xl border border-transparent hover:border-gray-100"><Info size={18} /></button>
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden p-0.5">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sayab" alt="User" className="w-full h-full object-cover rounded-lg" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] p-8 pr-[412px]">
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        
                        {/* 1. AGENT WORKFORCE OVERVIEW */}
                        <div className="grid grid-cols-4 gap-6">
                            {[
                                { label: 'Total Agents', val: '12', icon: Bot, trend: '+2 this mo' },
                                { label: 'Active Tasks', val: '142', icon: Activity, trend: '+18% velocity' },
                                { label: 'Avg Autonomy', val: '92%', icon: CpuIcon, trend: '+4% improvement' },
                                { label: 'Cost Savings', val: '$14.2k', icon: Zap, trend: '+22% vs last mo' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                            <stat.icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">{stat.trend}</span>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-2xl font-black text-gray-900">{stat.val}</div>
                                </div>
                            ))}
                        </div>

                        {/* 2. MAIN AGENT GRID */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-lg font-bold text-gray-900">Active Workforce</h2>
                                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                                        {['All', 'Operational', 'Engineering', 'Strategic'].map(f => (
                                            <button key={f} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${f === 'All' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input type="text" placeholder="Search agents..." className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all w-64" />
                                    </div>
                                    <button className="p-2 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-900 transition-all"><Filter size={18} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {MOCK_AGENTS.map(agent => (
                                    <AgentCard key={agent.id} agent={agent} />
                                ))}
                            </div>
                        </div>

                        {/* 3. AGENT ACTIVITY FEED */}
                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-8 space-y-6">
                                <h2 className="text-lg font-bold text-gray-900">Neural Activity Feed</h2>
                                <div className="space-y-4">
                                    {[
                                        { agent: 'Nexus-01', action: 'Optimized sprint workload for Backend Team.', time: '2 min ago', type: 'Operation' },
                                        { agent: 'Aura-04', action: 'Identified 3 security vulnerabilities in Payment Module.', time: '12 min ago', type: 'Security' },
                                        { agent: 'Echo-02', action: 'Resolved 14 high-priority customer escalations.', time: '24 min ago', type: 'Success' },
                                        { agent: 'Atlas-09', action: 'Generated strategic roadmap simulation for Q3.', time: '1 hour ago', type: 'Strategy' },
                                    ].map((log, i) => (
                                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-100 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">{log.agent[0]}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-gray-900">{log.agent}</span>
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{log.type}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{log.action}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">{log.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-4 space-y-6">
                                <h2 className="text-lg font-bold text-gray-900">Training Progress</h2>
                                <div className="bg-white border border-gray-100 rounded-[32px] p-6 space-y-6">
                                    {[
                                        { label: 'Reasoning Capability', val: 88, color: 'indigo' },
                                        { label: 'Contextual Memory', val: 92, color: 'emerald' },
                                        { label: 'Multi-Agent Sync', val: 78, color: 'blue' },
                                        { label: 'Tool Usage Mastery', val: 84, color: 'purple' },
                                    ].map(skill => (
                                        <div key={skill.label} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-gray-500 uppercase">{skill.label}</span>
                                                <span className="text-[10px] font-black text-gray-900">{skill.val}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                <div className={`h-full bg-${skill.color}-500`} style={{ width: `${skill.val}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all">Start Bulk Training Session</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR: LIVE MONITORING */}
                <aside className="absolute right-0 top-20 bottom-0 w-[380px] bg-white border-l border-gray-100 p-8 overflow-y-auto no-scrollbar z-30">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Live Monitoring</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase">Live</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Tokens/Sec', val: '1.2k', icon: Zap },
                                    { label: 'Active Sync', val: '14', icon: Network },
                                    { label: 'Neural Load', val: '42%', icon: CpuIcon },
                                    { label: 'Inference', val: '24ms', icon: Clock },
                                ].map(m => (
                                    <div key={m.label} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <m.icon size={14} className="text-gray-400" />
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{m.label}</span>
                                        </div>
                                        <div className="text-lg font-black text-gray-900">{m.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Agent Health Index</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { t: '10am', v: 88 }, { t: '11am', v: 92 }, { t: '12pm', v: 85 },
                                        { t: '1pm', v: 94 }, { t: '2pm', v: 91 }, { t: '3pm', v: 96 }
                                    ]}>
                                        <defs>
                                            <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                                        <Area type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Terminal size={18} />
                                    <h3 className="text-sm font-bold tracking-widest uppercase">Command Agent</h3>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Command agent to execute..." 
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 pr-10 text-xs placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-md"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-indigo-600 rounded-xl">
                                        <Send size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Audit Code', 'Predict Risk', 'Optimize Flow', 'Sync Teams'].map(cmd => (
                                        <button key={cmd} className="text-[9px] font-black uppercase p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-center">
                                            {cmd}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}

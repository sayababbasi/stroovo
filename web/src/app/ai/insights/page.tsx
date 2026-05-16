"use client";

import React, { useState, useMemo } from 'react';
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
    Command, Send, Play, RefreshCw, BarChart4, LineChart as LineIcon
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- Types & Interfaces ---

interface InsightSignal {
    label: string;
    value: string;
    status: 'High' | 'Medium' | 'Low' | 'Stable';
    color: string;
}

interface MetricExplanation {
    issue: string;
    impact: string;
    description: string;
}

interface SimulationScenario {
    id: string;
    name: string;
    deliveryImpact: number;
    costImpact: number;
    riskReduction: number;
    timelineShift: number;
}

// --- Mock Data ---

const VELOCITY_DATA = [
    { name: 'May 1', actual: 42, predicted: 42 },
    { name: 'May 8', actual: 48, predicted: 46 },
    { name: 'May 15', actual: 55, predicted: 52 },
    { name: 'May 22', actual: 52, predicted: 58 },
    { name: 'May 29', actual: 61, predicted: 65 },
];

const FORECAST_DATA = [
    { month: 'Jun', actual: 40, forecast: 40, bestCase: 40, worstCase: 40 },
    { month: 'Jul', forecast: 55, bestCase: 60, worstCase: 50 },
    { month: 'Aug', forecast: 72, bestCase: 85, worstCase: 60 },
    { month: 'Sep', forecast: 81, bestCase: 95, worstCase: 65 },
];

const PRODUCTIVITY_HEATMAP = [
    { day: 'Mon', frontend: 80, backend: 60, design: 90, qa: 70, devops: 85 },
    { day: 'Tue', frontend: 85, backend: 75, design: 80, qa: 65, devops: 90 },
    { day: 'Wed', frontend: 70, backend: 90, design: 85, qa: 80, devops: 75 },
    { day: 'Thu', frontend: 90, backend: 85, design: 70, qa: 90, devops: 80 },
    { day: 'Fri', frontend: 75, backend: 80, design: 95, qa: 75, devops: 70 },
];

const SIGNALS: InsightSignal[] = [
    { label: 'Delivery Risk', value: 'Low', status: 'Low', color: 'emerald' },
    { label: 'Burnout Probability', value: 'Medium', status: 'Medium', color: 'amber' },
    { label: 'Goal Forecast', value: '84%', status: 'Stable', color: 'blue' },
    { label: 'Sprint Stability', value: 'High', status: 'High', color: 'emerald' },
    { label: 'Automation Gain', value: '37%', status: 'Stable', color: 'indigo' },
];

const SCENARIOS: SimulationScenario[] = [
    { id: '1', name: 'Add 2 Developers', deliveryImpact: 18, costImpact: 12500, riskReduction: 32, timelineShift: -7 },
    { id: '2', name: 'Delay Sprint 15', deliveryImpact: -12, costImpact: -5000, riskReduction: 45, timelineShift: 5 },
    { id: '3', name: 'Reduce QA Cycle', deliveryImpact: 24, costImpact: 0, riskReduction: 15, timelineShift: -4 },
];

// --- Sub-Components ---

const IntelligenceScore = ({ score }: { score: number }) => (
    <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Animated Glow Ring */}
        <div className="absolute inset-4 bg-indigo-500/15 blur-[40px] rounded-full animate-pulse" />
        
        <svg className="w-full h-full transform -rotate-90 relative z-10 overflow-visible" viewBox="0 0 160 160">
            <circle
                cx="80"
                cy="80"
                r="65"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
            />
            <motion.circle
                cx="80"
                cy="80"
                r="65"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={408}
                initial={{ strokeDashoffset: 408 }}
                animate={{ strokeDashoffset: 408 - (408 * score) / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-indigo-600 stroke-cap-round"
                style={{ filter: 'drop-shadow(0 0 12px rgba(79, 70, 229, 0.5))' }}
            />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <motion.span 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1, type: "spring" }}
                className="text-5xl font-black text-gray-900 leading-none"
            >
                {score}
            </motion.span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">/ 100</span>
        </div>
        <div className="absolute -bottom-0 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm z-30">
            Excellent
        </div>
    </div>
);

const InsightCard = ({ title, children, icon: Icon, subtitle }: any) => (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Icon size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}
                </div>
            </div>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider">View Full Analysis</button>
        </div>
        {children}
    </div>
);

// --- Main Page ---

export default function AiInsightsPage() {
    const [activeScenario, setActiveScenario] = useState<SimulationScenario>(SCENARIOS[0]);
    const [isSimulating, setIsSimulating] = useState(false);

    const runSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => setIsSimulating(false), 1500);
    };

    return (
        <main className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300 relative min-w-0 h-screen overflow-hidden">
                {/* 1. HEADER */}
                <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Insights Intelligence</h1>
                            <div className="p-1 bg-indigo-50 rounded-lg">
                                <Sparkles className="text-indigo-600" size={16} />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Predictive operational intelligence powered by Stroovo AI.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
                            <span>Generate Executive Insight</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
                            <TrendingUp size={14} />
                            <span>Run AI Forecast</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                            <BrainCircuit size={14} />
                            <span>AI Strategic Analysis</span>
                        </button>
                        <button className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-900 transition-all">
                            <Download size={18} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] p-8 pr-[412px]">
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        
                        {/* 2. HERO EXECUTIVE AI PANEL */}
                        <section className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                            <div className="grid grid-cols-12 gap-12 items-center relative z-10">
                                <div className="col-span-3 flex flex-col items-center border-r border-gray-100 pr-12">
                                    <IntelligenceScore score={91} />
                                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-400">
                                        <ArrowUpRight size={12} className="text-emerald-500" />
                                        <span>+12 pts vs last 7 days</span>
                                    </div>
                                </div>

                                <div className="col-span-5 space-y-6">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-gray-900">AI Executive Summary</h2>
                                        <Sparkle size={14} className="text-indigo-500" />
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-600 font-medium">
                                        Engineering velocity improved by <span className="text-indigo-600 font-bold">18%</span> this month while workload imbalance dropped by <span className="text-indigo-600 font-bold">11%</span>. However, the AI predicts increased sprint instability within the next <span className="text-rose-500 font-bold">2 weeks</span> due to growing dependency pressure in the backend pipeline.
                                    </p>
                                    <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:gap-3 transition-all">
                                        View Full Executive Report <ChevronRight size={14} />
                                    </button>
                                </div>

                                <div className="col-span-4 grid grid-cols-2 gap-4">
                                    {SIGNALS.map(signal => (
                                        <div key={signal.label} className="p-4 bg-gray-50/50 border border-gray-100 rounded-3xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{signal.label}</span>
                                                <div className={`w-1.5 h-1.5 rounded-full bg-${signal.color}-500`} />
                                            </div>
                                            <div className="text-lg font-black text-gray-900">{signal.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Decorative Grid Lines */}
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                        </section>

                        {/* 3. LIVE INTELLIGENCE GRID */}
                        <div className="grid grid-cols-12 gap-8">
                            {/* Delivery Intelligence */}
                            <div className="col-span-4">
                                <InsightCard title="Delivery Intelligence" subtitle="Velocity & Throughput" icon={Activity}>
                                    <div className="h-64 -ml-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={VELOCITY_DATA}>
                                                <defs>
                                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                                                <Line type="monotone" dataKey="predicted" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Current Velocity</div>
                                            <div className="text-lg font-bold text-gray-900">52 pts</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">AI Prediction</div>
                                            <div className="text-lg font-bold text-emerald-500">61 pts <span className="text-xs">+17%</span></div>
                                        </div>
                                    </div>
                                </InsightCard>
                            </div>

                            {/* Productivity Intelligence */}
                            <div className="col-span-4">
                                <InsightCard title="Productivity Intelligence" subtitle="Team Efficiency Heatmap" icon={Zap}>
                                    <div className="h-64 flex flex-col justify-between pt-2">
                                        {['Frontend', 'Backend', 'Design', 'QA', 'DevOps'].map(team => (
                                            <div key={team} className="flex items-center gap-4">
                                                <span className="w-16 text-[10px] font-bold text-gray-400">{team}</span>
                                                <div className="flex-1 flex gap-1.5">
                                                    {Array.from({ length: 5 }).map((_, i) => {
                                                        const val = 40 + Math.random() * 60;
                                                        const color = val > 80 ? 'bg-emerald-400' : val > 60 ? 'bg-indigo-300' : 'bg-orange-200';
                                                        return <div key={i} className={`h-8 flex-1 rounded-md ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`} />;
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between pl-20 mt-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => <span key={d} className="text-[9px] font-bold text-gray-400">{d}</span>)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Focus Time</div>
                                            <div className="text-lg font-bold text-gray-900">4.2 hrs <span className="text-xs text-emerald-500">+12%</span></div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Productivity Score</div>
                                            <div className="text-lg font-bold text-indigo-600">86/100</div>
                                        </div>
                                    </div>
                                </InsightCard>
                            </div>

                            {/* Risk Intelligence */}
                            <div className="col-span-4">
                                <InsightCard title="Risk Intelligence" subtitle="Predictive Failures" icon={AlertTriangle}>
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="relative w-48 h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Critical', value: 2, color: '#f43f5e' },
                                                            { name: 'High', value: 3, color: '#f59e0b' },
                                                            { name: 'Medium', value: 2, color: '#4f46e5' },
                                                            { name: 'Low', value: 1, color: '#10b981' },
                                                        ]}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        { [0,1,2,3].map((entry, index) => <Cell key={index} fill={['#f43f5e', '#f59e0b', '#4f46e5', '#10b981'][index]} />) }
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black text-gray-900">08</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Risks</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Top Risk</span>
                                            <span className="text-xs font-bold text-rose-600">Backend dependency bottleneck</span>
                                        </div>
                                        <button className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-rose-100">View Details</button>
                                    </div>
                                </InsightCard>
                            </div>
                        </div>

                        {/* 4. ADVANCED ENGINES GRID */}
                        <div className="grid grid-cols-12 gap-8">
                            {/* AI Explanation Engine */}
                            <div className="col-span-4">
                                <InsightCard title="AI Explanation Engine" subtitle="The 'Why' Behind Metrics" icon={Info}>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-900">Why did velocity drop last week?</h4>
                                        {[
                                            { issue: '3 blocked backend dependencies', impact: 'High', color: 'rose' },
                                            { issue: 'Review cycle increased by 21%', impact: 'Medium', color: 'amber' },
                                            { issue: 'QA response time slowed', impact: 'Medium', color: 'amber' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 bg-${item.color}-50 text-${item.color}-600 rounded-lg`}>
                                                        <AlertCircle size={14} />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">{item.issue}</span>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded bg-${item.color}-100 text-${item.color}-600`}>{item.impact}</span>
                                            </div>
                                        ))}
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Root Cause</div>
                                            <p className="text-[11px] font-bold text-indigo-900 leading-relaxed">
                                                Velocity drop was primarily caused by the Backend team shifting focus to hotfixes, delaying core feature delivery by 2.4 days.
                                            </p>
                                        </div>
                                    </div>
                                </InsightCard>
                            </div>

                            {/* What-If Simulation */}
                            <div className="col-span-4">
                                <InsightCard title="What-If Simulation" subtitle="Predict Future Scenarios" icon={Play}>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Simulate Scenario</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {SCENARIOS.map(s => (
                                                    <button 
                                                        key={s.id}
                                                        onClick={() => setActiveScenario(s)}
                                                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${activeScenario.id === s.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-100'}`}
                                                    >
                                                        <span className="text-xs font-bold">{s.name}</span>
                                                        <ChevronRight size={14} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Delivery Impact</div>
                                                <div className="text-xl font-black text-emerald-600">+{activeScenario.deliveryImpact}%</div>
                                            </div>
                                            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Risk Reduction</div>
                                                <div className="text-xl font-black text-indigo-600">-{activeScenario.riskReduction}%</div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={runSimulation}
                                            className="w-full py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                                        >
                                            {isSimulating ? 'Processing Models...' : 'Run Intelligence Simulation'}
                                        </button>
                                    </div>
                                </InsightCard>
                            </div>

                            {/* Strategic Forecasting */}
                            <div className="col-span-4">
                                <InsightCard title="Strategic Forecasting" subtitle="Roadmap Completion Predictions" icon={Target}>
                                    <div className="h-64 -ml-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={FORECAST_DATA}>
                                                <defs>
                                                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="forecast" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
                                                <Area type="monotone" dataKey="bestCase" stroke="#10b981" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
                                                <Area type="monotone" dataKey="worstCase" stroke="#f43f5e" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Q3 Completion Success</div>
                                            <div className="text-lg font-bold text-gray-900">81% <span className="text-xs text-indigo-500">Likely</span></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-black text-emerald-500 uppercase">Best Case: 92%</span>
                                                <span className="text-[8px] font-black text-rose-500 uppercase">Worst Case: 65%</span>
                                            </div>
                                        </div>
                                    </div>
                                </InsightCard>
                            </div>
                        </div>

                        {/* 5. OPERATIONAL HEALTH GRID */}
                        <div className="grid grid-cols-12 gap-8 pb-20">
                            {/* Bottleneck Detection */}
                            <div className="col-span-5">
                                <InsightCard title="Bottleneck Detection" subtitle="Pipeline Intelligence" icon={Network}>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            {['Backlog', 'Dev', 'Review', 'QA', 'Deploy'].map((stage, i) => (
                                                <div key={stage} className="flex flex-col items-center gap-2">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${i === 2 ? 'bg-rose-50 border-rose-400 text-rose-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                        <span className="text-[10px] font-black uppercase">{stage.charAt(0)}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-500">{stage}</span>
                                                    {i === 2 && <span className="text-[8px] font-black text-rose-600 uppercase">Blocked</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-[28px]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <AlertTriangle size={16} className="text-rose-600" />
                                                <h4 className="text-xs font-bold text-rose-900">Critical Bottleneck: Code Review</h4>
                                            </div>
                                            <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                                                Code review stage is 2.3x slower than optimal. 14 PRs are waiting for &gt;24h. Suggested action: Assign 2 temporary reviewers from Team B.
                                            </p>
                                        </div>
                                    </div>
                                </InsightCard>
                            </div>

                            {/* Team Insights */}
                            <div className="col-span-7">
                                <InsightCard title="Team Insights" subtitle="Workload & Burnout Prediction" icon={Users}>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workload Balance</h4>
                                            {[
                                                { name: 'Sarah J.', workload: 92, color: 'bg-rose-500' },
                                                { name: 'Alex M.', workload: 78, color: 'bg-amber-500' },
                                                { name: 'Michael C.', workload: 65, color: 'bg-indigo-500' },
                                                { name: 'Priya P.', workload: 42, color: 'bg-emerald-500' },
                                            ].map(user => (
                                                <div key={user.name} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                                        <span className="text-gray-700">{user.name}</span>
                                                        <span className="text-gray-900">{user.workload}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                        <div className={`h-full ${user.color}`} style={{ width: `${user.workload}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col justify-center gap-6 border-l border-gray-100 pl-8">
                                            <div className="p-6 bg-amber-50 border border-amber-100 rounded-[32px] text-center">
                                                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Burnout Risk</div>
                                                <div className="text-3xl font-black text-amber-900">Medium</div>
                                                <div className="text-[10px] font-bold text-amber-700 mt-2">3 members at high risk</div>
                                            </div>
                                            <div className="flex items-center gap-4 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                                <Users size={18} className="text-emerald-600" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Team Collaboration</span>
                                                    <span className="text-xs font-bold text-emerald-900">High Stability</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </InsightCard>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. RIGHT SIDEBAR - AI LIVE MONITORING */}
                <aside className="absolute right-0 top-20 bottom-0 w-[380px] bg-white border-l border-gray-100 p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar z-30">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">AI Live Monitoring</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Critical Risks', val: 2, color: 'rose' },
                                { label: 'Blocked Workflows', val: 5, color: 'orange' },
                                { label: 'Overloaded Teams', val: 3, color: 'amber' },
                                { label: 'Anomalies', val: 4, color: 'indigo' },
                            ].map(m => (
                                <div key={m.label} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                    <div className="text-2xl font-black text-gray-900">{m.val}</div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Active Predictions</h3>
                            <button className="text-[10px] font-bold text-indigo-600 uppercase">View All</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Sprint 15 Success', prob: 72, color: 'bg-indigo-500' },
                                { label: 'Project Alpha Delivery', prob: 68, color: 'bg-blue-500' },
                                { label: 'Release 2.4 On-Time', prob: 81, color: 'bg-emerald-500' },
                            ].map(p => (
                                <div key={p.label} className="p-4 bg-white border border-gray-100 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-700">{p.label}</span>
                                        <span className="text-xs font-black text-gray-900">{p.prob}%</span>
                                    </div>
                                    <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${p.color}`} style={{ width: `${p.prob}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Command size={18} className="text-indigo-100" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest">AI Command Center</h3>
                                </div>
                                <p className="text-[10px] font-medium text-indigo-100 opacity-70">Ask AI anything about your strategic execution.</p>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Analyze velocity drop..." 
                                        className="w-full pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-2xl text-xs placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-md"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-indigo-600 rounded-lg">
                                        <Send size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {['/predict_delays', '/analyze_sprint', '/explain_drop', '/forecast_q3'].map(cmd => (
                                        <button key={cmd} className="text-[8px] font-black uppercase tracking-widest p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left">
                                            {cmd}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 p-12 opacity-10 pointer-events-none transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Activity size={160} />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .stroke-cap-round { stroke-linecap: round; }
            `}</style>
        </main>
    );
}

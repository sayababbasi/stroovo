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
    Command, Send
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- Types & Interfaces ---

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
type SuggestionType = 'Risk' | 'Automation' | 'Productivity' | 'Team' | 'Goal' | 'Documentation';

interface AISuggestion {
    id: string;
    type: SuggestionType;
    priority: Priority;
    title: string;
    description: string;
    impact: string;
    confidence: number;
    explanation: string;
    tags: string[];
    status: 'active' | 'applied' | 'ignored' | 'scheduled';
    createdAt: string;
}

interface WorkspaceHealth {
    aiScore: number;
    operationalHealth: string;
    efficiency: number;
    teamTrend: number;
    confidence: number;
    predictionRate: number;
}

// --- Mock Data ---

const MOCK_HEALTH: WorkspaceHealth = {
    aiScore: 92,
    operationalHealth: 'Good',
    efficiency: 18,
    teamTrend: 11,
    confidence: 92,
    predictionRate: 87
};

const MOCK_SUGGESTIONS: AISuggestion[] = [
    {
        id: 's1',
        type: 'Risk',
        priority: 'Critical',
        title: 'Project Alpha has 78% delay probability',
        description: 'Dependency bottlenecks in the Frontend review stage are blocking the critical path.',
        impact: '+14% Delivery Rate',
        confidence: 92,
        explanation: 'Three dependencies are stuck in "Review" for >48h. Historical data suggests this leads to 75%+ delay risk.',
        tags: ['Project Alpha', 'Backend Team', '+2'],
        status: 'active',
        createdAt: '2 min ago'
    },
    {
        id: 's2',
        type: 'Automation',
        priority: 'High',
        title: '23 repetitive manual status updates detected',
        description: 'AI detected that task status updates follow a consistent pattern that can be automated.',
        impact: '6.4 hrs Saved / Week',
        confidence: 89,
        explanation: 'Users are manually moving tasks to "QA" after PR approval. A trigger-based automation can handle this.',
        tags: ['Mobile App Project', 'Workflow'],
        status: 'active',
        createdAt: '5 min ago'
    },
    {
        id: 's3',
        type: 'Team',
        priority: 'High',
        title: 'Backend team is overloaded by 32%',
        description: '7 members have more than optimal task capacity, leading to burnout risk and velocity drop.',
        impact: '+22% Productivity',
        confidence: 90,
        explanation: 'Average tasks per developer is 14. Optimal range is 8-10. Velocity has dropped 12% in 3 days.',
        tags: ['Backend Team', 'Workload'],
        status: 'active',
        createdAt: '12 min ago'
    },
    {
        id: 's4',
        type: 'Productivity',
        priority: 'Medium',
        title: 'Daily standup time can be reduced by 32%',
        description: 'Suggest switching to async updates + smart summaries to reclaim engineering time.',
        impact: '4.2 hrs Saved / Week',
        confidence: 86,
        explanation: 'Standups are averaging 28 mins. Industry benchmark for this team size is 15 mins.',
        tags: ['All Teams', 'Process Optimization'],
        status: 'active',
        createdAt: '45 min ago'
    },
    {
        id: 's5',
        type: 'Goal',
        priority: 'Medium',
        title: 'Sprint 15 is at risk of missing commitment',
        description: 'Velocity is 18% lower than required to meet the current sprint goal.',
        impact: '72% Success Probability',
        confidence: 84,
        explanation: 'Current burn-down trend indicates 4 story points will remain uncompleted by Friday.',
        tags: ['Sprint 15', 'Mobile App Project'],
        status: 'active',
        createdAt: '1 hour ago'
    },
    {
        id: 's6',
        type: 'Documentation',
        priority: 'Low',
        title: 'Sprint 12 retrospective notes are missing',
        description: 'AI recommends creating a retrospective for learning and process improvement.',
        impact: 'Better Insights',
        confidence: 78,
        explanation: 'Historical correlation shows teams with consistent retro notes improve velocity 8% faster.',
        tags: ['Sprint 12', 'Process'],
        status: 'active',
        createdAt: '2 hours ago'
    }
];

// --- Sub-Components ---

const StatItem = ({ label, value, trend, icon: Icon, color }: any) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-gray-400">
            <Icon size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{value}</span>
            <div className={`flex items-center text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(trend)}%
            </div>
        </div>
    </div>
);

const SuggestionCard = ({ suggestion, onApply }: { suggestion: AISuggestion, onApply: (id: string) => void }) => {
    const priorityColor = {
        Critical: 'text-rose-600 bg-rose-50 border-rose-100',
        High: 'text-orange-600 bg-orange-50 border-orange-100',
        Medium: 'text-amber-600 bg-amber-50 border-amber-100',
        Low: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    }[suggestion.priority];

    const typeIcon = {
        Risk: AlertTriangle,
        Automation: Radio,
        Productivity: Zap,
        Team: Users,
        Goal: Target,
        Documentation: FileText
    }[suggestion.type];

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-100 transition-all group relative overflow-hidden"
        >
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${priorityColor} shrink-0`}>
                        {React.createElement(typeIcon, { size: 20 })}
                    </div>
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${priorityColor}`}>
                                {suggestion.priority}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {suggestion.type} SUGGESTION
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {suggestion.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                            {suggestion.description}
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            {suggestion.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4 w-48 shrink-0">
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="text-right">
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Confidence</div>
                            <div className="text-xs font-bold text-gray-900">{suggestion.confidence}%</div>
                            <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${suggestion.confidence}%` }} />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Impact</div>
                            <div className="text-xs font-bold text-indigo-600">{suggestion.impact.split(' ')[0]}</div>
                            <div className="text-[8px] font-bold text-gray-400 uppercase whitespace-nowrap">{suggestion.impact.split(' ').slice(1).join(' ')}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <button 
                            onClick={() => onApply(suggestion.id)}
                            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            {suggestion.type === 'Automation' ? 'Create Automation' : 'Apply Fix'}
                        </button>
                        <button className="w-full py-2 bg-white border border-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 transition-all">
                            View Analysis
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                    <Sparkles size={12} className="text-indigo-400" />
                    <span>AI Reasoning: <span className="text-gray-600 font-bold">{suggestion.explanation}</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-1.5 text-gray-300 hover:text-gray-900 transition-colors"><Trash2 size={14} /></button>
                    <button className="p-1.5 text-gray-300 hover:text-gray-900 transition-colors"><MoreHorizontal size={14} /></button>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page ---

export default function AiSuggestionsPage() {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>(MOCK_SUGGESTIONS);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    const handleApply = (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    const handleAutoOptimize = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setIsOptimizing(false);
            setSuggestions([]);
        }, 3000);
    };

    return (
        <main className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300 relative min-w-0 h-screen overflow-hidden">
                {/* 1. HEADER */}
                <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Suggestions Engine</h1>
                            <div className="p-1 bg-indigo-50 rounded-lg">
                                <BrainCircuit className="text-indigo-600" size={16} />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Real-time AI optimization insights for your entire organization.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-indigo-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
                            <Sparkles size={14} />
                            <span>Generate Recommendations</span>
                        </button>
                        <button 
                            onClick={handleAutoOptimize}
                            disabled={isOptimizing}
                            className={`flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 ${isOptimizing ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isOptimizing ? <Activity size={14} className="animate-spin" /> : <Zap size={14} />}
                            <span>{isOptimizing ? 'Optimizing Workspace...' : 'AI Auto Optimize'}</span>
                        </button>
                        <button className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-900 transition-all">
                            <Download size={18} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] p-8 pr-[412px]">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* 2. TOP AI HEALTH BANNER */}
                        <section className="bg-white border border-gray-100 rounded-[32px] p-8 relative overflow-hidden shadow-sm">
                            <div className="grid grid-cols-12 gap-8 items-center relative z-10">
                                <div className="col-span-3 flex flex-col gap-2 border-r border-gray-100 pr-8">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Workspace AI Score</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black text-gray-900">{MOCK_HEALTH.aiScore}</span>
                                        <span className="text-sm font-bold text-gray-400">/ 100</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Excellent</span>
                                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-9 grid grid-cols-5 gap-8 pl-4">
                                    <StatItem label="Operational Health" value="Good" trend={14} icon={CheckCircle} color="emerald" />
                                    <StatItem label="Execution Efficiency" value={`+${MOCK_HEALTH.efficiency}%`} trend={18} icon={Zap} color="indigo" />
                                    <StatItem label="Team Performance" value={`+${MOCK_HEALTH.teamTrend}%`} trend={11} icon={Users} color="blue" />
                                    <StatItem label="Predicted Delivery" value={`${MOCK_HEALTH.predictionRate}%`} trend={5} icon={Target} color="cyan" />
                                    <StatItem label="AI Confidence" value={`${MOCK_HEALTH.confidence}%`} trend={6} icon={Sparkles} color="purple" />
                                </div>
                            </div>
                            
                            {/* Decorative Robot Background */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none transform translate-x-1/4">
                                <Bot size={280} />
                            </div>
                        </section>

                        {/* 3. FILTER & CATEGORY CARDS */}
                        <div className="grid grid-cols-6 gap-4">
                            {[
                                { label: 'All Suggestions', count: 128, icon: Layers, active: true },
                                { label: 'Critical Risks', count: 12, icon: AlertTriangle, color: 'rose' },
                                { label: 'High Priority', count: 23, icon: Target, color: 'orange' },
                                { label: 'Optimization', count: 34, icon: Zap, color: 'amber' },
                                { label: 'Automation', count: 19, icon: Radio, color: 'indigo' },
                                { label: 'Team & Workload', count: 18, icon: Users, color: 'blue' },
                            ].map(cat => (
                                <button key={cat.label} className={`flex flex-col p-4 rounded-2xl border transition-all ${cat.active ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'bg-white border-gray-100 hover:border-indigo-100 shadow-sm'}`}>
                                    <div className={`p-2 rounded-lg w-fit ${cat.color ? `bg-${cat.color}-50 text-${cat.color}-600` : 'bg-indigo-50 text-indigo-600'}`}>
                                        <cat.icon size={16} />
                                    </div>
                                    <div className="mt-3">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{cat.label}</div>
                                        <div className="text-lg font-bold text-gray-900">{cat.count}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* 4. MAIN FEED & FILTERS */}
                        <div className="grid grid-cols-12 gap-8 items-start">
                            <div className="col-span-8 space-y-6">
                                <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input 
                                                type="text" 
                                                placeholder="Search suggestions..." 
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="h-6 w-[1px] bg-gray-100" />
                                        <div className="flex items-center gap-2">
                                            <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600">
                                                <Filter size={12} />
                                                <span>Filter</span>
                                                <ChevronDown size={12} />
                                            </button>
                                            <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600">
                                                <SortAsc size={12} />
                                                <span>Sort: Priority</span>
                                                <ChevronDown size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
                                        <button className="p-1.5 bg-white shadow-sm rounded-lg text-indigo-600"><List size={14} /></button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><Layout size={14} /></button>
                                    </div>
                                </div>

                                <div className="space-y-4 pb-20">
                                    <AnimatePresence mode="popLayout">
                                        {suggestions.map(suggestion => (
                                            <SuggestionCard 
                                                key={suggestion.id} 
                                                suggestion={suggestion} 
                                                onApply={handleApply}
                                            />
                                        ))}
                                    </AnimatePresence>

                                    {suggestions.length === 0 && !isOptimizing && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="py-20 flex flex-col items-center justify-center text-center space-y-4"
                                        >
                                            <div className="p-6 bg-emerald-50 text-emerald-600 rounded-full">
                                                <CheckCircle size={48} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Workspace Optimized</h3>
                                                <p className="text-sm text-gray-500">All suggestions have been addressed. Your workspace is running at peak efficiency.</p>
                                            </div>
                                            <button 
                                                onClick={() => setSuggestions(MOCK_SUGGESTIONS)}
                                                className="text-xs font-bold text-indigo-600 hover:underline uppercase"
                                            >
                                                Reload Mock Suggestions
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* 5. RIGHT SIDEBAR */}
                            <aside className="col-span-4 space-y-6 sticky top-28">
                                {/* Workspace Health Overview */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Workspace Health</h3>
                                        <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">View Details</button>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Execution Score', score: 88, color: 'bg-emerald-500' },
                                            { label: 'Team Health Score', score: 82, color: 'bg-indigo-500' },
                                            { label: 'Delivery Score', score: 87, color: 'bg-blue-500' },
                                            { label: 'Risk Score', score: 18, color: 'bg-rose-500', inverse: true },
                                        ].map(item => (
                                            <div key={item.label} className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</span>
                                                    <span className="text-xs font-bold text-gray-900">{item.score}/100</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                    <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active AI Monitoring */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Active Monitoring</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Overdue Tasks', val: 24, icon: Clock, color: 'rose' },
                                            { label: 'Blocked Tasks', val: 7, icon: ZapOff, color: 'orange' },
                                            { label: 'At Risk Sprints', val: 3, icon: Target, color: 'rose' },
                                            { label: 'Overloaded Members', val: 12, icon: Users, color: 'amber' },
                                        ].map(stat => (
                                            <div key={stat.label} className="p-3 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center gap-3">
                                                <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                                    <stat.icon size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900">{stat.val}</div>
                                                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Command Center */}
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Terminal size={18} className="text-indigo-100" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest">AI Command Center</h3>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Ask AI to optimize anything..." 
                                                className="w-full pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-2xl text-xs placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-md"
                                            />
                                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-indigo-600 rounded-lg hover:scale-105 transition-transform">
                                                <Send size={14} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { icon: Zap, label: 'Optimize Sprint' },
                                                { icon: AlertTriangle, label: 'Analyze Blockers' },
                                                { icon: Users, label: 'Balance Workload' },
                                                { icon: TrendingUp, label: 'Improve Velocity' },
                                            ].map(cmd => (
                                                <button key={cmd.label} className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-bold hover:bg-white/10 transition-all text-left">
                                                    <cmd.icon size={10} className="text-indigo-300" />
                                                    <span>{cmd.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-8 -right-8 p-12 opacity-10 pointer-events-none transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                        <Command size={160} />
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}

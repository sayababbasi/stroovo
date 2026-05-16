"use client";
import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    Calendar, ChevronDown, Download, Sparkles, TrendingUp, TrendingDown,
    Activity, CheckCircle2, Clock, Inbox, AlertTriangle, Users,
    MoreHorizontal, ArrowUpRight, ArrowDownRight, ArrowRight, Info, Zap,
    Target, Shield, Search, MessageSquare, Filter, Share2, 
    Layout, BrainCircuit, Flag, ZapOff, Bot, Settings, PanelRight
} from 'lucide-react';

// --- Types & Interfaces ---

interface KpiData {
    label: string;
    value: string | number;
    subValue?: string;
    trend: number;
    trendLabel: string;
    icon: any;
    color: string;
    chartData: { value: number }[];
}

interface ThroughputData {
    date: string;
    completed: number;
    inProgress: number;
    overdue: number;
    planned: number;
}

// --- Mock Data Engine ---

const MOCK_THROUGHPUT: ThroughputData[] = [
    { date: 'May 1', completed: 42, inProgress: 48, overdue: 12, planned: 55 },
    { date: 'May 2', completed: 48, inProgress: 52, overdue: 10, planned: 58 },
    { date: 'May 3', completed: 78, inProgress: 64, overdue: 12, planned: 70 },
    { date: 'May 4', completed: 65, inProgress: 58, overdue: 15, planned: 68 },
    { date: 'May 5', completed: 58, inProgress: 62, overdue: 18, planned: 65 },
    { date: 'May 6', completed: 62, inProgress: 55, overdue: 14, planned: 60 },
    { date: 'May 7', completed: 71, inProgress: 60, overdue: 10, planned: 68 },
];

const MOCK_KPI_DATA: KpiData[] = [
    {
        label: 'Performance Score',
        value: '82',
        subValue: '/ 100',
        trend: 12,
        trendLabel: 'vs last 7 days',
        icon: Target,
        color: 'indigo',
        chartData: Array.from({ length: 10 }, (_, i) => ({ value: 60 + Math.random() * 30 })),
    },
    {
        label: 'Completion Rate',
        value: '73.4%',
        trend: 8.6,
        trendLabel: 'vs last 7 days',
        icon: CheckCircle2,
        color: 'emerald',
        chartData: Array.from({ length: 10 }, (_, i) => ({ value: 50 + Math.random() * 40 })),
    },
    {
        label: 'Avg Cycle Time',
        value: '18.6',
        subValue: 'hrs',
        trend: -14,
        trendLabel: 'vs last 7 days',
        icon: Clock,
        color: 'blue',
        chartData: Array.from({ length: 10 }, (_, i) => ({ value: 25 - Math.random() * 10 })),
    },
    {
        label: 'Backlog',
        value: '124',
        trend: 5,
        trendLabel: 'tasks vs last 7 days',
        icon: Inbox,
        color: 'amber',
        chartData: Array.from({ length: 10 }, (_, i) => ({ value: 100 + Math.random() * 50 })),
    },
    {
        label: 'Risk Exposure',
        value: 'MEDIUM',
        trend: -8,
        trendLabel: 'improving',
        icon: Shield,
        color: 'rose',
        chartData: Array.from({ length: 10 }, (_, i) => ({ value: 40 + Math.random() * 20 })),
    },
    {
        label: 'Team Capacity',
        value: '68%',
        trend: 2,
        trendLabel: 'Optimal',
        icon: Users,
        color: 'cyan',
        chartData: Array.from({ length: 10 }, (_, i) => ({ value: 60 + Math.random() * 15 })),
    },
];

const MOCK_VELOCITY = [
    { day: 'May 1', value: 42 },
    { day: 'May 2', value: 48 },
    { day: 'May 3', value: 78 },
    { day: 'May 4', value: 65 },
    { day: 'May 5', value: 58 },
    { day: 'May 6', value: 62 },
    { day: 'May 7', value: 71 },
];

const MOCK_HEALTH = [
    { name: 'On Track', value: 45, color: '#10b981' },
    { name: 'At Risk', value: 18, color: '#f59e0b' },
    { name: 'Overdue', value: 12, color: '#ef4444' },
    { name: 'Completed', value: 4, color: '#3b82f6' },
];

const MOCK_CONTRIBUTORS = [
    { name: 'Alex Johnson', role: 'Lead Developer', tasks: 92, trend: 18, avatar: null },
    { name: 'Sarah Smith', role: 'Project Manager', tasks: 68, trend: 12, avatar: null },
    { name: 'Sayab Ali', role: 'CEO', tasks: 45, trend: 8, avatar: null },
    { name: 'Usman Tariq', role: 'Backend Developer', tasks: 41, trend: 6, avatar: null },
    { name: 'Michelle Lee', role: 'Designer', tasks: 38, trend: 5, avatar: null },
];

const MOCK_HEATMAP = [
    { team: 'Design Team', mon: 6.2, tue: 7.1, wed: 8.5, thu: 9.2, fri: 6.5 },
    { team: 'Development', mon: 7.8, tue: 8.9, wed: 9.6, thu: 8.3, fri: 7.4 },
    { team: 'QA Team', mon: 4.1, tue: 5.3, wed: 6.2, thu: 5.8, fri: 4.6 },
    { team: 'Marketing', mon: 3.2, tue: 4.1, wed: 4.8, thu: 5.2, fri: 3.6 },
    { team: 'Product', mon: 5.6, tue: 6.7, wed: 7.2, thu: 6.3, fri: 5.9 },
    { team: 'DevOps', mon: 6.0, tue: 6.4, wed: 7.0, thu: 6.8, fri: 6.1 },
];

const MOCK_RADAR = [
    { subject: 'Schedule', A: 120, B: 110, fullMark: 150 },
    { subject: 'Scope', A: 98, B: 130, fullMark: 150 },
    { subject: 'Dependencies', A: 86, B: 130, fullMark: 150 },
    { subject: 'Resources', A: 99, B: 100, fullMark: 150 },
    { subject: 'Budget', A: 85, B: 90, fullMark: 150 },
    { subject: 'Quality', A: 65, B: 85, fullMark: 150 },
];

const MOCK_BENCHMARKS = [
    { metric: 'Delivery Speed', value: 18, industry: 0 },
    { metric: 'Quality Score', value: 9, industry: 0 },
    { metric: 'Team Efficiency', value: 14, industry: 0 },
    { metric: 'Cycle Time', value: -12, industry: 0 },
    { metric: 'On-time Delivery', value: 22, industry: 0 },
];

// --- Sub-Components ---

const Card = ({ children, className = '', noPadding = false }: { children: React.ReactNode, className?: string, noPadding?: boolean }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${noPadding ? '' : 'p-6'} ${className}`}
    >
        {children}
    </motion.div>
);

const KpiCard = ({ data }: { data: KpiData }) => (
    <Card className="relative overflow-hidden group">
        <div className="flex items-start justify-between mb-2">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    {data.label} <data.icon size={12} />
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-2xl font-bold text-gray-900">{data.value}</h3>
                    {data.subValue && <span className="text-sm font-bold text-gray-400">{data.subValue}</span>}
                </div>
            </div>
            <div className={`p-2 rounded-xl bg-${data.color}-50 text-${data.color}-600`}>
                {data.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                data.trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
                {data.trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(data.trend)}%
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{data.trendLabel}</span>
        </div>

        <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                    <defs>
                        <linearGradient id={`gradient-${data.color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={data.color === 'emerald' ? '#10b981' : data.color === 'indigo' ? '#6366f1' : '#3b82f6'} stopOpacity={0.1}/>
                            <stop offset="95%" stopColor={data.color === 'emerald' ? '#10b981' : data.color === 'indigo' ? '#6366f1' : '#3b82f6'} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={data.color === 'emerald' ? '#10b981' : data.color === 'indigo' ? '#6366f1' : '#3b82f6'} 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill={`url(#gradient-${data.color})`} 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </Card>
);

// --- Main Page ---

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState('May 1 - May 7, 2024');
    const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);

    return (
        <main className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300 overflow-y-auto no-scrollbar">
                {/* SECTION 1: HEADER */}
                <header className="h-20 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-30">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Analytics Intelligence <Sparkles className="text-indigo-500" size={24} />
                        </h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Real-time executive visibility into performance, risks, and team capacity.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-sm font-bold text-gray-700">{dateRange}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Compare:</span>
                            <span className="text-sm font-bold text-gray-700">Apr 24 - Apr 30</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <button 
                            onClick={() => setIsAiInsightsOpen(!isAiInsightsOpen)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
                        >
                            <Sparkles size={16} /> AI Insights
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                            <Download size={16} /> Export
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* SECTION 2: EXECUTIVE KPI CARDS */}
                    <div className="grid grid-cols-6 gap-6">
                        {MOCK_KPI_DATA.map((kpi, i) => (
                            <KpiCard key={i} data={kpi} />
                        ))}
                    </div>

                    {/* SECTION 3 & 4: CHARTS ROW */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* 3. Execution Throughput */}
                        <div className="col-span-8">
                            <Card className="h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            Execution Throughput <Info size={14} className="text-gray-300" />
                                        </h3>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Track daily progress, delivery rate & acceleration</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            {['Completed', 'In Progress', 'Overdue', 'Planned'].map((item, i) => (
                                                <div key={item} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${['bg-emerald-500', 'bg-blue-500', 'bg-rose-500', 'bg-indigo-500'][i]}`} />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600">
                                            Daily <ChevronDown size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={MOCK_THROUGHPUT} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                                            />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                                labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px', fontSize: '12px' }}
                                            />
                                            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                            <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                            <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                            <Line type="monotone" dataKey="planned" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* 4. Velocity Snapshot */}
                        <div className="col-span-4 flex flex-col gap-8">
                            <Card className="flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Velocity Snapshot</h3>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                        <TrendingUp size={10} /> 18% <span className="text-gray-400 uppercase">vs last 7 days</span>
                                    </div>
                                </div>
                                <div className="h-[120px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={MOCK_VELOCITY}>
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {MOCK_VELOCITY.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 2 ? '#6366f1' : '#cbd5e1'} />
                                                ))}
                                            </Bar>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} dy={5} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-8 flex items-center gap-6">
                                    <div className="relative w-24 h-24">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={MOCK_HEALTH}
                                                    innerRadius={30}
                                                    outerRadius={45}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {MOCK_HEALTH.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-xl font-extrabold text-gray-900">79</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">Total</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {MOCK_HEALTH.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{item.name}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-900">{item.value} ({Math.round((item.value/79)*100)}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* SECTION 5, 6, 7, 8, 9, 10 Grid */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* 5. AI EXECUTIVE SUMMARY */}
                        <div className="col-span-4 h-full">
                            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white h-full relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                                <Bot size={20} className="text-indigo-100" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest">AI Executive Summary</h3>
                                                <p className="text-[9px] text-indigo-200 font-bold uppercase tracking-widest">Generated 2 min ago</p>
                                            </div>
                                        </div>
                                        <button className="text-white/40 hover:text-white transition-colors"><PanelRight size={16} /></button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-indigo-100 uppercase">Overall Outlook</span>
                                                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/20">POSITIVE</span>
                                            </div>
                                            <p className="text-sm text-indigo-50/80 leading-relaxed font-medium">
                                                Team performance is above average. Completion rate improved by 8.6% with reduced cycle time.
                                            </p>
                                        </div>

                                        <ul className="space-y-3">
                                            {[
                                                '3 risks require attention',
                                                '2 teams are overloaded',
                                                'Delivery capacity can increase by 12%'
                                            ].map((text, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs font-medium text-indigo-100/90">
                                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-300" />
                                                    {text}
                                                </li>
                                            ))}
                                        </ul>

                                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-2 group/btn">
                                            View Full AI Report <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -bottom-8 -right-8 p-12 opacity-10 pointer-events-none transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                    <Activity size={180} />
                                </div>
                            </Card>
                        </div>

                        {/* 6. CAPACITY HEATMAP */}
                        <div className="col-span-8">
                            <Card noPadding>
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            Capacity Heatmap <Info size={14} className="text-gray-300" />
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Team workload distribution over the current week</p>
                                    </div>
                                    <div className="flex rounded-lg p-1 bg-gray-50 border border-gray-200">
                                        <button className="px-3 py-1 bg-white rounded-md text-[10px] font-bold text-indigo-600 shadow-sm border border-gray-100">Hours</button>
                                        <button className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-900">Tasks</button>
                                    </div>
                                </div>
                                <div className="p-6 overflow-x-auto no-scrollbar">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="text-left py-2 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Team</th>
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                                                    <th key={day} className="py-2 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">{day}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {MOCK_HEATMAP.map((row) => (
                                                <tr key={row.team} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <span className="text-xs font-bold text-gray-700">{row.team}</span>
                                                    </td>
                                                    {[row.mon, row.tue, row.wed, row.thu, row.fri].map((val, i) => (
                                                        <td key={i} className="py-4 px-4 text-center">
                                                            <div 
                                                                className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-pointer shadow-sm ${
                                                                    val > 9 ? 'bg-rose-500 text-white shadow-rose-200' :
                                                                    val > 8 ? 'bg-amber-400 text-white shadow-amber-200' :
                                                                    val > 6 ? 'bg-emerald-400 text-white shadow-emerald-200' :
                                                                    'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                }`}
                                                            >
                                                                {val}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="mt-8 flex items-center justify-center gap-8">
                                        {[
                                            { label: '0-4h', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
                                            { label: '4-6h', color: 'bg-emerald-400' },
                                            { label: '6-8h', color: 'bg-amber-400' },
                                            { label: '8h+', color: 'bg-rose-500' },
                                        ].map(legend => (
                                            <div key={legend.label} className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${legend.color}`} />
                                                <span className="text-[10px] font-extrabold text-gray-400 uppercase">{legend.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* 7. TOP CONTRIBUTORS */}
                        <div className="col-span-4">
                            <Card noPadding>
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Top Contributors</h3>
                                    <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">View all</button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {MOCK_CONTRIBUTORS.map((c, i) => (
                                        <div key={i} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl transition-all group">
                                            <div className={`w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-110 transition-transform`}>
                                                {c.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{c.role}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">{c.tasks} <span className="text-[10px] text-gray-400 uppercase font-bold">tasks</span></div>
                                                <div className="flex items-center justify-end gap-1 text-[9px] font-extrabold text-emerald-500">
                                                    <TrendingUp size={10} /> {c.trend}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* 8. PROJECT HEALTH OVERVIEW */}
                        <div className="col-span-4">
                            <Card noPadding>
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Project Health Overview</h3>
                                    <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">View all</button>
                                </div>
                                <div className="p-6 space-y-6">
                                    {[
                                        { name: 'E-Commerce Platform', progress: 85, status: 'On Track', color: 'bg-emerald-500' },
                                        { name: 'Mobile Application', progress: 42, status: 'At Risk', color: 'bg-amber-400' },
                                        { name: 'Internal Dashboard', progress: 94, status: 'On Track', color: 'bg-emerald-500' },
                                        { name: 'Marketing Campaign', progress: 15, status: 'At Risk', color: 'bg-rose-500' },
                                        { name: 'Data Migration', progress: 68, status: 'On Track', color: 'bg-emerald-500' },
                                    ].map((p, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-700">{p.name}</span>
                                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                                    p.status === 'On Track' ? 'bg-emerald-50 text-emerald-600' :
                                                    p.status === 'At Risk' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${p.progress}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className={`h-full ${p.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* 9. AI IMPROVEMENT OPPORTUNITIES */}
                        <div className="col-span-4">
                            <Card noPadding>
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Top Improvement Opportunities</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {[
                                        { title: 'Reduce Review Cycle Time', impact: 'High Impact', desc: '18% faster delivery possible', icon: Clock, color: 'blue' },
                                        { title: 'Balance Workload', impact: 'Medium Impact', desc: '2 teams overloaded', icon: Users, color: 'amber' },
                                        { title: 'Automate 6 Manual Tasks', impact: 'High Impact', desc: 'Save 12+ hours per week', icon: Zap, color: 'emerald' },
                                    ].map((opt, i) => (
                                        <div key={i} className={`p-4 rounded-2xl border ${i === 0 ? 'bg-indigo-50/30 border-indigo-100' : 'bg-gray-50/50 border-gray-100'} hover:shadow-md transition-all cursor-pointer group`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className={`p-2 rounded-xl bg-${opt.color}-50 text-${opt.color}-600 group-hover:scale-110 transition-transform`}>
                                                    <opt.icon size={16} />
                                                </div>
                                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                                    opt.impact.includes('High') ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                    {opt.impact}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">{opt.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* 11. RISK RADAR */}
                        <div className="col-span-4">
                            <Card>
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            Risk Radar <Info size={14} className="text-gray-300" />
                                        </h3>
                                    </div>
                                    <div className="space-y-1">
                                        {[
                                            { label: 'High Risk', color: 'bg-rose-500' },
                                            { label: 'Medium Risk', color: 'bg-amber-400' },
                                            { label: 'Low Risk', color: 'bg-emerald-500' },
                                        ].map(l => (
                                            <div key={l.label} className="flex items-center gap-2 justify-end">
                                                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                                                <span className="text-[9px] font-extrabold text-gray-400 uppercase">{l.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_RADAR}>
                                            <PolarGrid stroke="#f1f5f9" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                            <Radar name="Previous" dataKey="B" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.3} />
                                            <Radar name="Current" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* 12. RECENT RISK ALERTS */}
                        <div className="col-span-4">
                            <Card noPadding>
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Risk Alerts</h3>
                                    <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">View all</button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {[
                                        { title: 'API Integration Delay', module: 'Backend Development', time: '12m ago', severity: 'High', color: 'rose' },
                                        { title: 'Design System Inconsistency', module: 'Design Team', time: '45m ago', severity: 'Medium', color: 'amber' },
                                        { title: 'Resource Overallocation', module: 'Mobile Application', time: '1h ago', severity: 'Medium', color: 'amber' },
                                    ].map((alert, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                            <div className={`p-3 rounded-2xl bg-${alert.color}-50 text-${alert.color}-600`}>
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900">{alert.title}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{alert.module} • {alert.time}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[9px] font-extrabold uppercase border ${
                                                alert.severity === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {alert.severity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* 13. BENCHMARKS */}
                        <div className="col-span-4 flex flex-col gap-8">
                            <Card className="flex-1">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Benchmarks</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">vs Industry Average</span>
                                </div>
                                <div className="space-y-6">
                                    {MOCK_BENCHMARKS.map((b, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-600">{b.metric}</span>
                                                <span className={`text-[10px] font-extrabold ${b.value > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {b.value > 0 ? '+' : ''}{b.value}%
                                                </span>
                                            </div>
                                            <div className="relative h-1 w-full bg-gray-100 rounded-full">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-300 rounded-full z-10" />
                                                <motion.div 
                                                    initial={{ width: 0, left: '50%' }}
                                                    animate={{ 
                                                        width: `${Math.abs(b.value)}%`, 
                                                        left: b.value > 0 ? '50%' : `${50 - Math.abs(b.value)}%` 
                                                    }}
                                                    className={`absolute top-0 h-full rounded-full ${b.value > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* 14. AI CHAT ANALYTICS ASSISTANT */}
                <div className="fixed bottom-8 right-8 z-50">
                    <Card noPadding className="w-[380px] shadow-2xl border-indigo-100 overflow-hidden ring-4 ring-indigo-500/10">
                        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold">Benchmarks</h4>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-200">Beta</span>
                                </div>
                            </div>
                            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Settings size={16} /></button>
                        </div>
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2 p-3 bg-white border border-indigo-100 rounded-xl shadow-sm cursor-pointer group">
                                <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Ask anything about your data...</span>
                                <div className="ml-auto p-1.5 bg-indigo-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                    <ArrowUpRight size={14} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </main>
    );
}

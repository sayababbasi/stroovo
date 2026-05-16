"use client";
import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search, Filter, Download, Plus, Sparkles, Activity, Users, 
    Zap, AlertCircle, TrendingUp, Clock, Calendar, ChevronDown,
    MoreHorizontal, CheckCircle2, MessageSquare, Shield, Lock,
    FileText, Layout, Target, Settings, Info, User, Layers,
    ArrowRight, Share2, Eye, Trash2, Database, ShieldCheck,
    BarChart3, PieChart, Timer, AlertTriangle, Play, BrainCircuit,
    Terminal, History, ExternalLink, RefreshCw, PanelRight,
    UserPlus, Mail, Flag, Trash, Pin, MoreVertical
} from 'lucide-react';

// --- Types & Interfaces ---

type ActivityType = 'task' | 'goal' | 'file' | 'ai' | 'automation' | 'security' | 'audit' | 'message';
type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

interface ActivityEvent {
    id: string;
    type: ActivityType;
    user: {
        name: string;
        avatar?: string;
        role: string;
    };
    action: string;
    target: string;
    module: string;
    project?: string;
    timestamp: string;
    impact: ImpactLevel;
    details?: string;
    aiInsight?: string;
    automationRule?: string;
    isAudit?: boolean;
}

interface ActivityStat {
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: any;
    color: string;
}

// --- Mock Data ---

const ACTIVITY_STATS: ActivityStat[] = [
    { label: 'Live Events', value: 127, trend: '+23% vs yesterday', trendUp: true, icon: Activity, color: 'blue' },
    { label: 'Active Members', value: 24, trend: 'Online now', icon: Users, color: 'green' },
    { label: 'AI Actions', value: 18, trend: '+12% vs yesterday', trendUp: true, icon: BrainCircuit, color: 'purple' },
    { label: 'Automations', value: 34, trend: 'Executed today', icon: Zap, color: 'amber' },
    { label: 'Risks Detected', value: 7, trend: 'Requires attention', icon: AlertTriangle, color: 'red' },
    { label: 'Productivity Score', value: '87/100', trend: '+5% this week', trendUp: true, icon: TrendingUp, color: 'indigo' },
];

const RECENT_ACTIVITIES: ActivityEvent[] = [
    {
        id: '1',
        type: 'ai',
        user: { name: 'Stroovo AI', role: 'Operational Intelligence' },
        action: 'detected potential sprint risk',
        target: 'Sprint 12',
        module: 'Sprint Planning',
        timestamp: '12m ago',
        impact: 'high',
        aiInsight: '4 tasks are behind schedule in Sprint 12. Team capacity is at 94%. Recommended: Reassign 2 non-critical tasks.',
    },
    {
        id: '2',
        type: 'task',
        user: { name: 'Ali Raza', role: 'Product Lead' },
        action: 'reassigned task "API Integration"',
        target: 'Mobile App Redesign',
        module: 'Tasks',
        project: 'Mobile App',
        timestamp: '2m ago',
        impact: 'medium',
    },
    {
        id: '3',
        type: 'automation',
        user: { name: 'Task Automation', role: 'System Rule' },
        action: 'executed: Overdue Task Reminder',
        target: '12 tasks notified',
        module: 'Automation',
        timestamp: '18m ago',
        impact: 'low',
        automationRule: 'IF task_overdue > notify_assignee',
    },
    {
        id: '4',
        type: 'file',
        user: { name: 'Sara Khan', role: 'Senior Designer' },
        action: 'uploaded v2.4 of',
        target: 'Q2 Marketing Strategy.pdf',
        module: 'Files',
        project: 'Marketing Campaign',
        timestamp: '32m ago',
        impact: 'medium',
    },
    {
        id: '5',
        type: 'security',
        user: { name: 'Admin', role: 'System Admin' },
        action: 'changed permissions for',
        target: 'Marketing Team',
        module: 'Audit Logs',
        timestamp: '1h ago',
        impact: 'high',
        isAudit: true,
    },
    {
        id: '6',
        type: 'goal',
        user: { name: 'Ahmed Hassan', role: 'CEO' },
        action: 'updated Key Result progress',
        target: 'Increase Customer Satisfaction',
        module: 'Goals',
        timestamp: '2h ago',
        impact: 'high',
    },
    {
        id: '7',
        type: 'ai',
        user: { name: 'Stroovo AI', role: 'Operational Intelligence' },
        action: 'generated weekly performance report',
        target: 'Engineering Team',
        module: 'Reports',
        timestamp: '3h ago',
        impact: 'low',
    }
];

// --- Sub-Components ---

const StatCard = ({ stat }: { stat: ActivityStat }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={22} />
            </div>
            {stat.trend && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    stat.trendUp ? 'bg-green-50 text-green-600' : 
                    stat.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
                }`}>
                    {stat.trend}
                </span>
            )}
        </div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</div>
    </div>
);

const ActivityCard = ({ event }: { event: ActivityEvent }) => {
    const getImpactColor = (impact: ImpactLevel) => {
        switch (impact) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getIcon = (type: ActivityType) => {
        switch (type) {
            case 'task': return <CheckCircle2 size={16} className="text-blue-600" />;
            case 'goal': return <Target size={16} className="text-purple-600" />;
            case 'file': return <FileText size={16} className="text-emerald-600" />;
            case 'ai': return <BrainCircuit size={16} className="text-indigo-600" />;
            case 'automation': return <Zap size={16} className="text-amber-600" />;
            case 'security': return <Shield size={16} className="text-rose-600" />;
            case 'audit': return <History size={16} className="text-slate-600" />;
            default: return <Activity size={16} className="text-gray-600" />;
        }
    };

    return (
        <div className={`relative bg-white p-5 rounded-2xl border transition-all hover:shadow-lg hover:translate-x-1 border-gray-100 group`}>
            <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                        {event.user.avatar ? (
                            <img src={event.user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-gray-400">{event.user.name.substring(0,2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm">
                        {getIcon(event.type)}
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 hover:text-blue-600 cursor-pointer">{event.user.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded">{event.user.role}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                <Clock size={10} /> {event.timestamp}
                            </span>
                            <button className="text-gray-300 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={16}/></button>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="text-gray-500">{event.action}</span>{' '}
                        <span className="font-bold text-gray-900 hover:underline cursor-pointer">{event.target}</span>
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                            <Layers size={10} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{event.module}</span>
                        </div>
                        {event.project && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50/50 rounded-md border border-blue-100/50">
                                <Layout size={10} className="text-blue-400" />
                                <span className="text-[10px] font-bold text-blue-500 uppercase">{event.project}</span>
                            </div>
                        )}
                        <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getImpactColor(event.impact)}`}>
                            {event.impact} Impact
                        </div>
                    </div>

                    {event.aiInsight && (
                        <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 relative overflow-hidden group/ai">
                            <div className="flex items-start gap-3 relative z-10">
                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Sparkles size={12} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-bold text-indigo-700 uppercase mb-1 tracking-wider">AI Analysis</div>
                                    <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
                                        {event.aiInsight}
                                    </p>
                                    <button className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                        View suggested reassignments <ArrowRight size={10} />
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/ai:opacity-10 transition-opacity">
                                <BrainCircuit size={48} />
                            </div>
                        </div>
                    )}

                    {event.automationRule && (
                        <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50/50 rounded-lg border border-amber-100/50">
                            <Zap size={10} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Rule Triggered:</span>
                            <code className="text-[10px] font-medium text-amber-900/60">{event.automationRule}</code>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export default function ActivityPage() {
    const [tab, setTab] = useState('All Activity');
    const [isAuditMode, setIsAuditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

    const [activeView, setActiveView] = useState<'feed' | 'timeline' | 'heatmap'>('feed');

    const filteredActivities = useMemo(() => {
        return RECENT_ACTIVITIES.filter(act => {
            const matchesSearch = act.target.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                act.user.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
            
            if (tab === 'AI Events') return act.type === 'ai';
            if (tab === 'Automation') return act.type === 'automation';
            if (tab === 'Audit Logs') return act.isAudit;
            return true;
        });
    }, [searchQuery, tab]);

    return (
        <main className={`flex min-h-screen ${isAuditMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'} transition-colors duration-500`}>
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-[240px] transition-all duration-300">
                {/* 1. TOP BAR */}
                <header className={`h-16 border-b ${isAuditMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-gray-200'} flex items-center justify-between px-8 sticky top-0 z-20 transition-colors`}>
                    <div className="flex items-center gap-6 flex-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <h1 className={`text-xl font-bold ${isAuditMode ? 'text-white' : 'text-gray-900'}`}>Activity</h1>
                            <div className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                LIVE
                            </div>
                        </div>
                        
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search events, users, tasks..." 
                                className={`w-full pl-10 pr-12 py-2 ${isAuditMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className={`p-2 rounded-lg ${isAuditMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}>
                            <RefreshCw size={18} />
                        </button>
                        <button className={`px-4 py-2 ${isAuditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} rounded-lg text-sm font-semibold transition-all flex items-center gap-2`}>
                            <Download size={16} /> Export Logs
                        </button>
                        <button 
                            onClick={() => setIsAuditMode(!isAuditMode)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                                isAuditMode ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Shield size={16} /> {isAuditMode ? 'Audit Mode Active' : 'Enter Audit Mode'}
                        </button>
                    </div>
                </header>

                {/* 1.1 SUB TABS */}
                <div className={`${isAuditMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-gray-200'} border-b px-8 py-2 flex items-center justify-between transition-colors`}>
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {['All Activity', 'Team Activity', 'Project Activity', 'Automation', 'AI Events', 'Audit Logs'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setTab(t)}
                                className={`text-sm font-bold whitespace-nowrap pb-2 border-b-2 transition-all ${
                                    tab === t 
                                        ? 'text-blue-500 border-blue-500' 
                                        : isAuditMode ? 'text-slate-500 border-transparent hover:text-slate-300' : 'text-gray-400 border-transparent hover:text-gray-800'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isAuditMode ? 'text-slate-500' : 'text-gray-400'}`}>Real-time update:</span>
                        <span className="text-[10px] font-extrabold text-blue-500 uppercase">Every 5 Seconds</span>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* 2. MAIN FEED AREA */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                        {/* 2.1 SMART CARDS (CONTROL BAR) */}
                        <div className="grid grid-cols-6 gap-4 mb-8">
                            {ACTIVITY_STATS.map((stat, i) => (
                                <StatCard key={i} stat={stat} />
                            ))}
                        </div>

                        {/* 2.2 FILTER BAR */}
                        <div className={`mb-8 p-4 rounded-2xl border ${isAuditMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100'} flex items-center justify-between transition-colors shadow-sm`}>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <Filter size={16} className="text-gray-400" />
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isAuditMode ? 'text-slate-400' : 'text-gray-500'}`}>Quick Filters:</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {['Users', 'Modules', 'Event Type', 'Impact'].map((f) => (
                                        <button key={f} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                                            isAuditMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}>
                                            {f}: All <ChevronDown size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button className="text-[11px] font-bold text-blue-500 hover:underline uppercase tracking-widest">Clear Filters</button>
                        </div>

                        {/* 2.3 FEED HEADER */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className={`text-lg font-bold ${isAuditMode ? 'text-white' : 'text-gray-900'}`}>
                                    {activeView === 'feed' ? 'Live Operational Feed' : activeView === 'timeline' ? 'Operational Timeline' : 'Activity Heatmap'}
                                </h2>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAuditMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                                    {filteredActivities.length} Events Total
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`flex rounded-lg p-1 ${isAuditMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                    <button 
                                        onClick={() => setActiveView('feed')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeView === 'feed' ? 'bg-white text-blue-600 shadow-sm shadow-blue-500/10' : 'text-gray-500 hover:text-gray-900'}`}>Feed</button>
                                    <button 
                                        onClick={() => setActiveView('timeline')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeView === 'timeline' ? 'bg-white text-blue-600 shadow-sm shadow-blue-500/10' : 'text-gray-500 hover:text-gray-900'}`}>Timeline</button>
                                    <button 
                                        onClick={() => setActiveView('heatmap')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeView === 'heatmap' ? 'bg-white text-blue-600 shadow-sm shadow-blue-500/10' : 'text-gray-500 hover:text-gray-900'}`}>Heatmap</button>
                                </div>
                            </div>
                        </div>

                        {/* 2.4 MAIN FEED CONTENT */}
                        {activeView === 'feed' && (
                            <div className="space-y-4">
                                {filteredActivities.map((event) => (
                                    <ActivityCard key={event.id} event={event} />
                                ))}
                                <button className={`w-full py-4 text-xs font-bold uppercase tracking-widest border border-dashed rounded-2xl transition-all ${
                                    isAuditMode ? 'border-slate-700 text-slate-500 hover:text-slate-300' : 'border-gray-200 text-gray-400 hover:text-gray-900'
                                }`}>
                                    Load more activity history
                                </button>
                            </div>
                        )}

                        {activeView === 'timeline' && (
                            <div className={`p-8 rounded-3xl border ${isAuditMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-100'} min-h-[600px] relative`}>
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 border-dashed border-l" />
                                <div className="space-y-16 relative z-10">
                                    {[
                                        { time: 'Now', label: 'LIVE', color: 'green', events: ['AI Analysis Generated', 'Risk Detected: Sprint 12'] },
                                        { time: '11:00 AM', label: 'MORNING SYNC', color: 'blue', events: ['12 Tasks Created', '3 Goals Updated'] },
                                        { time: '09:00 AM', label: 'DAILY START', color: 'purple', events: ['All Members Online', 'Automation Executed'] },
                                        { time: 'Yesterday', label: 'SYSTEM SCAN', color: 'slate', events: ['Audit Logs Cleared', 'Permissions Validated'] },
                                    ].map((milestone, i) => (
                                        <div key={i} className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className="flex-1 text-right">
                                                {i % 2 === 0 && (
                                                    <div className="space-y-2">
                                                        <div className={`text-[10px] font-bold text-${milestone.color}-500 uppercase`}>{milestone.label}</div>
                                                        <div className={`text-sm font-bold ${isAuditMode ? 'text-white' : 'text-gray-900'}`}>{milestone.time}</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`w-12 h-12 rounded-full bg-${milestone.color}-500 border-4 border-white flex items-center justify-center shadow-lg relative z-20`}>
                                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                            </div>
                                            <div className="flex-1">
                                                {i % 2 !== 0 && (
                                                    <div className="space-y-2">
                                                        <div className={`text-[10px] font-bold text-${milestone.color}-500 uppercase`}>{milestone.label}</div>
                                                        <div className={`text-sm font-bold ${isAuditMode ? 'text-white' : 'text-gray-900'}`}>{milestone.time}</div>
                                                    </div>
                                                )}
                                                <div className="mt-4 space-y-2">
                                                    {milestone.events.map((e, ei) => (
                                                        <div key={ei} className={`px-3 py-2 rounded-lg text-[11px] font-medium ${isAuditMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-600'}`}>
                                                            {e}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeView === 'heatmap' && (
                            <div className={`p-8 rounded-3xl border ${isAuditMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-100'} min-h-[400px]`}>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                                        <span className={`text-xs font-bold ${isAuditMode ? 'text-slate-400' : 'text-gray-500'}`}>Activity Intensity</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-gray-400">Less</span>
                                            {[1, 2, 3, 4, 5].map(v => <div key={v} className={`w-3 h-3 rounded-sm bg-blue-500 opacity-${v * 20}`} />)}
                                            <span className="text-[10px] text-gray-400">More</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <div key={day} className={`text-[10px] font-bold text-center mb-2 uppercase ${isAuditMode ? 'text-slate-500' : 'text-gray-400'}`}>{day}</div>
                                    ))}
                                    {Array.from({ length: 28 }).map((_, i) => (
                                        <div key={i} className={`aspect-square rounded-md transition-all hover:scale-110 cursor-pointer bg-blue-500 opacity-${Math.floor(Math.random() * 5 + 1) * 20}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. RIGHT PANEL (AI INSIGHTS & ANALYTICS) */}
                    {isRightPanelOpen && (
                        <aside className={`w-[400px] border-l flex flex-col overflow-y-auto no-scrollbar transition-all duration-500 ${
                            isAuditMode ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-gray-200'
                        }`}>
                            <div className="p-6 space-y-8">
                                {/* AI SUMMARY CARD */}
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles size={20} className="text-indigo-200" />
                                            <span className="text-xs font-bold uppercase tracking-widest">AI Intelligence Summary</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Workspace Health: Strong</h3>
                                        <p className="text-sm text-indigo-100/80 leading-relaxed mb-6 font-medium">
                                            Productivity is up 12% across 8 modules. 3 risks detected in Sprint Planning need your attention.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                                <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">Risk Level</div>
                                                <div className="text-lg font-bold">Medium</div>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                                <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">Efficiency</div>
                                                <div className="text-lg font-bold">94.2%</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                                        <Activity size={120} />
                                    </div>
                                </div>

                                {/* OPERATIONAL RISKS */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-xs font-bold uppercase tracking-widest ${isAuditMode ? 'text-slate-400' : 'text-gray-400'}`}>Operational Risks</h3>
                                        <button className="text-[10px] font-bold text-blue-500 hover:underline uppercase">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { title: 'Sprint 12 Delay', risk: 'High', color: 'red', desc: '4 tasks overdue by 48h+' },
                                            { title: 'Team Overload', risk: 'Medium', color: 'amber', desc: 'Design team at 112% capacity' },
                                            { title: 'API Integration Blocked', risk: 'Medium', color: 'amber', desc: 'Waiting for Backend approval' },
                                        ].map((risk, i) => (
                                            <div key={i} className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                                                isAuditMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-gray-50 border-gray-100 hover:shadow-md'
                                            }`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm font-bold ${isAuditMode ? 'text-white' : 'text-gray-900'}`}>{risk.title}</span>
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                                        risk.color === 'red' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {risk.risk} Risk
                                                    </span>
                                                </div>
                                                <p className={`text-[11px] ${isAuditMode ? 'text-slate-400' : 'text-gray-500'}`}>{risk.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* TEAM PERFORMANCE */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-xs font-bold uppercase tracking-widest ${isAuditMode ? 'text-slate-400' : 'text-gray-400'}`}>Performance Pulse</h3>
                                        <BarChart3 size={16} className="text-gray-400" />
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Ali Raza', actions: 124, score: 96, avatar: null },
                                            { name: 'Sara Khan', actions: 89, score: 92, avatar: null },
                                            { name: 'Ahmed Hassan', actions: 56, score: 88, avatar: null },
                                        ].map((user, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg bg-${i === 0 ? 'blue' : i === 1 ? 'emerald' : 'amber'}-500/10 text-${i === 0 ? 'blue' : i === 1 ? 'emerald' : 'amber'}-500 flex items-center justify-center text-[10px] font-bold uppercase`}>
                                                    {user.name.substring(0,2)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-xs font-bold ${isAuditMode ? 'text-slate-200' : 'text-gray-900'}`}>{user.name}</span>
                                                        <span className="text-[10px] font-bold text-blue-500">{user.score}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${user.score}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* RECOMMENDATIONS */}
                                <div className={`p-5 rounded-2xl border-2 border-dashed ${isAuditMode ? 'bg-slate-800/20 border-slate-700/50' : 'bg-blue-50/20 border-blue-100/50'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info size={16} className="text-blue-500" />
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">AI Recommendation</span>
                                    </div>
                                    <p className={`text-xs font-medium leading-relaxed ${isAuditMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                        "Sprint 12 is at risk of delay. Reassign 3 frontend tasks from Usman (overloaded) to Sara Khan to stabilize timeline."
                                    </p>
                                    <button className="mt-4 w-full py-2 bg-blue-600 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                                        Optimize Sprint Capacity
                                    </button>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `}</style>
        </main>
    );
}

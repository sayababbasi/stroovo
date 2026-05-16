"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, Brain, ShieldCheck, Zap, 
    Settings, Play, Square, Activity, 
    Database, Network, History, Sparkles,
    AlertTriangle, Terminal, Layers, Globe,
    ChevronRight, Power, RefreshCcw, Lock,
    TrendingUp, ArrowUpRight, CheckCircle2,
    BarChart3, Clock, Search, MoreHorizontal,
    Plus, Filter, Share2, MousePointer2,
    LayoutGrid, List, MessageSquare, Shield, Target
} from 'lucide-react';
import { 
    LineChart, Line, AreaChart, Area, 
    XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// --- MOCK DATA ---
const chartData = [
    { name: '00:00', value: 40 },
    { name: '04:00', value: 30 },
    { name: '08:00', value: 60 },
    { name: '12:00', value: 45 },
    { name: '16:00', value: 80 },
    { name: '20:00', value: 55 },
    { name: '23:59', value: 90 },
];

const statusData = [
    { name: 'Healthy', value: 25, color: '#10B981' },
    { name: 'Warning', value: 2, color: '#F59E0B' },
    { name: 'Critical', value: 1, color: '#EF4444' },
];

// --- COMPONENTS ---

const MetricCard = ({ title, value, trend, trendDir, icon: Icon, color }: any) => (
    <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{title}</h4>
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                <Icon size={14} />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <div className="text-2xl font-black text-gray-900 mb-1">{value}</div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${
                    trendDir === 'up' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                    {trendDir === 'up' ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                    {trend}
                </div>
            </div>
            <div className="h-12 w-24">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={color === 'indigo' ? '#4F46E5' : color === 'emerald' ? '#10B981' : '#6366F1'} 
                            strokeWidth={2} 
                            dot={false} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

const EngineCard = ({ icon: Icon, name, health, uptime, lastRestart }: any) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-100 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Icon size={16} />
                </div>
                <h4 className="text-[12px] font-black text-gray-900">{name}</h4>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Running
            </div>
        </div>
        
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Health</span>
                    <span className="text-[10px] font-black text-gray-900">{health}%</span>
                </div>
                <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${health}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Uptime</div>
                    <div className="text-[10px] font-black text-gray-900">{uptime}</div>
                </div>
                <div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Last Restart</div>
                    <div className="text-[10px] font-black text-gray-900">{lastRestart}</div>
                </div>
            </div>
        </div>

        <button className="w-full mt-5 py-2 text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:bg-indigo-50 rounded-lg transition-all">
            Manage
        </button>
    </div>
);

const MonitorRow = ({ label, value, progress }: any) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500">{label}</span>
            <span className="text-[10px] font-black text-gray-900">{value}</span>
        </div>
        <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-indigo-500" 
            />
        </div>
    </div>
);

const ControlToggle = ({ label, desc, checked }: any) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <div className="text-[11px] font-black text-gray-900 mb-0.5">{label}</div>
            <div className="text-[9px] font-medium text-gray-400">{desc}</div>
        </div>
        <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-all ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    </div>
);

export const AIControlSystem = ({ role }: { role: string }) => {
    const [activeTab, setActiveTab] = useState('AI Overview');

    const tabs = ['AI Overview', 'Models Management', 'Automations Control', 'Decision Engine', 'AI Policies', 'System Settings', 'Logs & Monitoring'];

    return (
        <section className="space-y-8 pb-12">
            {/* METRICS ROW */}
            <div className="grid grid-cols-5 gap-6">
                <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm flex gap-4 overflow-hidden relative">
                    <div className="w-24 h-24 shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={statusData} 
                                    innerRadius={30} 
                                    outerRadius={45} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-black text-gray-900 leading-none">98%</span>
                            <span className="text-[6px] font-bold text-gray-400 uppercase tracking-tighter">Health</span>
                        </div>
                    </div>
                    <div className="space-y-2 flex-1 pt-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Systems Status</h4>
                        {statusData.map((s, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-[9px] font-bold text-gray-500">{s.name}</span>
                                </div>
                                <span className="text-[9px] font-black text-gray-900">{s.value} <span className="text-gray-300">({Math.round((s.value/28)*100)}%)</span></span>
                            </div>
                        ))}
                    </div>
                </div>

                <MetricCard title="Active AI Models" value="7" trend="+2 this month" trendDir="up" icon={Layers} color="indigo" />
                <MetricCard title="Automations Controlled" value="84" trend="+18 this month" trendDir="up" icon={Zap} color="emerald" />
                <MetricCard title="AI Decisions Today" value="1,248" trend="22% vs yesterday" trendDir="up" icon={Target} color="emerald" />
                <MetricCard title="Cost Optimization" value="$12,640" trend="18.6% vs last month" trendDir="up" icon={BarChart3} color="indigo" />
            </div>

            {/* TABS */}
            <div className="flex items-center gap-8 border-b border-gray-100 pb-0.5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.1em] transition-all relative whitespace-nowrap ${
                            activeTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="aiControlTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* LEFT MAIN PANEL */}
                <div className="col-span-9 space-y-8">
                    <div>
                        <div className="mb-6">
                            <h3 className="text-base font-black text-gray-900 leading-tight">AI Systems Control Center</h3>
                            <p className="text-[11px] text-gray-400 font-medium">Monitor and control all AI components from one place.</p>
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            <EngineCard name="AI Assistant Engine" icon={BotIcon} health={99} uptime="99.9%" lastRestart="2 days ago" />
                            <EngineCard name="AI Automation Engine" icon={Zap} health={98} uptime="99.8%" lastRestart="1 day ago" />
                            <EngineCard name="AI Prediction Engine" icon={TrendingUp} health={97} uptime="99.7%" lastRestart="3 days ago" />
                            <EngineCard name="AI Optimization Engine" icon={Zap} health={98} uptime="99.9%" lastRestart="5 hours ago" />
                            <EngineCard name="AI Memory Engine" icon={Database} health={99} uptime="99.9%" lastRestart="1 day ago" />
                            <EngineCard name="AI Decision Engine" icon={Brain} health={98} uptime="99.8%" lastRestart="2 days ago" />
                            <EngineCard name="AI Learning Engine" icon={RefreshCcw} health={97} uptime="99.6%" lastRestart="8 hours ago" />
                            <EngineCard name="AI Security Engine" icon={Shield} health={100} uptime="100%" lastRestart="1 day ago" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        {/* ACTIVITY STREAM */}
                        <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">AI Activity Stream</h3>
                                <button className="text-[8px] font-black text-indigo-600 uppercase">View All</button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { icon: MessageSquare, text: 'AI Assistant processed 128 queries', time: '2 min ago' },
                                    { icon: Zap, text: 'Automation Engine executed 24 workflows', time: '5 min ago' },
                                    { icon: Target, text: 'Prediction Engine detected 3 potential risks', time: '10 min ago' },
                                    { icon: RefreshCcw, text: 'Optimization Engine improved 6 workflows', time: '15 min ago' },
                                    { icon: Brain, text: 'Learning Engine updated knowledge base', time: '20 min ago' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="p-1.5 bg-gray-50 text-gray-400 rounded-lg shrink-0"><item.icon size={12} /></div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-black text-gray-900 leading-tight">{item.text}</div>
                                            <div className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter mt-0.5">{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PERFORMANCE METRICS */}
                        <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">AI Performance Metrics</h3>
                                <select className="bg-gray-50 border-none text-[8px] font-black uppercase tracking-widest text-gray-400 rounded px-1 py-0.5">
                                    <option>This Week</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Response Accuracy', value: '96.8%', trend: '+ 3.2%' },
                                    { label: 'Prediction Accuracy', value: '93.4%', trend: '+ 2.1%' },
                                    { label: 'Automation Success Rate', value: '98.7%', trend: '+ 1.8%' },
                                    { label: 'Decision Confidence Avg.', value: '94.2%', trend: '+ 2.5%' },
                                    { label: 'Learning Progress', value: '89.3%', trend: '+ 4.3%' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-500">{item.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-gray-900">{item.value}</span>
                                            <span className="text-[9px] font-black text-emerald-500">{item.trend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RECENT DECISIONS */}
                        <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Recent AI Decisions</h3>
                                <button className="text-[8px] font-black text-indigo-600 uppercase">View All</button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { title: 'Reassigned 12 overdue tasks to reduce sprint risk', impact: 'High Impact', color: 'rose' },
                                    { title: 'Predicted sprint delay probability: 42%', impact: 'Medium Impact', color: 'amber' },
                                    { title: 'Optimized workflow "Bug Triage Process"', impact: 'Low Impact', color: 'indigo' },
                                    { title: 'Detected workload imbalance in Design Team', impact: 'High Impact', color: 'rose' }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex items-start gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 bg-${item.color === 'rose' ? 'rose-500' : item.color === 'amber' ? 'amber-500' : 'indigo-500'}`} />
                                            <div className="text-[10px] font-black text-gray-900 leading-tight">{item.title}</div>
                                        </div>
                                        <span className={`ml-3.5 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest ${
                                            item.color === 'rose' ? 'bg-rose-50 text-rose-600' : item.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                                        }`}>{item.impact}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR PANEL */}
                <div className="col-span-3 space-y-8">
                    {/* SYSTEM MONITOR */}
                    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Real-time System Monitor</h3>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Live
                            </div>
                        </div>
                        <div className="space-y-6">
                            <MonitorRow label="CPU Usage" value="32%" progress={32} />
                            <MonitorRow label="Memory Usage" value="48%" progress={48} />
                            <MonitorRow label="Storage Usage" value="36%" progress={36} />
                            <MonitorRow label="Network Activity" value="68%" progress={68} />
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-gray-500">AI Requests (RPM)</span>
                                    <span className="text-[10px] font-black text-gray-900">1,248</span>
                                </div>
                                <div className="h-10 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <Area type="monotone" dataKey="value" stroke="#4F46E5" fill="#4F46E522" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GLOBAL CONTROLS */}
                    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-8">AI Global Controls</h3>
                        <div className="space-y-2 divide-y divide-gray-50">
                            <ControlToggle label="Enable All AI Systems" desc="All systems are active and operational" checked={true} />
                            <ControlToggle label="Auto-Optimize Performance" desc="Automatically optimize system performance" checked={true} />
                            <ControlToggle label="Learning Mode" desc="AI system learning is enabled" checked={true} />
                            <ControlToggle label="Predictive Monitoring" desc="Real-time prediction and alerting" checked={true} />
                            <ControlToggle label="Safety & Compliance" desc="All safety protocols are active" checked={true} />
                        </div>

                        <div className="mt-8 space-y-3">
                            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all">
                                Restart All Systems
                            </button>
                            <button className="w-full py-4 bg-white border border-gray-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <RefreshCcw size={14} />
                                Run Health Check
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- CUSTOM ICONS ---
const BotIcon = ({ size }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

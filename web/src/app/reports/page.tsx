"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
    Search, Plus, Sparkles, Calendar, Download, MoreHorizontal,
    ChevronDown, Filter, Share2, FileText, Layout, Target,
    Activity, Clock, CheckCircle2, AlertTriangle, Users,
    Zap, BrainCircuit, Shield, Send, Mail, MessageSquare,
    Eye, Copy, Trash2, Archive, Globe, Lock, History,
    Presentation, Monitor, Smartphone, FileDown, Settings,
    ArrowUpRight, ArrowDownRight, Info, PlusCircle, Layers,
    Maximize2, Save, RotateCcw, ChevronLeft, ChevronRight,
    PieChart as PieIcon, BarChart3, LineChart as LineIcon, Grid
} from 'lucide-react';

// --- Types & Interfaces ---

type ReportStatus = 'ready' | 'generating' | 'scheduled' | 'archived';
type ReportType = 'Executive' | 'Sprint' | 'Team' | 'Financial' | 'OKR' | 'Risk' | 'AI Prediction';

interface ReportKPI {
    label: string;
    value: string | number;
    trend: number;
    icon: any;
    color: string;
    chartData: { v: number }[];
}

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: ReportType;
    icon: any;
    color: string;
    usageCount: number;
    aiTags: string[];
}

interface GeneratedReport {
    id: string;
    name: string;
    type: ReportType;
    workspace: string;
    owner: { name: string, avatar?: string };
    lastModified: string;
    downloads: number;
    status: ReportStatus;
}

// --- Mock Data Engine ---

const REPORT_KPIS: ReportKPI[] = [
    { label: 'Generated Reports', value: 128, trend: 24, icon: FileText, color: 'blue', chartData: Array.from({ length: 10 }, (_, i) => ({ v: 40 + Math.random() * 40 })) },
    { label: 'Scheduled Reports', value: 24, trend: 18, icon: Calendar, color: 'emerald', chartData: Array.from({ length: 10 }, (_, i) => ({ v: 10 + Math.random() * 20 })) },
    { label: 'AI Insights Reports', value: 36, trend: 32, icon: Sparkles, color: 'indigo', chartData: Array.from({ length: 10 }, (_, i) => ({ v: 20 + Math.random() * 50 })) },
    { label: 'Executive Reports', value: 18, trend: 16, icon: Shield, color: 'amber', chartData: Array.from({ length: 10 }, (_, i) => ({ v: 5 + Math.random() * 15 })) },
    { label: 'Shared Reports', value: 42, trend: 20, icon: Users, color: 'cyan', chartData: Array.from({ length: 10 }, (_, i) => ({ v: 30 + Math.random() * 30 })) },
    { label: 'Total Downloads', value: '2.4K', trend: 28, icon: Download, color: 'purple', chartData: Array.from({ length: 10 }, (_, i) => ({ v: 50 + Math.random() * 80 })) },
];

const REPORT_TEMPLATES: ReportTemplate[] = [
    { id: 't1', name: 'Executive Summary', description: 'Company-wide performance overview', type: 'Executive', icon: Shield, color: 'blue', usageCount: 1420, aiTags: ['AI Analytics', 'Weekly'] },
    { id: 't2', name: 'Project Health Report', description: 'Detailed project analysis & risks', type: 'Risk', icon: Target, color: 'emerald', usageCount: 890, aiTags: ['Risk Engine', 'Real-time'] },
    { id: 't3', name: 'Sprint Performance', description: 'Sprint metrics & velocity trends', type: 'Sprint', icon: Activity, color: 'purple', usageCount: 2100, aiTags: ['Predictive', 'Agile'] },
    { id: 't4', name: 'Team Productivity', description: 'Team output & collaboration insights', type: 'Team', icon: Users, color: 'indigo', usageCount: 1250, aiTags: ['Behavioral', 'AI Insight'] },
    { id: 't5', name: 'OKR Progress Report', description: 'Strategic goals and key results', type: 'OKR', icon: Target, color: 'amber', usageCount: 640, aiTags: ['Strategic', 'Impact'] },
    { id: 't6', name: 'Risk & Issues Report', description: 'Project risks and mitigation plans', type: 'Risk', icon: AlertTriangle, color: 'rose', usageCount: 720, aiTags: ['Security', 'Audited'] },
];

const GENERATED_REPORTS: GeneratedReport[] = [
    { id: 'r1', name: 'Q2 Executive Summary Report', type: 'Executive', workspace: 'Stroovo Inc.', owner: { name: 'Sayab Ali' }, lastModified: 'May 7, 2024, 10:30 AM', downloads: 124, status: 'ready' },
    { id: 'r2', name: 'Mobile App Project Health', type: 'Risk', workspace: 'Mobile App', owner: { name: 'Alex Johnson' }, lastModified: 'May 7, 2024, 9:15 AM', downloads: 86, status: 'ready' },
    { id: 'r3', name: 'Sprint 12 Performance Report', type: 'Sprint', workspace: 'Development Team', owner: { name: 'Sarah Smith' }, lastModified: 'May 6, 2024, 5:45 PM', downloads: 64, status: 'ready' },
    { id: 'r4', name: 'Team Productivity Analysis', type: 'Team', workspace: 'Marketing Team', owner: { name: 'Michelle Lee' }, lastModified: 'May 6, 2024, 2:20 PM', downloads: 52, status: 'ready' },
    { id: 'r5', name: 'Q2 Financial Overview', type: 'Financial', workspace: 'Stroovo Inc.', owner: { name: 'Usman Tariq' }, lastModified: 'May 5, 2024, 11:10 AM', downloads: 98, status: 'ready' },
    { id: 'r6', name: 'Q1 Performance Retrospective', type: 'Executive', workspace: 'Stroovo Inc.', owner: { name: 'Sayab Ali' }, lastModified: 'Apr 30, 2024, 4:15 PM', downloads: 210, status: 'ready' },
    { id: 'r7', name: 'Resource Allocation Map', type: 'Team', workspace: 'Operations', owner: { name: 'Sara Khan' }, lastModified: 'Apr 28, 2024, 1:40 PM', downloads: 45, status: 'ready' },
];

const BUILDER_WIDGETS = [
    { id: 'w1', name: 'Delivery Performance Trend', type: 'Line', data: Array.from({ length: 7 }, (_, i) => ({ name: `May ${i+1}`, value: 20 + Math.random() * 60 })) },
    { id: 'w2', name: 'Task Completion Breakdown', type: 'Pie', data: [{ name: 'Completed', value: 130, color: '#10b981' }, { name: 'In Progress', value: 60, color: '#3b82f6' }, { name: 'Overdue', value: 25, color: '#ef4444' }, { name: 'Planned', value: 20, color: '#6366f1' }] },
    { id: 'w3', name: 'Team Velocity', type: 'Bar', data: Array.from({ length: 5 }, (_, i) => ({ name: ['Dev', 'Design', 'QA', 'Ops', 'Mkt'][i], value: 40 + Math.random() * 40 })) },
];

// --- Sub-Components ---

const KpiCard = ({ kpi }: { kpi: ReportKPI }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon size={22} />
            </div>
            <div className="flex flex-col items-end">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${kpi.trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {kpi.trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {kpi.trend}%
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">vs last 7 days</span>
            </div>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</div>
        <div className="flex items-end justify-between mt-1">
            <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
            <div className="h-8 w-16">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpi.chartData}>
                        <Area type="monotone" dataKey="v" stroke={kpi.color === 'emerald' ? '#10b981' : kpi.color === 'blue' ? '#3b82f6' : '#6366f1'} fillOpacity={0} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </motion.div>
);

const TemplateCard = ({ template }: { template: ReportTemplate }) => (
    <motion.div 
        whileHover={{ scale: 1.02 }}
        className="min-w-[240px] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer group hover:border-blue-100 transition-all"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl bg-${template.color}-50 text-${template.color}-600`}>
                <template.icon size={20} />
            </div>
            <div className="flex items-center gap-1">
                {template.aiTags.map(tag => (
                    <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded uppercase">{tag}</span>
                ))}
            </div>
        </div>
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{template.name}</h4>
        <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{template.description}</p>
        <div className="mt-4 flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-400 uppercase">{template.usageCount} reports generated</span>
            <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-500"><PlusCircle size={16}/></button>
        </div>
    </motion.div>
);

// --- Main Page ---

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('All Reports');
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [previewPage, setPreviewPage] = useState(1);
    const [isScheduling, setIsScheduling] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

    // --- Handlers ---

    const handleAiGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setShowSuccessToast('AI Report generated successfully!');
            setTimeout(() => setShowSuccessToast(null), 3000);
        }, 2500);
    };

    const handleExport = (format: string) => {
        setIsExporting(format);
        
        // Simulate processing time
        setTimeout(() => {
            setIsExporting(null);
            
            try {
                // CREATE A REAL DOWNLOAD TRIGGER
                const mockContent = `Stroovo Executive Report - ${new Date().toLocaleDateString()}\nFormat: ${format}\nStatus: Official\n\nThis is a mock generated ${format} report for the Q2 Executive Summary.`;
                const blob = new Blob([mockContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Stroovo_Report_Q2_${new Date().getTime()}.${format.toLowerCase()}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                setShowSuccessToast(`Report downloaded as ${format}`);
            } catch (error) {
                console.error('Download failed:', error);
            }
            
            setTimeout(() => setShowSuccessToast(null), 3000);
        }, 1500);
    };

    const handleCreateSchedule = () => {
        setIsScheduling(true);
        setTimeout(() => {
            setIsScheduling(false);
            setShowSuccessToast('Automation schedule created!');
            setTimeout(() => setShowSuccessToast(null), 3000);
        }, 1200);
    };

    const filteredReports = useMemo(() => {
        return GENERATED_REPORTS.filter(report => {
            const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 report.workspace.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTab = activeTab === 'All Reports' || 
                              (activeTab === 'My Reports' && report.owner.name === 'Sayab Ali') ||
                              (activeTab === 'Team Reports' && report.type === 'Team') ||
                              (activeTab === 'AI Generated' && report.name.includes('AI'));
            return matchesSearch && matchesTab;
        });
    }, [searchQuery, activeTab]);

    return (
        <main className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300 overflow-y-auto no-scrollbar relative">
                {/* SUCCESS TOAST */}
                <AnimatePresence>
                    {showSuccessToast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, x: '-50%' }}
                            animate={{ opacity: 1, y: 20, x: '-50%' }}
                            exit={{ opacity: 0, y: -20, x: '-50%' }}
                            className="fixed top-4 left-1/2 z-[100] px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800"
                        >
                            <div className="p-1 bg-emerald-500 rounded-full">
                                <CheckCircle2 size={14} className="text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">{showSuccessToast}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 1. HEADER */}
                <header className="h-20 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-30">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Generate, analyze, and share powerful reports with AI intelligence.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all group">
                            <Globe size={16} className="text-gray-400 group-hover:text-blue-500" />
                            <span className="text-sm font-bold text-gray-700">All Workspaces</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search reports, templates..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleAiGenerate}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 disabled:opacity-50"
                        >
                            {isGenerating ? <RotateCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {isGenerating ? 'Analyzing...' : 'AI Generate'}
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                            <Plus size={18} /> Create Report
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* 2. KPI CARDS */}
                    <div className="grid grid-cols-6 gap-6">
                        {REPORT_KPIS.map((kpi, i) => (
                            <KpiCard key={i} kpi={kpi} />
                        ))}
                    </div>

                    {/* 3. POPULAR TEMPLATES */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Popular Report Templates</h3>
                            <button className="text-[11px] font-bold text-blue-600 hover:underline uppercase">View all templates</button>
                        </div>
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-4">
                            {REPORT_TEMPLATES.map((template) => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
                        </div>
                    </section>

                    {/* 4. REPORT BUILDER & PREVIEW AREA */}
                    <div className="grid grid-cols-12 gap-8 items-start">
                        {/* BUILDER */}
                        <div className="col-span-9">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-900">Report Builder</h3>
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-500 text-[10px] font-bold rounded uppercase border border-indigo-100">AI-Powered</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><RotateCcw size={16}/></button>
                                    <button onClick={() => setShowSuccessToast('Draft saved successfully!')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Save size={16}/></button>
                                    <button className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-2"><Eye size={14}/> Preview</button>
                                    <button onClick={() => setShowSuccessToast('Report published!')} className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md">Save Report</button>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                {/* Widget Sidebar */}
                                <div className="w-56 bg-white rounded-2xl border border-gray-100 p-4 space-y-6 h-fit sticky top-24">
                                    <div className="flex p-1 bg-gray-50 rounded-xl">
                                        <button className="flex-1 py-1.5 bg-white rounded-lg text-[10px] font-extrabold text-blue-600 shadow-sm">Widgets</button>
                                        <button className="flex-1 py-1.5 text-[10px] font-extrabold text-gray-400">Metrics</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase mb-2">Charts</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { icon: LineIcon, label: 'Line' },
                                                    { icon: BarChart3, label: 'Bar' },
                                                    { icon: PieIcon, label: 'Donut' },
                                                    { icon: Activity, label: 'Area' },
                                                ].map(w => (
                                                    <button 
                                                        key={w.label} 
                                                        onClick={() => setShowSuccessToast(`${w.label} chart added to canvas`)}
                                                        className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-all group"
                                                    >
                                                        <w.icon size={16} className="text-gray-400 group-hover:text-blue-500" />
                                                        <span className="text-[9px] font-bold text-gray-500 group-hover:text-blue-600 uppercase">{w.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase mb-2">Tables</div>
                                            <button onClick={() => setShowSuccessToast('Data Grid added')} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3 hover:bg-blue-50 transition-all">
                                                <Grid size={14} className="text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Data Grid</span>
                                            </button>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase mb-2">KPIs</div>
                                            <button onClick={() => setShowSuccessToast('Stat Card added')} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3 hover:bg-blue-50 transition-all">
                                                <Target size={14} className="text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Stat Card</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Builder Canvas */}
                                <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm relative overflow-hidden flex flex-col gap-6">
                                    <div className="grid grid-cols-12 gap-6">
                                        {/* Line Chart - WIDER */}
                                        <div className="col-span-8 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900 uppercase">Delivery Performance Trend</h4>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Last 7 days</p>
                                                </div>
                                                <button className="p-1 hover:bg-gray-50 rounded text-gray-300"><MoreHorizontal size={14}/></button>
                                            </div>
                                            <div className="h-[220px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={BUILDER_WIDGETS[0].data}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} dy={5} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} />
                                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Pie Chart - COMPACT */}
                                        <div className="col-span-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900 uppercase">Task Breakdown</h4>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">This Week</p>
                                                </div>
                                                <button className="p-1 hover:bg-gray-50 rounded text-gray-300"><MoreHorizontal size={14}/></button>
                                            </div>
                                            <div className="h-[220px] w-full flex flex-col items-center justify-center relative">
                                                <div className="w-full h-32">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie data={BUILDER_WIDGETS[1].data} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                                                                {BUILDER_WIDGETS[1].data.map((entry: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                                        <div className="text-lg font-bold text-gray-900 leading-none">235</div>
                                                        <div className="text-[7px] font-bold text-gray-400 uppercase">Total</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 mt-4 w-full px-2">
                                                    {BUILDER_WIDGETS[1].data.map((item: any) => (
                                                        <div key={item.name} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                                <span className="text-[7px] font-bold text-gray-500 uppercase">{item.name}</span>
                                                            </div>
                                                            <span className="text-[7px] font-extrabold text-gray-900">{item.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Small KPI Grid */}
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { label: 'Avg Cycle Time', val: '18.6h', trend: -14, color: 'blue' },
                                            { label: 'Completion Rate', val: '73.4%', trend: 8.6, color: 'emerald' },
                                            { label: 'Overdue Tasks', val: '25', trend: -6, color: 'rose' },
                                            { label: 'Team Capacity', val: '68%', trend: 4, color: 'amber' },
                                        ].map(stat => (
                                            <div key={stat.label} className="p-4 bg-gray-50/30 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-md cursor-pointer group">
                                                <div className="text-[8px] font-extrabold text-gray-400 uppercase mb-1 tracking-wider">{stat.label}</div>
                                                <div className="text-xl font-bold text-gray-900">{stat.val}</div>
                                                <div className={`text-[9px] font-bold mt-1 flex items-center gap-1 ${stat.trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {stat.trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                    {Math.abs(stat.trend)}% <span className="text-gray-400 uppercase text-[8px]">vs last 7 days</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* MOVED: EXPORT & SCHEDULE SECTIONS */}
                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100/50">
                                        {/* EXPORT SECTION */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Export Options</h4>
                                                <Download size={14} className="text-blue-500" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { label: 'PDF', icon: FileDown, color: 'rose' },
                                                    { label: 'PPTX', icon: Presentation, color: 'amber' },
                                                    { label: 'DOCX', icon: FileText, color: 'blue' },
                                                    { label: 'XLSX', icon: Grid, color: 'emerald' },
                                                    { label: 'CSV', icon: Layers, color: 'indigo' },
                                                    { label: 'PNG', icon: Layout, color: 'cyan' },
                                                ].map(ex => (
                                                    <button 
                                                        key={ex.label} 
                                                        onClick={() => handleExport(ex.label)}
                                                        disabled={isExporting !== null}
                                                        className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex flex-col items-center gap-2 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all group disabled:opacity-50"
                                                    >
                                                        {isExporting === ex.label ? <RotateCcw size={16} className="animate-spin text-blue-500" /> : <ex.icon size={16} className={`text-${ex.color}-500 group-hover:scale-110 transition-transform`} />}
                                                        <span className="text-[9px] font-bold text-gray-600 uppercase">{isExporting === ex.label ? 'Wait' : ex.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => handleExport('PDF')}
                                                className="w-full py-3 bg-blue-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                                            >
                                                Generate & Export Report
                                            </button>
                                        </div>

                                        {/* SCHEDULE SECTION */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Automation & Scheduling</h4>
                                                <Calendar size={14} className="text-emerald-500" />
                                            </div>
                                            <div className="bg-emerald-50/30 border border-emerald-100 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[160px]">
                                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                                                    {isScheduling ? <RotateCcw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                                </div>
                                                <h5 className="text-[11px] font-bold text-emerald-800 uppercase mb-1">AI-Powered Recurring Delivery</h5>
                                                <p className="text-[9px] text-emerald-600 font-medium max-w-[200px] mb-4">Set up automated weekly summaries to be sent to Slack or Email.</p>
                                                <button 
                                                    onClick={handleCreateSchedule}
                                                    disabled={isScheduling}
                                                    className="px-6 py-2 bg-white border border-emerald-200 text-emerald-600 text-[10px] font-bold rounded-xl hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
                                                >
                                                    {isScheduling ? 'Configuring...' : 'Configure Schedule'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                                        <Layers size={400} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR (AI INSIGHTS & PREVIEW) */}
                        <div className="col-span-3 space-y-6 h-fit sticky top-24">
                            {/* AI INSIGHTS */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-indigo-500" />
                                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Insights</h4>
                                    </div>
                                    <span className="text-[8px] font-bold text-indigo-400 uppercase">Stroovo AI</span>
                                </div>
                                <ul className="space-y-3 relative z-10">
                                    {[
                                        'Delivery performance improved by 12% this week.',
                                        'Backend team is overloaded. 16 tasks are at risk.',
                                        'Reduce review cycle time by 15% to increase velocity.',
                                        'Automation can save 12+ hours per week.'
                                    ].map((insight, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-gray-700 leading-relaxed group-hover:translate-x-1 transition-transform">
                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500" />
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                                <button className="mt-5 w-full py-2 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                                    View Detailed AI Report <ChevronRight size={12} />
                                </button>
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
                                    <BrainCircuit size={80} />
                                </div>
                            </div>

                            {/* REPORT PREVIEW */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Report Preview</h4>
                                    <History size={12} className="text-gray-400" />
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 aspect-[4/3] relative flex flex-col items-center justify-center overflow-hidden group shadow-inner">
                                    <div className="w-full h-full bg-white rounded-lg border border-gray-100 p-3 relative transform scale-90">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className="w-3 h-3 bg-blue-600 rounded flex items-center justify-center text-[6px] text-white font-bold">S</div>
                                            <span className="text-[6px] font-bold text-gray-900">Stroovo</span>
                                        </div>
                                        <div className="text-[8px] font-bold text-gray-900 mb-0.5 uppercase tracking-tighter">Q2 Summary - Page {previewPage}</div>
                                        <div className="text-[5px] text-gray-400 mb-2 uppercase">April - June 2024</div>
                                        <div className="grid grid-cols-4 gap-1 mb-2">
                                            {[1,2,3,4].map(i => <div key={i} className="h-2.5 bg-gray-50 rounded" />)}
                                        </div>
                                        <div className="h-10 w-full bg-gray-50 rounded mb-1.5" />
                                        <div className="flex items-center justify-between">
                                            <div className="w-1/3 h-1 bg-gray-50 rounded" />
                                            <div className="w-2.5 h-2.5 bg-gray-50 rounded-full" />
                                        </div>
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/90 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button className="p-2 bg-white rounded-lg text-blue-600 hover:scale-110 transition-transform shadow-lg"><Eye size={16}/></button>
                                        <button className="p-2 bg-white rounded-lg text-blue-600 hover:scale-110 transition-transform shadow-lg"><Download size={16}/></button>
                                        <button className="p-2 bg-white rounded-lg text-blue-600 hover:scale-110 transition-transform shadow-lg"><Share2 size={16}/></button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between px-1">
                                    <button 
                                        onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))}
                                        className="p-0.5 text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <ChevronLeft size={16}/>
                                    </button>
                                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Page {previewPage} / 12</span>
                                    <button 
                                        onClick={() => setPreviewPage(prev => Math.min(12, prev + 1))}
                                        className="p-0.5 text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <ChevronRight size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. GENERATED REPORTS TABLE */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-8">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Generated Reports</h3>
                                <div className="flex items-center gap-6">
                                    {['All Reports', 'My Reports', 'Team Reports', 'AI Generated'].map(tab => (
                                        <button 
                                            key={tab} 
                                            onClick={() => setActiveTab(tab)}
                                            className={`text-[11px] font-bold pb-2 border-b-2 transition-all ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600">
                                    Sort: Last Modified <ChevronDown size={12} />
                                </div>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button className="p-1 bg-white rounded shadow-sm text-blue-600"><Grid size={14}/></button>
                                    <button className="p-1 text-gray-400"><Layers size={14}/></button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="text-left py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Report Name</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Type</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Workspace</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Created By</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Last Modified</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Downloads</th>
                                        <th className="text-right py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredReports.length > 0 ? filteredReports.map((report) => (
                                        <tr key={report.id} className="group hover:bg-gray-50/50 transition-all">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                                        <FileText size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer">{report.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                    report.type === 'Executive' ? 'bg-purple-50 text-purple-600' :
                                                    report.type === 'Sprint' ? 'bg-blue-50 text-blue-600' :
                                                    report.type === 'Financial' ? 'bg-amber-50 text-amber-600' :
                                                    report.type === 'Team' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {report.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs font-medium text-gray-500">{report.workspace}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                        {report.owner.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{report.owner.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-xs font-medium text-gray-500">{report.lastModified}</td>
                                            <td className="py-4 px-6 text-xs font-bold text-gray-700">{report.downloads}</td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setShowSuccessToast('Opening report...')} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-blue-500"><Eye size={16}/></button>
                                                    <button onClick={() => setShowSuccessToast('Share link copied!')} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-emerald-500"><Share2 size={16}/></button>
                                                    <button onClick={() => handleExport('PDF')} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-500"><Download size={16}/></button>
                                                    <button className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-gray-900"><MoreVertical size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                                        <Search size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No reports found matching your criteria</p>
                                                    <button 
                                                        onClick={() => {setSearchQuery(''); setActiveTab('All Reports');}}
                                                        className="text-xs font-bold text-blue-600 hover:underline uppercase"
                                                    >
                                                        Clear all filters
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-center">
                                <button className="text-[11px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    View all reports <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}

// --- Helper Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm ${className}`}>
        {children}
    </div>
);

const MoreVertical = ({ size, className }: { size?: number, className?: string }) => <div className={className}><MoreHorizontal size={size} /></div>;

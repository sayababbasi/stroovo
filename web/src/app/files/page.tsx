"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
    Search, Upload, FolderPlus, FilePlus, Grid, List, Star, Clock,
    Users, Share2, Download, MoreHorizontal, ChevronDown, ChevronRight,
    Hash, Folder, FileText, Image, Code, FileArchive, File,
    X as XIcon, Eye, Pencil, Trash2, Copy, Link as LinkIcon, CheckSquare, Flame,
    BarChart2, Activity, MessageSquare, CheckCircle2, RotateCcw,
    Plus, Filter, SlidersHorizontal, PanelRight, Heart, Zap, AlertCircle,
    FileVideo, Files, History, ShieldCheck, HardDrive, Sparkles, BrainCircuit,
    MoreVertical, Pin, Trash, ExternalLink, Tags, UserPlus, Info, Calendar as CalendarIcon
} from 'lucide-react';

// --- Types & Interfaces ---

interface FileItem {
    id: string;
    name: string;
    type: string;
    size: string;
    owner: string;
    lastUpdated: string;
    isStarred?: boolean;
    isPinned?: boolean;
    tags?: string[];
    aiStatus?: 'outdated' | 'recently_modified' | 'high_usage' | 'at_risk' | null;
    usage?: number; // 0-100 for charts
    thumbnail?: string;
    folderId?: string;
}

interface FolderItem {
    id: string;
    name: string;
    color?: string;
    parentId?: string;
    isFavorite?: boolean;
    itemCount: number;
}

// --- Mock Data ---

const INITIAL_FILES: FileItem[] = [
    { id: 'f1', name: 'Project Proposal.pdf', type: 'pdf', size: '12.4 MB', owner: 'Sayab Ali', lastUpdated: '20 days ago', aiStatus: 'outdated', isPinned: true, usage: 85, folderId: 'root' },
    { id: 'f2', name: 'Budget Planning.xlsx', type: 'excel', size: '8.7 MB', owner: 'Alex Johnson', lastUpdated: '5 hours ago', isPinned: true, usage: 60, folderId: 'root' },
    { id: 'f3', name: 'Product Requirements.docx', type: 'doc', size: '2.1 MB', owner: 'Sara Khan', lastUpdated: '1 day ago', isPinned: true, usage: 40, folderId: 'root' },
    { id: 'f4', name: 'Design System.fig', type: 'figma', size: '24.6 MB', owner: 'Michelle', lastUpdated: '1 day ago', aiStatus: 'high_usage', isPinned: true, usage: 95, folderId: 'root' },
    { id: 'f5', name: 'Sprint 12 Assets', type: 'folder_ref', size: '32 files', owner: 'Sayab Ali', lastUpdated: '1 hour ago', aiStatus: 'recently_modified', usage: 70, folderId: 'root' },
    { id: 'f6', name: 'User Research Report.pdf', type: 'pdf', size: '5.4 MB', owner: 'John Smith', lastUpdated: '2 hours ago', isStarred: true, usage: 50, folderId: 'root' },
    { id: 'f7', name: 'Q2 Business Review.pptx', type: 'ppt', size: '16.8 MB', owner: 'Alex Johnson', lastUpdated: '3 hours ago', isStarred: true, usage: 30, folderId: 'root' },
    { id: 'f8', name: 'IMG_2024_Design.png', type: 'image', size: '1.2 MB', owner: 'Sara Khan', lastUpdated: '5 hours ago', usage: 20, thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=200&fit=crop', folderId: 'root' },
    { id: 'f9', name: 'Product Demo.mp4', type: 'video', size: '45.2 MB', owner: 'John Smith', lastUpdated: '6 hours ago', usage: 90, folderId: 'root' },
    { id: 'f10', name: 'Mobile App UI Kit.fig', type: 'figma', size: '18.3 MB', owner: 'Michelle', lastUpdated: '1 day ago', isStarred: true, usage: 75, folderId: 'root' },
    { id: 'f11', name: 'Meeting Notes.docx', type: 'doc', size: '1.1 MB', owner: 'Sara Khan', lastUpdated: '3 hours ago', usage: 15, folderId: 'root' },
    { id: 'f12', name: 'Analytics Dashboard.xlsx', type: 'excel', size: '9.3 MB', owner: 'Alex Johnson', lastUpdated: '5 days ago', aiStatus: 'at_risk', usage: 10, folderId: 'root' },
];

const INITIAL_FOLDERS: FolderItem[] = [
    { id: 'all', name: 'All Files', itemCount: 2451 },
    { id: 'projects', name: 'Project Folders', itemCount: 1245 },
    { id: 'ecommerce', name: 'E-Commerce Platform', parentId: 'projects', itemCount: 342, color: '#FFAB00' },
    { id: 'mobile', name: 'Mobile Application', parentId: 'projects', itemCount: 198, color: '#0052CC' },
    { id: 'marketing', name: 'Marketing Campaign', parentId: 'projects', itemCount: 156, color: '#36B37E' },
    { id: 'personal', name: 'Personal', itemCount: 320 },
    { id: 'team', name: 'Team Folders', itemCount: 886 },
    { id: 'shared', name: 'Shared Folders', itemCount: 431 },
    { id: 'archived', name: 'Archived', itemCount: 112 },
    { id: 'trash', name: 'Trash', itemCount: 28 },
];

// --- Helper Functions ---

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText className="text-red-500" />;
        case 'excel': return <Table className="text-green-600" />;
        case 'doc': return <FileText className="text-blue-600" />;
        case 'ppt': return <FileBarChart2 className="text-orange-500" />;
        case 'image': return <Image className="text-purple-500" />;
        case 'video': return <FileVideo className="text-indigo-500" />;
        case 'figma': return <Zap className="text-pink-500" />;
        case 'folder_ref': return <Folder className="text-yellow-500" />;
        default: return <File className="text-gray-400" />;
    }
};

const Table = ({ className }: { className?: string }) => <div className={className}><Grid size={16} /></div>;

// --- Main Component ---

export default function FilesPage() {
    const [view, setView] = useState<'grid' | 'list' | 'timeline' | 'activity'>('grid');
    const [tab, setTab] = useState('All Files');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(INITIAL_FILES[0]);
    const [rightPanelTab, setRightPanelTab] = useState<'details' | 'activity' | 'comments' | 'versions'>('details');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

    const filteredFiles = useMemo(() => {
        let files = INITIAL_FILES.filter(f => 
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (tab === 'Documents') {
            files = files.filter(f => ['doc', 'pdf', 'excel', 'ppt'].includes(f.type));
        } else if (tab === 'Media') {
            files = files.filter(f => ['image', 'video'].includes(f.type));
        } else if (tab === 'Favorites') {
            files = files.filter(f => f.isStarred);
        } else if (tab === 'Trash') {
            files = [INITIAL_FILES[INITIAL_FILES.length - 1]]; // Mock trash
        }

        return files;
    }, [searchQuery, tab]);


    const pinnedFiles = filteredFiles.filter(f => f.isPinned);
    const recentFiles = filteredFiles.filter(f => !f.isPinned);

    return (
        <main className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-[240px] transition-all duration-300">
                {/* 1. TOP BAR */}
                <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-4 flex-1 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search files, folders or content..." 
                                className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-1.5 py-0.5 rounded">⌘ K</span>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors border border-purple-100">
                            <Sparkles size={16} />
                            <span>AI Search</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
                            <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Upload</button>
                            <Link href="/documents" className="px-3 py-1.5 bg-white text-xs font-bold text-blue-600 rounded-md shadow-sm border border-gray-200/50 flex items-center gap-1.5">
                                <FilePlus size={14} /> New Doc
                            </Link>
                        </div>
                    </div>
                </header>

                {/* 1.1 SUB TABS */}
                <div className="bg-white border-b border-gray-200 px-8 py-2 flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {['All Files', 'Documents', 'Media', 'Shared', 'Recent', 'Favorites', 'Trash'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setTab(t)}
                            className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-all ${
                                tab === t ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* 2. MAIN AREA */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Files</h1>
                            <p className="text-sm text-gray-500 mt-1">All your project files, documents, and assets in one intelligent workspace.</p>
                        </div>

                        {/* 3. SMART CARDS */}
                        <div className="grid grid-cols-5 gap-4 mb-8">
                            {[
                                { label: 'Total Files', value: '2,451', trend: '+18% this month', icon: Files, color: 'blue' },
                                { label: 'Documents', value: '1,128', sub: '46% of total', icon: FileText, color: 'green' },
                                { label: 'Media', value: '892', sub: '36% of total', icon: Image, color: 'purple' },
                                { label: 'Shared', value: '431', sub: '17% of total', icon: Users, color: 'orange' },
                                { label: 'Storage Used', value: '68.4 GB', sub: '/ 200 GB', progress: 34, icon: HardDrive, color: 'slate' },
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                                            <card.icon size={20} />
                                        </div>
                                        {card.trend && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{card.trend}</span>}
                                    </div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">{card.value}</div>
                                    {card.sub && <div className="text-[11px] text-gray-500 mt-1 font-medium">{card.sub}</div>}
                                    {card.progress && (
                                        <div className="mt-3">
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${card.progress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 4. VIEW SWITCHER & FILTERS */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                                {[
                                    { id: 'grid', icon: Grid, label: 'Grid' },
                                    { id: 'list', icon: List, label: 'List' },
                                    { id: 'timeline', icon: CalendarIcon, label: 'Timeline' },
                                    { id: 'activity', icon: Activity, label: 'Activity' },
                                ].map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setView(v.id as any)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                            view === v.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        <v.icon size={16} />
                                        <span>{v.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                                    <span className="text-xs font-semibold text-gray-500">Type:</span>
                                    <select className="text-xs font-bold text-gray-900 bg-transparent outline-none cursor-pointer">
                                        <option>All</option>
                                        <option>Documents</option>
                                        <option>Media</option>
                                        <option>Code</option>
                                    </select>
                                </div>
                                <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:text-blue-600 transition-colors">
                                    <SlidersHorizontal size={18} />
                                </button>
                                <button 
                                    onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                                    className={`p-2 border border-gray-200 rounded-lg bg-white transition-colors ${isRightPanelOpen ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    <PanelRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* 5. CONTENT AREA BY VIEW */}
                        <div className="flex gap-8">
                            {/* LEFT SIDEBAR (Internal) */}
                            <div className="w-64 flex-shrink-0 flex flex-col gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Folders</span>
                                        <button className="text-gray-400 hover:text-blue-600 transition-colors"><Plus size={16}/></button>
                                    </div>
                                    <div className="space-y-1">
                                        {INITIAL_FOLDERS.filter(f => !f.parentId).map(folder => (
                                            <FolderNavItem key={folder.id} folder={folder} active={folder.id === 'all'} />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filters</span>
                                        <button className="text-[10px] font-bold text-blue-600 hover:underline transition-colors uppercase">Clear All</button>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <span className="text-xs font-bold text-gray-600 block mb-3">File Type</span>
                                        <div className="grid grid-cols-4 gap-3 mb-6">
                                            {[
                                                { icon: Files, color: 'blue', label: 'All' },
                                                { icon: FileText, color: 'blue', label: 'Docs' },
                                                { icon: Table, color: 'green', label: 'Sheets' },
                                                { icon: FileBarChart2, color: 'orange', label: 'Slides' },
                                                { icon: FileText, color: 'red', label: 'PDF' },
                                                { icon: Image, color: 'purple', label: 'Images' },
                                                { icon: FileVideo, color: 'indigo', label: 'Videos' },
                                                { icon: MoreHorizontal, color: 'slate', label: 'Others' },
                                            ].map((f, i) => (
                                                <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer">
                                                    <div className={`p-2 rounded-lg bg-${f.color}-50 text-${f.color}-600 group-hover:scale-110 transition-transform`}>
                                                        <f.icon size={14} />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">{f.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 block mb-3">Tags</span>
                                        <div className="flex flex-wrap gap-2">
                                            {['Design', 'Development', 'Research', 'Marketing', 'Finance', 'Product'].map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-md border border-gray-100 hover:border-blue-200 hover:text-blue-600 cursor-pointer transition-all">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <button className="w-full text-center text-[10px] font-bold text-blue-600 mt-4 hover:underline">More filters</button>
                                    </div>
                                </div>
                            </div>

                            {/* MAIN GRID/LIST/ETC */}
                            <div className="flex-1 min-w-0">
                                {view === 'grid' && (
                                    <div className="space-y-10">
                                        {/* Pinned Files */}
                                        {pinnedFiles.length > 0 && (
                                            <section>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold text-gray-900">Pinned Files</h3>
                                                        <div className="h-1 w-1 bg-gray-300 rounded-full" />
                                                        <Pin size={14} className="text-blue-500" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-6">
                                                    {pinnedFiles.map(file => (
                                                        <FileCard key={file.id} file={file} isSelected={selectedFile?.id === file.id} onClick={() => setSelectedFile(file)} />
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* Recent Files */}
                                        <section>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-bold text-gray-900">
                                                    {tab === 'All Files' ? 'Recent Files' : `${tab}`}
                                                </h3>
                                                <button className="text-[11px] font-bold text-blue-600 hover:underline">View all</button>
                                            </div>
                                            {recentFiles.length > 0 ? (
                                                <div className="grid grid-cols-4 gap-4">
                                                    {recentFiles.map(file => (
                                                        <FileCard key={file.id} file={file} isSelected={selectedFile?.id === file.id} onClick={() => setSelectedFile(file)} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                                    <File size={48} className="text-gray-300 mb-4" />
                                                    <p className="text-sm font-bold text-gray-900">No files found</p>
                                                    <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                                                </div>
                                            )}
                                        </section>

                                        {/* File Insights Dashboard (Mini) */}
                                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-12">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-sm font-bold text-gray-900">Files Insights</h3>
                                                <button className="text-[11px] font-bold text-blue-600 hover:underline">View all insights</button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-6">
                                                {[
                                                    { label: 'Most Accessed', name: 'User Research Report.pdf', stat: 'Accessed 26 times', trend: '↑ 32%', icon: Eye, color: 'blue' },
                                                    { label: 'Recently Updated', name: '8 files updated today', stat: 'Last update: 5m ago', trend: '↑ 14% vs yesterday', icon: RotateCcw, color: 'green' },
                                                    { label: 'Large Files', name: '5 files over 100MB', stat: 'Total: 2.3 GB', icon: HardDrive, color: 'purple' },
                                                    { label: 'Unused Files', name: '12 files not accessed', stat: 'In 30+ days', icon: AlertCircle, color: 'red' },
                                                ].map((ins, i) => (
                                                    <div key={i} className="flex gap-4 group">
                                                        <div className={`w-10 h-10 rounded-xl bg-${ins.color}-50 flex-shrink-0 flex items-center justify-center text-${ins.color}-600 group-hover:scale-110 transition-transform`}>
                                                            <ins.icon size={20} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{ins.label}</div>
                                                            <div className="text-xs font-bold text-gray-900 truncate mb-1">{ins.name}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-gray-500">{ins.stat}</span>
                                                                {ins.trend && <span className="text-[10px] font-bold text-green-600">{ins.trend}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section> section
                                    </div>
                                )}

                                {view === 'list' && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-gray-50/50">
                                                <tr className="text-left">
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Name</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Type</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Owner</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Size</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Last Updated</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredFiles.map(file => (
                                                    <tr 
                                                        key={file.id} 
                                                        onClick={() => setSelectedFile(file)}
                                                        className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${selectedFile?.id === file.id ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                                                                    {getFileIcon(file.type)}
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-900">{file.name}</span>
                                                                {file.isPinned && <Pin size={12} className="text-blue-500" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{file.type}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                                    {file.owner.substring(0,2)}
                                                                </div>
                                                                <span className="text-xs font-medium text-gray-700">{file.owner}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-500">{file.size}</td>
                                                        <td className="px-6 py-4 text-xs text-gray-500">{file.lastUpdated}</td>
                                                        <td className="px-6 py-4">
                                                            {file.aiStatus ? (
                                                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                                    file.aiStatus === 'outdated' ? 'bg-amber-100 text-amber-700' :
                                                                    file.aiStatus === 'high_usage' ? 'bg-blue-100 text-blue-700' :
                                                                    file.aiStatus === 'recently_modified' ? 'bg-green-100 text-green-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {file.aiStatus.replace('_', ' ')}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Normal</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                
                                {(view === 'timeline' || view === 'activity') && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <Activity size={48} className="text-gray-300 mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900">{view.charAt(0).toUpperCase() + view.slice(1)} View</h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-sm text-center">This feature is part of the Enterprise expansion. Activity bursts and timeline plots will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 6. RIGHT PANEL (CONTEXT PANEL) */}
                    {isRightPanelOpen && (
                        <aside className="w-[320px] bg-white border-l border-gray-200 overflow-y-auto no-scrollbar flex flex-col sticky top-0 h-full animate-in slide-in-from-right duration-300">
                            {selectedFile ? (
                                <>
                                    {/* Panel Tabs */}
                                    <div className="flex border-b border-gray-100 p-2">
                                        {['details', 'activity', 'comments', 'versions'].map((t) => (
                                            <button 
                                                key={t}
                                                onClick={() => setRightPanelTab(t as any)}
                                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-md ${
                                                    rightPanelTab === t ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                            >
                                                {t} {t === 'comments' && <span className="ml-1 opacity-50">6</span>}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Preview Area */}
                                    <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
                                        <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden group mb-4">
                                            {selectedFile.thumbnail ? (
                                                <img src={selectedFile.thumbnail} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="text-5xl mb-2">{getFileIcon(selectedFile.type)}</div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedFile.type}</div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"><Eye size={20}/></button>
                                                <button className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"><Download size={20}/></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 justify-center w-full">
                                            <h2 className="text-base font-bold text-gray-900 truncate">{selectedFile.name}</h2>
                                            <button className="text-gray-400 hover:text-yellow-500"><Star size={16} fill={selectedFile.isStarred ? 'currentColor' : 'none'} /></button>
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{selectedFile.type.toUpperCase()} DOCUMENT • {selectedFile.size}</p>
                                    </div>

                                    {/* Details Content */}
                                    <div className="p-6 space-y-8">
                                        {rightPanelTab === 'details' && (
                                            <>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-gray-400 uppercase">Location</span>
                                                        <span className="font-semibold text-gray-700 truncate max-w-[160px]">/Project Folders/E-Commerce</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-gray-400 uppercase">Owner</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">{selectedFile.owner.substring(0,2)}</div>
                                                            <span className="font-semibold text-gray-700">{selectedFile.owner}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-gray-400 uppercase">Created</span>
                                                        <span className="font-semibold text-gray-700">May 20, 2024, 10:30 AM</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-gray-400 uppercase">Updated</span>
                                                        <span className="font-semibold text-gray-700">May 25, 2024, 2:45 PM</span>
                                                    </div>
                                                </div>

                                                {/* AI INSIGHTS */}
                                                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                                            <Sparkles size={14} />
                                                        </div>
                                                        <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">AI Insights</span>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 uppercase mb-1">
                                                                <MessageSquare size={10} /> Summary
                                                            </div>
                                                            <p className="text-[11px] text-purple-800/80 leading-relaxed">
                                                                This proposal outlines the complete plan for the e-commerce platform including core features, tech stack, timeline and budget.
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 uppercase mb-1">
                                                                <Search size={10} /> Key Points
                                                            </div>
                                                            <ul className="text-[11px] text-purple-800/80 space-y-1 ml-4 list-disc">
                                                                <li>Timeline: 12 weeks</li>
                                                                <li>Budget: $120,000</li>
                                                                <li>Team: 8 members</li>
                                                                <li>Priority: High</li>
                                                            </ul>
                                                        </div>

                                                        <button className="w-full flex items-center justify-center gap-2 py-2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-200/50 hover:bg-purple-200 transition-colors">
                                                            <BrainCircuit size={12} />
                                                            Ask AI about this file
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* LINKED TO */}
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Linked To</span>
                                                    <div className="space-y-2">
                                                        {[
                                                            { label: 'E-Commerce Platform', type: 'Project', icon: FolderKanban, color: 'blue' },
                                                            { label: 'Sprint 12', type: 'Sprint', icon: Zap, color: 'amber' },
                                                            { label: 'Design System', type: 'Task', icon: CheckSquare, color: 'rose' },
                                                        ].map((link, i) => (
                                                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                                                <div className={`w-8 h-8 rounded-lg bg-${link.color}-50 text-${link.color}-600 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                                                    <link.icon size={16} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-[11px] font-bold text-gray-900 truncate">{link.label}</div>
                                                                    <div className="text-[9px] font-bold text-gray-400 uppercase">{link.type}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {rightPanelTab === 'activity' && (
                                            <div className="space-y-6">
                                                {[
                                                    { user: 'Sayab Ali', action: 'uploaded v2.4', time: '1 hour ago', icon: Upload },
                                                    { user: 'Alex Johnson', action: 'added a comment', time: '3 hours ago', icon: MessageSquare },
                                                    { user: 'Sara Khan', action: 'viewed the file', time: '5 hours ago', icon: Eye },
                                                    { user: 'Michelle', action: 'renamed the file', time: '1 day ago', icon: Pencil },
                                                ].map((act, i) => (
                                                    <div key={i} className="flex gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <act.icon size={12} className="text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] text-gray-900 leading-tight">
                                                                <span className="font-bold">{act.user}</span> {act.action}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{act.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {rightPanelTab === 'comments' && (
                                            <div className="space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                                                        <p className="text-[11px] font-bold text-gray-900 mb-1">Sayab Ali</p>
                                                        <p className="text-[11px] text-gray-600 leading-relaxed">Can we update the budget section in the proposal? Some costs have changed.</p>
                                                        <p className="text-[9px] text-gray-400 mt-2">2:30 PM</p>
                                                    </div>
                                                </div>
                                                <div className="relative mt-8">
                                                    <textarea 
                                                        placeholder="Write a comment..." 
                                                        className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                                    />
                                                    <button className="absolute bottom-3 right-3 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-blue-700">Post</button>
                                                </div>
                                            </div>
                                        )}

                                        {rightPanelTab === 'versions' && (
                                            <div className="space-y-3">
                                                {[
                                                    { v: 'v2.4', date: 'May 25, 2024', owner: 'Sayab Ali', current: true },
                                                    { v: 'v2.3', date: 'May 23, 2024', owner: 'Alex Johnson' },
                                                    { v: 'v2.0', date: 'May 20, 2024', owner: 'Sayab Ali' },
                                                    { v: 'v1.0', date: 'May 15, 2024', owner: 'System' },
                                                ].map((v, i) => (
                                                    <div key={i} className={`p-3 rounded-xl border transition-all cursor-pointer group ${v.current ? 'bg-blue-50 border-blue-100 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-900">{v.v}</span>
                                                                {v.current && <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase">Current</span>}
                                                            </div>
                                                            <button className="p-1 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"><RotateCcw size={14}/></button>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                                                            <span>{v.date}</span>
                                                            <span>by {v.owner}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                                    <Info size={40} className="text-gray-300 mb-4" />
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Select a file</p>
                                    <p className="text-[11px] text-gray-500 mt-2">Choose a file to view details, insights and activity timeline.</p>
                                </div>
                            )}
                        </aside>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}

// --- Sub-Components ---

function FolderNavItem({ folder, active = false }: { folder: FolderItem; active?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = INITIAL_FOLDERS.some(f => f.parentId === folder.id);
    const children = INITIAL_FOLDERS.filter(f => f.parentId === folder.id);

    return (
        <div>
            <div 
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    active ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                {hasChildren ? (
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                ) : (
                    <div className="w-3.5 h-3.5" />
                )}
                <div className={`p-1.5 rounded-lg ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Folder size={14} fill={folder.color || 'currentColor'} className={folder.color ? '' : 'text-gray-500'} />
                </div>
                <span className="text-sm flex-1 truncate">{folder.name}</span>
                {folder.itemCount && (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100/50 px-1.5 py-0.5 rounded-lg group-hover:bg-white transition-colors">
                        {folder.itemCount.toLocaleString()}
                    </span>
                )}
            </div>
            
            {hasChildren && isOpen && (
                <div className="ml-6 mt-1 space-y-1">
                    {children.map(child => (
                        <div key={child.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: child.color || '#CBD5E1' }} />
                            <span className="text-xs truncate">{child.name}</span>
                            <span className="text-[9px] font-bold opacity-50 ml-auto">{child.itemCount}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function FileCard({ file, isSelected, onClick }: { file: FileItem; isSelected: boolean; onClick: () => void }) {
    return (
        <div 
            onClick={onClick}
            className={`group relative bg-white p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-xl hover:translate-y-[-4px] ${
                isSelected ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' : 'border-gray-100 shadow-sm'
            }`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {getFileIcon(file.type)}
                </div>
                <div className="flex items-center gap-1.5">
                    {file.aiStatus && (
                        <div className={`p-1 rounded-md bg-opacity-10 ${
                            file.aiStatus === 'outdated' ? 'bg-amber-500 text-amber-600' :
                            file.aiStatus === 'high_usage' ? 'bg-blue-500 text-blue-600' :
                            file.aiStatus === 'recently_modified' ? 'bg-green-500 text-green-600' :
                            'bg-red-500 text-red-600'
                        }`}>
                            {file.aiStatus === 'outdated' ? <AlertCircle size={14} /> : 
                             file.aiStatus === 'high_usage' ? <Flame size={14} /> : 
                             file.aiStatus === 'recently_modified' ? <RotateCcw size={14} /> :
                             <ShieldCheck size={14} />}
                        </div>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {file.thumbnail && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100 shadow-inner">
                    <img src={file.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            )}

            <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{file.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{file.type}</span>
                    <div className="h-1 w-1 bg-gray-300 rounded-full" />
                    <span className="text-[10px] font-bold text-gray-400">{file.size}</span>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white uppercase shadow-sm">
                            {file.owner.substring(0,2)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">{file.owner}</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">Updated {file.lastUpdated}</span>
                </div>
            </div>

            {/* AI Status Badge (Floating) */}
            {file.aiStatus && (
                <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm border ${
                    file.aiStatus === 'outdated' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    file.aiStatus === 'high_usage' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    file.aiStatus === 'recently_modified' ? 'bg-green-50 text-green-700 border-green-100' :
                    'bg-red-50 text-red-700 border-red-100'
                }`}>
                    {file.aiStatus.replace('_', ' ')}
                </div>
            )}
        </div>
    );
}


const Settings = ({ size, className }: { size?: number, className?: string }) => <MoreHorizontal size={size} className={className} />;
const FolderTree = ({ size, className }: { size?: number, className?: string }) => <div className={className}><Folder size={size} /></div>;
const FolderKanban = ({ size, className }: { size?: number, className?: string }) => <FolderTree size={size} className={className} />;
const FileBarChart2 = ({ size, className }: { size?: number, className?: string }) => <BarChart2 size={size} className={className} />;

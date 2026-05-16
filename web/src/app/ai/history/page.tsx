"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    History, Clock, Download, Play, 
    Filter, FileText, Search, Activity,
    Zap, Brain, Target, Shield,
    Workflow, List, LayoutGrid, Calendar,
    Plus, Share2, ArrowRight, ChevronRight,
    AlertTriangle, BrainCircuit, Cpu, ZapOff
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { HistoryHero } from '@/components/ai/history/HistoryHero';
import { HistoryTimeline } from '@/components/ai/history/HistoryTimeline';
import { DecisionLog } from '@/components/ai/history/DecisionLog';
import { HistorySidebar } from '@/components/ai/history/HistorySidebar';

export default function AIHistoryPage() {
    const [activeView, setActiveView] = useState('Timeline');

    return (
        <main className="flex min-h-screen bg-[#F8FAFF]">
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 ml-[260px]">
                {/* TOP HEADER */}
                <header className="flex items-center justify-between px-10 py-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-black text-gray-900">AI History</h1>
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                <History size={20} />
                            </div>
                        </div>
                        <p className="text-[13px] font-medium text-gray-400 italic">
                            Complete AI operational history, reasoning, and execution intelligence.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Download size={14} className="text-indigo-600" />
                            Export Timeline
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Play size={14} className="text-indigo-600" />
                            AI Replay
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Filter size={14} className="text-indigo-600" />
                            Filter Events
                        </button>
                        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 ml-2">
                            <FileText size={16} />
                            Audit Report
                        </button>
                    </div>
                </header>

                <div className="px-10 pb-12">
                    <div className="grid grid-cols-12 gap-8">
                        {/* LEFT & CENTER COLUMN */}
                        <div className="col-span-9 space-y-8 min-w-0">
                            <HistoryHero />

                            {/* TABS & FILTERS */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-8 border-b border-gray-100 pb-0.5">
                                    {['Timeline', 'Decision Log', 'Operational Changes', 'Predictions', 'Execution Logs'].map((tab, i) => (
                                        <button 
                                            key={tab} 
                                            onClick={() => setActiveView(tab)}
                                            className={`pb-4 text-[10px] font-black uppercase tracking-[0.1em] transition-all relative ${
                                                activeView === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            {tab}
                                            {activeView === tab && <motion.div layoutId="activeHistoryTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                                        <input 
                                            type="text" 
                                            placeholder="Search history..." 
                                            className="bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-[11px] font-medium focus:outline-none shadow-sm w-44 h-9"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl shadow-sm h-9">
                                        <button className="p-1 bg-indigo-50 text-indigo-600 rounded-lg transition-all"><List size={13} /></button>
                                        <button className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg transition-all"><LayoutGrid size={13} /></button>
                                    </div>
                                </div>
                            </div>

                            {activeView === 'Timeline' ? <HistoryTimeline /> : <DecisionLog />}
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="col-span-3">
                            <HistorySidebar />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

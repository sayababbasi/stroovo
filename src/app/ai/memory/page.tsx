"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    BrainCircuit, Sparkles, Plus, Share2, 
    Download, LayoutGrid, List, Search,
    Filter, Database, Network, Workflow,
    Cpu, Target, History, Settings,
    FileSearch, Activity, Brain, Globe,
    Shield, Layers, MessageSquare, BarChart3,
    ArrowUpRight, Clock, ChevronRight
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { MemoryHero } from '@/components/ai/memory/MemoryHero';
import { MemoryTable } from '@/components/ai/memory/MemoryTable';
import { MemoryAssistant } from '@/components/ai/memory/MemoryAssistant';
import { MemoryExtra } from '@/components/ai/memory/MemoryExtra';

export default function AIMemoryPage() {
    const [activeTab, setActiveTab] = useState('All Memories');

    const tabs = [
        { name: 'All Memories', icon: Database },
        { name: 'Knowledge Graph', icon: Network },
        { name: 'Patterns', icon: Activity },
        { name: 'Entities', icon: Target },
        { name: 'Relationships', icon: Globe },
        { name: 'Learning History', icon: History }
    ];

    return (
        <main className="flex min-h-screen bg-[#F8FAFF]">
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 ml-[260px]">
                {/* TOP HEADER */}
                <header className="flex items-center justify-between px-10 py-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-black text-gray-900">AI Memory</h1>
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Brain size={20} />
                            </div>
                        </div>
                        <p className="text-[13px] font-medium text-gray-400 italic">
                            Persistent organizational intelligence and contextual memory system.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                            <Plus size={16} />
                            Create Memory
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Sparkles size={14} className="text-indigo-600" />
                            AI Organize
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Download size={14} className="text-indigo-600" />
                            Import Knowledge
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <BarChart3 size={14} className="text-indigo-600" />
                            Memory Analytics
                        </button>
                    </div>
                </header>

                <div className="px-10 pb-12">
                    <div className="grid grid-cols-12 gap-8">
                        {/* LEFT & CENTER COLUMN */}
                        <div className="col-span-9 space-y-8 min-w-0">
                            <MemoryHero />

                            {/* TABS & FILTERS */}
                            <div className="flex flex-wrap items-center justify-between gap-6 mb-4">
                                <div className="flex items-center gap-8 border-b border-gray-100 pb-0.5 overflow-x-auto no-scrollbar">
                                    {tabs.map((tab) => (
                                        <button 
                                            key={tab.name} 
                                            onClick={() => setActiveTab(tab.name)}
                                            className={`pb-4 text-[10px] font-black uppercase tracking-[0.1em] transition-all relative whitespace-nowrap flex items-center gap-2 ${
                                                activeTab === tab.name ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            <tab.icon size={13} />
                                            {tab.name}
                                            {activeTab === tab.name && (
                                                <motion.div 
                                                    layoutId="activeMemoryTab" 
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                                        <input 
                                            type="text" 
                                            placeholder="Search memories, entities, patterns..." 
                                            className="bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-[11px] font-medium focus:outline-none shadow-sm w-64 h-9"
                                        />
                                    </div>
                                    <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                                        <Filter size={14} />
                                    </button>
                                    <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl shadow-sm h-9">
                                        <button className="p-1 bg-indigo-50 text-indigo-600 rounded-lg transition-all"><LayoutGrid size={13} /></button>
                                        <button className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg transition-all"><List size={13} /></button>
                                    </div>
                                </div>
                            </div>

                            <MemoryTable />
                            
                            <MemoryExtra />
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="col-span-3 space-y-6">
                            <MemoryAssistant />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

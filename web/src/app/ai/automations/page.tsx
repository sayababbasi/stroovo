"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Sparkles, Filter, Search, 
    LayoutGrid, List, FileText, BarChart3,
    Settings, Zap, Box, Layout, Bell,
    ChevronDown, ChevronRight, HelpCircle
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { AutomationHero } from '@/components/ai/automations/AutomationHero';
import { AutomationGrid } from '@/components/ai/automations/AutomationGrid';
import { AutomationAssistant } from '@/components/ai/automations/AutomationAssistant';
import { AutomationExtra } from '@/components/ai/automations/AutomationExtra';

export default function AIAutomationsPage() {
    return (
        <main className="flex min-h-screen bg-[#F8FAFF]">
            {/* Sidebar from your workspace */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 ml-[260px]">
                {/* TOP HEADER */}
                <header className="flex items-center justify-between px-8 py-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-1">AI Automations</h1>
                        <p className="text-[13px] font-medium text-gray-400">Autonomous operational automation powered by Stroovo AI.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Sparkles size={14} className="text-indigo-600" />
                            AI Auto Builder
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Box size={14} className="text-indigo-600" />
                            Templates
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <BarChart3 size={14} className="text-indigo-600" />
                            Analytics
                        </button>
                        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 ml-2">
                            <Plus size={16} />
                            Create Automation
                        </button>
                    </div>
                </header>

                <div className="px-8 pb-12">
                    <div className="grid grid-cols-12 gap-8">
                        {/* LEFT & CENTER COLUMN */}
                        <div className="col-span-8 space-y-8 min-w-0">
                            <AutomationHero />

                            {/* TABS & FILTERS */}
                            <div className="flex flex-wrap items-center justify-between gap-6 mb-4">
                                <div className="flex items-center gap-6 border-b border-gray-100 pb-0.5 overflow-x-auto no-scrollbar">
                                    {['All Automations', 'Operational', 'AI Decision', 'Predictive', 'Integration', 'System'].map((tab, i) => (
                                        <button 
                                            key={tab} 
                                            className={`pb-4 text-[9px] font-black uppercase tracking-[0.1em] transition-all relative whitespace-nowrap ${
                                                i === 0 ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            {tab}
                                            {i === 0 && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="flex items-center gap-3 ml-auto">
                                    <select className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-600 focus:outline-none shadow-sm cursor-pointer h-9">
                                        <option>All Status</option>
                                    </select>
                                    <select className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-600 focus:outline-none shadow-sm cursor-pointer h-9">
                                        <option>All Owners</option>
                                    </select>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                                        <input 
                                            type="text" 
                                            placeholder="Search..." 
                                            className="bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-[11px] font-medium focus:outline-none shadow-sm w-32 h-9"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl shadow-sm h-9">
                                        <button className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg transition-all"><LayoutGrid size={13} /></button>
                                        <button className="p-1 bg-indigo-50 text-indigo-600 rounded-lg transition-all"><List size={13} /></button>
                                    </div>
                                </div>
                            </div>

                            <AutomationGrid />
                            
                            <AutomationExtra />
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="col-span-4 min-w-0">
                            <AutomationAssistant />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

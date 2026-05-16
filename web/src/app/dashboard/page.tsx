"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Stroovo Executive Intelligence Engine - Stable v1.0
import { 
    LayoutDashboard, Brain, Zap, Target, 
    Shield, Activity, TrendingUp, Users,
    Search, Bell, Sparkles, Command,
    Settings, MoreHorizontal, Download,
    Plus, Play, Filter, BarChart3,
    Cpu, Network, Database, ShieldCheck,
    ArrowUpRight, Clock, Box, Globe,
    Workflow, MessageSquare, Briefcase,
    ChevronDown, ChevronRight, AlertTriangle
} from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import { ExecutiveHeader } from '../../components/dashboard/ExecutiveHeader';
import { KPISection } from '../../components/dashboard/KPISection';
import { AIInsightsPanel } from '../../components/dashboard/AIInsightsPanel';
import { OperationsCenter } from '../../components/dashboard/OperationsCenter';
import { ProjectGrid } from '../../components/dashboard/ProjectGrid';
import { TeamPerformance } from '../../components/dashboard/TeamPerformance';
import { AIControlSystem } from '../../components/dashboard/AIControlSystem';
import { ActionCenter } from '../../components/dashboard/ActionCenter';
import { ReportingPanel } from '../../components/dashboard/ReportingPanel';
import { ExecutiveIntelligence } from '../../components/dashboard/ExecutiveIntelligence';
import { useAuth } from '@/contexts/AuthContext';

export default function ExecutiveDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Overview');
    const [isAIControlOpen, setIsAIControlOpen] = useState(false);

    const role = user?.role || 'CEO'; // Fallback for demo

    const tabs = [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Execution', icon: Zap },
        { name: 'Organization', icon: Globe },
        { name: 'AI Intelligence', icon: Brain },
        { name: 'Strategy', icon: Target },
        { name: 'Risk', icon: Shield }
    ];

    return (
        <main className="flex min-h-screen bg-[#F8FAFF]">
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 ml-[260px]">
                <ExecutiveHeader isAIMode={isAIControlOpen} />

                <div className="px-10 pb-12">
                    {/* TABS & MODES */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-8 border-b border-gray-100 pb-0.5">
                            {tabs.map((tab) => (
                                <button 
                                    key={tab.name} 
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative ${
                                        activeTab === tab.name ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <tab.icon size={14} />
                                        {tab.name}
                                    </div>
                                    {activeTab === tab.name && (
                                        <motion.div 
                                            layoutId="activeDashTab" 
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsAIControlOpen(!isAIControlOpen)}
                                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 shadow-lg ${
                                    isAIControlOpen 
                                    ? 'bg-indigo-600 text-white shadow-indigo-500/20' 
                                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                                }`}
                            >
                                <Cpu size={16} />
                                AI Control Center
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isAIControlOpen ? 'bg-white' : 'bg-indigo-500'}`} />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isAIControlOpen ? (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <KPISection role={role} />
                                <ExecutiveIntelligence role={role} />
                                <div className="grid grid-cols-12 gap-8">
                                    <div className="col-span-8 space-y-8">
                                        <AIInsightsPanel role={role} />
                                        <OperationsCenter role={role} />
                                        {role !== 'CTO' && <ProjectGrid role={role} />}
                                    </div>
                                    <div className="col-span-4 space-y-8">
                                        <ActionCenter role={role} />
                                        <TeamPerformance role={role} />
                                        <ReportingPanel role={role} />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="ai-control"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <AIControlSystem role={role} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}

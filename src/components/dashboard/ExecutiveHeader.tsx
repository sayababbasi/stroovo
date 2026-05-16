"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, Bell, Command, User, 
    Sparkles, Brain, Settings, HelpCircle,
    ChevronDown, Activity, ShieldCheck, Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ExecutiveHeader = ({ isAIMode }: { isAIMode?: boolean }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="px-10 py-8 flex items-center justify-between sticky top-0 bg-[#F8FAFF]/80 backdrop-blur-md z-30">
            {/* GREETING & CONTEXT */}
            <div>
                {!isAIMode ? (
                    <>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                Good Morning, {user?.name?.split(' ')[0] || 'Executive'}
                            </h1>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                                Operational Health: 94%
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-[13px] font-medium text-gray-400 italic">
                                Your organization execution health improved by <span className="text-indigo-600 font-bold">12%</span> this week.
                            </p>
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                AI Control System
                            </h1>
                            <Sparkles size={20} className="text-indigo-600" />
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 italic">
                            Control, monitor, and optimize your AI systems and automation operations.
                        </p>
                    </>
                )}
            </div>

            {/* AI COMMAND BAR */}
            <div className="flex-1 max-w-2xl mx-12">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Command size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ask AI or search organization... (Cmd + K)"
                        className="w-full bg-white border border-gray-100 rounded-[24px] pl-14 pr-12 py-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all placeholder:text-gray-300"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                            <Sparkles size={12} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-gray-400">AI</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* EXECUTIVE CONTROLS */}
            <div className="flex items-center gap-4">
                <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm relative group">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    <div className="absolute top-full right-0 mt-2 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        3 New Notifications
                    </div>
                </button>
                
                <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                    <Settings size={20} />
                </button>

                <div className="h-10 w-px bg-gray-100 mx-2" />

                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                    <div className="text-right">
                        <div className="text-xs font-black text-gray-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{user?.name || 'Executive'}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.role || 'Administrator'}</div>
                    </div>
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 border-2 border-white shadow-md overflow-hidden group-hover:scale-105 transition-transform">
                            {user?.image ? (
                                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                </div>
            </div>
        </header>
    );
};

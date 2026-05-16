"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Send, Sparkles, Cpu, 
    ArrowUpRight, Target, Clock,
    Zap, Activity, TrendingUp, ChevronRight
} from 'lucide-react';

const ImpactStat = ({ icon: Icon, label, value, trend }: any) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50 text-gray-400">
                <Icon size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-right">
            <div className="text-xs font-black text-gray-900">{value}</div>
            <div className="text-[9px] font-bold text-emerald-500 uppercase flex items-center justify-end gap-0.5">
                <ArrowUpRight size={10} />
                {trend}
            </div>
        </div>
    </div>
);

export const AutomationAssistant = () => {
    const [prompt, setPrompt] = useState('');

    return (
        <div className="space-y-6">
            {/* AI ASSISTANT CHAT */}
            <div className="bg-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <Sparkles size={16} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">AI Automation Assistant</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest">Beta</span>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                        <Cpu size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-100">Hi Sayab! I'm your AI Assistant.</p>
                        <p className="text-xs font-black">How can I help automate today?</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold transition-all text-left">
                        Build from prompt
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold transition-all text-left">
                        Optimize flows
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold transition-all text-left">
                        Suggest automation
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold transition-all text-left">
                        Explain failure
                    </button>
                </div>

                <div className="relative">
                    <input 
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what you want to automate..."
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-xs font-medium placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all pr-12"
                    />
                    <button className="absolute right-2 top-2 bottom-2 px-3 bg-white text-indigo-600 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* AUTOMATION IMPACT */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Automation Impact</h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">This Month</span>
                </div>
                
                <div className="space-y-1 divide-y divide-gray-50">
                    <ImpactStat icon={Clock} label="Total Time Saved" value="146.6 hrs" trend="31%" />
                    <ImpactStat icon={Target} label="Manual Tasks Reduced" value="1,247" trend="28%" />
                    <ImpactStat icon={Activity} label="Operational Efficiency" value="+18%" trend="15%" />
                    <ImpactStat icon={Zap} label="Cost Savings" value="$12,640" trend="22%" />
                </div>
            </div>

            {/* EXECUTION OVERVIEW CHART */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Execution Overview</h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">This Month</span>
                </div>
                
                <div className="h-32 flex items-end justify-between gap-1 mb-6">
                    {[30, 45, 35, 60, 40, 75, 50, 90, 65, 80, 55, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full relative h-full bg-gray-50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="absolute bottom-0 w-full bg-indigo-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-[9px] font-black text-gray-400 uppercase">Executions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-black text-gray-400 uppercase">Successful</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full" />
                        <span className="text-[9px] font-black text-gray-400 uppercase">Failed</span>
                    </div>
                </div>
            </div>

            {/* AUTOMATION HEALTH DONUT */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Automation Health</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Details</button>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 * 0.1} className="text-emerald-500" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-gray-900 leading-none">92%</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Healthy</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Healthy</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-900">68 (81%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Warning</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-900">11 (13%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Critical</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-900">5 (6%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Brain, Target, Shield, 
    Workflow, Activity, AlertTriangle,
    Clock, ArrowUpRight, TrendingUp, Sparkles,
    MessageSquare, Cpu, Layers
} from 'lucide-react';

const SidebarSection = ({ title, children, actionText }: any) => (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">{title}</h3>
            {actionText && (
                <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{actionText}</button>
            )}
        </div>
        {children}
    </div>
);

export const HistorySidebar = () => {
    return (
        <div className="space-y-6 sticky top-8">
            {/* LIVE AI EVENTS */}
            <SidebarSection title="Live AI Events" actionText="View Feed">
                <div className="space-y-4">
                    {[
                        { title: 'Predictive Analysis', desc: 'Sprint 16 risk scan active', icon: Target, color: 'indigo' },
                        { title: 'Auto-Optimization', desc: 'Resource rebalancing active', icon: Zap, color: 'blue' },
                        { title: 'Decision Logging', desc: 'Task priority #142 updated', icon: Brain, color: 'purple' }
                    ].map((event, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                            <div className={`w-8 h-8 rounded-lg bg-${event.color}-50 text-${event.color}-600 flex items-center justify-center shrink-0`}>
                                <event.icon size={14} className="animate-pulse" />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-gray-900">{event.title}</div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{event.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </SidebarSection>

            {/* CRITICAL ALERTS */}
            <div className="bg-rose-600 rounded-[32px] p-6 text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle size={16} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Critical Alerts</h3>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                        <div className="text-[11px] font-black mb-1">High Latency Detected</div>
                        <p className="text-[10px] font-medium text-rose-100 mb-3">API response times in Europe are exceeding SLA by 240%.</p>
                        <button className="w-full py-2 bg-white text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            Review AI Analysis
                        </button>
                    </div>
                </div>
            </div>

            {/* CURRENT PREDICTIONS */}
            <SidebarSection title="Current Predictions">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sprint Success Prob.</span>
                            <span className="text-[11px] font-black text-emerald-500">82%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '82%' }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delay Risk (Release 2.4.0)</span>
                            <span className="text-[11px] font-black text-amber-500">34%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '34%' }}
                                className="h-full bg-amber-500"
                            />
                        </div>
                    </div>
                </div>
            </SidebarSection>

            {/* OPERATIONAL INSIGHTS */}
            <SidebarSection title="AI Insights">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-gray-600 leading-relaxed">
                            AI suggests reassigning 4 non-critical tasks from <span className="text-gray-900">John</span> to prevent a predicted 2-day delay in <span className="text-gray-900">Sprint 16</span>.
                        </p>
                    </div>
                </div>
            </SidebarSection>
        </div>
    );
};

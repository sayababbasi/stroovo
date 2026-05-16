"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Settings, ToggleRight, ToggleLeft, 
    Radio, Workflow, MoreVertical, Shield, 
    AlertTriangle, CheckCircle2, History,
    Timer, BarChart3, Target, User, ChevronRight,
    TrendingUp, LineChart, MoreHorizontal
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, {
    headers: {
        'x-tenant-id': 'default-tenant',
        'x-user-id': 'admin@revoticai.com'
    }
}).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
});

const Sparkline = ({ color }: { color: string }) => (
    <div className="flex items-end gap-0.5 h-6">
        {[40, 70, 45, 90, 65, 85, 95].map((h, i) => (
            <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className={`w-1 rounded-full ${color}`}
                transition={{ delay: i * 0.1 }}
            />
        ))}
    </div>
);

export const AutomationGrid = () => {
    const { data: automations, error, isLoading } = useSWR('/api/ai/automations', fetcher);

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-50 rounded-2xl" />
                ))}
            </div>
        );
    }

    if (error || (automations && !Array.isArray(automations))) {
        return (
            <div className="p-8 bg-rose-50 border border-rose-100 rounded-[32px] text-center">
                <p className="text-rose-600 font-bold uppercase tracking-widest text-xs">Failed to load automations</p>
                <p className="text-[10px] text-rose-400 mt-2">The system encountered a synchronization issue. Please refresh the page.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-50">
                        <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Automation</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Health</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Executions</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Success Rate</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Time Saved</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Last Execution</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {automations?.map((auto: any) => (
                        <tr key={auto.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${
                                        auto.type === 'OPERATIONAL' ? 'bg-blue-50 text-blue-600' :
                                        auto.type === 'AI_DECISION' ? 'bg-purple-50 text-purple-600' :
                                        auto.type === 'PREDICTIVE' ? 'bg-indigo-50 text-indigo-600' :
                                        'bg-orange-50 text-orange-600'
                                    }`}>
                                        <Zap size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-900 mb-0.5">{auto.name}</div>
                                        <div className="text-[9px] font-medium text-gray-400 line-clamp-1">{auto.description}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                    auto.type === 'OPERATIONAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    auto.type === 'AI_DECISION' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    auto.type === 'PREDICTIVE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                    {auto.type.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-3 py-5">
                                <div className="flex justify-center">
                                    <div className="w-9 h-9 rounded-full border-2 border-emerald-50 flex items-center justify-center relative">
                                        <span className="text-[9px] font-black text-emerald-600">{auto.healthScore || 96}</span>
                                        <div className="absolute inset-0 border-2 border-emerald-500 rounded-full border-t-transparent animate-spin-slow opacity-20" />
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <div className="text-center">
                                    <div className="text-[11px] font-black text-gray-900 mb-0.5">{(auto.executionCount || 1248).toLocaleString()}</div>
                                    <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-emerald-500 uppercase">
                                        <TrendingUp size={9} />
                                        <span>18%</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-gray-900">{auto.successRate || 98.4}%</span>
                                    <Sparkline color={auto.successRate > 95 ? 'bg-emerald-400' : 'bg-amber-400'} />
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <div className="text-[11px] font-black text-gray-900 mb-0.5">{auto.timeSavedPerWeek || '24.6'} hrs</div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">per week</div>
                            </td>
                            <td className="px-3 py-5">
                                <div className="flex items-center gap-2 text-[11px] font-black text-gray-900">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    2m ago
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <button className="text-indigo-600 hover:scale-110 transition-transform">
                                    <ToggleRight size={24} />
                                </button>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                    <MoreHorizontal size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing 1 to 6 of 84 automations</span>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, '...', 14].map((p, i) => (
                        <button key={i} className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                            p === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-white hover:text-gray-900'
                        }`}>
                            {p}
                        </button>
                    ))}
                    <button className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-900 transition-all">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

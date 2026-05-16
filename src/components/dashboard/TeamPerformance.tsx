"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Activity, TrendingUp, AlertTriangle, 
    ArrowUpRight, ChevronRight, Brain, Clock,
    Zap, Sparkles, User, Target, BarChart3
} from 'lucide-react';

const TeamRow = ({ name, efficiency, risk, workload, color }: any) => (
    <div className="flex items-center justify-between py-4 group cursor-pointer border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                color === 'rose' ? 'bg-rose-50 text-rose-600' :
                'bg-blue-50 text-blue-600'
            } group-hover:scale-110 transition-transform shadow-sm`}>
                <Users size={18} />
            </div>
            <div>
                <div className="text-[11px] font-black text-gray-900 mb-0.5">{name}</div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Workload:</span>
                        <span className={`text-[9px] font-black ${workload > 85 ? 'text-rose-500' : 'text-emerald-500'}`}>{workload}%</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Efficiency:</span>
                        <span className="text-[9px] font-black text-indigo-600">{efficiency}%</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-right">
            <div className={`text-[10px] font-black uppercase tracking-widest ${
                risk === 'High' ? 'text-rose-500' : risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
            }`}>
                {risk} Risk
            </div>
            <div className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Burnout Factor</div>
        </div>
    </div>
);

export const TeamPerformance = ({ role }: { role: string }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                        <Target size={18} className="text-gray-400" />
                    </div>
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Team Performance & Risk</h3>
                </div>
                <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Full Analytics</button>
            </div>

            <div className="space-y-2 mb-8">
                <TeamRow name="Product Design" efficiency={94} risk="Low" workload={68} color="indigo" />
                <TeamRow name="Backend Core" efficiency={88} risk="High" workload={94} color="emerald" />
                <TeamRow name="QA Automation" efficiency={91} risk="Medium" workload={82} color="rose" />
                <TeamRow name="Growth Ops" efficiency={96} risk="Low" workload={45} color="blue" />
            </div>

            <div className="p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full -mr-8 -mt-8" />
                
                <div className="flex items-center gap-2 mb-4">
                    <Brain size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Burnout Alert</h4>
                </div>
                
                <p className="text-[11px] font-medium text-gray-600 leading-relaxed mb-6">
                    <span className="font-black text-gray-900">Backend Core</span> is approaching critical capacity. AI recommends reassigning 3 tasks to <span className="text-gray-900">Growth Ops</span> to stabilize.
                </p>

                <button className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                    Approve Redistribution
                    <Sparkles size={12} />
                </button>
            </div>
        </div>
    );
};

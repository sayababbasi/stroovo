"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Sparkles, Brain, TrendingUp, AlertTriangle, 
    ArrowRight, Target, Activity, Cpu, 
    Zap, Clock, ChevronRight, User,
    ShieldAlert, Box, Layers
} from 'lucide-react';

const InsightCard = ({ title, description, impact, confidence, category, action }: any) => (
    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group border-l-4 border-l-indigo-500">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    impact === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                    {impact} IMPACT
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {category}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-xl">
                <Brain size={12} className="text-indigo-500" />
                <span className="text-[10px] font-black text-gray-900">{confidence}% Confidence</span>
            </div>
        </div>

        <h4 className="text-sm font-black text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{title}</h4>
        <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-6">
            {description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                {action}
                <ArrowRight size={12} />
            </button>
            <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-1">
                Why?
                <ChevronRight size={12} />
            </button>
        </div>
    </div>
);

export const AIInsightsPanel = ({ role }: { role: string }) => {
    return (
        <section className="bg-indigo-600 rounded-[32px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -ml-32 -mb-32" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">AI Executive Intelligence</h2>
                            <p className="text-sm text-indigo-100 font-medium">Continuous organizational analysis and predictive optimization.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10">
                        Run Strategic Audit
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <InsightCard 
                        title="Backend Velocity Drop Detected"
                        description="Velocity dropped 18% after workload increase. Potential burnout risk in 5 days if unaddressed."
                        impact="HIGH"
                        confidence={96}
                        category="WORKLOAD"
                        action="Rebalance Now"
                    />
                    <InsightCard 
                        title="Design System Bottleneck"
                        description="QA review lag is delaying 3 critical path projects. AI suggests adding 1 peer reviewer."
                        impact="MEDIUM"
                        confidence={92}
                        category="BOTTLENECK"
                        action="Assign Reviewer"
                    />
                    <InsightCard 
                        title="Efficiency Opportunity: QA"
                        description="AI learned pattern: QA automation can handle 42% of manual regression tests. Saving 12hrs/week."
                        impact="HIGH"
                        confidence={89}
                        category="OPPORTUNITY"
                        action="Automate Task"
                    />
                </div>
            </div>
        </section>
    );
};

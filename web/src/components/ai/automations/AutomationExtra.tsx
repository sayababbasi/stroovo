"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Sparkles, MessageSquare, 
    ChevronRight, CheckCircle2, Clock,
    TrendingUp, MousePointer2, User,
    ArrowRight, Workflow, Target
} from 'lucide-react';

const RecommendationCard = ({ title, impact, action }: any) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-indigo-100 hover:shadow-lg transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles size={14} />
            </div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                impact === 'High' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
                {impact} Impact
            </span>
        </div>
        <h4 className="text-[11px] font-black text-gray-900 mb-1 leading-tight">{title}</h4>
        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
            {action}
        </button>
    </div>
);

const ExecutionItem = ({ name, time, status }: any) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Workflow size={14} className="text-gray-400" />
            </div>
            <div>
                <div className="text-[11px] font-black text-gray-900">{name}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{time}</div>
            </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
            status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
            {status}
        </span>
    </div>
);

export const AutomationExtra = () => {
    return (
        <section className="grid grid-cols-12 gap-8 mt-12 pb-12">
            {/* AI RECOMMENDATIONS */}
            <div className="col-span-3">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">AI Recommendations</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                    <RecommendationCard 
                        title="Create automation for repetitive QA approvals" 
                        impact="High" 
                        action="Create"
                    />
                    <RecommendationCard 
                        title="Optimize notification timing for focus" 
                        impact="Medium" 
                        action="Optimize"
                    />
                    <RecommendationCard 
                        title="Enable auto task assignment based on skill" 
                        impact="High" 
                        action="Create"
                    />
                </div>
            </div>

            {/* QUICK BUILDER PREVIEW */}
            <div className="col-span-5 bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Automation Builder (Quick Start)</h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Create in seconds</span>
                </div>
                
                <div className="relative flex flex-col items-center gap-6 py-4">
                    <div className="flex gap-12">
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center min-w-[100px]">
                            <div className="text-[8px] font-black text-emerald-600 uppercase mb-1">Trigger</div>
                            <div className="text-[10px] font-bold text-gray-900">Task Overdue</div>
                        </div>
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center min-w-[100px]">
                            <div className="text-[8px] font-black text-indigo-600 uppercase mb-1">AI Condition</div>
                            <div className="text-[10px] font-bold text-gray-900">High Delay Risk</div>
                        </div>
                    </div>
                    
                    <div className="w-px h-8 bg-gray-100" />
                    
                    <div className="flex gap-12">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center min-w-[100px]">
                            <div className="text-[8px] font-black text-blue-600 uppercase mb-1">Action</div>
                            <div className="text-[10px] font-bold text-gray-900">Notify Manager</div>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center min-w-[100px]">
                            <div className="text-[8px] font-black text-blue-600 uppercase mb-1">Action</div>
                            <div className="text-[10px] font-bold text-gray-900">Reassign Task</div>
                        </div>
                    </div>

                    <button className="mt-8 px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl text-xs font-bold transition-all border border-gray-100 flex items-center gap-2">
                        <span>Open Builder</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* RECENT EXECUTIONS */}
            <div className="col-span-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Recent Executions</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm divide-y divide-gray-50">
                    <ExecutionItem name="Sprint Recovery Automation" time="2 min ago" status="Success" />
                    <ExecutionItem name="Smart Escalation Engine" time="5 min ago" status="Success" />
                    <ExecutionItem name="AI Workload Rebalancer" time="1 min ago" status="Success" />
                    <ExecutionItem name="Predictive Delay Preventer" time="10 min ago" status="Success" />
                    <ExecutionItem name="Auto Status & Reporting" time="Just now" status="Success" />
                    <ExecutionItem name="Slack Alert Orchestrator" time="1 min ago" status="Failed" />
                </div>
            </div>
        </section>
    );
};

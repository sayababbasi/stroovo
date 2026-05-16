"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Brain, Zap, Target, TrendingUp, 
    Clock, Activity, Shield, Workflow,
    Cpu, ArrowUpRight, BarChart3, Database
} from 'lucide-react';

const HistoryMetric = ({ title, value, trend, icon: Icon, color }: any) => (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-2xl ${
                color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                color === 'rose' ? 'bg-rose-50 text-rose-600' :
                'bg-blue-50 text-blue-600'
            } group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-widest">
                <TrendingUp size={12} />
                {trend}
            </div>
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</div>
        <div className="text-2xl font-black text-gray-900">{value}</div>
    </div>
);

export const HistoryHero = () => {
    return (
        <section className="grid grid-cols-4 gap-6 mb-8">
            <HistoryMetric 
                title="AI Decisions Made" 
                value="12,842" 
                trend="+24%" 
                icon={Brain} 
                color="indigo" 
            />
            <HistoryMetric 
                title="Automations Executed" 
                value="84,201" 
                trend="+31%" 
                icon={Zap} 
                color="blue" 
            />
            <HistoryMetric 
                title="Predictions Generated" 
                value="4,281" 
                trend="+18%" 
                icon={Target} 
                color="emerald" 
            />
            <HistoryMetric 
                title="AI Interventions" 
                value="1,245" 
                trend="+12%" 
                icon={Activity} 
                color="rose" 
            />
        </section>
    );
};

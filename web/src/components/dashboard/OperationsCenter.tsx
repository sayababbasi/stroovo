"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, History, BarChart3, TrendingUp, 
    Zap, Brain, Target, Shield,
    Clock, ArrowUpRight, ChevronRight, Filter,
    LayoutGrid, List, MoreHorizontal, AlertTriangle
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

const data = [
    { name: 'Mon', velocity: 4000, efficiency: 2400 },
    { name: 'Tue', velocity: 3000, efficiency: 1398 },
    { name: 'Wed', velocity: 2000, efficiency: 9800 },
    { name: 'Thu', velocity: 2780, efficiency: 3908 },
    { name: 'Fri', velocity: 1890, efficiency: 4800 },
    { name: 'Sat', velocity: 2390, efficiency: 3800 },
    { name: 'Sun', velocity: 3490, efficiency: 4300 },
];

const ActivityItem = ({ type, title, time, status, icon: Icon }: any) => (
    <div className="flex items-center justify-between py-4 group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                type === 'AI' ? 'bg-indigo-50 text-indigo-600' :
                type === 'EXECUTION' ? 'bg-emerald-50 text-emerald-600' :
                'bg-blue-50 text-blue-600'
            } group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
            </div>
            <div>
                <div className="text-[11px] font-black text-gray-900 mb-0.5">{title}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={10} />
                    {time}
                    <span className="text-gray-200">•</span>
                    <span className={status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}>{status}</span>
                </div>
            </div>
        </div>
        <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
    </div>
);

export const OperationsCenter = ({ role }: { role: string }) => {
    return (
        <section className="grid grid-cols-12 gap-8">
            {/* REALTIME ACTIVITY FEED */}
            <div className="col-span-4 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl">
                            <Activity size={18} className="text-gray-400" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Operational Activity</h3>
                    </div>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Feed</button>
                </div>

                <div className="space-y-1 divide-y divide-gray-50">
                    <ActivityItem 
                        type="AI" 
                        title="AI Rebalanced Team Alpha Workload" 
                        time="2 min ago" 
                        status="SUCCESS" 
                        icon={Brain} 
                    />
                    <ActivityItem 
                        type="EXECUTION" 
                        title="Sprint 15 Deployed to Production" 
                        time="15 min ago" 
                        status="SUCCESS" 
                        icon={Zap} 
                    />
                    <ActivityItem 
                        type="SYSTEM" 
                        title="Infrastructure Scale-Up Completed" 
                        time="42 min ago" 
                        status="SUCCESS" 
                        icon={TrendingUp} 
                    />
                    <ActivityItem 
                        type="AI" 
                        title="Anomaly Detected: API Latency Spike" 
                        time="1 hr ago" 
                        status="RESOLVED" 
                        icon={AlertTriangle} 
                    />
                    <ActivityItem 
                        type="EXECUTION" 
                        title="New Project: Quantum UI Overhaul" 
                        time="3 hrs ago" 
                        status="PENDING" 
                        icon={LayoutGrid} 
                    />
                </div>
            </div>

            {/* EXECUTION INTELLIGENCE CHARTS */}
            <div className="col-span-8 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl">
                            <BarChart3 size={18} className="text-gray-400" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Execution Velocity & Efficiency</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase hover:text-indigo-600 transition-all">Week</button>
                        <button className="px-3 py-1.5 bg-indigo-600 border border-indigo-600 rounded-lg text-[9px] font-black text-white uppercase shadow-lg shadow-indigo-500/20">Month</button>
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="velocity" 
                                stroke="#4F46E5" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorVelocity)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="efficiency" 
                                stroke="#10B981" 
                                strokeWidth={3}
                                fill="transparent"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Velocity</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational Efficiency</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">+14.2% Growth</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

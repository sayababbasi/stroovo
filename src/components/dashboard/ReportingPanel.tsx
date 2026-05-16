"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Download, FileText, FileSpreadsheet, 
    BarChart3, Clock, ChevronRight, 
    Calendar, Filter, Share2, MoreHorizontal
} from 'lucide-react';

const ReportItem = ({ title, date, format, size }: any) => (
    <div className="flex items-center justify-between py-4 group cursor-pointer border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                {format === 'PDF' ? <FileText size={18} /> : <FileSpreadsheet size={18} />}
            </div>
            <div>
                <div className="text-[11px] font-black text-gray-900 mb-0.5">{title}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    {date}
                    <span className="text-gray-200">•</span>
                    {size}
                </div>
            </div>
        </div>
        <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
            <Download size={16} />
        </button>
    </div>
);

export const ReportingPanel = ({ role }: { role: string }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                        <BarChart3 size={18} className="text-gray-400" />
                    </div>
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Executive Reporting</h3>
                </div>
                <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">All Reports</button>
            </div>

            <div className="space-y-1 divide-y divide-gray-50">
                <ReportItem 
                    title="Strategic Execution Summary" 
                    date="Today, 09:42 AM" 
                    format="PDF" 
                    size="2.4 MB" 
                />
                <ReportItem 
                    title="Q2 Operational Metrics" 
                    date="Yesterday" 
                    format="XLS" 
                    size="12.8 MB" 
                />
                <ReportItem 
                    title="AI Efficiency & ROI Audit" 
                    date="2 days ago" 
                    format="PDF" 
                    size="4.1 MB" 
                />
                <ReportItem 
                    title="Workload Balance Report" 
                    date="May 1, 2024" 
                    format="PDF" 
                    size="1.8 MB" 
                />
            </div>

            <button className="w-full mt-8 py-4 bg-white border border-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-indigo-100 transition-all flex items-center justify-center gap-2">
                Configure Automated Reports
                <ChevronRight size={14} />
            </button>
        </div>
    );
};

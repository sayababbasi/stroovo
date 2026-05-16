'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    CreditCard, 
    Zap, 
    CheckCircle2, 
    ArrowUpRight, 
    Clock, 
    Shield, 
    Activity, 
    Users,
    Download,
    Plus,
    AlertCircle,
    ChevronRight,
    Sparkles,
    BarChart3,
    History,
    Settings,
    Crown,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLANS, FEATURE_KEYS } from '@/lib/billing/registry';

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState<'subscription' | 'usage' | 'history' | 'seats'>('subscription');
    const [loading, setLoading] = useState(true);

    // Mock data - in real app, fetch from /api/billing
    const currentPlan = PLANS.PRO;
    const usage = {
        tasksUsed: 420,
        tasksLimit: -1,
        storageUsed: 45 * 1024 * 1024 * 1024,
        storageLimit: 100 * 1024 * 1024 * 1024,
        aiCreditsUsed: 650,
        aiCreditsLimit: 1000,
        seatsUsed: 12,
        seatsLimit: -1,
        automationsUsed: 124,
        automationsLimit: 500
    };

    const invoices = [
        { id: 'INV-001', date: 'May 1, 2026', amount: '$29.00', status: 'PAID', method: '•••• 4242' },
        { id: 'INV-002', date: 'Apr 1, 2026', amount: '$29.00', status: 'PAID', method: '•••• 4242' },
        { id: 'INV-003', date: 'Mar 1, 2026', amount: '$29.00', status: 'PAID', method: '•••• 4242' },
    ];

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFF]">
                <Sidebar />
                <main className="flex-1 ml-[260px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Loading Billing Center...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFF]">
            <Sidebar />

            <main className="flex-1 ml-[260px]">
                {/* HEADER */}
                <header className="px-10 py-8 bg-white border-b border-gray-100 sticky top-0 z-30">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Billing & Subscription</h1>
                                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 flex items-center gap-2">
                                    <Crown size={12} />
                                    {currentPlan.name} Plan
                                </div>
                            </div>
                            <p className="text-[13px] font-medium text-gray-400">Manage your workspace subscription, invoices, and usage limits.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-all">
                                Cancel Plan
                            </button>
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                                <Zap size={14} />
                                Upgrade Plan
                            </button>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="flex items-center gap-8">
                        {[
                            { id: 'subscription', label: 'Subscription', icon: CreditCard },
                            { id: 'usage', label: 'Usage & Limits', icon: Activity },
                            { id: 'seats', label: 'Team Seats', icon: Users },
                            { id: 'history', label: 'Billing History', icon: History }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative flex items-center gap-2 ${
                                    activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeBillingTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="px-10 py-10 max-w-7xl">
                    <AnimatePresence mode="wait">
                        {activeTab === 'subscription' && (
                            <motion.div
                                key="subscription"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* CURRENT PLAN CARD */}
                                <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 blur-[100px] rounded-full -mr-32 -mt-32 opacity-50" />
                                    
                                    <div className="grid grid-cols-12 gap-10 relative z-10">
                                        <div className="col-span-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                                                    <Crown size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Stroovo Pro</h2>
                                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Active since May 2024 • Monthly Billing</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-8 mb-10">
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Cost</div>
                                                    <div className="text-xl font-black text-gray-900">$29.00</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Billing Date</div>
                                                    <div className="text-xl font-black text-gray-900">June 1, 2026</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Status</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                        <span className="text-sm font-black text-gray-900">Paid</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                                                    Manage in Stripe
                                                </button>
                                                <button className="px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                                                    View Invoice history
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-span-4 bg-[#F8FAFF] rounded-[28px] p-8">
                                            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Quick Usage Overview</h3>
                                            <div className="space-y-6">
                                                <UsageBar label="AI Credits" used={usage.aiCreditsUsed} limit={usage.aiCreditsLimit} color="indigo" />
                                                <UsageBar label="Storage" used={45} limit={100} unit="GB" color="emerald" />
                                                <UsageBar label="Team Seats" used={12} limit={20} color="blue" />
                                            </div>
                                            <button className="w-full mt-8 py-3 border border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                                View Detailed Usage
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* PRICING PLANS */}
                                <div className="grid grid-cols-3 gap-8">
                                    <PricingCard plan={PLANS.STARTER} current={false} />
                                    <PricingCard plan={PLANS.PRO} current={true} />
                                    <PricingCard plan={PLANS.ENTERPRISE} current={false} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'usage' && (
                            <motion.div
                                key="usage"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-12 gap-8"
                            >
                                <div className="col-span-8 space-y-8">
                                    <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
                                        <h2 className="text-xl font-black text-gray-900 mb-8">Resource Consumption</h2>
                                        <div className="grid grid-cols-2 gap-10">
                                            <DetailedUsageCard label="Tasks Created" used={usage.tasksUsed} limit={1000} icon={CheckCircle2} />
                                            <DetailedUsageCard label="AI Computations" used={usage.aiCreditsUsed} limit={usage.aiCreditsLimit} icon={Sparkles} />
                                            <DetailedUsageCard label="Automation Cycles" used={usage.automationsUsed} limit={usage.automationsLimit} icon={Zap} />
                                            <DetailedUsageCard label="Cloud Storage" used={45} limit={100} unit="GB" icon={DatabaseIcon} />
                                        </div>
                                    </div>

                                    <div className="bg-indigo-600 rounded-[32px] p-10 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                                    <Sparkles size={24} />
                                                </div>
                                                <h3 className="text-xl font-black">AI Billing Insights</h3>
                                            </div>
                                            <p className="text-indigo-100 text-[14px] leading-relaxed mb-8 max-w-xl">
                                                Based on your current activity, Stroovo AI predicts your usage will exceed the **AI Credits limit** in 12 days. We recommend upgrading to **Enterprise** to avoid any interruption in autonomous operations.
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                                                    Optimize AI Cost
                                                </button>
                                                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                                                    Upgrade Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-4 space-y-8">
                                    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                                        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Usage Forecast</h3>
                                        <div className="h-40 w-full mb-6">
                                            {/* Sparkline simulation */}
                                            <div className="flex items-end gap-1 h-full">
                                                {[30, 45, 35, 60, 55, 80, 75, 90].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg transition-all hover:bg-indigo-600" style={{ height: `${h}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-medium text-gray-400 italic">
                                            Operational velocity is up <span className="text-emerald-500 font-black">+24%</span> this month.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm"
                            >
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice ID</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {invoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-10 py-6 text-[11px] font-black text-gray-900">{inv.id}</td>
                                                <td className="px-10 py-6 text-[11px] font-medium text-gray-600">{inv.date}</td>
                                                <td className="px-10 py-6 text-[11px] font-black text-gray-900">{inv.amount}</td>
                                                <td className="px-10 py-6">
                                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-[11px] font-medium text-gray-400">{inv.method}</td>
                                                <td className="px-10 py-6 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                        <Download size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {activeTab === 'seats' && (
                            <motion.div
                                key="seats"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 mb-2">Team Seat Management</h2>
                                        <p className="text-[13px] font-medium text-gray-400">You are currently using <span className="text-indigo-600 font-black">12 of 20</span> available seats.</p>
                                    </div>
                                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                        <Plus size={14} />
                                        Invite New Member
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                                        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Seat Distribution</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm font-black text-[10px]">AD</div>
                                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Admins</span>
                                                </div>
                                                <span className="text-[11px] font-black text-gray-900">3 Seats</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm font-black text-[10px]">MB</div>
                                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Members</span>
                                                </div>
                                                <span className="text-[11px] font-black text-gray-900">8 Seats</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm font-black text-[10px]">GS</div>
                                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Guests</span>
                                                </div>
                                                <span className="text-[11px] font-black text-gray-900">1 Seat</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// Helper Components
const UsageBar = ({ label, used, limit, unit = '', color }: any) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{label}</span>
            <span className="text-[11px] font-black text-gray-900">{used}{unit} / {limit === -1 ? '∞' : `${limit}${unit}`}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: limit === -1 ? '40%' : `${(used / limit) * 100}%` }}
                className={`h-full bg-${color}-500`} 
            />
        </div>
    </div>
);

const DetailedUsageCard = ({ label, used, limit, icon: Icon, unit = '' }: any) => (
    <div className="p-6 border border-gray-100 rounded-[24px] hover:border-indigo-100 transition-all">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-50 text-gray-400 rounded-xl"><Icon size={16} /></div>
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{label}</h4>
        </div>
        <div className="flex items-end justify-between mb-4">
            <div className="text-2xl font-black text-gray-900">{used}{unit}</div>
            <div className="text-[10px] font-bold text-gray-400">Limit: {limit === -1 ? '∞' : `${limit}${unit}`}</div>
        </div>
        <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: limit === -1 ? '20%' : `${(used / limit) * 100}%` }} />
        </div>
    </div>
);

const PricingCard = ({ plan, current }: any) => (
    <div className={`bg-white border rounded-[32px] p-10 flex flex-col transition-all duration-300 ${
        current ? 'border-indigo-600 shadow-xl shadow-indigo-500/10 scale-[1.02]' : 'border-gray-100 shadow-sm hover:border-gray-200'
    }`}>
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                {current && <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Current</span>}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">${plan.priceMonthly}</span>
                <span className="text-sm font-bold text-gray-400 uppercase">/ month</span>
            </div>
        </div>

        <div className="space-y-4 mb-10 flex-1">
            {Object.entries(plan.features).map(([key, enabled]) => (
                <div key={key} className={`flex items-center gap-3 text-[11px] font-bold ${enabled ? 'text-gray-600' : 'text-gray-300'}`}>
                    {enabled ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Lock size={14} />}
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
            ))}
        </div>

        <button className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
            current 
            ? 'bg-gray-50 text-gray-400 cursor-default' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
        }`}>
            {current ? 'Your Plan' : `Get ${plan.name}`}
        </button>
    </div>
);

const DatabaseIcon = ({ size }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
);

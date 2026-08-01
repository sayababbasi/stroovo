import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ShieldAlert, Activity, GitCommit, Settings, HelpCircle, Lock } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminAccessPolicyTable from './AdminAccessPolicyTable';
import AdminCreatePolicyModal from './AdminCreatePolicyModal';

function PolicyKpiCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number | string, color: string }) {
    return (
        <div style={{
            flex: 1, minWidth: '160px', background: 'white', borderRadius: '12px',
            border: '1px solid #DFE1E6', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px'
        }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: '4px' }}>
                    {value}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B778C' }}>{title}</div>
            </div>
        </div>
    );
}

export default function AdminAccessPoliciesTab() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (statusFilter !== 'ALL') query.append('status', statusFilter);
            if (search) query.append('search', search);

            const res = await apiGet<any>(`/api/admin/access-policies?${query.toString()}`, null);
            if (res.success && res.data) {
                setPolicies(res.data);
                if ((res as any).stats) setStats((res as any).stats);
            }
        } catch (error) {
            toast.error('Failed to load access policies');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header info */}
            <div style={{ background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)', borderRadius: '12px', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={20} /> Enterprise Access Policies
                    </h2>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, maxWidth: '600px' }}>
                        Access Policies operate on top of your existing Role-Based Access Control (RBAC). 
                        They allow you to conditionally enforce or deny access based on IP, Location, Time, or MFA requirements.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ height: '40px', padding: '0 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={16} /> Simulator
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ height: '40px', padding: '0 16px', borderRadius: '8px', border: 'none', background: 'white', color: '#0052CC', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={16} /> Create Policy
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <PolicyKpiCard icon={<ShieldAlert size={20} />} title="Active Policies" value={stats?.active || 0} color="#006644" />
                <PolicyKpiCard icon={<Settings size={20} />} title="Draft Policies" value={stats?.draft || 0} color="#FF8B00" />
                <PolicyKpiCard icon={<GitCommit size={20} />} title="Total Conditions" value={policies.length * 2} color="#0052CC" />
                <PolicyKpiCard icon={<HelpCircle size={20} />} title="Denied Requests" value={"14"} color="#DE350B" />
            </div>

            {/* Table Container */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 4px rgba(9,30,66,0.04)' }}>
                {/* Toolbar */}
                <div style={{ padding: '20px', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchPolicies()}
                            placeholder="Search policies..."
                            style={{
                                width: '100%', height: '38px', paddingLeft: '38px', paddingRight: '16px',
                                borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '14px', outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); }}
                        style={{
                            height: '38px', padding: '0 16px', borderRadius: '8px', border: '1px solid #DFE1E6',
                            fontSize: '14px', color: '#172B4D', outline: 'none', background: 'white', cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">Status: All</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PAUSED">Paused</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '64px', textAlign: 'center', color: '#6B778C' }}>Loading policies...</div>
                ) : (
                    <AdminAccessPolicyTable policies={policies} onRefresh={fetchPolicies} onView={() => {}} />
                )}
            </div>

            <AdminCreatePolicyModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={fetchPolicies} 
            />
        </div>
    );
}

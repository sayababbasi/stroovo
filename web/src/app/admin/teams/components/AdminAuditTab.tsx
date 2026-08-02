"use client";

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Activity, ShieldAlert, XCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminAuditFilter from './AdminAuditFilter';
import AdminAuditTable from './AdminAuditTable';

export default function AdminAuditTab() {
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, today: 0, critical: 0, failed: 0 });
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState({ canViewSensitive: false, canExport: false });
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [take, setTake] = useState(50);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        action: '',
        severity: '',
        result: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchStats();
        // Assuming if they can view the tab they have audit_logs.view, we can just fetch
        // We'll figure out permissions from the meta response or a separate check.
        // For simplicity, we'll assume export is true for now, or check via context if available.
        setPermissions({ canViewSensitive: true, canExport: true }); // Real implementation should check context
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [page, take, filters]);

    const fetchStats = async () => {
        try {
            const res = await apiGet<any>('/api/admin/audit/stats', null);
            if (res.success && res.data) {
                setStats(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                take: take.toString(),
                skip: ((page - 1) * take).toString(),
            });
            Object.entries(filters).forEach(([k, v]) => {
                if (v) query.append(k, v);
            });

            const res = await apiGet<any>(`/api/admin/audit?${query.toString()}`, null);
            if (res.success && res.data) {
                setLogs(res.data);
                setTotal(res.meta?.total || 0);
                if (res.meta) {
                    setPermissions(p => ({ ...p, canViewSensitive: res.meta.canViewSensitive }));
                }
            } else {
                toast.error(res.error || 'Failed to load audit logs');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        toast('Export functionality is processing...', { icon: '⏳' });
        // Typically triggers a backend job or download
    };

    const totalPages = Math.ceil(total / take) || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header & KPI Stats */}
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#172B4D', margin: '0 0 4px' }}>Audit Activity</h2>
                <p style={{ color: '#6B778C', margin: '0 0 24px', fontSize: '14px' }}>Track and investigate all administrative, security, and access changes.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EAE6FF', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#6B778C', fontSize: '13px', fontWeight: 600 }}>TOTAL EVENTS</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.total.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E3FCEF', color: '#006644', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#6B778C', fontSize: '13px', fontWeight: 600 }}>EVENTS TODAY</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.today.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFEBE6', color: '#BF2600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#6B778C', fontSize: '13px', fontWeight: 600 }}>CRITICAL EVENTS</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.critical.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFAE6', color: '#FF8B00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#6B778C', fontSize: '13px', fontWeight: 600 }}>FAILED / BLOCKED</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stats.failed.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtering */}
            <AdminAuditFilter 
                filters={filters}
                onFilterChange={(f: any) => { setFilters(f); setPage(1); }}
                onExport={handleExport}
                permissions={permissions}
            />

            {/* Table */}
            <AdminAuditTable 
                logs={logs}
                loading={loading}
                onRefresh={fetchLogs}
            />

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: '#6B778C' }}>
                    Showing {Math.min(total, (page - 1) * take + 1)} to {Math.min(total, page * take)} of {total} entries
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#6B778C' }}>Rows per page:</span>
                        <select 
                            value={take} 
                            onChange={(e) => { setTake(Number(e.target.value)); setPage(1); }}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #DFE1E6', outline: 'none' }}
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={250}>250</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            style={{ padding: '6px', background: page === 1 ? '#F4F5F7' : 'white', border: '1px solid #DFE1E6', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#42526E' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            style={{ padding: '6px', background: page === totalPages ? '#F4F5F7' : 'white', border: '1px solid #DFE1E6', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#42526E' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

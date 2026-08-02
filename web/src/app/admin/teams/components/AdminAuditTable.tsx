"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, FileText, Activity } from 'lucide-react';
import AdminAuditDetailDrawer from './AdminAuditDetailDrawer';

export default function AdminAuditTable({ logs, loading, onRefresh }: any) {
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const getSeverityBadge = (sev: string) => {
        switch (sev) {
            case 'CRITICAL': return <span style={{ color: '#BF2600', background: '#FFEBE6', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>CRITICAL</span>;
            case 'HIGH': return <span style={{ color: '#FF5630', background: '#FFEBE6', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>HIGH</span>;
            case 'MEDIUM': return <span style={{ color: '#FFAB00', background: '#FFFAE6', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>MEDIUM</span>;
            case 'LOW': return <span style={{ color: '#36B37E', background: '#E3FCEF', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>LOW</span>;
            default: return <span style={{ color: '#0052CC', background: '#DEEBFF', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>INFO</span>;
        }
    };

    const getResultIcon = (result: string) => {
        if (result === 'SUCCESS') return <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#36B37E' }} title="Success" />;
        if (result === 'FAILED') return <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5630' }} title="Failed" />;
        if (result === 'BLOCKED') return <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFAB00' }} title="Blocked" />;
        return <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B3BAC5' }} title="Unknown" />;
    };

    return (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#F4F5F7', color: '#6B778C', borderBottom: '1px solid #DFE1E6' }}>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date & Time</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actor</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Resource</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Severity</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Result</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6B778C' }}>
                                    Loading audit logs...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '64px', textAlign: 'center', color: '#6B778C' }}>
                                    <Activity size={32} color="#DFE1E6" style={{ margin: '0 auto 16px' }} />
                                    <div>No audit activity found matching your filters.</div>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #DFE1E6', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <td style={{ padding: '12px 16px', color: '#42526E' }}>
                                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ color: '#172B4D', fontWeight: 500 }}>{log.user?.name || 'System'}</div>
                                        <div style={{ color: '#6B778C', fontSize: '11px' }}>{log.user?.email || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#172B4D', fontWeight: 500 }}>
                                        {log.action}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ color: '#172B4D' }}>{log.entity}</div>
                                        <div style={{ color: '#6B778C', fontSize: '11px', fontFamily: 'monospace' }}>{log.entityId}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {getSeverityBadge(log.severity)}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getResultIcon(log.result)}
                                            <span style={{ color: '#42526E', fontSize: '12px' }}>{log.result}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }} 
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px', borderRadius: '4px' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#EBECF0'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <AdminAuditDetailDrawer 
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
        </div>
    );
}

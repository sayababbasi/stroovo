"use client";

import React from 'react';
import { X, Activity, User, Shield, AlertTriangle, Key, Network, MapPin, Laptop, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAuditDetailDrawer({
    isOpen,
    onClose,
    log
}: any) {
    if (!isOpen || !log) return null;

    const renderJson = (data: any) => {
        if (!data) return <span style={{ color: '#8A94A6', fontStyle: 'italic' }}>None</span>;
        return (
            <pre style={{
                background: '#F4F5F7', padding: '12px', borderRadius: '4px', fontSize: '12px',
                color: '#172B4D', overflowX: 'auto', margin: 0, border: '1px solid #DFE1E6'
            }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        );
    };

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'CRITICAL': return '#BF2600';
            case 'HIGH': return '#FF5630';
            case 'MEDIUM': return '#FFAB00';
            case 'LOW': return '#36B37E';
            default: return '#0052CC';
        }
    };

    const getResultBadge = (result: string) => {
        if (result === 'SUCCESS') return <span style={{ background: '#E3FCEF', color: '#006644', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>SUCCESS</span>;
        if (result === 'FAILED') return <span style={{ background: '#FFEBE6', color: '#BF2600', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>FAILED</span>;
        if (result === 'BLOCKED') return <span style={{ background: '#FFFAE6', color: '#FF8B00', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>BLOCKED</span>;
        return <span>{result}</span>;
    };

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.54)', zIndex: 900 }} onClick={onClose} />

            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '600px', maxWidth: '90vw', background: 'white',
                boxShadow: '-4px 0 16px rgba(9,30,66,0.1)', zIndex: 901, display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.2s ease-out'
            }}>
                <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={16} color={getSeverityColor(log.severity)} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>{log.action}</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getResultBadge(log.result)}
                            <span style={{ fontSize: '12px', color: '#6B778C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Actor Details */}
                    <section>
                        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actor details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '13px' }}>
                            <div style={{ color: '#6B778C' }}>Name</div>
                            <div style={{ color: '#172B4D', fontWeight: 500 }}>{log.user?.name || 'System'}</div>
                            
                            <div style={{ color: '#6B778C' }}>Email</div>
                            <div style={{ color: '#172B4D' }}>{log.user?.email || 'N/A'}</div>
                            
                            <div style={{ color: '#6B778C' }}>Role</div>
                            <div style={{ color: '#172B4D' }}>{log.user?.systemRole?.name || log.user?.role || 'SYSTEM'}</div>

                            {log.ipAddress && (
                                <>
                                    <div style={{ color: '#6B778C' }}>IP Address</div>
                                    <div style={{ color: '#172B4D', fontFamily: 'monospace' }}>{log.ipAddress}</div>
                                </>
                            )}

                            {log.userAgent && (
                                <>
                                    <div style={{ color: '#6B778C' }}>User Agent</div>
                                    <div style={{ color: '#172B4D', wordBreak: 'break-all' }}>{log.userAgent}</div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Resource Context */}
                    <section>
                        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resource Context</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '13px' }}>
                            <div style={{ color: '#6B778C' }}>Type</div>
                            <div style={{ color: '#172B4D' }}>{log.entity}</div>
                            
                            <div style={{ color: '#6B778C' }}>ID</div>
                            <div style={{ color: '#172B4D', fontFamily: 'monospace' }}>{log.entityId}</div>
                            
                            {log.metadata?.path && (
                                <>
                                    <div style={{ color: '#6B778C' }}>API Path</div>
                                    <div style={{ color: '#172B4D', fontFamily: 'monospace' }}>{log.metadata.method} {log.metadata.path}</div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* State Changes */}
                    {(log.previousValue || log.newValue) && (
                        <section>
                            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Changes</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '8px', fontWeight: 600 }}>BEFORE</div>
                                    {renderJson(log.previousValue)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#006644', marginBottom: '8px', fontWeight: 600 }}>AFTER</div>
                                    {renderJson(log.newValue)}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Metadata */}
                    <section>
                        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Raw Metadata</h4>
                        {renderJson(log.metadata)}
                    </section>
                    
                </div>
            </div>
        </>
    );
}

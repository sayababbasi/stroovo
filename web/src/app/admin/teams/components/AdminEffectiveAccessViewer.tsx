"use client";

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Search, Activity, User, Briefcase, Bot } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface AdminEffectiveAccessViewerProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export default function AdminEffectiveAccessViewer({ userId, userName, onClose }: AdminEffectiveAccessViewerProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        effectivePermissions: string[];
        explanation: Record<string, { granted: boolean; sources: string[] }>;
    } | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchPermissions = async () => {
            setLoading(true);
            try {
                const res = await apiGet<any>(`/api/admin/users/${userId}/permissions`, null);
                if (res.success && res.data) {
                    setData(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch effective permissions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [userId]);

    const filteredKeys = data ? Object.keys(data.explanation).filter(k => 
        k.toLowerCase().includes(search.toLowerCase())
    ) : [];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(9, 30, 66, 0.54)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000
        }}>
            <div style={{
                width: '600px',
                background: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 24px rgba(9, 30, 66, 0.08)'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 4px', fontSize: '20px', color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={20} color="#0052CC" />
                            Effective Access Trace
                        </h2>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>
                            Inspecting evaluated permissions for <strong>{userName}</strong>
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B778C' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '16px 24px', borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search permissions (e.g. projects.edit)"
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 36px',
                                borderRadius: '6px',
                                border: '1px solid #DFE1E6',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', color: '#6B778C' }}>
                            Calculating effective access...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredKeys.map(key => {
                                const info = data!.explanation[key];
                                const isGranted = info.granted;
                                
                                return (
                                    <div key={key} style={{ 
                                        border: '1px solid',
                                        borderColor: isGranted ? '#E3FCEF' : '#DFE1E6',
                                        borderRadius: '8px', 
                                        padding: '16px',
                                        background: isGranted ? 'white' : '#FAFBFC'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: isGranted ? '#0052CC' : '#172B4D' }}>
                                                {key}
                                            </span>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                fontWeight: 600, 
                                                padding: '4px 8px', 
                                                borderRadius: '4px',
                                                background: isGranted ? '#E3FCEF' : '#FFEBE6',
                                                color: isGranted ? '#006644' : '#DE350B'
                                            }}>
                                                {isGranted ? 'GRANTED' : 'DENIED'}
                                            </span>
                                        </div>
                                        
                                        {isGranted ? (
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '8px', fontWeight: 600 }}>Sources of Truth:</div>
                                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {info.sources.map((src, idx) => (
                                                        <li key={idx} style={{ fontSize: '13px', color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '4px', height: '4px', background: '#36B37E', borderRadius: '50%' }} />
                                                            {src}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '13px', color: '#6B778C' }}>
                                                Explicit Deny / No matching rules found
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {filteredKeys.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px', color: '#6B778C' }}>
                                    No permissions matched your search.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

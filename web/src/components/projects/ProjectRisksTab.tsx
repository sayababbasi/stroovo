
"use client";

import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Filter, ShieldAlert, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ProjectRisksTab({ project, risks: initialRisks }: { project: any, risks: any[] }) {
    const [risks, setRisks] = useState(initialRisks);
    const [isAdding, setIsAdding] = useState(false);

    const stats = {
        total: risks.length,
        critical: risks.filter(r => r.impact === 'CRITICAL').length,
        high: risks.filter(r => r.impact === 'HIGH').length,
        open: risks.filter(r => r.status === 'OPEN').length,
    };

    const handleAddRisk = async () => {
        const title = window.prompt("Enter Risk Title:");
        if (!title) return;
        
        try {
            const newRisk = {
                id: Math.random().toString(36).substr(2, 9),
                title,
                impact: 'HIGH',
                probability: 'MEDIUM',
                status: 'OPEN',
                createdAt: new Date().toISOString()
            };
            // Optimistic UI for now
            setRisks([newRisk, ...risks]);
            toast.success("Risk logged successfully");
            
            // Assuming an endpoint exists or will exist:
            // await axios.post(`/api/projects/${project.id}/risks`, newRisk);
        } catch (error) {
            toast.error("Failed to add risk");
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'CRITICAL': return { bg: '#FFF0F0', text: '#BF2600' };
            case 'HIGH': return { bg: '#FFF7E6', text: '#974F0C' };
            case 'MEDIUM': return { bg: '#E6EFFF', text: '#0052CC' };
            default: return { bg: '#F4F5F7', text: '#42526E' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return { bg: '#FFF0F0', text: '#BF2600' };
            case 'MITIGATED': return { bg: '#E3FCEF', text: '#006644' };
            case 'MONITORING': return { bg: '#E6EFFF', text: '#0052CC' };
            default: return { bg: '#F4F5F7', text: '#42526E' };
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            
            {/* Top Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                <div className="p-panel" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#5E6C84', marginBottom: 16 }}>Total Risks</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{stats.total}</div>
                </div>
                <div className="p-panel" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#BF2600', marginBottom: 16 }}>Critical</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{stats.critical}</div>
                </div>
                <div className="p-panel" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#974F0C', marginBottom: 16 }}>High</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{stats.high}</div>
                </div>
                <div className="p-panel" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0052CC', marginBottom: 16 }}>Open</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{stats.open}</div>
                </div>
                <div className="p-panel hover:bg-blue-700" style={{ padding: 20, background: '#0052CC', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onClick={handleAddRisk}>
                    <Plus size={24} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Log New Risk</div>
                </div>
            </div>

            {/* Table Area */}
            <div className="p-panel" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#172B4D', margin: 0 }}>Risk Register</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} color="#8A94A6" style={{ position: 'absolute', left: 12, top: 10 }} />
                            <input type="text" placeholder="Search risks..." style={{ padding: '8px 12px 8px 32px', border: '1px solid #DFE1E6', borderRadius: 8, fontSize: 13, width: 240, outline: 'none' }} />
                        </div>
                        <button className="btn-secondary"><Filter size={14} /> Filter</button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6', background: '#F8F9FA', padding: '12px 24px', fontSize: 12, fontWeight: 700, color: '#5E6C84' }}>
                    <div style={{ flex: 2 }}>Risk Title</div>
                    <div style={{ flex: 1 }}>Impact</div>
                    <div style={{ flex: 1 }}>Probability</div>
                    <div style={{ flex: 1 }}>Status</div>
                    <div style={{ flex: 1 }}>Logged Date</div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {risks.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B778C' }}>
                            <ShieldAlert size={48} color="#DFE1E6" style={{ marginBottom: 16 }} />
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#172B4D', marginBottom: 8 }}>No active risks</div>
                            <div style={{ fontSize: 14, marginBottom: 16 }}>Your project is currently looking healthy.</div>
                            <button className="btn-primary" onClick={handleAddRisk}>Log a Risk</button>
                        </div>
                    ) : (
                        risks.map(r => {
                            const imp = getImpactColor(r.impact);
                            const stat = getStatusColor(r.status);
                            return (
                                <div key={r.id} style={{ display: 'flex', borderBottom: '1px solid #EBECF0', padding: '16px 24px', alignItems: 'center', transition: 'background 0.2s', cursor: 'pointer' }} className="hover:bg-gray-50">
                                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <AlertTriangle size={16} color={imp.text} />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{r.title}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ background: imp.bg, color: imp.text, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>{r.impact}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#42526E' }}>{r.probability}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ background: stat.bg, color: stat.text, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>{r.status}</span>
                                    </div>
                                    <div style={{ flex: 1, fontSize: 12, color: '#6B778C', fontWeight: 500 }}>
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

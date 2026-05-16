"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Zap, Trash2, Play, Pause, Settings2 } from 'lucide-react';

export default function AutomationsPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRules = async () => {
            // Mocking for now - in production this would fetch from /api/automations
            setRules([
                { id: '1', name: 'Notify Manager on Completion', triggerEvent: 'TASK_COMPLETED', action: 'NOTIFY_MANAGER', isActive: true },
                { id: '2', name: 'High Risk Alert', triggerEvent: 'RISK_SCORE_HIGH', action: 'SEND_WEBHOOK', isActive: false },
            ]);
            setLoading(false);
        };
        fetchRules();
    }, []);

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#172B4D' }}>Automations</h1>
                    <p style={{ color: '#6B778C', marginTop: '8px' }}>Create "If-This-Then-That" rules to automate your workflows.</p>
                </div>
                <button style={{ 
                    background: '#0052CC', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '6px', 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer'
                }}>
                    <Plus size={18} /> Create Rule
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rules.map(rule => (
                    <div key={rule.id} style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        border: '1px solid #DFE1E6', 
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px'
                    }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '10px', 
                            background: rule.isActive ? '#E3FCEF' : '#F4F5F7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={24} color={rule.isActive ? '#36B37E' : '#6B778C'} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', margin: '0 0 4px 0' }}>{rule.name}</h3>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B778C' }}>
                                <span>Trigger: <strong style={{color: '#42526E'}}>{rule.triggerEvent}</strong></span>
                                <span>Action: <strong style={{color: '#0052CC'}}>{rule.action}</strong></span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ background: 'transparent', border: '1px solid #DFE1E6', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                                {rule.isActive ? <Pause size={16} color="#42526E" /> : <Play size={16} color="#36B37E" />}
                            </button>
                            <button style={{ background: 'transparent', border: '1px solid #DFE1E6', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                                <Settings2 size={16} color="#42526E" />
                            </button>
                            <button style={{ background: 'transparent', border: '1px solid #FFEBE6', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                                <Trash2 size={16} color="#FF5630" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {!loading && rules.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px', background: '#F4F5F7', borderRadius: '12px' }}>
                    <Settings2 size={48} color="#B3BAC5" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#42526E' }}>No automated rules yet</h3>
                    <p style={{ color: '#6B778C', marginTop: '8px' }}>Set up your first rule to start automating your project workflows.</p>
                </div>
            )}
        </div>
    );
}

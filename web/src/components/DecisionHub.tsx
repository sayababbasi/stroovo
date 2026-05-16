"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Check, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function DecisionHub() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // Mocking suggestions for now - in production this would fetch from an AI-populated table
                setSuggestions([
                    {
                        id: '1',
                        type: 'REASSIGNMENT',
                        title: 'Balance Workload',
                        description: 'Move "Database Migration" from User A to User B to reduce bottleneck.',
                        impact: 'High',
                        confidence: 92
                    },
                    {
                        id: '2',
                        type: 'PRIORITIZATION',
                        title: 'Shift Focus',
                        description: 'Project "Alpha" is at 80% risk. Suggest pausing Task "Beta" to focus on "Gamma".',
                        impact: 'Critical',
                        confidence: 85
                    }
                ]);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    if (loading) return <div>Analyzing project data...</div>;

    return (
        <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #DFE1E6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Zap color="#0052CC" size={20} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>AI Decision Hub</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {suggestions.map(s => (
                    <div key={s.id} style={{ 
                        padding: '16px', 
                        borderRadius: '8px', 
                        border: '1px solid #DFE1E6',
                        background: '#FAFBFC'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldAlert size={16} color={s.impact === 'Critical' ? '#FF5630' : '#0052CC'} />
                                <span style={{ fontWeight: 700, fontSize: '14px', color: '#172B4D' }}>{s.title}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#6B778C' }}>{s.confidence}% confidence</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#42526E', margin: '0 0 16px 0' }}>{s.description}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ 
                                flex: 1, 
                                background: '#0052CC', 
                                color: 'white', 
                                border: 'none', 
                                padding: '8px', 
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}>
                                <Check size={14} /> Approve
                            </button>
                            <button style={{ 
                                flex: 1, 
                                background: 'transparent', 
                                color: '#42526E', 
                                border: '1px solid #DFE1E6', 
                                padding: '8px', 
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}>
                                <X size={14} /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                background: 'transparent',
                border: '1px dashed #B3BAC5',
                color: '#505F79',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                View All Recommendations <ArrowRight size={14} />
            </button>
        </div>
    );
}

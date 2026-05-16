"use client";

import React from 'react';
import { 
    MoreHorizontal, Mail, CheckCircle, XCircle, 
    Key, Trash2, Shield, Calendar, Clock,
    ArrowRight, Loader2, Edit3, Users, Building, 
    UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoRequest {
    id: string;
    name: string;
    email: string;
    company: string | null;
    message: string | null;
    status: string;
    createdAt: string;
}

interface DemoRequestPipelineProps {
    requests: DemoRequest[];
    loading: boolean;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export default function DemoRequestPipeline({
    requests,
    loading,
    onApprove,
    onReject
}: DemoRequestPipelineProps) {
    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: '200px', background: 'white', borderRadius: '16px', border: '1px solid #EBECF0', animation: 'pulse 2s infinite' }} />
                ))}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div style={{ background: 'white', padding: '80px', borderRadius: '16px', border: '1px solid #EBECF0', textAlign: 'center' }}>
                <Shield size={48} style={{ color: '#C1C7D0', margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', marginBottom: '8px' }}>No new requests</h3>
                <p style={{ color: '#6B778C' }}>You have no demo requests to review at this time.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {requests.map((request, idx) => (
                <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid #EBECF0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#36B37E' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                background: '#E3FCEF', 
                                color: '#36B37E', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: 800
                            }}>
                                {request.name.charAt(0)}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>{request.name}</h4>
                                <div style={{ fontSize: '13px', color: '#6B778C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail size={12} /> {request.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {request.company && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#42526E' }}>
                                <Building size={14} color="#6B778C" />
                                <span><b>Company:</b> {request.company}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#42526E' }}>
                            <Calendar size={14} color="#6B778C" />
                            <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        {request.message && (
                            <div style={{ 
                                padding: '12px', 
                                background: '#F4F5F7', 
                                borderRadius: '8px', 
                                fontSize: '13px', 
                                color: '#6B778C',
                                fontStyle: 'italic',
                                lineHeight: '1.5'
                            }}>
                                "{request.message}"
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                        <button
                            onClick={() => onApprove(request.id)}
                            style={{ 
                                flex: 1,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '8px', 
                                padding: '10px', 
                                background: '#36B37E', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '13px', 
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <UserPlus size={16} /> Approve
                        </button>
                        <button
                            onClick={() => onReject(request.id)}
                            style={{ 
                                flex: 1,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '8px', 
                                padding: '10px', 
                                background: 'white', 
                                color: '#FF5630', 
                                border: '1px solid #FF5630', 
                                borderRadius: '8px', 
                                fontSize: '13px', 
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FFEBE6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                        >
                            <XCircle size={16} /> Reject
                        </button>
                    </div>
                </motion.div>
            ))}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

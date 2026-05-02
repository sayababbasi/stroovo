"use client";

import React, { useState } from 'react';
import { Bell, Search, User, Zap, Activity, ShieldCheck, Database } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';

export default function GlobalHeader() {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 32px', background: 'white', borderBottom: '1px solid #E8EAED',
            position: 'sticky', top: 0, zIndex: 50
        }}>
            {/* System Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#36B37E', background: '#E3FCEF', padding: '4px 10px', borderRadius: '20px' }}>
                    <ShieldCheck size={14} /> AI System Online
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#42526E' }}>
                    <Database size={14} color="#8A94A6" /> DB Connected (9ms)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#42526E' }}>
                    <Activity size={14} color="#0052CC" /> 12 Active Users
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F4F5F7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                    >
                        <Bell size={18} color="#42526E" />
                        <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#FF5630', border: '2px solid white' }} />
                    </button>

                    {showNotifications && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '380px', background: 'white', borderRadius: '12px', boxShadow: '0 12px 40px rgba(9,30,66,0.15)', border: '1px solid #E8EAED', zIndex: 100 }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>Notifications</div>
                                <button style={{ border: 'none', background: 'none', fontSize: '12px', color: '#0052CC', fontWeight: 600, cursor: 'pointer' }}>Mark all as read</button>
                            </div>
                            <div style={{ padding: '8px' }}>
                                <div style={{ padding: '12px', borderRadius: '8px', background: '#FFF4E6', display: 'flex', gap: '12px', marginBottom: '4px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFAB00', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>Team overloaded warning</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>AI has detected 3 team members exceeding optimal capacity.</div>
                                        <div style={{ fontSize: '11px', color: '#8A94A6', marginTop: '4px' }}>Just now</div>
                                    </div>
                                </div>
                                <div style={{ padding: '12px', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4F5F7', color: '#42526E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>Patrick assigned you a task</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>"Implement new authentication flow"</div>
                                        <div style={{ fontSize: '11px', color: '#8A94A6', marginTop: '4px' }}>2 hours ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div style={{ width: '1px', height: '24px', background: '#E8EAED' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                        P
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Patrick</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#8A94A6' }}>Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

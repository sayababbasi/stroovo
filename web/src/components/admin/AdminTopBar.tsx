"use client";

import React from 'react';
import { Search, Bell, User, HeartPulse, ChevronDown } from 'lucide-react';

interface AdminTopBarProps {
    user: any;
}

export default function AdminTopBar({ user }: AdminTopBarProps) {
    return (
        <header style={{
            height: '64px',
            background: 'white',
            borderBottom: '1px solid #EBECF0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 90
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} color="#6B778C" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Global search..." 
                        style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            background: '#F4F5F7',
                            border: '1px solid #EBECF0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#E3FCEF', padding: '4px 12px', borderRadius: '20px' }}>
                        <HeartPulse size={14} color="#36B37E" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#36B37E' }}>API: 24ms</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button style={{ background: 'none', border: 'none', color: '#6B778C', cursor: 'pointer', position: 'relative' }}>
                    <Bell size={20} />
                    <div style={{ width: '8px', height: '8px', background: '#FF5630', borderRadius: '50%', border: '2px solid white', position: 'absolute', top: 0, right: 0 }} />
                </button>

                <div style={{ width: '1px', height: '24px', background: '#EBECF0' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{user.name}</div>
                        <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500 }}>System Administrator</div>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                        {user.name?.charAt(0)}
                    </div>
                    <ChevronDown size={14} color="#6B778C" />
                </div>
            </div>
        </header>
    );
}

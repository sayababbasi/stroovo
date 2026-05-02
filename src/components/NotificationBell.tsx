"use client";

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';

export default function NotificationBell() {
    const { isAuthenticated, isLoading, accessToken } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const controller = new AbortController();

        const fetchNotifications = async () => {
            try {
                const res = await apiGet('/api/notifications', accessToken);
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        setNotifications([]);
                        setUnreadCount(0);
                    }
                    return;
                }
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Failed to fetch notifications:', error);
                }
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [isAuthenticated, isLoading]);

    const markAllRead = async () => {
        if (!isAuthenticated) return;

        try {
            const res = await fetch('/api/notifications', { method: 'PATCH', credentials: 'include' });
            if (!res.ok) return;
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAllRead();
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#42526E',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#FF5630',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: '10px',
                        border: '2px solid white'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '320px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid #DFE1E6',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #DFE1E6', fontWeight: 600, fontSize: '14px' }}>
                        Notifications
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#6B778C', fontSize: '13px' }}>
                            Your notification center is clear.
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} style={{ 
                                padding: '12px 16px', 
                                borderBottom: '1px solid #F4F5F7',
                                opacity: n.read ? 0.7 : 1,
                                background: n.read ? 'transparent' : '#F4F5F7'
                            }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{n.title}</div>
                                <div style={{ fontSize: '12px', color: '#42526E', marginTop: '4px' }}>{n.message}</div>
                                <div style={{ fontSize: '10px', color: '#8993A4', marginTop: '8px' }}>
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

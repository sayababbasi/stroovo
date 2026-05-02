"use client";

import React from 'react';
import { Bot, MessageSquare, Send, Sparkles, User, Zap } from 'lucide-react';

interface ExecutiveAssistantSidebarProps {
    user: any;
}

export default function ExecutiveAssistantSidebar({ user }: ExecutiveAssistantSidebarProps) {
    const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'assistant', text: string }>>([
        { role: 'assistant', text: `Hello ${user?.name?.split(' ')[0] || 'Revotic'}, how can I assist you today?` }
    ]);
    const [input, setInput] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const suggestedActions = [
        { icon: Zap, text: 'Balance team workload' },
        { icon: Sparkles, text: 'Adjust deadlines for risk' },
        { icon: Bot, text: 'Analyze unfinished tasks' },
    ];

    const handleSend = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const newMessages = [...messages, { role: 'user' as const, text: messageText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, context: 'EXECUTIVE_DASHBOARD' })
            });
            
            if (res.ok) {
                const data = await res.json();
                setMessages([...newMessages, { role: 'assistant', text: data.response || "I've analyzed the request and updated the strategy." }]);
            } else {
                setMessages([...newMessages, { role: 'assistant', text: "I'm having trouble connecting to the strategy engine right now." }]);
            }
        } catch (err) {
            setMessages([...newMessages, { role: 'assistant', text: "System connection error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: '320px',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #EBECF0',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: '24px'
        }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>AI Executive Assistant</h3>

            {/* Chat Display */}
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                paddingRight: '4px'
            }} className="enterprise-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: msg.role === 'user' ? '#0052CC' : '#F4F5F7',
                        color: msg.role === 'user' ? 'white' : '#172B4D',
                        fontSize: '13px',
                        lineHeight: '1.5'
                    }}>
                        {msg.text}
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: '#F4F5F7', padding: '10px 14px', borderRadius: '12px', fontSize: '13px' }}>
                        Processing...
                    </div>
                )}
            </div>

            {/* Suggested actions */}
            {!loading && messages.length < 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {suggestedActions.map((action, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSend(action.text)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: '#FFFFFF',
                                border: '1px solid #EBECF0',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                fontSize: '12px',
                                color: '#42526E'
                            }}
                        >
                            <action.icon size={14} color="#0052CC" />
                            {action.text}
                        </button>
                    ))}
                </div>
            )}

            {/* Chat Input */}
            <div style={{ position: 'relative' }}>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything..." 
                    style={{
                        width: '100%',
                        background: '#F4F5F7',
                        border: 'none',
                        padding: '12px 44px 12px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: '#172B4D',
                        outline: 'none'
                    }}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={loading}
                    style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#0052CC',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        opacity: loading ? 0.5 : 1
                    }}
                >
                    <Send size={14} color="white" />
                </button>
            </div>
        </div>
    );
}

function ChevronRight({ size, color }: { size: number, color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

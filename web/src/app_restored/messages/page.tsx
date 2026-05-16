import Sidebar from '@/components/Sidebar';
import { MessageSquare, Send, Search, MoreHorizontal } from 'lucide-react';

export default function MessagesPage() {
    const conversations = [
        { name: 'Core Development', unread: 3, lastMessage: 'Alex: The sprint review is scheduled for...', time: '10:30 AM' },
        { name: 'Design Systems', unread: 0, lastMessage: "You: I'll send the mockups by EOD", time: '9:15 AM' },
        { name: 'Sarah Chen', unread: 1, lastMessage: 'Can you review the pull request?', time: 'Yesterday' },
        { name: 'Michael Park', unread: 0, lastMessage: 'Thanks for the help!', time: 'Yesterday' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7', display: 'flex' }}>
                {/* Conversations List */}
                <div style={{ width: '320px', background: 'white', borderRight: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #DFE1E6' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Messages</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                            <input type="text" placeholder="Search conversations..." style={{ width: '100%', padding: '8px 10px 8px 34px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '13px' }} />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {conversations.map((conv, i) => (
                            <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #EBECF0', cursor: 'pointer', background: i === 0 ? '#F4F5F7' : 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{conv.name}</span>
                                    <span style={{ fontSize: '11px', color: '#6B778C' }}>{conv.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: '#6B778C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{conv.lastMessage}</span>
                                    {conv.unread > 0 && (
                                        <span style={{ background: '#FF5630', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontWeight: 700 }}>{conv.unread}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>Core Development</h3>
                            <span style={{ fontSize: '12px', color: '#6B778C' }}>5 members</span>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><MoreHorizontal size={20} /></button>
                    </div>

                    <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', color: '#6B778C' }}>
                            <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>

                    <div style={{ padding: '16px 24px', background: 'white', borderTop: '1px solid #DFE1E6' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input type="text" placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }} />
                            <button style={{ padding: '10px 20px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Send size={16} />
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

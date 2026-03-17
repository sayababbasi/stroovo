import Sidebar from '@/components/Sidebar';
import { Bot, Send, Sparkles, AlertTriangle, Zap } from 'lucide-react';

export default function AIPage() {
    const suggestions = [
        { icon: AlertTriangle, color: '#FF5630', title: 'Deadline Risk', desc: '"API Integration" task is at risk of missing its deadline' },
        { icon: Zap, color: '#FFAB00', title: 'Priority Adjustment', desc: 'Consider prioritizing "Design System Update" based on dependencies' },
        { icon: Sparkles, color: '#0052CC', title: 'Optimization', desc: 'Sprint 24 is overloaded. Consider moving 2 tasks to Sprint 25' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>AI Assistant</h1>
                        <span style={{ background: '#6554C0', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>BETA</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Smart suggestions and automated insights</p>
                </div>

                <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Chat Interface */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', height: '500px' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #DFE1E6' }}>
                            <h3 style={{ fontWeight: 600 }}>Chat with AI</h3>
                        </div>

                        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', maxWidth: '80%' }}>
                                <div style={{ fontSize: '13px', color: '#172B4D' }}>
                                    Hello! I'm your AI assistant. I can help you with task prioritization, deadline management, and productivity insights. What would you like to know?
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px 20px', borderTop: '1px solid #DFE1E6' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input type="text" placeholder="Ask me anything..." style={{ flex: 1, padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }} />
                                <button style={{ padding: '10px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Smart Suggestions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '20px' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Smart Suggestions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {suggestions.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#F4F5F7', borderRadius: '6px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <s.icon size={18} color={s.color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{s.title}</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C' }}>{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, #0052CC 0%, #6554C0 100%)', borderRadius: '8px', padding: '24px', color: 'white' }}>
                            <Bot size={32} style={{ marginBottom: '12px' }} />
                            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>AI-Powered Insights</h3>
                            <p style={{ fontSize: '13px', opacity: 0.9 }}>
                                Based on your team's patterns, productivity peaks on Tuesdays and Wednesdays. Consider scheduling important tasks during these days.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

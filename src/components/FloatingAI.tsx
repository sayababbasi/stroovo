'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Bot, Lightbulb, Loader2, Send, ShieldAlert, Sparkles, Wand2, X, Zap } from 'lucide-react';

type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface ChatResponse {
  success?: boolean;
  error?: string;
  data?: { content?: string };
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'AI Planner', description: 'Generate tasks from goals', href: '/ai', icon: Wand2, color: '#6554C0', bg: '#F2F0FF' },
  { label: 'Risk Alerts', description: 'Active risk signals', href: '/ai/alerts', icon: ShieldAlert, color: '#FF5630', bg: '#FFEBE6' },
  { label: 'Automations', description: 'Manage Stroovo workflow rules', href: '/automations', icon: Zap, color: '#FFAB00', bg: '#FFF4E6' },
  { label: 'Suggestions', description: 'AI recommendations', href: '/ai/suggestions', icon: Lightbulb, color: '#36B37E', bg: '#E3FCEF' },
];

function createMessage(role: MessageRole, content: string): Message {
  return { id: crypto.randomUUID(), role, content, timestamp: new Date().toISOString() };
}

export default function FloatingAI() {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    const handlePointerDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;
    setMessages(c => [...c, createMessage('user', prompt)]);
    setInput('');
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'phi3:mini' }),
      });
      const result = (await response.json().catch(() => ({}))) as ChatResponse;
      if (!response.ok) throw new Error(result.error || 'Failed to generate a response.');
      const content = result.data?.content?.trim();
      setMessages(c => [...c, createMessage('assistant', content || 'No response returned.')]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unknown error';
      console.error('Floating AI chat failed:', requestError);
      setError(message);
      setMessages(c => [...c, createMessage('assistant', 'Could not reach the AI service. Confirm Ollama is running and try again.')]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        type="button"
        onClick={() => setIsOpen(c => !c)}
        aria-label="Open Stroovo AI Assistant"
        aria-expanded={isOpen}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9000,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6554C0 0%, #0052CC 100%)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(101,84,192,0.35)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        {isOpen ? <X size={20} /> : <Bot size={22} />}
      </button>

      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 92, right: 24, zIndex: 8999,
        width: 360, maxHeight: '80vh',
        background: 'white', borderRadius: 20, border: '1px solid #E8EAED',
        boxShadow: '0 24px 64px rgba(9,30,66,0.18)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transformOrigin: 'bottom right',
        transform: isOpen ? 'scale(1)' : 'scale(0.92)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }} ref={panelRef} id="system-control-ai">
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1C1E2E 0%, #0D1117 100%)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6554C0, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="white" />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>Stroovo AI Assistant</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#36B37E', background: 'rgba(54,179,126,0.15)', padding: '2px 6px', borderRadius: 10 }}>ONLINE</span>
              </div>
              <p style={{ fontSize: '12px', color: '#8A94A6', margin: 0, lineHeight: 1.4 }}>Ask Stroovo... AI-powered assistant for tasks, risks &amp; planning.</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.08)', color: '#8A94A6', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F4F5F7' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#FAFBFC', border: '1px solid #E8EAED', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = action.bg; (e.currentTarget as HTMLElement).style.borderColor = action.color + '44'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFBFC'; (e.currentTarget as HTMLElement).style.borderColor = '#E8EAED'; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color={action.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#172B4D' }}>{action.label}</div>
                    <div style={{ fontSize: '10px', color: '#8A94A6' }}>{action.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          {messages.length === 0 ? (
            <div style={{ background: '#F4F5F7', borderRadius: 12, padding: '12px 14px', fontSize: '13px', color: '#6B778C', lineHeight: 1.5 }}>
              Ask me about tasks, risks, team workload, or project planning. I&apos;m here to help.
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 14, fontSize: '13px', lineHeight: 1.5,
                  background: m.role === 'user' ? 'linear-gradient(135deg, #6554C0, #0052CC)' : '#F4F5F7',
                  color: m.role === 'user' ? 'white' : '#172B4D',
                  borderBottomRightRadius: m.role === 'user' ? 4 : 14,
                  borderBottomLeftRadius: m.role === 'assistant' ? 4 : 14,
                }}>{m.content}</div>
              </div>
            ))
          )}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: '#8A94A6' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              AI is thinking...
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F4F5F7' }}>
          {error && <div style={{ fontSize: '11px', color: '#FF5630', marginBottom: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={2}
              placeholder="Ask Stroovo..."
              disabled={isLoading}
              style={{ flex: 1, resize: 'none', border: '1px solid #E8EAED', borderRadius: 10, padding: '8px 12px', fontSize: '13px', color: '#172B4D', outline: 'none', background: '#FAFBFC', minHeight: 48, fontFamily: 'inherit' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: (!input.trim() || isLoading) ? '#E8EAED' : 'linear-gradient(135deg, #6554C0, #0052CC)', color: (!input.trim() || isLoading) ? '#B0B7C3' : 'white', cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
            >
              {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

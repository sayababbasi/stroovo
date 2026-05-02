"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, LayoutGrid, ListTodo, Target, Users, Settings, Zap, Plus, Bot, CheckCircle2, AlertTriangle, Clock, X, Command, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
    id: string;
    type: 'navigation' | 'action' | 'ai' | 'task';
    label: string;
    description?: string;
    icon: React.ReactNode;
    shortcut?: string;
    action?: () => void;
    href?: string;
}

const ALL_COMMANDS: CommandItem[] = [
    { id: 'nav-dashboard', type: 'navigation', label: 'Go to Dashboard', description: 'Overview & insights', icon: <LayoutGrid size={16} />, href: '/' },
    { id: 'nav-tasks', type: 'navigation', label: 'Go to My Tasks', description: 'All your tasks', icon: <ListTodo size={16} />, href: '/tasks' },
    { id: 'nav-goals', type: 'navigation', label: 'Go to Goals', description: 'Strategic objectives', icon: <Target size={16} />, href: '/goals' },
    { id: 'nav-teams', type: 'navigation', label: 'Go to Teams', description: 'Manage team members', icon: <Users size={16} />, href: '/teams' },
    { id: 'nav-settings', type: 'navigation', label: 'Go to Settings', description: 'System configuration', icon: <Settings size={16} />, href: '/settings' },
    { id: 'nav-automations', type: 'navigation', label: 'Go to Automations', description: 'View automation rules', icon: <Zap size={16} />, href: '/automations' },
    { id: 'act-create-task', type: 'action', label: 'Create New Task', description: 'Open task creation modal', icon: <Plus size={16} />, shortcut: 'C' },
    { id: 'ai-analyze', type: 'ai', label: 'AI: Analyze Risk', description: 'Run AI risk analysis across all tasks', icon: <Bot size={16} /> },
    { id: 'ai-suggest', type: 'ai', label: 'AI: Get Suggestions', description: 'Get smart next-step recommendations', icon: <Zap size={16} /> },
    { id: 'ai-summary', type: 'ai', label: 'AI: Generate Summary', description: 'Summarize team progress this week', icon: <CheckCircle2 size={16} /> },
    { id: 'task-overdue', type: 'task', label: 'View Overdue Tasks', description: 'Tasks past their deadline', icon: <AlertTriangle size={16} />, href: '/tasks' },
    { id: 'task-today', type: 'task', label: 'View Due Today', description: 'Tasks due today', icon: <Clock size={16} />, href: '/tasks' },
];

const GROUP_LABELS: Record<CommandItem['type'], string> = { navigation: 'Navigation', action: 'Actions', ai: 'AI Commands', task: 'Tasks' };
const GROUP_COLORS: Record<CommandItem['type'], string> = { navigation: '#0052CC', action: '#36B37E', ai: '#6554C0', task: '#FF5630' };

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const filtered = query.trim() ? ALL_COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.description?.toLowerCase().includes(query.toLowerCase())) : ALL_COMMANDS;
    
    const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
        (acc[item.type] = acc[item.type] || []).push(item);
        return acc;
    }, {});

    const handleSelect = useCallback((item: CommandItem) => {
        if (item.href) router.push(item.href);
        if (item.action) item.action();
        setIsOpen(false);
    }, [router]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
            if (e.key === 'Enter' && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex]); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, filtered, selectedIndex, handleSelect]);

    if (!isOpen) return null;

    let globalIdx = -1;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', background: 'rgba(9,30,66,0.55)', backdropFilter: 'blur(4px)' }} onClick={() => setIsOpen(false)}>
            <div style={{ width: '100%', maxWidth: '620px', background: '#fff', borderRadius: '16px', boxShadow: '0 32px 80px rgba(9,30,66,0.25)', overflow: 'hidden', border: '1px solid rgba(9,30,66,0.1)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
                    <Search size={18} color="#6B778C" />
                    <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }} placeholder="Search tasks, pages, AI actions..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', color: '#172B4D', background: 'transparent', fontWeight: 500 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#F4F5F7', borderRadius: '6px', fontSize: '12px', color: '#8A94A6', fontWeight: 600 }}><Command size={11} /> K</div>
                    <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8A94A6', padding: 4 }}><X size={16} /></button>
                </div>
                <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '8px' }}>
                    {Object.entries(grouped).map(([type, items]) => (
                        <div key={type}>
                            <div style={{ padding: '8px 12px 4px', fontSize: '11px', fontWeight: 700, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{GROUP_LABELS[type as CommandItem['type']]}</div>
                            {items.map((item) => {
                                globalIdx++;
                                const idx = globalIdx;
                                const isSelected = selectedIndex === idx;
                                return (
                                    <button key={item.id} onClick={() => handleSelect(item)} onMouseEnter={() => setSelectedIndex(idx)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: isSelected ? '#F0F5FF' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: isSelected ? GROUP_COLORS[item.type] : '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : GROUP_COLORS[item.type], flexShrink: 0, transition: 'all 0.15s' }}>{item.icon}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{item.label}</div>
                                            {item.description && <div style={{ fontSize: '12px', color: '#8A94A6', marginTop: 1 }}>{item.description}</div>}
                                        </div>
                                        {item.shortcut && <div style={{ padding: '2px 8px', background: '#F4F5F7', borderRadius: '5px', fontSize: '11px', fontWeight: 700, color: '#8A94A6' }}>{item.shortcut}</div>}
                                        <ChevronRight size={14} color={isSelected ? '#0052CC' : '#DFE1E6'} />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8A94A6', fontSize: '14px' }}>
                            <Search size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                            <div style={{ fontWeight: 600 }}>No results for "{query}"</div>
                            <div style={{ fontSize: '12px', marginTop: 4 }}>Try searching for a page, task, or AI action</div>
                        </div>
                    )}
                </div>
                <div style={{ padding: '10px 20px', borderTop: '1px solid #F4F5F7', display: 'flex', gap: '16px', fontSize: '11px', color: '#8A94A6', fontWeight: 500 }}>
                    <span><kbd style={{ fontFamily: 'inherit', background: '#F4F5F7', padding: '2px 5px', borderRadius: 4, fontSize: 10 }}>↑↓</kbd> Navigate</span>
                    <span><kbd style={{ fontFamily: 'inherit', background: '#F4F5F7', padding: '2px 5px', borderRadius: 4, fontSize: 10 }}>↵</kbd> Select</span>
                    <span><kbd style={{ fontFamily: 'inherit', background: '#F4F5F7', padding: '2px 5px', borderRadius: 4, fontSize: 10 }}>Esc</kbd> Close</span>
                </div>
            </div>
        </div>
    );
}

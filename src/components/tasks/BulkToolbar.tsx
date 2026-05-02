"use client";
import React, { useState } from 'react';
import { X, ChevronDown, Check, Trash2, UserCheck, Zap } from 'lucide-react';
import type { TaskStatus, Priority } from './types';
import { STATUS_COLORS, STATUS_BG, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUSES, PRIORITIES } from './types';

interface BulkToolbarProps {
    count: number;
    onClear: () => void;
    onBulkStatus: (status: TaskStatus) => void;
    onBulkPriority: (priority: Priority) => void;
    onBulkAssign: (assignee: string) => void;
    onBulkDelete: () => void;
}

const TEAM = ['Patrick', 'Michelle', 'Alex', 'Sara', 'Jordan'];

function DropMenu({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(4px)', transition: 'background 0.15s'
            }}>
                {icon} {label} <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
            {open && (
                <div onClick={() => setOpen(false)} style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 200,
                    background: 'white', borderRadius: 12, border: '1px solid #E8EAED',
                    boxShadow: '0 -12px 40px rgba(9,30,66,0.18)', padding: 6, minWidth: 150
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function BulkToolbar({ count, onClear, onBulkStatus, onBulkPriority, onBulkAssign, onBulkDelete }: BulkToolbarProps) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', borderRadius: 14,
            background: 'linear-gradient(135deg, #0052CC 0%, #172B4D 100%)',
            boxShadow: '0 8px 32px rgba(0,82,204,0.35)', animation: 'slideUp 0.2s ease-out',
            backdropFilter: 'blur(8px)',
        }}>
            {/* Count badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12, borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={13} color="white" strokeWidth={3} />
                </div>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{count} selected</span>
            </div>

            {/* Status */}
            <DropMenu label="Set Status" icon={<Zap size={13} />}>
                {STATUSES.map(s => (
                    <button key={s} onClick={() => onBulkStatus(s)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '7px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                        background: 'transparent', fontSize: '12px', fontWeight: 600, color: STATUS_COLORS[s]
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s] }} />
                        {STATUS_LABELS[s]}
                    </button>
                ))}
            </DropMenu>

            {/* Priority */}
            <DropMenu label="Set Priority" icon={<ChevronDown size={13} />}>
                {PRIORITIES.map(p => (
                    <button key={p} onClick={() => onBulkPriority(p)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '7px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                        background: 'transparent', fontSize: '12px', fontWeight: 700, color: PRIORITY_COLORS[p]
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_COLORS[p] }} />
                        {PRIORITY_LABELS[p]}
                    </button>
                ))}
            </DropMenu>

            {/* Assign */}
            <DropMenu label="Assign" icon={<UserCheck size={13} />}>
                {TEAM.map(name => {
                    const palette = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0'];
                    let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
                    const color = palette[Math.abs(h) % palette.length];
                    return (
                        <button key={name} onClick={() => onBulkAssign(name)} style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            padding: '7px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                            background: 'transparent', fontSize: '12px', fontWeight: 500, color: '#172B4D'
                        }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: color, color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {name.substring(0, 2).toUpperCase()}
                            </div>
                            {name}
                        </button>
                    );
                })}
            </DropMenu>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />

            {/* Delete */}
            <button onClick={onBulkDelete} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                background: 'rgba(255,86,48,0.25)', border: '1px solid rgba(255,86,48,0.4)',
                borderRadius: 8, color: '#FFB3A0', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
            }}>
                <Trash2 size={13} /> Delete
            </button>

            {/* Close */}
            <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex', alignItems: 'center' }}>
                <X size={16} />
            </button>
        </div>
    );
}

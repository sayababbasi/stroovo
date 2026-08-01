"use client";

import React, { useState } from 'react';
import { AlertTriangle, CornerDownRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminMoveTeamModal({
    isOpen,
    onClose,
    onSuccess,
    team,
    targetParent,
    allTeams
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    team: any;
    targetParent: any | null; // null means moving to root
    allTeams: any[];
}) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !team) return null;

    const currentParent = allTeams.find(t => t.id === team.parentTeamId);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/teams/hierarchy/move', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: team.id,
                    targetParentId: targetParent ? targetParent.id : null
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Successfully moved ${team.name}`);
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || 'Failed to move team');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.54)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25)' }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Move Team</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }} disabled={loading}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    <p style={{ margin: '0 0 16px', color: '#42526E', fontSize: '14px', lineHeight: '1.5' }}>
                        You are moving <strong>{team.name}</strong> to a new location in the hierarchy.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F4F5F7', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6B778C', fontSize: '13px', fontWeight: 600 }}>Current Parent:</span>
                            <span style={{ color: '#172B4D', fontSize: '13px', fontWeight: 500 }}>{currentParent ? currentParent.name : 'Root Organization'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6B778C', fontSize: '13px', fontWeight: 600 }}>New Parent:</span>
                            <span style={{ color: '#0052CC', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CornerDownRight size={14} /> {targetParent ? targetParent.name : 'Root Organization'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', background: '#FFFAE6', padding: '16px', borderRadius: '6px', borderLeft: '3px solid #FFAB00' }}>
                        <AlertTriangle size={20} color="#FFAB00" style={{ flexShrink: 0 }} />
                        <div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Impact Warning</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#42526E', lineHeight: '1.5' }}>
                                Moving this team will affect <strong>{team._count?.members || 0} members</strong>. 
                                Any permissions inherited from {currentParent ? currentParent.name : 'the root'} will be replaced by policies inherited from {targetParent ? targetParent.name : 'the root'}.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#42526E', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={loading}
                        style={{ height: '36px', padding: '0 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Moving...' : 'Confirm Move'}
                    </button>
                </div>
            </div>
        </div>
    );
}

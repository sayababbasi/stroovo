"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Trash2, Edit2, Archive, RefreshCw, Users, ArrowRightLeft, Plus } from 'lucide-react';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminDeleteTeamModal from './AdminDeleteTeamModal';
import AdminTransferOwnershipModal from './AdminTransferOwnershipModal';
import AdminAddTeamMemberModal from './AdminAddTeamMemberModal';
import AdminRemoveMemberModal from './AdminRemoveMemberModal';

interface AdminTeamDetailDrawerProps {
    team: any;
    onClose: () => void;
    onRefresh: () => void;
}

export default function AdminTeamDetailDrawer({ team, onClose, onRefresh }: AdminTeamDetailDrawerProps) {
    const [fullTeam, setFullTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isStatusChanging, setIsStatusChanging] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<any>(null);

    useEffect(() => {
        fetchTeamDetails();
    }, [team.id]);

    const fetchTeamDetails = async () => {
        setLoading(true);
        try {
            const res = await apiGet<any>(`/api/admin/teams/${team.id}`, null);
            if (res.success && res.data) {
                setFullTeam(res.data);
            }
        } catch (e) {
            toast.error('Failed to load team details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsStatusChanging(true);
        const newStatus = fullTeam.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
        try {
            const res = await apiPatch(`/api/admin/teams/${team.id}`, null, { status: newStatus });
            if (res.success) {
                toast.success(`Team ${newStatus === 'ACTIVE' ? 'activated' : 'archived'} successfully`);
                fetchTeamDetails();
                onRefresh();
            } else {
                toast.error(res.error || 'Failed to update team status');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsStatusChanging(false);
        }
    };

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)', zIndex: 1000 }} onClick={onClose} />
            <div style={{
                position: 'fixed', right: 0, top: 0, bottom: 0, width: '600px', maxWidth: '100vw',
                background: 'white', zIndex: 1001, boxShadow: '-4px 0 24px rgba(9,30,66,0.15)',
                display: 'flex', flexDirection: 'column'
            }}>
                
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: 0 }}>{team.name}</h2>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: fullTeam?.status === 'ACTIVE' ? '#E3FCEF' : '#FFEBE6', color: fullTeam?.status === 'ACTIVE' ? '#006644' : '#DE350B' }}>
                                {fullTeam?.status || team.status}
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>ID: {team.id}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={20} /></button>
                </div>

                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6B778C' }}>Loading details...</div>
                ) : !fullTeam ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#DE350B' }}>Failed to load team details.</div>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* Description */}
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: '0 0 8px' }}>Description</h3>
                            <p style={{ fontSize: '14px', color: '#42526E', margin: 0, lineHeight: 1.5 }}>{fullTeam.description || 'No description provided.'}</p>
                        </div>

                        {/* Admin Controls */}
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={16} color="#6554C0" /> Administrative Actions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '8px', border: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Transfer Ownership</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C' }}>Change the primary team lead.</div>
                                    </div>
                                    <button onClick={() => setIsTransferModalOpen(true)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ArrowRightLeft size={14} /> Transfer
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '8px', border: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Archive Team</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C' }}>Freeze team activity but preserve history.</div>
                                    </div>
                                    <button onClick={handleToggleStatus} disabled={isStatusChanging} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: fullTeam.status === 'ACTIVE' ? '#FF8B00' : '#36B37E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Archive size={14} /> {fullTeam.status === 'ACTIVE' ? 'Archive' : 'Restore'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '8px', border: '1px solid #FFEBE6', background: '#FFF7F5' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#DE350B' }}>Delete Team</div>
                                        <div style={{ fontSize: '12px', color: '#DE350B' }}>Permanently remove this team and its associations.</div>
                                    </div>
                                    <button onClick={() => setIsDeleteModalOpen(true)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #FFBDAD', background: '#FFEBE6', color: '#DE350B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* Members Overview */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={16} /> Members ({fullTeam.members?.length || 0})
                                </h3>
                                <button onClick={() => setIsAddMemberModalOpen(true)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Plus size={14} /> Add Member
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {fullTeam.members?.slice(0, 5).map((m: any) => (
                                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {m.user.image ? (
                                                <img src={m.user.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E9F2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                                                    {m.user.name?.substring(0,2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{m.user.name}</div>
                                                <div style={{ fontSize: '12px', color: '#6B778C' }}>{m.user.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: m.role === 'OWNER' ? '#6554C0' : '#42526E', background: m.role === 'OWNER' ? '#EAE6FF' : '#F4F5F7', padding: '2px 8px', borderRadius: '4px' }}>
                                                {m.role}
                                            </span>
                                            {m.role !== 'OWNER' && (
                                                <button
                                                    onClick={() => setMemberToRemove(m)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#DE350B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    title="Remove Member"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {fullTeam.members?.length > 5 && (
                                    <div style={{ textAlign: 'center', padding: '8px', fontSize: '13px', color: '#0052CC', fontWeight: 600, cursor: 'pointer' }}>
                                        View all {fullTeam.members.length} members
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {isDeleteModalOpen && (
                <AdminDeleteTeamModal 
                    team={fullTeam}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onSuccess={() => {
                        setIsDeleteModalOpen(false);
                        onClose();
                        onRefresh();
                    }}
                />
            )}

            {isAddMemberModalOpen && (
                <AdminAddTeamMemberModal
                    team={fullTeam || team}
                    isOpen={isAddMemberModalOpen}
                    onClose={() => setIsAddMemberModalOpen(false)}
                    onSuccess={() => {
                        setIsAddMemberModalOpen(false);
                        fetchTeamDetails();
                        onRefresh();
                    }}
                />
            )}

            {isTransferModalOpen && (
                <AdminTransferOwnershipModal 
                    team={fullTeam}
                    onClose={() => setIsTransferModalOpen(false)}
                    onSuccess={() => {
                        setIsTransferModalOpen(false);
                        fetchTeamDetails();
                        onRefresh();
                    }}
                />
            )}

            {memberToRemove && (
                <AdminRemoveMemberModal
                    team={fullTeam || team}
                    member={memberToRemove}
                    onClose={() => setMemberToRemove(null)}
                    onSuccess={() => {
                        setMemberToRemove(null);
                        fetchTeamDetails();
                        onRefresh();
                    }}
                />
            )}
        </>
    );
}

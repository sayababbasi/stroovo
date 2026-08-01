"use client";

import React, { useState, useEffect } from 'react';
import { X, Users, Shield, FolderTree, Activity, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminTeamHierarchyDetailDrawer({
    isOpen,
    onClose,
    team,
    allTeams,
    onRefresh
}: any) {
    if (!isOpen || !team) return null;

    const parent = allTeams.find((t: any) => t.id === team.parentTeamId);
    const children = allTeams.filter((t: any) => t.parentTeamId === team.id);

    return (
        <>
            {/* Backdrop */}
            <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.54)', zIndex: 900 }} 
                onClick={onClose}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', background: 'white',
                boxShadow: '-4px 0 16px rgba(9,30,66,0.1)', zIndex: 901, display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.2s ease-out'
            }}>
                <style>{`
                    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                `}</style>

                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#EAE6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FolderTree size={16} color="#6554C0" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>{team.name}</h2>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B778C', background: '#F4F5F7', padding: '2px 6px', borderRadius: '4px' }}>
                            {team.teamType || 'TEAM'}
                        </span>
                        <span style={{ fontSize: '12px', color: team.status === 'ACTIVE' ? '#006644' : '#BF2600', background: team.status === 'ACTIVE' ? '#E3FCEF' : '#FFEBE6', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>
                            {team.status}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Overview */}
                    <section>
                        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overview</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '13px' }}>
                            <div style={{ color: '#6B778C' }}>Description</div>
                            <div style={{ color: '#172B4D' }}>{team.description || <span style={{ color: '#8A94A6', fontStyle: 'italic' }}>No description</span>}</div>
                            
                            <div style={{ color: '#6B778C' }}>Created</div>
                            <div style={{ color: '#172B4D' }}>{format(new Date(team.createdAt), 'MMM d, yyyy')}</div>
                        </div>
                    </section>

                    {/* Hierarchy Context */}
                    <section>
                        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hierarchy</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F4F5F7', padding: '16px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6B778C', fontSize: '13px' }}>Parent Team</span>
                                <span style={{ color: '#172B4D', fontSize: '13px', fontWeight: 500 }}>{parent ? parent.name : 'None (Root)'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6B778C', fontSize: '13px' }}>Sub-teams</span>
                                <span style={{ color: '#172B4D', fontSize: '13px', fontWeight: 500 }}>{children.length} direct children</span>
                            </div>
                        </div>
                    </section>

                    {/* Leadership & Members */}
                    <section>
                        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Structure</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '13px' }}>
                            <div style={{ color: '#6B778C' }}>Team Lead</div>
                            <div>
                                {team.lead ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={team.lead.image || `https://ui-avatars.com/api/?name=${team.lead.name}`} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                        <span style={{ color: '#172B4D', fontWeight: 500 }}>{team.lead.name}</span>
                                    </div>
                                ) : <span style={{ color: '#8A94A6', fontStyle: 'italic' }}>Unassigned</span>}
                            </div>
                            
                            <div style={{ color: '#6B778C' }}>Total Members</div>
                            <div style={{ color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={16} color="#6B778C" /> {team._count?.members || 0} active members
                            </div>
                        </div>
                    </section>

                    {/* Access & Permissions */}
                    <section>
                        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Control</h4>
                        <div style={{ border: '1px solid #DFE1E6', borderRadius: '8px', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Shield size={16} color="#0052CC" />
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Inherited Access</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#42526E', lineHeight: '1.5' }}>
                                This team inherently receives access policies from <strong>{parent ? parent.name : 'the Organization Root'}</strong>.
                                Any custom access policies assigned directly to {team.name} will override or merge with inherited policies based on configuration.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

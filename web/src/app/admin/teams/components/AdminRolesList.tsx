"use client";

import React, { useState } from 'react';
import { Search, Plus, Shield, ShieldCheck } from 'lucide-react';
import { getRoleIcon } from '@/lib/iconMap';

interface AdminRolesListProps {
    roles: any[];
    selectedRoleId: string | null;
    onSelectRole: (id: string) => void;
    onCreateClick: () => void;
}

export default function AdminRolesList({ roles, selectedRoleId, onSelectRole, onCreateClick }: AdminRolesListProps) {
    const [search, setSearch] = useState('');

    const filteredRoles = roles.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
    );

    const systemRoles = filteredRoles.filter(r => r.isSystem);
    const customRoles = filteredRoles.filter(r => !r.isSystem);

    const renderRoleItem = (role: any) => {
        const isSelected = role.id === selectedRoleId;
        const RoleIcon = getRoleIcon(role.name);
        
        return (
            <div 
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                style={{
                    padding: '16px',
                    borderBottom: '1px solid #DFE1E6',
                    cursor: 'pointer',
                    background: isSelected ? '#E9F2FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #0052CC' : '3px solid transparent',
                    transition: 'all 0.1s'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: isSelected ? '#0052CC' : '#172B4D' }}>
                        <div style={{ color: isSelected ? '#0052CC' : '#42526E' }}>
                            <RoleIcon size={16} />
                        </div>
                        {role.name}
                    </div>
                    {role.isSystem ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#6554C0', background: '#F4F1FD', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            <ShieldCheck size={10} /> System
                        </div>
                    ) : (
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B778C', background: '#F4F5F7', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            Custom
                        </div>
                    )}
                </div>
                {role.description && (
                    <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {role.description}
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#8A94A6', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={12} /> {role._count?.permissions || 0} permissions
                    </span>
                    <span>•</span>
                    <span>{role.memberCount || 0} members</span>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 4px rgba(9,30,66,0.04)', overflow: 'hidden' }}>
            
            {/* Header & Search */}
            <div style={{ padding: '20px', borderBottom: '1px solid #DFE1E6' }}>
                <button 
                    onClick={onCreateClick}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}
                >
                    <Plus size={16} /> New Role
                </button>

                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search roles..."
                        style={{
                            width: '100%', height: '36px', paddingLeft: '34px', paddingRight: '12px',
                            borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none', background: '#FAFBFC'
                        }}
                    />
                </div>
            </div>

            {/* List Area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {systemRoles.length > 0 && (
                    <div>
                        <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#FAFBFC', borderBottom: '1px solid #DFE1E6' }}>
                            System Roles
                        </div>
                        {systemRoles.map(renderRoleItem)}
                    </div>
                )}

                {customRoles.length > 0 ? (
                    <div>
                        <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#FAFBFC', borderBottom: '1px solid #DFE1E6', borderTop: systemRoles.length > 0 ? 'none' : '1px solid #DFE1E6' }}>
                            Custom Roles
                        </div>
                        {customRoles.map(renderRoleItem)}
                    </div>
                ) : (
                    search === '' && (
                        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '4px' }}>No custom roles yet</div>
                            <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '16px' }}>Create a custom role to give your teams exactly the access they need.</div>
                            <button onClick={onCreateClick} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Create Custom Role</button>
                        </div>
                    )
                )}

                {filteredRoles.length === 0 && search !== '' && (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B778C', fontSize: '13px' }}>
                        No roles match your search.
                    </div>
                )}
            </div>
        </div>
    );
}

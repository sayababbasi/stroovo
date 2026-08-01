"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, Settings, Edit2, Copy, Trash2, CalendarDays } from 'lucide-react';
import AdminPermissionMatrix from './AdminPermissionMatrix';
import AdminRoleMembers from './AdminRoleMembers';
import { apiGet } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminRoleDetailProps {
    role: any;
    allPermissions: any[];
    onRefresh: () => void;
}

export default function AdminRoleDetail({ role, allPermissions, onRefresh }: AdminRoleDetailProps) {
    const [activeTab, setActiveTab] = useState('Permissions');
    const [roleDetails, setRoleDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role) {
            fetchRoleDetails();
        }
    }, [role.id]);

    const fetchRoleDetails = async () => {
        setLoading(true);
        try {
            // Need the full role with specific users and permissions
            const res = await apiGet<any>(`/api/admin/roles/${role.id}`);
            if (res.success && res.data) {
                setRoleDetails(res.data);
            } else {
                setRoleDetails(role); // Fallback
            }
        } catch (error) {
            console.error('Failed to fetch role details:', error);
            setRoleDetails(role);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (!roleDetails) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6B778C' }}>
                Loading role details...
            </div>
        );
    }

    const tabs = ['Permissions', 'Members', 'Audit Activity'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: 0 }}>{roleDetails.name}</h2>
                            {roleDetails.isSystem ? (
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6554C0', background: '#F4F1FD', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    System Role
                                </span>
                            ) : (
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', background: '#F4F5F7', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    Custom Role
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: '14px', color: '#6B778C', margin: 0, maxWidth: '600px' }}>
                            {roleDetails.description || 'No description provided.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Edit2 size={14} /> Edit
                        </button>
                        <button style={{ height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Copy size={14} /> Duplicate
                        </button>
                        {!roleDetails.isSystem && (
                            <button style={{ height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#DE350B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#6B778C' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} /> {roleDetails.users?.length || 0} members
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarDays size={16} /> Created {formatDate(roleDetails.createdAt)}
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ padding: '0 32px', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '32px' }}>
                {tabs.map(tab => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '16px 0',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: activeTab === tab ? '#0052CC' : '#6B778C',
                            borderBottom: activeTab === tab ? '2px solid #0052CC' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#6B778C', padding: '48px' }}>Loading...</div>
                ) : (
                    <>
                        {activeTab === 'Permissions' && (
                            <AdminPermissionMatrix 
                                role={roleDetails} 
                                allPermissions={allPermissions}
                                onSave={onRefresh}
                            />
                        )}
                        {activeTab === 'Members' && (
                            <AdminRoleMembers 
                                role={roleDetails} 
                                onRefresh={() => {
                                    fetchRoleDetails();
                                    onRefresh();
                                }}
                            />
                        )}
                        {activeTab === 'Audit Activity' && (
                            <div style={{ textAlign: 'center', color: '#6B778C', padding: '48px', border: '1px dashed #DFE1E6', borderRadius: '8px' }}>
                                Audit activity logging for this role will appear here.
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
}

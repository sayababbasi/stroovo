"use client";

import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminRolesList from './AdminRolesList';
import AdminRoleDetail from './AdminRoleDetail';
import AdminCreateRoleModal from './AdminCreateRoleModal';

export default function AdminRolesTab() {
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                apiGet<any[]>('/api/admin/roles'),
                apiGet<any[]>('/api/admin/permissions')
            ]);
            
            if (rolesRes.success && rolesRes.data) {
                setRoles(rolesRes.data);
                // Auto-select first role if none selected
                if (!selectedRoleId && rolesRes.data.length > 0) {
                    setSelectedRoleId(rolesRes.data[0].id);
                }
            }
            if (permsRes.success && permsRes.data) {
                setPermissions(permsRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch RBAC data:', error);
            toast.error('Failed to load roles and permissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 200px)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600, color: '#172B4D' }}>Roles & Permissions</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Manage organization roles, security policies, and granular access permissions.</p>
                </div>
            </div>

            {loading && roles.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                    Loading RBAC configuration...
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', gap: '24px', minHeight: 0 }}>
                    {/* Left Panel: Role List */}
                    <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                        <AdminRolesList 
                            roles={roles} 
                            selectedRoleId={selectedRoleId} 
                            onSelectRole={setSelectedRoleId} 
                            onCreateClick={() => setIsCreateModalOpen(true)}
                        />
                    </div>

                    {/* Right Panel: Role Detail / Matrix */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 4px rgba(9,30,66,0.04)', overflow: 'hidden' }}>
                        {selectedRole ? (
                            <AdminRoleDetail 
                                role={selectedRole} 
                                allPermissions={permissions} 
                                onRefresh={fetchData}
                            />
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                                Select a role to view configuration
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <AdminCreateRoleModal 
                    roles={roles}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={(newRole) => {
                        setIsCreateModalOpen(false);
                        fetchData();
                        setSelectedRoleId(newRole.id);
                    }}
                />
            )}
        </div>
    );
}

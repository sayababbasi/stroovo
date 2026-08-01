"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShieldAlert, Check, X, AlertCircle } from 'lucide-react';
import { apiPut } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminPermissionMatrixProps {
    role: any;
    allPermissions: any[];
    onSave: () => void;
}

export default function AdminPermissionMatrix({ role, allPermissions, onSave }: AdminPermissionMatrixProps) {
    const [search, setSearch] = useState('');
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    
    // role.permissions is an array of { permissionId, roleId, permission: { key, module, action, description } }
    const initialKeys = role.permissions?.map((p: any) => p.permission?.key) || [];
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(initialKeys));
    const [isSaving, setIsSaving] = useState(false);

    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, any[]> = {};
        allPermissions.forEach(p => {
            if (!groups[p.module]) groups[p.module] = [];
            groups[p.module].push(p);
        });
        return groups;
    }, [allPermissions]);

    // Initialize all expanded by default
    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(groupedPermissions).forEach(module => {
            initialExpanded[module] = true;
        });
        setExpandedModules(initialExpanded);
    }, [groupedPermissions]);

    const hasUnsavedChanges = useMemo(() => {
        if (selectedKeys.size !== initialKeys.length) return true;
        for (const key of initialKeys) {
            if (!selectedKeys.has(key)) return true;
        }
        return false;
    }, [selectedKeys, initialKeys]);

    const handleTogglePermission = (key: string) => {
        const next = new Set(selectedKeys);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedKeys(next);
    };

    const handleQuickSelect = (moduleName: string, perms: any[], level: 'NONE' | 'VIEW' | 'FULL') => {
        const next = new Set(selectedKeys);
        
        // Remove all perms for this module first
        perms.forEach(p => next.delete(p.key));
        
        if (level === 'FULL') {
            perms.forEach(p => next.add(p.key));
        } else if (level === 'VIEW') {
            const viewPerm = perms.find(p => p.action === 'View' || p.key.endsWith('.view'));
            if (viewPerm) next.add(viewPerm.key);
        }
        
        setSelectedKeys(next);
    };

    const handleModuleToggleAll = (modulePermissions: any[]) => {
        const next = new Set(selectedKeys);
        const moduleKeys = modulePermissions.map(p => p.key);
        const allSelected = moduleKeys.every(k => next.has(k));
        
        if (allSelected) {
            moduleKeys.forEach(k => next.delete(k));
        } else {
            moduleKeys.forEach(k => next.add(k));
        }
        setSelectedKeys(next);
    };

    const handleGrantAll = () => {
        const next = new Set<string>();
        allPermissions.forEach(p => next.add(p.key));
        setSelectedKeys(next);
    };

    const handleRemoveAll = () => {
        setSelectedKeys(new Set());
    };

    const handleDiscard = () => {
        setSelectedKeys(new Set(initialKeys));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await apiPut(`/api/admin/roles/${role.id}/permissions`, null, {
                permissionKeys: Array.from(selectedKeys)
            });

            if (res.success) {
                toast.success('Permissions updated successfully');
                onSave(); // Refresh parent
            } else {
                toast.error(res.error || 'Failed to update permissions');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    // Filter modules by search
    const filteredModules = Object.entries(groupedPermissions).filter(([moduleName, perms]) => {
        if (search === '') return true;
        if (moduleName.toLowerCase().includes(search.toLowerCase())) return true;
        return perms.some(p => 
            p.description?.toLowerCase().includes(search.toLowerCase()) ||
            p.action.toLowerCase().includes(search.toLowerCase())
        );
    });

    const toggleModuleExpand = (moduleName: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleName]: !prev[moduleName]
        }));
    };

    const isSuperAdmin = role.name === 'Super Admin';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search permissions..."
                        style={{
                            width: '100%', height: '36px', paddingLeft: '34px', paddingRight: '12px',
                            borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleRemoveAll} disabled={isSuperAdmin} style={{ height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '12px', fontWeight: 600, cursor: isSuperAdmin ? 'not-allowed' : 'pointer', opacity: isSuperAdmin ? 0.5 : 1 }}>
                        Remove All
                    </button>
                    <button onClick={handleGrantAll} style={{ height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Grant All
                    </button>
                </div>
            </div>

            {/* Unsaved Changes Banner */}
            {hasUnsavedChanges && (
                <div style={{ background: '#FFFAE6', border: '1px solid #FFC400', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF8B00', fontSize: '13px', fontWeight: 600 }}>
                        <AlertCircle size={16} /> You have unsaved permission changes.
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleDiscard} disabled={isSaving} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#42526E', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            Discard
                        </button>
                        <button onClick={handleSave} disabled={isSaving} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '12px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {isSuperAdmin && (
                <div style={{ background: '#DE350B10', border: '1px solid #DE350B', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DE350B', fontSize: '13px' }}>
                    <ShieldAlert size={16} /> <strong>Super Admin Warning:</strong> You cannot strip all permissions from this role to prevent organization lockout.
                </div>
            )}

            {/* Matrix */}
            <div style={{ border: '1px solid #DFE1E6', borderRadius: '8px', overflow: 'hidden' }}>
                {filteredModules.map(([moduleName, perms]) => {
                    const isExpanded = expandedModules[moduleName];
                    const moduleKeys = perms.map(p => p.key);
                    const allModuleSelected = moduleKeys.every(k => selectedKeys.has(k));
                    const someModuleSelected = moduleKeys.some(k => selectedKeys.has(k)) && !allModuleSelected;

                    return (
                        <div key={moduleName} style={{ borderBottom: '1px solid #DFE1E6' }}>
                            {/* Module Header */}
                            <div 
                                style={{ 
                                    padding: '16px', 
                                    background: '#FAFBFC', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                                onClick={() => toggleModuleExpand(moduleName)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div 
                                        style={{ width: '12px', height: '12px', border: '2px solid', borderColor: allModuleSelected ? '#0052CC' : someModuleSelected ? '#0052CC' : '#DFE1E6', borderRadius: '3px', background: allModuleSelected ? '#0052CC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={(e) => { e.stopPropagation(); handleModuleToggleAll(perms); }}
                                    >
                                        {allModuleSelected && <Check size={10} color="white" />}
                                        {someModuleSelected && <div style={{ width: '6px', height: '6px', background: '#0052CC', borderRadius: '1px' }} />}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>
                                        {moduleName}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#8A94A6' }}>
                                        {moduleKeys.filter(k => selectedKeys.has(k)).length} / {perms.length} granted
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleQuickSelect(moduleName, perms, 'NONE'); }}
                                        style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', border: '1px solid #DFE1E6', background: moduleKeys.every(k => !selectedKeys.has(k)) ? '#FFEBE6' : 'white', color: moduleKeys.every(k => !selectedKeys.has(k)) ? '#DE350B' : '#42526E', cursor: 'pointer' }}
                                    >
                                        No Access
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleQuickSelect(moduleName, perms, 'VIEW'); }}
                                        style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', cursor: 'pointer' }}
                                    >
                                        View Only
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleQuickSelect(moduleName, perms, 'FULL'); }}
                                        style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', border: '1px solid #DFE1E6', background: allModuleSelected ? '#E3FCEF' : 'white', color: allModuleSelected ? '#006644' : '#42526E', cursor: 'pointer' }}
                                    >
                                        Full Access
                                    </button>
                                    <div style={{ width: '1px', height: '16px', background: '#DFE1E6', margin: '0 8px' }} />
                                    <div style={{ color: '#6B778C', fontSize: '12px', fontWeight: 600 }}>
                                        {isExpanded ? 'Collapse' : 'Expand'}
                                    </div>
                                </div>
                            </div>

                            {/* Module Permissions Grid */}
                            {isExpanded && (
                                <div style={{ padding: '16px', background: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                    {perms.map((p) => (
                                        <div 
                                            key={p.key}
                                            onClick={() => handleTogglePermission(p.key)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                padding: '12px',
                                                borderRadius: '6px',
                                                border: selectedKeys.has(p.key) ? '1px solid #0052CC' : '1px solid #DFE1E6',
                                                background: selectedKeys.has(p.key) ? '#E9F2FF' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.1s'
                                            }}
                                        >
                                            <div style={{ width: '16px', height: '16px', border: '1px solid', borderColor: selectedKeys.has(p.key) ? '#0052CC' : '#DFE1E6', borderRadius: '3px', background: selectedKeys.has(p.key) ? '#0052CC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                                {selectedKeys.has(p.key) && <Check size={12} color="white" />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: selectedKeys.has(p.key) ? '#0052CC' : '#172B4D', marginBottom: '2px' }}>
                                                    {p.action}
                                                </div>
                                                <div style={{ fontSize: '12px', color: selectedKeys.has(p.key) ? '#0052CC' : '#6B778C', opacity: 0.8 }}>
                                                    {p.description || p.key}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {filteredModules.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6B778C', border: '1px solid #DFE1E6', borderRadius: '8px' }}>
                    No permissions match your search.
                </div>
            )}
        </div>
    );
}

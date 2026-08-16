"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Users, PieChart, Check, Search, MoreHorizontal } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Permission } from './PermissionMatrix';
import RoleDetail from './RoleDetail';
import { getRoleIcon } from '@/lib/iconMap';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { permissions: number; users: number };
}

function KpiCard({ icon, title, value, trend, trendLabel, color }: {
  icon: React.ReactNode; title: string; value: number | string;
  trend?: string; trendLabel?: string; color: string;
}) {
  const isPositive = trend?.startsWith('+') || trend?.startsWith('↑');
  return (
    <div style={{
      flex: 1, minWidth: '150px', background: 'white', borderRadius: '12px',
      border: '1px solid #DFE1E6', padding: '20px', boxShadow: '0 1px 4px rgba(9,30,66,0.04)',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B778C', marginBottom: '8px' }}>{title}</div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: isPositive ? '#36B37E' : '#97A0AF' }}>{trend}</span>
          <span style={{ fontSize: '12px', color: '#97A0AF' }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}



function CreateRoleModal({ onClose, onCreated }: { onClose: () => void; onCreated: (role: Role) => void }) {
  const { accessToken } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const res = await apiPost<Role>('/api/admin/roles', accessToken, { name: name.trim(), description: desc.trim() || undefined });
      if (res.success && res.data) {
        toast.success('Role created!');
        onCreated(res.data);
      } else {
        toast.error(res.error || 'Failed to create role');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: '12px', width: '480px', maxWidth: '95vw', padding: '28px', boxShadow: '0 20px 60px rgba(9,30,66,0.20)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: '0 0 6px' }}>Create New Role</h2>
        <p style={{ fontSize: '13px', color: '#6B778C', margin: '0 0 20px' }}>Create a custom role with specific permissions.</p>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '6px' }}>Role Name <span style={{ color: '#DE350B' }}>*</span></label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. QA Engineer, Designer..."
              style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none', color: '#172B4D', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What is this role for?"
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none', color: '#172B4D', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !name.trim()} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: isLoading || !name.trim() ? '#8A94A6' : '#0052CC', color: 'white', fontSize: '13px', fontWeight: 700, cursor: isLoading || !name.trim() ? 'not-allowed' : 'pointer' }}>
              {isLoading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RolesTab() {
  const { accessToken } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchRole, setSearchRole] = useState('');

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiGet<Role[]>('/api/admin/roles', accessToken),
        apiGet<Permission[]>('/api/admin/permissions', accessToken),
      ]);
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
        if (!selectedRole && rolesRes.data.length > 0) {
          setSelectedRole(rolesRes.data[0]);
        }
      }
      if (permsRes.success && permsRes.data) {
        setAllPermissions(permsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchRole.toLowerCase())
  );

  const totalRoles = roles.length;
  const customRoles = roles.filter((r) => !r.isSystem).length;
  const totalPerms = allPermissions.length;
  const totalAssignments = roles.reduce((acc, r) => acc + (r._count?.users || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <KpiCard icon={<Shield size={18} />} title="Total Roles" value={totalRoles} trend=" " trendLabel="No change" color="#6554C0" />
        <KpiCard icon={<Shield size={18} />} title="Custom Roles" value={customRoles} trend={customRoles > 0 ? '+25%' : ' '} trendLabel="vs last month" color="#0052CC" />
        <KpiCard icon={<Check size={18} />} title="Permissions" value={totalPerms} trend=" " trendLabel="No change" color="#36B37E" />
        <KpiCard icon={<Users size={18} />} title="Assignments" value={totalAssignments} trend={totalAssignments > 0 ? '+15%' : ' '} trendLabel="vs last month" color="#FF8B00" />
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
        {/* Left: Role List */}
        <div style={{
          width: '260px', flexShrink: 0, background: 'white',
          borderRadius: '12px', border: '1px solid #DFE1E6',
          boxShadow: '0 1px 4px rgba(9,30,66,0.04)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* List Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #F0F1F3', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Roles</span>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  height: '28px', padding: '0 10px', borderRadius: '6px', border: 'none',
                  background: '#0052CC', color: 'white', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={12} /> New Role
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
              <input
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                placeholder="Search roles..."
                style={{
                  width: '100%', height: '32px', paddingLeft: '30px', paddingRight: '10px',
                  borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '12px',
                  outline: 'none', color: '#172B4D', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Role Items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6B778C', fontSize: '13px' }}>Loading...</div>
            ) : filteredRoles.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>No roles found</p>
              </div>
            ) : (
              filteredRoles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                const RoleIcon = getRoleIcon(role.name);
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', cursor: 'pointer',
                      background: isSelected ? '#EEF2FF' : 'transparent',
                      borderLeft: isSelected ? '3px solid #0052CC' : '3px solid transparent',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = '#F8F9FA')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: isSelected ? '#DBEAFE' : '#F4F5F7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                      flexShrink: 0, color: isSelected ? '#0052CC' : '#42526E'
                    }}>
                      <RoleIcon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#0052CC' : '#172B4D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {role.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8A94A6' }}>
                        {role._count?.users ?? 0} members
                      </div>
                    </div>
                    {role.isSystem && (
                      <span style={{ fontSize: '10px', color: '#8A94A6', border: '1px solid #DFE1E6', borderRadius: '4px', padding: '1px 5px', flexShrink: 0 }}>SYS</span>
                    )}
                  </div>
                );
              })
            )}

            {/* View Archived */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F1F3', marginTop: '4px' }}>
              <button style={{ background: 'none', border: 'none', color: '#6B778C', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
                <PieChart size={12} /> View Archived Roles
              </button>
            </div>
          </div>
        </div>

        {/* Right: Role Detail */}
        <RoleDetail
          role={selectedRole}
          allPermissions={allPermissions}
          onRoleUpdated={fetchRoles}
          onRoleDeleted={() => {
            setSelectedRole(null);
            fetchRoles();
          }}
        />
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newRole) => {
            setShowCreateModal(false);
            fetchRoles();
            setSelectedRole(newRole);
          }}
        />
      )}
    </div>
  );
}

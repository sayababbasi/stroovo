"use client";

import React, { useState, useEffect } from 'react';
import { Users, Shield, Settings, MoreHorizontal, Edit2, Copy, Archive, Trash2, AlertTriangle } from 'lucide-react';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import PermissionMatrix, { Permission } from './PermissionMatrix';
import { getRoleIcon } from '@/lib/iconMap';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { permissions: number; users: number };
  permissions?: { permission: Permission; permissionId: string; roleId: string }[];
  users?: { id: string; name: string | null; email: string }[];
}

interface RoleDetailProps {
  role: Role | null;
  allPermissions: Permission[];
  onRoleUpdated: () => void;
  onRoleDeleted: () => void;
}

type DetailTab = 'permissions' | 'members' | 'settings';

function Avatar({ name, size = 32 }: { name: string | null; size?: number }) {
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const colors = ['#6554C0', '#0052CC', '#36B37E', '#FF8B00'];
  const colorIndex = (name || '').length % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${colors[colorIndex]}20`, color: colors[colorIndex],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}



export default function RoleDetail({ role, allPermissions, onRoleUpdated, onRoleDeleted }: RoleDetailProps) {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<DetailTab>('permissions');
  const [fullRole, setFullRole] = useState<Role | null>(null);
  const [isSavingPerms, setIsSavingPerms] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [descValue, setDescValue] = useState('');

  useEffect(() => {
    if (!role) return;
    setActiveTab('permissions');
    setShowDeleteConfirm(false);
    setEditingName(false);
    fetchFullRole();
  }, [role?.id]);

  const fetchFullRole = async () => {
    if (!role) return;
    try {
      const res = await apiGet<Role>(`/api/admin/roles/${role.id}`, accessToken);
      if (res.success && res.data) {
        setFullRole(res.data);
        setNameValue(res.data.name);
        setDescValue(res.data.description || '');
      }
    } catch (err) {
      console.error('Failed to fetch role details:', err);
    }
  };

  const handleSavePermissions = async (permissionKeys: string[]) => {
    if (!role) return;
    setIsSavingPerms(true);
    try {
      const res = await apiPatch(
        `/api/admin/roles/${role.id}/permissions`,
        accessToken,
        { permissionKeys }
      );
      if (res.success) {
        toast.success('Permissions saved');
        fetchFullRole();
        onRoleUpdated();
      } else {
        toast.error(res.error || 'Failed to save permissions');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save permissions');
    } finally {
      setIsSavingPerms(false);
    }
  };

  const handleSaveRoleInfo = async () => {
    if (!role) return;
    try {
      const res = await apiPatch(`/api/admin/roles/${role.id}`, accessToken, {
        name: nameValue,
        description: descValue,
      });
      if (res.success) {
        toast.success('Role updated');
        setEditingName(false);
        fetchFullRole();
        onRoleUpdated();
      } else {
        toast.error(res.error || 'Failed to update role');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    try {
      const res = await apiDelete(`/api/admin/roles/${role.id}`, accessToken);
      if (res.success) {
        toast.success('Role deleted');
        onRoleDeleted();
      } else {
        toast.error(res.error || 'Failed to delete role');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  if (!role) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC', borderRadius: '12px', border: '1px solid #DFE1E6', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Shield size={40} style={{ color: '#DFE1E6', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#6B778C', margin: 0 }}>Select a role to view details</p>
          <p style={{ fontSize: '13px', color: '#97A0AF', marginTop: '4px' }}>Choose a role from the list on the left</p>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(role.name);
  const existingKeys = fullRole?.permissions?.map((rp) => rp.permission.key) || [];
  const memberCount = fullRole?.users?.length ?? fullRole?._count?.users ?? role._count?.users ?? 0;
  const permCount = fullRole?.permissions?.length ?? fullRole?._count?.permissions ?? role._count?.permissions ?? 0;

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'permissions', label: 'Permissions', icon: <Shield size={14} /> },
    { id: 'members', label: `Members (${memberCount})`, icon: <Users size={14} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
  ];

  return (
    <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Role Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: '#E9F2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', color: '#0052CC'
            }}>
              <RoleIcon size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: 0 }}>{role.name}</h2>
                <span style={{
                  padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                  background: role.isSystem ? '#EEF2FF' : '#E3FCEF',
                  color: role.isSystem ? '#0052CC' : '#006644',
                }}>
                  {role.isSystem ? '🔒 System Role' : '✨ Custom Role'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>
                {role.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Header Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', background: '#F4F5F7', border: '1px solid #DFE1E6',
            }}>
              <Users size={14} style={{ color: '#6B778C' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>{memberCount}</span>
              <span style={{ fontSize: '13px', color: '#6B778C' }}>Members</span>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #DFE1E6',
                  background: 'white', color: '#42526E', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <>
                  <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
                  <div style={{
                    position: 'absolute', right: 0, top: '42px', zIndex: 100,
                    background: 'white', border: '1px solid #DFE1E6', borderRadius: '10px',
                    boxShadow: '0 8px 24px rgba(9,30,66,0.15)', minWidth: '180px', overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => { setEditingName(true); setActiveTab('settings'); setShowMenu(false); }}
                      style={menuItemStyle}
                    >
                      <Edit2 size={14} /> Edit Role
                    </button>
                    <button onClick={() => setShowMenu(false)} style={menuItemStyle}>
                      <Copy size={14} /> Duplicate Role
                    </button>
                    {!role.isSystem && (
                      <>
                        <div style={{ height: '1px', background: '#F0F1F3', margin: '4px 0' }} />
                        <button
                          onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                          style={{ ...menuItemStyle, color: '#DE350B' }}
                        >
                          <Trash2 size={14} /> Delete Role
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #DFE1E6', marginBottom: '-25px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #0052CC' : '2px solid transparent',
                color: activeTab === tab.id ? '#0052CC' : '#6B778C',
                fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Delete Confirm */}
        {showDeleteConfirm && (
          <div style={{
            marginBottom: '20px', padding: '20px', borderRadius: '10px',
            background: '#FFEBE6', border: '1px solid #FFBDAD',
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} style={{ color: '#DE350B', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#DE350B', margin: '0 0 4px' }}>Delete "{role.name}" role?</p>
                <p style={{ fontSize: '13px', color: '#BF2600', margin: '0 0 12px' }}>
                  This action cannot be undone. Users assigned this role will lose their permissions.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #FFBDAD', background: 'white', color: '#DE350B', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#DE350B', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <PermissionMatrix
            roleId={role.id}
            roleName={role.name}
            isSystem={role.isSystem}
            existingPermissionKeys={existingKeys}
            allPermissions={allPermissions}
            onSave={handleSavePermissions}
            isSaving={isSavingPerms}
          />
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            {!fullRole?.users || fullRole.users.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Users size={36} style={{ color: '#DFE1E6', marginBottom: '12px' }} />
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#6B778C', margin: 0 }}>No members assigned</p>
                <p style={{ fontSize: '13px', color: '#97A0AF', marginTop: '4px' }}>No users have this role assigned yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fullRole.users.map((u) => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px', border: '1px solid #F0F1F3',
                    background: '#FAFBFC',
                  }}>
                    <Avatar name={u.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{u.name || 'Unknown'}</div>
                      <div style={{ fontSize: '12px', color: '#6B778C' }}>{u.email}</div>
                    </div>
                    <span style={{ padding: '2px 10px', borderRadius: '100px', background: '#EEF2FF', color: '#0052CC', fontSize: '11px', fontWeight: 700 }}>
                      {role.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '560px' }}>
            <section>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', margin: '0 0 16px' }}>Role Information</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '6px' }}>Role Name</label>
                  {editingName ? (
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px', border: '2px solid #0052CC', fontSize: '13px', outline: 'none', color: '#172B4D', boxSizing: 'border-box' }}
                    />
                  ) : (
                    <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', color: '#172B4D', background: role.isSystem ? '#FAFBFC' : 'white' }}>
                      {role.name}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '6px' }}>Description</label>
                  {editingName ? (
                    <textarea
                      value={descValue}
                      onChange={(e) => setDescValue(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #0052CC', fontSize: '13px', outline: 'none', color: '#172B4D', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                    />
                  ) : (
                    <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', color: role.description ? '#172B4D' : '#97A0AF', background: role.isSystem ? '#FAFBFC' : 'white', minHeight: '68px' }}>
                      {role.description || 'No description'}
                    </div>
                  )}
                </div>
                {editingName && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditingName(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveRoleInfo} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0052CC', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                      Save
                    </button>
                  </div>
                )}
                {!editingName && (
                  <button onClick={() => setEditingName(true)} style={{ alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#0052CC', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit2 size={14} /> Edit Role
                  </button>
                )}
              </div>
            </section>

            <section>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', margin: '0 0 12px' }}>Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Type', value: role.isSystem ? 'System Role' : 'Custom Role' },
                  { label: 'Members', value: String(memberCount) },
                  { label: 'Permissions', value: String(permCount) },
                  { label: 'Created', value: new Date(role.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                  { label: 'Last Modified', value: new Date(role.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                ].map((item) => (
                  <div key={item.label} style={{ padding: '12px', borderRadius: '8px', background: '#F8F9FA', border: '1px solid #F0F1F3' }}>
                    <div style={{ fontSize: '11px', color: '#8A94A6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {!role.isSystem && (
              <section>
                <div style={{ padding: '20px', borderRadius: '10px', border: '1.5px solid #FFBDAD', background: '#FFFAE6' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#DE350B', margin: '0 0 8px' }}>⚠️ Danger Zone</h4>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: '0 0 12px' }}>
                    Deleting this role will remove all permission associations. Users with this role will lose their permissions immediately.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #DE350B', background: 'white', color: '#DE350B', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} /> Delete Role
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
  padding: '10px 16px', textAlign: 'left', background: 'none',
  border: 'none', color: '#172B4D', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
};

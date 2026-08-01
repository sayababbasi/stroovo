"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Plus, Check } from 'lucide-react';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
}

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userIds: string[];
}

export default function AssignRoleModal({ isOpen, onClose, onSuccess, userIds }: AssignRoleModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [primaryRoleId, setPrimaryRoleId] = useState<string>('');
  const [additionalRoleIds, setAdditionalRoleIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiGet<Role[]>('/api/admin/roles');
      if (res.success && res.data) {
        setRoles(res.data);
      }
    } catch (err) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdditionalRole = (id: string) => {
    if (primaryRoleId === id) return; // Cannot be both
    setAdditionalRoleIds(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!primaryRoleId && additionalRoleIds.length === 0) {
      toast.error('Please select at least one role');
      return;
    }
    
    setSaving(true);
    try {
      if (userIds.length === 1) {
        const res = await apiPatch(`/api/admin/users/${userIds[0]}/roles`, null, {
          primaryRoleId,
          additionalRoleIds
        });
        if (res.success) {
          toast.success('Role updated successfully');
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || 'Failed to update roles');
        }
      } else {
        const res = await apiPost('/api/admin/users/bulk-assign', null, {
          userIds,
          primaryRoleId,
          additionalRoleIds
        });
        if (res.success) {
          toast.success(`Roles updated for ${userIds.length} users`);
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || 'Failed to update roles');
        }
      }
    } catch (err) {
      toast.error('Error assigning roles');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent style={{ maxWidth: '600px', padding: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #DFE1E6' }}>
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#E9F2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Assign Roles</h2>
            <p style={{ fontSize: '13px', color: '#6B778C', margin: '4px 0 0' }}>
              Select a primary role and optional additional roles for {userIds.length} user{userIds.length > 1 ? 's' : ''}.
            </p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B778C', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>Loading roles...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Primary Role */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#172B4D', marginBottom: '12px' }}>
                  Primary Role <span style={{ color: '#DE350B' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {roles.map(role => (
                    <div 
                      key={role.id}
                      onClick={() => {
                        setPrimaryRoleId(role.id);
                        if (additionalRoleIds.includes(role.id)) {
                          setAdditionalRoleIds(prev => prev.filter(id => id !== role.id));
                        }
                      }}
                      style={{
                        padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                        border: primaryRoleId === role.id ? '2px solid #0052CC' : '1px solid #DFE1E6',
                        background: primaryRoleId === role.id ? '#F4F5F7' : 'white',
                        display: 'flex', alignItems: 'center', gap: '12px'
                      }}
                    >
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: primaryRoleId === role.id ? '5px solid #0052CC' : '1px solid #A5ADBA', display: 'flex', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{role.name}</div>
                        {role.isSystem && <div style={{ fontSize: '11px', color: '#8A94A6', marginTop: '2px' }}>System Role</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Roles */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#172B4D', marginBottom: '12px' }}>
                  Additional Roles (Optional)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {roles.filter(r => r.id !== primaryRoleId).map(role => (
                    <label 
                      key={role.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        border: '1px solid #DFE1E6', borderRadius: '8px', cursor: 'pointer',
                        background: additionalRoleIds.includes(role.id) ? '#F4F5F7' : 'white'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={additionalRoleIds.includes(role.id)}
                        onChange={() => toggleAdditionalRole(role.id)}
                        style={{ width: '16px', height: '16px', accentColor: '#0052CC' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{role.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #DFE1E6', background: '#FAFBFC', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{ padding: '0 16px', height: '36px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!primaryRoleId && additionalRoleIds.length === 0)}
            style={{ padding: '0 20px', height: '36px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontSize: '13px', fontWeight: 600, cursor: (!primaryRoleId && additionalRoleIds.length === 0) ? 'not-allowed' : 'pointer', opacity: (!primaryRoleId && additionalRoleIds.length === 0) ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : 'Assign Roles'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

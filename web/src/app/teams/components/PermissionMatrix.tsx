"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { getModuleIcon } from '@/lib/iconMap';

export interface Permission {
  id: string;
  module: string;
  action: string;
  key: string;
  description?: string;
}

export interface RolePermissionState {
  [permKey: string]: boolean;
}

interface PermissionMatrixProps {
  roleId: string;
  roleName: string;
  isSystem: boolean;
  existingPermissionKeys: string[];
  allPermissions: Permission[];
  onSave: (permissionKeys: string[]) => Promise<void>;
  isSaving: boolean;
}


// Access level definitions (UI concept   maps from permission key patterns)
type AccessLevel = 'none' | 'view' | 'edit' | 'full';

function getAccessLevelForModule(module: string, permState: RolePermissionState, perms: Permission[]): AccessLevel {
  const modulePerms = perms.filter((p) => p.module === module);
  const activeModulePerms = modulePerms.filter((p) => permState[p.key]);

  if (activeModulePerms.length === 0) return 'none';

  const hasDelete = activeModulePerms.some((p) => p.action.includes('delete') || p.action === 'delete');
  const hasCreate = activeModulePerms.some((p) => p.action.includes('create') || p.action === 'create');
  const hasRead = activeModulePerms.some((p) => p.action.includes('read') || p.action === 'read');

  if (hasDelete && hasCreate) return 'full';
  if (hasCreate) return 'edit';
  if (hasRead) return 'view';
  return 'none';
}

function setAccessLevelForModule(
  module: string,
  level: AccessLevel,
  perms: Permission[],
  current: RolePermissionState
): RolePermissionState {
  const updated = { ...current };
  const modulePerms = perms.filter((p) => p.module === module);

  for (const p of modulePerms) {
    if (level === 'none') {
      updated[p.key] = false;
    } else if (level === 'view') {
      updated[p.key] = p.action.includes('read');
    } else if (level === 'edit') {
      updated[p.key] = p.action.includes('read') || p.action.includes('create') || p.action.includes('update') || p.action.includes('assign');
    } else if (level === 'full') {
      updated[p.key] = true;
    }
  }
  return updated;
}

function RadioButton({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={!disabled ? onChange : undefined}
      disabled={disabled}
      style={{
        width: '18px', height: '18px', borderRadius: '50%', cursor: disabled ? 'not-allowed' : 'pointer',
        border: checked ? '5px solid #0052CC' : '2px solid #DFE1E6',
        background: checked ? '#EEF2FF' : 'white',
        transition: 'all 0.15s', flexShrink: 0, display: 'inline-block',
        outline: 'none',
      }}
    />
  );
}

export default function PermissionMatrix({
  roleId, roleName, isSystem, existingPermissionKeys, allPermissions, onSave, isSaving
}: PermissionMatrixProps) {
  const [permState, setPermState] = useState<RolePermissionState>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [searchPerm, setSearchPerm] = useState('');

  // Initialize permission state from existing keys
  useEffect(() => {
    const initial: RolePermissionState = {};
    for (const p of allPermissions) {
      initial[p.key] = existingPermissionKeys.includes(p.key);
    }
    setPermState(initial);
    setHasChanges(false);
  }, [existingPermissionKeys, allPermissions]);

  // Group permissions by module
  const grouped = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const mod = p.module?.toLowerCase() || 'other';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  const modules = Object.keys(grouped).sort();

  // Filter
  const filteredModules = searchPerm
    ? modules.filter((mod) =>
      grouped[mod].some(
        (p) =>
          p.key.toLowerCase().includes(searchPerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchPerm.toLowerCase()) ||
          p.action.toLowerCase().includes(searchPerm.toLowerCase())
      )
    )
    : modules;

  const toggleModule = (mod: string) => {
    const next = new Set(expandedModules);
    if (next.has(mod)) next.delete(mod); else next.add(mod);
    setExpandedModules(next);
  };

  const togglePerm = (key: string) => {
    setPermState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setHasChanges(true);
      return next;
    });
  };

  const setModuleLevel = (mod: string, level: AccessLevel) => {
    setPermState((prev) => {
      const next = setAccessLevelForModule(mod, level, allPermissions, prev);
      setHasChanges(true);
      return next;
    });
  };

  const handleSave = async () => {
    const keys = Object.entries(permState).filter(([, v]) => v).map(([k]) => k);
    await onSave(keys);
    setHasChanges(false);
  };

  const handleReset = () => {
    const initial: RolePermissionState = {};
    for (const p of allPermissions) {
      initial[p.key] = existingPermissionKeys.includes(p.key);
    }
    setPermState(initial);
    setHasChanges(false);
  };

  const expandAll = () => setExpandedModules(new Set(modules));
  const collapseAll = () => setExpandedModules(new Set());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
          <input
            value={searchPerm}
            onChange={(e) => setSearchPerm(e.target.value)}
            placeholder="Search permissions..."
            style={{
              width: '100%', height: '36px', paddingLeft: '32px', paddingRight: '12px',
              borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px',
              outline: 'none', color: '#172B4D', boxSizing: 'border-box',
            }}
          />
        </div>

        <button onClick={expandAll} style={smallBtnStyle}>Expand All</button>
        <button onClick={collapseAll} style={smallBtnStyle}>Collapse All</button>

        <div style={{ flex: 1 }} />

        {hasChanges && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#FFF0B3', borderRadius: '8px', border: '1px solid #FFD740' }}>
              <AlertCircle size={14} style={{ color: '#974F0C' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#974F0C' }}>Unsaved changes</span>
            </div>
            <button
              onClick={handleReset}
              style={{
                height: '36px', padding: '0 16px', borderRadius: '8px', border: '1px solid #DFE1E6',
                background: 'white', color: '#42526E', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                height: '36px', padding: '0 16px', borderRadius: '8px', border: 'none',
                background: isSaving ? '#8A94A6' : '#0052CC',
                color: 'white', fontSize: '13px', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
        {isSystem && (
          <div style={{ padding: '6px 12px', background: '#EEF2FF', borderRadius: '8px', border: '1px solid #9DB5E7' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC' }}>🔒 System role (Editable)</span>
          </div>
        )}
      </div>

      {/* Permission Matrix Table */}
      <div style={{ border: '1px solid #DFE1E6', borderRadius: '10px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 140px',
          padding: '12px 20px', background: '#F8F9FA', borderBottom: '1px solid #DFE1E6',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Permission</div>
          {['No Access', 'View', 'Edit', 'Full Access'].map((col) => (
            <div key={col} style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
              {col}
            </div>
          ))}
        </div>

        {/* Module Groups */}
        {filteredModules.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6B778C', fontSize: '13px' }}>
            No permissions match your search.
          </div>
        ) : (
          filteredModules.map((mod) => {
            const isExpanded = expandedModules.has(mod);
            const currentLevel = getAccessLevelForModule(mod, permState, allPermissions);
            const modPerms = searchPerm
              ? grouped[mod].filter(
                (p) =>
                  p.key.toLowerCase().includes(searchPerm.toLowerCase()) ||
                  p.description?.toLowerCase().includes(searchPerm.toLowerCase()) ||
                  p.action.toLowerCase().includes(searchPerm.toLowerCase())
              )
              : grouped[mod];

            const ModuleIcon = getModuleIcon(mod);
            const label = mod.charAt(0).toUpperCase() + mod.slice(1).replace(/_/g, ' ');

            return (
              <div key={mod}>
                {/* Module Header Row */}
                <div
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 140px',
                    padding: '14px 20px', borderBottom: '1px solid #F0F1F3',
                    background: isExpanded ? '#FAFBFC' : 'white',
                    cursor: 'pointer', userSelect: 'none',
                    borderLeft: `3px solid #0052CC`,
                  }}
                  onClick={() => toggleModule(mod)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isExpanded ? <ChevronDown size={16} style={{ color: '#6B778C' }} /> : <ChevronRight size={16} style={{ color: '#6B778C' }} />}
                    <span style={{ fontSize: '14px', color: '#42526E', display: 'flex' }}><ModuleIcon size={16} /></span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>{label}</span>
                    <span style={{ fontSize: '11px', color: '#8A94A6', fontWeight: 500 }}>{grouped[mod].length} permissions</span>
                  </div>
                  {(['none', 'view', 'edit', 'full'] as AccessLevel[]).map((level) => (
                    <div key={level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <RadioButton
                        checked={currentLevel === level}
                        onChange={() => setModuleLevel(mod, level)}
                        disabled={isSystem}
                      />
                    </div>
                  ))}
                </div>

                {/* Individual Permissions */}
                {(isExpanded || searchPerm) && modPerms.map((perm) => (
                  <div
                    key={perm.key}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 140px',
                      padding: '10px 20px 10px 52px', borderBottom: '1px solid #F7F8F9',
                      background: 'white',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>
                        {perm.description || perm.key}
                      </div>
                      <div style={{ fontSize: '11px', color: '#97A0AF', marginTop: '2px', fontFamily: 'monospace' }}>
                        {perm.key}
                      </div>
                    </div>
                    {/* For individual perms, just show a toggle in the checkbox column */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RadioButton
                        checked={!permState[perm.key]}
                        onChange={() => togglePerm(perm.key)}
                        disabled={isSystem}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RadioButton
                        checked={!!permState[perm.key]}
                        onChange={() => togglePerm(perm.key)}
                        disabled={isSystem}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Save Bar */}
      {hasChanges && !isSystem && (
        <div style={{
          position: 'sticky', bottom: 0, background: 'white',
          borderTop: '1px solid #DFE1E6', borderRadius: '0 0 10px 10px',
          padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 -4px 12px rgba(9,30,66,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ color: '#FF8B00' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>
              You have unsaved permission changes for <em>{roleName}</em>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleReset} style={{ ...smallBtnStyle, height: '36px' }}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                height: '36px', padding: '0 20px', borderRadius: '8px', border: 'none',
                background: isSaving ? '#8A94A6' : '#0052CC',
                color: 'white', fontSize: '13px', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const smallBtnStyle: React.CSSProperties = {
  height: '32px', padding: '0 14px', borderRadius: '6px', border: '1px solid #DFE1E6',
  background: 'white', color: '#42526E', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
};

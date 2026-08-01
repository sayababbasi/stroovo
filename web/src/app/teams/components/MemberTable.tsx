"use client";

import React, { useState } from 'react';
import { MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { apiPatch, apiDelete } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MemberDetail } from './MemberDrawer';

interface MemberTableProps {
  members: MemberDetail[];
  onMemberClick: (member: MemberDetail) => void;
  onRefresh: () => void;
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onAssignRole?: (member: MemberDetail) => void;
}

type SortField = 'name' | 'teamRole' | 'joinedAt' | 'taskCount' | 'projectCount';
type SortDir = 'asc' | 'desc';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: '#E9F2FF', text: '#0052CC' },
  MANAGER: { bg: '#E3FCEF', text: '#006644' },
  MEMBER: { bg: '#F4F1FD', text: '#6554C0' },
  VIEWER: { bg: '#F4F5F7', text: '#42526E' },
  OWNER: { bg: '#FFF0B3', text: '#974F0C' },
  TEAM_MEMBER: { bg: '#F4F1FD', text: '#6554C0' },
};

function Avatar({ name, image, size = 36 }: { name: string | null; image: string | null; size?: number }) {
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const colors = ['#6554C0', '#0052CC', '#36B37E', '#FF8B00', '#FF5630'];
  const colorIndex = (name || '').length % colors.length;

  if (image) {
    return (
      <img
        src={image}
        alt={name || ''}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F0F1F3', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${colors[colorIndex]}20`,
      color: colors[colorIndex],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, border: `1.5px solid ${colors[colorIndex]}30`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_COLORS[role?.toUpperCase()] || { bg: '#F4F5F7', text: '#42526E' };
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
      background: colors.bg, color: colors.text, display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {role}
    </span>
  );
}

function StatusDot({ lastLoginAt }: { lastLoginAt: string | null }) {
  const isOnline = lastLoginAt && (Date.now() - new Date(lastLoginAt).getTime() < 15 * 60 * 1000);
  const isAway = lastLoginAt && !isOnline && (Date.now() - new Date(lastLoginAt).getTime() < 60 * 60 * 1000);
  const status = isOnline ? 'Online' : isAway ? 'Away' : 'Offline';
  const color = isOnline ? '#36B37E' : isAway ? '#FF8B00' : '#97A0AF';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#42526E', fontWeight: 500 }}>{status}</span>
    </div>
  );
}

function MemberActionMenu({ member, onViewProfile, onRefresh }: {
  member: MemberDetail;
  onViewProfile: () => void;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleChangeRole = async (newRole: string) => {
    try {
      const res = await apiPatch(`/api/team-members/${member.memberId}`, null, { role: newRole });
      if (res.success) {
        toast.success('Role updated');
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to update role');
      }
    } catch {
      toast.error('Failed to update role');
    }
    setOpen(false);
  };

  const handleRemove = async () => {
    try {
      const res = await apiDelete(`/api/team-members/${member.memberId}`, null);
      if (res.success) {
        toast.success('Member removed');
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to remove member');
      }
    } catch {
      toast.error('Failed to remove member');
    }
    setOpen(false);
    setConfirmRemove(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          width: '32px', height: '32px', borderRadius: '6px', border: '1px solid transparent',
          background: 'none', color: '#6B778C', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          <div style={{
            position: 'absolute', right: 0, top: '36px', zIndex: 100,
            background: 'white', border: '1px solid #DFE1E6', borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(9,30,66,0.15)', minWidth: '180px', overflow: 'hidden',
          }}>
            {!confirmRemove ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onViewProfile(); setOpen(false); }}
                  style={menuItemStyle}
                >
                  View Profile
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRefresh(); setOpen(false); }}
                  style={menuItemStyle}
                >
                  Edit Access & Roles
                </button>
                <div style={{ padding: '4px 12px', fontSize: '11px', color: '#8A94A6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Change Role
                </div>
                {['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'].map((r) => (
                  <button
                    key={r}
                    onClick={(e) => { e.stopPropagation(); handleChangeRole(r); }}
                    disabled={r === member.teamRole}
                    style={{
                      ...menuItemStyle,
                      paddingLeft: '24px',
                      color: r === member.teamRole ? '#8A94A6' : '#172B4D',
                      fontWeight: r === member.teamRole ? 700 : 500,
                    }}
                  >
                    {r}{r === member.teamRole ? ' (current)' : ''}
                  </button>
                ))}
                <div style={{ height: '1px', background: '#F0F1F3', margin: '4px 0' }} />
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmRemove(true); }}
                  style={{ ...menuItemStyle, color: '#DE350B' }}
                >
                  Remove Member
                </button>
              </>
            ) : (
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '13px', color: '#172B4D', fontWeight: 600, margin: '0 0 4px' }}>Remove member?</p>
                <p style={{ fontSize: '12px', color: '#6B778C', margin: '0 0 12px' }}>
                  This will remove {member.name || member.email} from this team.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmRemove(false); }}
                    style={{ flex: 1, height: '32px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                    style={{ flex: 1, height: '32px', borderRadius: '6px', border: 'none', background: '#DE350B', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left',
  background: 'none', border: 'none', color: '#172B4D', fontSize: '13px', fontWeight: 500,
  cursor: 'pointer', transition: 'background 0.1s',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return null;
  return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

function ThButton({ label, field, sortField, sortDir, onSort }: {
  label: string; field: SortField; sortField: SortField; sortDir: SortDir; onSort: (f: SortField) => void;
}) {
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C',
        textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left',
        cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
        background: field === sortField ? '#F8F9FA' : 'transparent',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label} <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </span>
    </th>
  );
}

export default function MemberTable({ 
  members, 
  onMemberClick, 
  onRefresh,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onAssignRole
}: MemberTableProps) {
  const [sortField, setSortField] = useState<SortField>('joinedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...members].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    if (sortField === 'joinedAt') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  if (members.length === 0) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', background: '#F4F5F7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#97A0AF' }}>
          <MoreHorizontal size={24} />
        </div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#172B4D', margin: '0 0 4px' }}>No members found</p>
        <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
            <th style={{ width: '48px', padding: '12px 16px', textAlign: 'center' }}>
              <input 
                type="checkbox" 
                checked={members.length > 0 && selectedIds.length === members.length}
                onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0052CC' }}
              />
            </th>
            <ThButton label="Member" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <ThButton label="Role" field="teamRole" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>Access Scope</th>
            <ThButton label="Projects" field="projectCount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <ThButton label="Tasks" field="taskCount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left' }}>Status</th>
            <ThButton label="Joined" field="joinedAt" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((member) => (
            <tr
              key={member.userId}
              onClick={() => onMemberClick(member)}
              style={{
                borderBottom: '1px solid #F4F5F7', cursor: 'pointer',
                transition: 'background 0.1s',
                background: selectedIds.includes(member.userId) ? '#E9F2FF' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!selectedIds.includes(member.userId)) e.currentTarget.style.background = '#F8F9FA' }}
              onMouseLeave={(e) => { if (!selectedIds.includes(member.userId)) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Checkbox */}
              <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(member.userId)}
                  onChange={(e) => onSelect && onSelect(member.userId, e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0052CC' }}
                />
              </td>

              {/* Member */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={member.name} image={member.image} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.name || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B778C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.email}
                    </div>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td style={{ padding: '14px 16px' }}>
                <RoleBadge role={member.teamRole} />
              </td>

              {/* Team */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {member.teams.slice(0, 2).map((t) => (
                    <span key={t.id} style={{ fontSize: '12px', color: '#42526E', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.name}
                    </span>
                  ))}
                  {member.teams.length > 2 && (
                    <span style={{ fontSize: '11px', color: '#8A94A6' }}>+{member.teams.length - 2} more</span>
                  )}
                </div>
              </td>

              {/* Projects */}
              <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>
                {member.projectCount}
              </td>

              {/* Tasks */}
              <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>
                {member.taskCount}
              </td>

              {/* Status */}
              <td style={{ padding: '14px 16px' }}>
                <StatusDot lastLoginAt={member.lastLoginAt} />
              </td>

              {/* Joined */}
              <td style={{ padding: '14px 16px', fontSize: '13px', color: '#42526E', whiteSpace: 'nowrap' }}>
                {formatDate(member.joinedAt)}
              </td>

              {/* Actions */}
              <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                <MemberActionMenu
                  member={member}
                  onViewProfile={() => onMemberClick(member)}
                  onRefresh={onRefresh}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

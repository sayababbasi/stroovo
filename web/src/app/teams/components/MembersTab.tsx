"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, UserPlus, Users, UserCheck, UserMinus, Shield, Mail,
  ChevronLeft, ChevronRight, SlidersHorizontal, X
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import MemberTable from './MemberTable';
import MemberDrawer, { MemberDetail } from './MemberDrawer';
import InviteMemberModal from './InviteMemberModal';
import AssignRoleModal from './AssignRoleModal';

interface Team {
  id: string;
  name: string;
}

interface Stats {
  total: number;
  active: number;
  newThisMonth: number;
}

interface MembersTabProps {
  teams: Team[];
  currentTeamId?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function KpiCard({ icon, title, value, trend, trendLabel, color }: {
  icon: React.ReactNode; title: string; value: number | string;
  trend?: string; trendLabel?: string; color: string;
}) {
  const isPositive = trend?.startsWith('+') || trend?.startsWith('↑');
  return (
    <div style={{
      flex: 1, minWidth: '160px', background: 'white', borderRadius: '12px',
      border: '1px solid #DFE1E6', padding: '20px', boxShadow: '0 1px 4px rgba(9,30,66,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: '4px' }}>
        {value}
      </div>
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

export default function MembersTab({ teams, currentTeamId }: MembersTabProps) {
  const { accessToken } = useAuth();
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, newThisMonth: 0 });
  const [roleCount, setRoleCount] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeam, setFilterTeam] = useState(currentTeamId || '');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // UI State
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  
  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => selected ? [...prev, id] : prev.filter(x => x !== id));
  }, []);

  const handleSelectAll = useCallback((selected: boolean, visibleIds: string[]) => {
    setSelectedIds(selected ? visibleIds : []);
  }, []);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiGet<any>('/api/teams/members/all', accessToken);
      if (res.success && res.data) {
        setMembers(res.data.data || res.data);
        if (res.data.stats) {
          setStats(res.data.stats);
        } else {
          const data: MemberDetail[] = res.data.data || res.data;
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          setStats({
            total: data.length,
            active: data.filter((m) => m.lastLoginAt && new Date(m.lastLoginAt) >= sevenDaysAgo).length,
            newThisMonth: data.filter((m) => new Date(m.joinedAt) >= monthStart).length,
          });
        }

        // Get unique roles count
        const roles = new Set((res.data.data || res.data).map((m: MemberDetail) => m.teamRole));
        setRoleCount(roles.size);
      } else {
        setError(res.error || 'Failed to load members');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const fetchInviteCount = useCallback(async () => {
    if (!currentTeamId) return;
    try {
      const res = await apiGet<any>(`/api/team-invitations?teamId=${currentTeamId}&status=PENDING`, accessToken);
      if (res.success) {
        setInviteCount(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch { /* silent */ }
  }, [accessToken, currentTeamId]);

  useEffect(() => {
    fetchMembers();
    fetchInviteCount();
  }, [fetchMembers, fetchInviteCount]);

  // Filtered members
  const filtered = useMemo(() => {
    let result = [...members];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          (m.name || '').toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.teamRole.toLowerCase().includes(q)
      );
    }

    if (filterRole) {
      result = result.filter((m) => m.teamRole?.toUpperCase() === filterRole);
    }

    if (filterStatus) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (filterStatus === 'ONLINE') {
        result = result.filter((m) => m.lastLoginAt && new Date(m.lastLoginAt) >= sevenDaysAgo);
      } else {
        result = result.filter((m) => !m.lastLoginAt || new Date(m.lastLoginAt) < sevenDaysAgo);
      }
    }

    if (filterTeam) {
      result = result.filter((m) => m.teams.some((t) => t.id === filterTeam));
    }

    return result;
  }, [members, search, filterRole, filterStatus, filterTeam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const hasFilters = search || filterRole || filterStatus || filterTeam;

  const clearFilters = () => {
    setSearch('');
    setFilterRole('');
    setFilterStatus('');
    setFilterTeam(currentTeamId || '');
    setPage(1);
  };

  const uniqueRoles = [...new Set(members.map((m) => m.teamRole?.toUpperCase()).filter(Boolean))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <KpiCard icon={<Users size={18} />} title="Total Members" value={stats.total} trend={stats.total > 0 ? '+12%' : '—'} trendLabel="vs last month" color="#0052CC" />
        <KpiCard icon={<UserCheck size={18} />} title="Active Members" value={stats.active} trend={stats.active > 0 ? '+8%' : '—'} trendLabel="vs last month" color="#36B37E" />
        <KpiCard icon={<UserPlus size={18} />} title="New This Month" value={stats.newThisMonth} trend={stats.newThisMonth > 0 ? `+${stats.newThisMonth}` : '—'} trendLabel="vs last month" color="#FF8B00" />
        <KpiCard icon={<Shield size={18} />} title="Roles" value={roleCount} trend="—" trendLabel="No change" color="#6554C0" />
        <KpiCard icon={<Mail size={18} />} title="Invitations Sent" value={inviteCount} trend={inviteCount > 0 ? '+20%' : '—'} trendLabel="vs last month" color="#00B8D9" />
      </div>

      {/* Toolbar */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6',
        padding: '16px 20px', boxShadow: '0 1px 4px rgba(9,30,66,0.04)',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search members by name, email or role..."
              style={{
                width: '100%', height: '38px', paddingLeft: '38px', paddingRight: '12px',
                borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px',
                outline: 'none', color: '#172B4D', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            style={{
              height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #DFE1E6',
              fontSize: '13px', color: filterRole ? '#0052CC' : '#6B778C',
              fontWeight: filterRole ? 600 : 400, outline: 'none', background: 'white', cursor: 'pointer',
              minWidth: '100px',
            }}
          >
            <option value="">All Roles</option>
            {uniqueRoles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            style={{
              height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #DFE1E6',
              fontSize: '13px', color: filterStatus ? '#0052CC' : '#6B778C',
              fontWeight: filterStatus ? 600 : 400, outline: 'none', background: 'white', cursor: 'pointer',
              minWidth: '100px',
            }}
          >
            <option value="">All Status</option>
            <option value="ONLINE">Active (7d)</option>
            <option value="OFFLINE">Inactive</option>
          </select>

          {/* Team Filter */}
          {teams.length > 1 && (
            <select
              value={filterTeam}
              onChange={(e) => { setFilterTeam(e.target.value); setPage(1); }}
              style={{
                height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #DFE1E6',
                fontSize: '13px', color: filterTeam ? '#0052CC' : '#6B778C',
                fontWeight: filterTeam ? 600 : 400, outline: 'none', background: 'white', cursor: 'pointer',
                minWidth: '120px',
              }}
            >
              <option value="">All Teams</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                height: '38px', padding: '0 14px', borderRadius: '8px', border: '1px solid #DFE1E6',
                background: '#FFEBE6', color: '#DE350B', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <X size={14} />
              Clear
            </button>
          )}

          <div style={{ flex: 1 }} />

          {/* Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            style={{
              height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none',
              background: '#0052CC', color: 'white', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 2px 8px rgba(0,82,204,0.3)',
              flexShrink: 0,
            }}
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>

        {/* Active Filter Pills */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Active filters:</span>
            {search && (
              <span style={{ padding: '2px 10px', borderRadius: '100px', background: '#EEF2FF', color: '#0052CC', fontSize: '12px', fontWeight: 600 }}>
                Search: "{search}"
              </span>
            )}
            {filterRole && (
              <span style={{ padding: '2px 10px', borderRadius: '100px', background: '#EEF2FF', color: '#0052CC', fontSize: '12px', fontWeight: 600 }}>
                Role: {filterRole}
              </span>
            )}
            {filterStatus && (
              <span style={{ padding: '2px 10px', borderRadius: '100px', background: '#EEF2FF', color: '#0052CC', fontSize: '12px', fontWeight: 600 }}>
                Status: {filterStatus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table Card */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6',
        boxShadow: '0 1px 4px rgba(9,30,66,0.04)', overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #DFE1E6', borderTopColor: '#0052CC', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', color: '#6B778C' }}>Loading members...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#DE350B', margin: '0 0 4px' }}>Error loading members</p>
            <p style={{ fontSize: '13px', color: '#6B778C', margin: '0 0 16px' }}>{error}</p>
            <button onClick={fetchMembers} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#0052CC', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
              <div style={{
                background: '#E9F2FF', padding: '12px 20px', borderBottom: '1px solid #DFE1E6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0052CC' }}>
                    {selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedIds([])}
                    style={{ background: 'none', border: 'none', color: '#0052CC', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear selection
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowAssignRoleModal(true)}
                    style={{
                      height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid #0052CC',
                      background: 'white', color: '#0052CC', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Shield size={14} /> Assign Roles
                  </button>
                </div>
              </div>
            )}
            <MemberTable
              members={paginated}
              onMemberClick={(m) => setSelectedMember(m)}
              onRefresh={fetchMembers}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={(selected) => handleSelectAll(selected, paginated.map(m => m.userId))}
            />
          </>
        )}

        {/* Pagination */}
        {!isLoading && !error && filtered.length > 0 && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid #F4F5F7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            flexWrap: 'wrap',
          }}>
            {/* Summary */}
            <span style={{ fontSize: '13px', color: '#6B778C', fontWeight: 500, flexShrink: 0 }}>
              Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} members
            </span>

            {/* Page controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #DFE1E6',
                  background: page === 1 ? '#F4F5F7' : 'white', color: page === 1 ? '#97A0AF' : '#172B4D',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '6px',
                      border: pageNum === page ? 'none' : '1px solid #DFE1E6',
                      background: pageNum === page ? '#0052CC' : 'white',
                      color: pageNum === page ? 'white' : '#172B4D',
                      fontSize: '13px', fontWeight: pageNum === page ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #DFE1E6',
                  background: page === totalPages ? '#F4F5F7' : 'white', color: page === totalPages ? '#97A0AF' : '#172B4D',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ChevronRight size={16} />
              </button>

              {/* Rows per page */}
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{
                  height: '32px', padding: '0 8px', borderRadius: '6px', border: '1px solid #DFE1E6',
                  fontSize: '12px', color: '#172B4D', fontWeight: 500, outline: 'none', background: 'white', cursor: 'pointer',
                }}
              >
                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} / page</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Drawers & Modals */}
      <MemberDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => { fetchMembers(); fetchInviteCount(); }}
        teams={teams}
        currentTeam={teams.find((t) => t.id === (currentTeamId || '')) || null}
      />
      
      <AssignRoleModal
        isOpen={showAssignRoleModal}
        onClose={() => setShowAssignRoleModal(false)}
        onSuccess={() => {
          fetchMembers();
          setSelectedIds([]);
        }}
        userIds={selectedIds}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

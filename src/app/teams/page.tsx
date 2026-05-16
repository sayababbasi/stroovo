"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Bell, ChevronDown, MoreHorizontal, Settings, 
  Users, UserPlus, Activity, Shield, PieChart, 
  MoreVertical, Check, X, Copy, Mail, Link as LinkIcon, 
  Circle, TrendingUp, Zap, Clock, User, Folder, Layout, Inbox, 
  HelpCircle, LogOut, CheckCircle2, FileText, ChevronRight, Home, Calendar, CheckSquare, Brain, AlertCircle, Bot, AlertTriangle, Wand2, ShieldAlert
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import FloatingAI from '@/components/FloatingAI';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { socketService } from '@/lib/socket';
import Sidebar from '@/components/Sidebar';

// --- Types ---
interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
  spaces: any[];
  _count?: { members: number; spaces: number; tasks: number };
}

interface UserType {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: UserType;
  status?: 'ONLINE' | 'OFFLINE';
  lastActive?: string;
}

interface TeamInvitation {
  id: string;
  teamId: string;
  email: string; // From User relation or email field
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  user?: UserType;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  time: string;
}

export default function StroovoTeamsDashboard() {
  const { user: authUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'INVITES' | 'ACTIVITY' | 'ROLES' | 'INSIGHTS'>('MEMBERS');
  const [mainNavTab, setMainNavTab] = useState('Team');

  // Invites Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [generateLink, setGenerateLink] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dummy Activity Logs (will integrate with real logs if available)
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: '1', action: 'Joined team', user: 'Alex Johnson', time: '2m ago' },
    { id: '2', action: 'Changed role to Admin', user: 'Sarah Smith', time: '1h ago' },
    { id: '3', action: 'Invited mark@example.com', user: 'You', time: '3h ago' },
    { id: '4', action: 'Created Content Team workspace', user: 'Mike Davis', time: '5h ago' },
  ]);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('/api/teams?include=members,invitations,spaces', null);
      if (response.success && response.data) {
        setTeams(response.data);
        setCurrentTeam(prev => {
          if (!prev && response.data.length > 0) return response.data[0];
          if (prev) {
            const updated = response.data.find((t: Team) => t.id === prev.id);
            return updated || prev;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Updates Setup
  useEffect(() => {
    // socketService.connect();
    
    // const handleUpdate = () => fetchData();
    // socketService.onTeamUpdate?.(handleUpdate);
    // socketService.onMemberAdded?.(handleUpdate);
    // socketService.onMemberRemoved?.(handleUpdate);

    // return () => {
    //   socketService.offTeamUpdate?.(handleUpdate);
    //   socketService.offMemberAdded?.(handleUpdate);
    //   socketService.offMemberRemoved?.(handleUpdate);
    // };
  }, [fetchData]);

  // Handlers
  const handleInvite = async () => {
    if (!currentTeam || !inviteEmails.trim()) return;
    setIsInviting(true);
    try {
      const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
      for (const email of emails) {
        await apiPost('/api/team-members', null, { 
          teamId: currentTeam.id, 
          email, 
          role: inviteRole,
          message: inviteMessage,
          sendEmail
        });
        
        // Add optimistic activity log
        setActivities(prev => [{
          id: Math.random().toString(),
          action: `Invited ${email}`,
          user: authUser?.name || 'You',
          time: 'Just now'
        }, ...prev]);
      }
      toast.success('Invitations sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmails('');
      setInviteMessage('');
      fetchData();
    } catch (error) {
      toast.error('Failed to send invitations.');
      console.error(error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await apiPatch(`/api/team-members/${memberId}`, null, { role: newRole });
      toast.success('Role updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await apiDelete(`/api/team-members/${memberId}`, null);
      toast.success('Member removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await apiDelete(`/api/team-invitations/${inviteId}`, null);
      toast.success('Invitation cancelled');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };

  // Derived State
  const members = currentTeam?.members || [];
  const activeMembers = members.filter(m => {
    // Mocking online status randomly for demo purposes, but normally driven by socket
    if (m.status === undefined) {
      m.status = Math.random() > 0.5 ? 'ONLINE' : 'OFFLINE';
      m.lastActive = m.status === 'ONLINE' ? 'Now' : '2h ago';
    }
    return true;
  });

  const filteredMembers = activeMembers.filter(m => {
    const matchesSearch = (m.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const onlineUsers = activeMembers.filter(m => m.status === 'ONLINE');
  const adminsCount = members.filter(m => m.role === 'ADMIN' || m.role === 'OWNER').length;
  
  // Dynamic Team Health Score calculation
  const teamHealthScore = useMemo(() => {
    if (!currentTeam || members.length === 0) return 0;
    const onlineRatio = onlineUsers.length / members.length;
    const baseScore = 75; // Baseline healthy score
    return Math.min(100, Math.round(baseScore + (onlineRatio * 25)));
  }, [members, onlineUsers, currentTeam]);

  // Utility Functions
  const getRoleBadgeColor = (role: string) => {
    switch(role.toUpperCase()) {
      case 'OWNER': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MANAGER': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'GUEST': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading && !currentTeam) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', height: '100vh', overflow: 'hidden', background: '#FBFBFD' }} className="text-gray-900 font-sans p-2">
        
      {/* INNER SIDEBAR: TEAMS LIST */}
      <aside className="w-72 flex-shrink-0 bg-[#FBFBFD] border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Teams</h2>
          <button className="text-gray-500 hover:text-gray-900"><Plus size={18} /></button>
        </div>
        <div className="px-4 pb-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input className="pl-9 bg-white border-gray-200 shadow-sm text-sm h-9" placeholder="Search teams..." />
          </div>
        </div>
        
        <nav className="p-2 border-b border-gray-100 space-y-0.5">
           <NavItem icon={<Home size={18}/>} label="Home" />
           <NavItem icon={<Inbox size={18}/>} label="Inbox" />
           <NavItem icon={<CheckSquare size={18}/>} label="My Tasks" />
           <NavItem icon={<Calendar size={18}/>} label="Schedule" />
        </nav>

        <div className="p-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">TEAMS</h2>
          <div className="space-y-1">
            {teams.map((team) => {
              const isActive = currentTeam?.id === team.id;
              return (
                <div 
                  key={team.id}
                  onClick={() => setCurrentTeam(team)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-[#EEF2FF]' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${isActive ? 'bg-[#E0E7FF] text-blue-600' : 'bg-[#E0E7FF] text-blue-500'}`}>
                      <Users size={16} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{team.name}</h3>
                      <p className="text-xs text-gray-500">{team._count?.members || team.members?.length || 0} members • {team._count?.spaces || team.spaces?.length || 0} spaces</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10 relative">
          {/* Left section: Active Team */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <Users size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">{currentTeam?.name || 'Loading...'}</h1>
              <p className="text-xs text-gray-500">{currentTeam?._count?.members || currentTeam?.members?.length || 0} members • {currentTeam?._count?.spaces || currentTeam?.spaces?.length || 0} spaces</p>
            </div>
          </div>

          {/* Right section: Navigation & Actions */}
          <div className="flex items-center gap-4">
            {/* Top Navigation */}
            <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
              {[
                { id: 'Overview', icon: Layout },
                { id: 'Workspace', icon: Folder },
                { id: 'Tasks', icon: CheckCircle2 },
                { id: 'Team', icon: Users },
                { id: 'Insights', icon: Brain },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setMainNavTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${mainNavTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <tab.icon size={16} /> {tab.id}
                </button>
              ))}
            </div>
            
            <button className="text-gray-400 hover:text-gray-600"><Search size={20}/></button>
            <button className="text-gray-400 hover:text-gray-600"><Settings size={20}/></button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <div className="flex-1 overflow-auto bg-[#FBFBFD]">
          {mainNavTab === 'Team' ? (
            <div className="max-w-7xl mx-auto p-8 space-y-8">
            
            {/* Header Title & Actions */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team Management</h1>
                <p className="text-gray-500 mt-1">Manage members, roles, and workspace access.</p>
              </div>
              <Button 
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-md shadow-gray-900/10 rounded-lg px-5 h-10 font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <UserPlus size={16} />
                Invite Member
              </Button>
            </div>

            {/* PHASE 2: DASHBOARD HEADER CARDS (Task 2.1) */}
            <div className="grid grid-cols-5 gap-4">
              <StatCard 
                icon={<Users className="text-blue-500" />} 
                value={members.length} 
                label="Total Members" 
                trend="+2 this week" 
                trendUp={true} 
              />
              <StatCard 
                icon={<Mail className="text-orange-500" />} 
                value={currentTeam?.invitations?.length || 0} 
                label="Pending Invites" 
                trend="1 expiring soon" 
                trendUp={false} 
              />
              <StatCard 
                icon={<Activity className="text-green-500" />} 
                value={onlineUsers.length} 
                label="Active (24h)" 
                trend="High engagement" 
                trendUp={true} 
              />
              <StatCard 
                icon={<Shield className="text-purple-500" />} 
                value={adminsCount} 
                label="Admins" 
                trend="Secure setup" 
                trendUp={true} 
              />
              <StatCard 
                icon={<TrendingUp className="text-indigo-500" />} 
                value={`${teamHealthScore}%`} 
                label="Team Health Score" 
                trend="+5% vs last month" 
                trendUp={true} 
                highlight 
              />
            </div>

            <div className="flex gap-8 items-start">
              {/* LEFT MAIN CONTENT (Tabs & Table) */}
              <div className="flex-1 space-y-6">
                
                {/* PHASE 3: TAB SYSTEM (Task 3.1) */}
                <div className="flex border-b border-gray-200">
                  <TabButton active={activeTab === 'MEMBERS'} onClick={() => setActiveTab('MEMBERS')} label="Members" count={members.length} />
                  <TabButton active={activeTab === 'INVITES'} onClick={() => setActiveTab('INVITES')} label="Pending Invites" count={currentTeam?.invitations?.length} />
                  <TabButton active={activeTab === 'ACTIVITY'} onClick={() => setActiveTab('ACTIVITY')} label="Activity" />
                  <TabButton active={activeTab === 'ROLES'} onClick={() => setActiveTab('ROLES')} label="Roles & Permissions" />
                  <TabButton active={activeTab === 'INSIGHTS'} onClick={() => setActiveTab('INSIGHTS')} label="Insights" />
                </div>

                {/* TAB CONTENTS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  
                  {activeTab === 'MEMBERS' && (
                    <div className="flex flex-col h-full">
                      {/* PHASE 4: MEMBERS TABLE (Tasks 4.1, 4.2, 4.3) */}
                      {/* Table Filters */}
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Search members..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                          >
                            <option value="ALL">All Roles</option>
                            <option value="OWNER">Owner</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MANAGER">Manager</option>
                            <option value="MEMBER">Member</option>
                            <option value="GUEST">Guest</option>
                          </select>
                          <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                          >
                            <option value="ALL">All Status</option>
                            <option value="ONLINE">Online</option>
                            <option value="OFFLINE">Offline</option>
                          </select>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {filteredMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {member.user?.image ? (
                                          <img src={member.user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="text-indigo-700 font-medium text-sm">{member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}</span>
                                        )}
                                      </div>
                                      {member.status === 'ONLINE' && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">{member.user?.name || 'Unknown User'}</div>
                                      <div className="text-sm text-gray-500">{member.user?.email || 'No email'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(member.role)}`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${member.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-sm text-gray-600 capitalize">{member.status?.toLowerCase()}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.lastActive}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Inline Actions */}
                                    <select 
                                      className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-600 cursor-pointer hover:border-gray-300 focus:outline-none"
                                      value={member.role}
                                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                    >
                                      <option value="OWNER">Owner</option>
                                      <option value="ADMIN">Admin</option>
                                      <option value="MANAGER">Manager</option>
                                      <option value="MEMBER">Member</option>
                                      <option value="GUEST">Guest</option>
                                    </select>
                                    <button 
                                      onClick={() => handleRemoveMember(member.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                      title="Remove Member"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                  No members found matching your criteria.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Mock */}
                      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <span className="text-sm text-gray-500">Showing {filteredMembers.length} of {members.length} members</span>
                        <div className="flex gap-1">
                          <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50">Previous</button>
                          <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'INVITES' && (
                    <div className="p-0">
                      {/* Task 5.3: Pending Invites Tab */}
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent Date</th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {currentTeam?.invitations?.map(inv => (
                            <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{inv.email || inv.user?.email || 'Unknown'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(inv.role)}`}>
                                  {inv.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(inv.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Resend</button>
                                  <button onClick={() => handleCancelInvite(inv.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Cancel</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(!currentTeam?.invitations || currentTeam.invitations.length === 0) && (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No pending invites.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {['ACTIVITY', 'ROLES', 'INSIGHTS'].includes(activeTab) && (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <MoreHorizontal size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Coming Soon</h3>
                      <p className="text-gray-500 max-w-sm">This section is currently under development. Detailed {activeTab.toLowerCase()} views will be available in the next update.</p>
                    </div>
                  )}

                </div>

                {/* PHASE 7: LOWER DASHBOARD SECTION */}
                <div className="grid grid-cols-3 gap-6 pt-2">
                  {/* Workspaces Card (Task 7.1) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 col-span-1 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Workspaces</h3>
                      <button className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"><Plus size={16} /></button>
                    </div>
                    <div className="space-y-3 flex-1">
                      <WorkspaceItem name="Campaigns" members={12} icon={<Target size={16} />} color="bg-orange-100 text-orange-600" />
                      <WorkspaceItem name="Content Team" members={8} icon={<FileText size={16} />} color="bg-blue-100 text-blue-600" />
                      <WorkspaceItem name="Design Studio" members={5} icon={<PenTool size={16} />} color="bg-purple-100 text-purple-600" />
                    </div>
                  </div>

                  {/* Quick Actions Card (Task 7.2) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 col-span-1 flex flex-col hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <QuickAction icon={<Folder />} label="Create Workspace" />
                      <QuickAction icon={<UserPlus />} label="Invite Members" onClick={() => setIsInviteModalOpen(true)} />
                      <QuickAction icon={<Shield />} label="Manage Roles" onClick={() => setActiveTab('ROLES')} />
                      <QuickAction icon={<Settings />} label="Team Settings" />
                    </div>
                  </div>

                  {/* Invite Link Card (Task 7.3) */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-md p-5 col-span-1 text-white flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <LinkIcon size={120} />
                    </div>
                    <h3 className="font-bold text-white mb-2 relative z-10">Invite via Link</h3>
                    <p className="text-indigo-100 text-sm mb-4 relative z-10">Anyone with this link can request to join your team.</p>
                    
                    <div className="mt-auto relative z-10 space-y-3">
                      <div className="flex bg-white/10 rounded-lg p-1 border border-white/20 backdrop-blur-sm">
                        <input 
                          type="text" 
                          readOnly 
                          value="https://stroovo.com/join/mkt-team" 
                          className="bg-transparent text-white text-sm px-3 outline-none flex-1 font-mono"
                        />
                        <button className="bg-white text-indigo-600 px-3 py-1.5 rounded-md text-sm font-semibold shadow hover:bg-indigo-50 transition-colors">
                          Copy
                        </button>
                      </div>
                      <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                        <option value="anyone" className="text-gray-900">Anyone with link</option>
                        <option value="domain" className="text-gray-900">Only @company.com</option>
                        <option value="invited" className="text-gray-900">Only invited emails</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* PHASE 6: RIGHT SIDEBAR (Task 6.1, 6.2, 6.3) */}
              <div className="w-80 flex-shrink-0 space-y-6">
                
                {/* Online Users */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Online Now
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{onlineUsers.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {onlineUsers.slice(0, 8).map((u, i) => (
                      <div key={i} className="relative group cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                          {u.user?.image ? <img src={u.user.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-sm">{u.user?.name?.charAt(0) || 'U'}</div>}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        
                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                          {u.user?.name}
                        </div>
                      </div>
                    ))}
                    {onlineUsers.length > 8 && (
                      <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500">
                        +{onlineUsers.length - 8}
                      </div>
                    )}
                    {onlineUsers.length === 0 && <p className="text-sm text-gray-500">No one is currently online.</p>}
                  </div>
                </div>

                {/* Team Activity Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {activities.map((log) => (
                      <div key={log.id} className="flex gap-3 items-start group">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-100 transition-colors">
                          <Activity size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 leading-snug">
                            <span className="font-semibold">{log.user}</span> {log.action}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2 hover:bg-indigo-50 rounded-lg transition-colors">
                    View All Activity
                  </button>
                </div>

                {/* Insights Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                    Insights 
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">7 Days</span>
                  </h3>
                  
                  {/* Fake Chart */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1 h-24 mb-2">
                      {[30, 45, 25, 60, 40, 80, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-100 hover:bg-indigo-500 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top Active Members</h4>
                  <div className="space-y-3">
                    <TopMember name="Sarah Smith" score={98} />
                    <TopMember name="Alex Johnson" score={85} />
                    <TopMember name="Mike Davis" score={72} />
                  </div>
                </div>

              </div>
            </div>
          </div>
          ) : (
            <>
               {mainNavTab === 'Overview' && <OverviewTab team={currentTeam} members={members} onlineUsers={onlineUsers} teamHealthScore={teamHealthScore} setIsInviteModalOpen={setIsInviteModalOpen} />}
               {mainNavTab === 'Workspace' && <WorkspaceTab team={currentTeam} />}
               {mainNavTab === 'Tasks' && <TasksTab team={currentTeam} />}
               {mainNavTab === 'Insights' && <InsightsTab team={currentTeam} members={members} />}
            </>
          )}
        </div>
      </main>

      {/* PHASE 5: INVITATION SYSTEM MODAL (Task 5.2) */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                <UserPlus size={24} />
                Invite to Team
              </DialogTitle>
              <p className="text-indigo-100 mt-1">Add new members to collaborate in your workspace.</p>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="emails" className="font-semibold text-gray-700 text-sm">Email Addresses</Label>
              <Input 
                id="emails"
                placeholder="e.g. john@company.com, sarah@company.com" 
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                className="focus-visible:ring-indigo-500"
              />
              <p className="text-xs text-gray-500">Separate multiple emails with commas.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="font-semibold text-gray-700 text-sm">Role & Permissions</Label>
              <select 
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <option value="ADMIN">Admin - Full access to all settings</option>
                <option value="MANAGER">Manager - Can manage members and projects</option>
                <option value="MEMBER">Member - Can view and collaborate</option>
                <option value="GUEST">Guest - Limited read-only access</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="font-semibold text-gray-700 text-sm">Personal Message (Optional)</Label>
              <textarea 
                id="message"
                placeholder="Welcome to the team! Here's access to our workspace."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 resize-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sendEmail} 
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
                />
                <span className="text-sm text-gray-700 font-medium">Send email invitation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={generateLink} 
                  onChange={(e) => setGenerateLink(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
                />
                <span className="text-sm text-gray-700 font-medium">Generate shareable invite link</span>
              </label>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
            <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)} className="font-medium text-gray-600 hover:text-gray-900">
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={isInviting || !inviteEmails.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200"
            >
              {isInviting ? 'Sending...' : (generateLink && !sendEmail ? 'Generate Link' : 'Send Invite')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <FloatingAI />
      </div>
    </div>
  );
}

// --- Sub-components for UI structure ---

function NavItem({ icon, label, active = false, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}>
      <div className="flex items-center gap-3">
        {React.cloneElement(icon as React.ReactElement<any>, { className: active ? 'text-indigo-600' : 'text-gray-400' })}
        <span className="text-sm">{label}</span>
      </div>
      {badge && <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}

function StatCard({ icon, value, label, trend, trendUp, highlight = false }: any) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${highlight ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100' : 'bg-white border-gray-100'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm font-semibold text-gray-500 mb-3">{label}</div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
          {trendUp ? <TrendingUp size={12} /> : <Clock size={12} />}
          {trend}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'}`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function WorkspaceItem({ name, members, icon, color }: any) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{members} members</p>
        </div>
      </div>
      <ChevronDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 -rotate-90 transition-all" />
    </div>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all text-gray-600 group">
      <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-semibold text-center">{label}</span>
    </button>
  );
}

function TopMember({ name, score }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-semibold text-gray-900">{name}</span>
          <span className="text-xs font-bold text-indigo-600">{score}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score}%` }}></div>
        </div>
      </div>
    </div>
  );
}

// Additional missing icons used but not in lucide imports directly
function Target(props: any) { return <PieChart {...props} />; }
function PenTool(props: any) { return <Settings {...props} />; }

function OverviewTab({ team, members, onlineUsers, teamHealthScore, setIsInviteModalOpen }: any) {
  const pendingInvites = team?.invitations?.length || 0;
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team Overview</h1>
          <p className="text-gray-500 mt-1">At a glance view of {team?.name || 'your team'}.</p>
        </div>
        <div className="flex gap-3">
           <Button onClick={() => setIsInviteModalOpen(true)} className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"><UserPlus size={16} className="mr-2" /> Invite Member</Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><CheckCircle2 size={16} className="mr-2" /> Create Task</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users className="text-indigo-600" />} value={members?.length || 0} label="Total Members" trend="+2 this week" trendUp={true} highlight={true} />
        <StatCard icon={<Activity className="text-purple-600" />} value={onlineUsers?.length || 0} label="Active (24h)" trend="Stable" trendUp={true} />
        <StatCard icon={<CheckCircle2 className="text-emerald-600" />} value="128" label="Tasks Completed" trend="+12 this week" trendUp={true} />
        <StatCard icon={<Clock className="text-amber-600" />} value="24" label="Tasks Pending" trend="-3 this week" trendUp={true} />
        <StatCard icon={<PieChart className="text-blue-600" />} value={`${teamHealthScore || 92}/100`} label="Team Health" trend="Excellent" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 col-span-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-red-500"/> Needs Attention</h3>
          <div className="space-y-4">
             <div className="flex items-start gap-3">
               <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock size={16}/></div>
               <div><p className="text-sm font-semibold text-gray-900">3 Overdue Tasks</p><p className="text-xs text-gray-500">Marketing Campaign requires action</p></div>
             </div>
             <div className="flex items-start gap-3">
               <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><User size={16}/></div>
               <div><p className="text-sm font-semibold text-gray-900">2 Inactive Members</p><p className="text-xs text-gray-500">No login in 7 days</p></div>
             </div>
             <div className="flex items-start gap-3">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Mail size={16}/></div>
               <div><p className="text-sm font-semibold text-gray-900">{pendingInvites} Pending Invites</p><p className="text-xs text-gray-500">Awaiting response</p></div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 col-span-1 lg:col-span-2">
           <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500"/> Team Progress</h3>
           <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2"><span className="text-sm font-semibold text-gray-700">Tasks Completion</span><span className="text-sm font-bold text-emerald-600">84%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '84%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between mb-2"><span className="text-sm font-semibold text-gray-700">Workspace Setup</span><span className="text-sm font-bold text-indigo-600">100%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{width: '100%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between mb-2"><span className="text-sm font-semibold text-gray-700">Q3 Sprint Progress</span><span className="text-sm font-bold text-purple-600">65%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{width: '65%'}}></div></div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} className="text-indigo-500"/> Recent Activity Timeline</h3>
         <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"><CheckCircle2 size={14}/></div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1"><div className="font-bold text-gray-900 text-sm">Task Completed</div><time className="text-xs font-medium text-gray-500">2h ago</time></div>
                <div className="text-sm text-gray-600">Sarah Smith completed task <span className="font-medium text-gray-900">"Draft Q3 Proposal"</span></div>
              </div>
            </div>
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"><UserPlus size={14}/></div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1"><div className="font-bold text-gray-900 text-sm">New Member</div><time className="text-xs font-medium text-gray-500">5h ago</time></div>
                <div className="text-sm text-gray-600">Mike Davis joined the <span className="font-medium text-gray-900">Marketing Team</span></div>
              </div>
            </div>
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-purple-100 text-purple-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"><Shield size={14}/></div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1"><div className="font-bold text-gray-900 text-sm">Role Updated</div><time className="text-xs font-medium text-gray-500">1d ago</time></div>
                <div className="text-sm text-gray-600">You updated roles for <span className="font-medium text-gray-900">2 members</span></div>
              </div>
            </div>
         </div>
      </div>
    </div>
  )
}

function WorkspaceTab({ team }: any) {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workspaces</h1>
          <p className="text-gray-500 mt-1">Manage areas of work for {team?.name || 'your team'}.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><Folder size={16} className="mr-2" /> Create Workspace</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Layout size={24}/></div>
             <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">Active</div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">Marketing Site Redesign</h3>
          <p className="text-sm text-gray-500 mb-6">Complete overhaul of the main landing pages.</p>
          <div className="flex justify-between items-center border-t border-gray-50 pt-4">
             <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700">S</div>
               <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs font-bold text-purple-700">M</div>
               <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">+3</div>
             </div>
             <div className="text-sm font-semibold text-gray-700">12 Tasks</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Brain size={24}/></div>
             <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">Active</div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">Q3 Campaign Planning</h3>
          <p className="text-sm text-gray-500 mb-6">Strategy and asset creation for Q3 marketing.</p>
          <div className="flex justify-between items-center border-t border-gray-50 pt-4">
             <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-700">A</div>
               <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-700">J</div>
             </div>
             <div className="text-sm font-semibold text-gray-700">8 Tasks</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TasksTab({ team }: any) {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team Tasks</h1>
          <p className="text-gray-500 mt-1">Track and manage progress across all spaces.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><Plus size={16} className="mr-2" /> New Task</Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search tasks..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
        </div>
        <div className="w-px h-6 bg-gray-200"></div>
        <Button variant="ghost" className="text-gray-600 hover:text-gray-900"><User size={16} className="mr-2"/> Assignee</Button>
        <Button variant="ghost" className="text-gray-600 hover:text-gray-900"><Activity size={16} className="mr-2"/> Status</Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Task Name</th>
              <th className="px-6 py-4">Workspace</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assignee</th>
              <th className="px-6 py-4">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-transparent group-hover:border-indigo-500"><Check size={12}/></div>
                  <span className="font-semibold text-gray-900">Draft Q3 Proposal</span>
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">Q3 Planning</span></td>
              <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md"><Circle size={8} className="fill-blue-500"/> In Progress</span></td>
              <td className="px-6 py-4"><div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">SS</div></td>
              <td className="px-6 py-4"><span className="text-sm font-medium text-gray-900">Tomorrow</span></td>
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer bg-red-50/20">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border border-red-300 flex items-center justify-center text-transparent"><Check size={12}/></div>
                  <span className="font-semibold text-red-900">Finalize Assets</span>
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">Site Redesign</span></td>
              <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded-md"><Circle size={8} className="fill-red-500"/> Blocked</span></td>
              <td className="px-6 py-4"><div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">AJ</div></td>
              <td className="px-6 py-4"><span className="text-sm font-bold text-red-600">Yesterday</span></td>
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-500 border-emerald-500 text-white flex items-center justify-center"><Check size={12}/></div>
                  <span className="font-semibold text-gray-500 line-through">Review Designs</span>
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Site Redesign</span></td>
              <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md"><CheckCircle2 size={12}/> Done</span></td>
              <td className="px-6 py-4"><div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">MD</div></td>
              <td className="px-6 py-4"><span className="text-sm font-medium text-gray-500">2 days ago</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InsightsTab({ team, members }: any) {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team Insights</h1>
          <p className="text-gray-500 mt-1">Analytics and performance metrics.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button className="px-3 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium text-gray-900">7 Days</button>
          <button className="px-3 py-1.5 text-gray-500 hover:text-gray-900 text-sm font-medium rounded-md">30 Days</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">Task Completion Rate</h3>
          <div className="h-48 flex items-end justify-between gap-2">
             {[40, 60, 45, 80, 50, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group h-full relative">
                  <div className="w-full bg-indigo-100 group-hover:bg-indigo-500 transition-colors rounded-t-md absolute bottom-0" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h}%</div>
                  </div>
                </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-medium text-gray-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">Top Performers</h3>
          <div className="space-y-4">
             <TopMember name="Sarah Smith" score={98} />
             <TopMember name="Alex Johnson" score={85} />
             <TopMember name="Mike Davis" score={72} />
             <TopMember name="Emily Chen" score={64} />
          </div>
        </div>
      </div>

      {/* NEW: AI Risk Analysis Block */}
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Bot size={18} className="text-indigo-600" /> AI Risk Analysis</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <div className="col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 text-white shadow-lg">
             <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={20} className="text-indigo-200" />
                <h4 className="font-bold text-lg">System Health</h4>
             </div>
             <div className="text-4xl font-bold mb-2">92%</div>
             <p className="text-indigo-100 text-sm mb-4">Low risk profile across the workspace. Current trajectory shows 84% probability of hitting Q3 Sprint targets.</p>
             <button className="w-full bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
               <Wand2 size={14} /> Run Deep Analysis
             </button>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-4">
             <div className="flex items-start gap-4 p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div className="p-2 bg-red-100 rounded-lg text-red-600 mt-0.5"><AlertTriangle size={16} /></div>
                <div>
                   <h5 className="font-bold text-gray-900 text-sm mb-1">High Risk: Site Redesign</h5>
                   <p className="text-xs text-gray-600 mb-2">AI detected a 75% delay probability due to blocked dependencies in "Finalize Assets".</p>
                   <div className="flex gap-2">
                     <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 cursor-pointer hover:bg-gray-50">Reassign Tasks</span>
                     <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 cursor-pointer hover:bg-gray-50">Extend Deadline</span>
                   </div>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600 mt-0.5"><Clock size={16} /></div>
                <div>
                   <h5 className="font-bold text-gray-900 text-sm mb-1">Workload Warning: Sarah Smith</h5>
                   <p className="text-xs text-gray-600 mb-2">Current assignment volume exceeds historical velocity by 40%. Burnout risk detected.</p>
                   <div className="flex gap-2">
                     <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 cursor-pointer hover:bg-gray-50">Review Workload</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  )
}

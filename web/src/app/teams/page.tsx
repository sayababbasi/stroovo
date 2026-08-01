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
import MembersTab from './components/MembersTab';
import RolesTab from './components/RolesTab';
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
  const [mainNavTab, setMainNavTab] = useState<'Teams' | 'Members' | 'Roles'>('Teams');
  const [innerTeamTab, setInnerTeamTab] = useState('Members');

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
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: '#FAFBFC', overflow: 'hidden' }} className="font-sans text-gray-900">
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <header style={{ height: '72px', background: 'white', borderBottom: '1px solid #E8EAED', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
             </div>
             <div>
                <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', margin: 0, lineHeight: 1.2 }}>Teams</h1>
                <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Manage your teams, members and their permissions.</p>
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
               <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
               <input 
                 type="text" 
                 placeholder="Search teams, members... ( / )" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={{ width: '100%', height: '36px', paddingLeft: '36px', paddingRight: '120px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none' }}
               />
               <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#0052CC', background: '#EEF2FF', padding: '2px 6px', borderRadius: '4px' }}>PRO TIP</span>
                  <span style={{ fontSize: '11px', color: '#8A94A6' }}>Press / to search</span>
               </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  {activeMembers.slice(0, 3).map((m, i) => (
                    <div key={m.id} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', marginLeft: i > 0 ? '-10px' : 0, background: '#DFE1E6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E', fontSize: '12px', fontWeight: 600, zIndex: 10 - i }}>
                      {m.user?.image ? <img src={m.user.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : m.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                  ))}
                  {activeMembers.length > 3 && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', marginLeft: '-10px', background: '#FF8B00', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, zIndex: 0 }}>
                      +{activeMembers.length - 3}
                    </div>
                  )}
               </div>
               
               <button 
                  onClick={() => document.getElementById('invite-email-input')?.focus()}
                  style={{ background: '#0052CC', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', height: '36px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
               >
                 <Plus size={16} /> Invite Member
               </button>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="hide-scrollbar">
           
           {/* KPI CARDS */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)' }}>
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <Users size={20} />
                    </div>
                    <div>
                       <div style={{ fontSize: '13px', color: '#6B778C', fontWeight: 600, marginBottom: '4px' }}>Total Members</div>
                       <div style={{ fontSize: '24px', color: '#172B4D', fontWeight: 800, lineHeight: 1, marginBottom: '8px' }}>{members.length}</div>
                       <div style={{ fontSize: '12px', color: '#36B37E', fontWeight: 600 }}>↑ 12% <span style={{ color: '#8A94A6', fontWeight: 500 }}>vs last month</span></div>
                    </div>
                 </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)' }}>
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E3FCEF', color: '#36B37E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <Circle size={14} className="fill-current" />
                    </div>
                    <div>
                       <div style={{ fontSize: '13px', color: '#6B778C', fontWeight: 600, marginBottom: '4px' }}>Active Members</div>
                       <div style={{ fontSize: '24px', color: '#172B4D', fontWeight: 800, lineHeight: 1, marginBottom: '8px' }}>{onlineUsers.length}</div>
                       <div style={{ fontSize: '12px', color: '#36B37E', fontWeight: 600 }}>↑ 8% <span style={{ color: '#8A94A6', fontWeight: 500 }}>vs last month</span></div>
                    </div>
                 </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)' }}>
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E9F2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <Folder size={20} />
                    </div>
                    <div>
                       <div style={{ fontSize: '13px', color: '#6B778C', fontWeight: 600, marginBottom: '4px' }}>Teams</div>
                       <div style={{ fontSize: '24px', color: '#172B4D', fontWeight: 800, lineHeight: 1, marginBottom: '8px' }}>{teams.length}</div>
                       <div style={{ fontSize: '12px', color: '#8A94A6', fontWeight: 500 }}>— No change</div>
                    </div>
                 </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)' }}>
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFF0B3', color: '#FF8B00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <Layout size={20} />
                    </div>
                    <div>
                       <div style={{ fontSize: '13px', color: '#6B778C', fontWeight: 600, marginBottom: '4px' }}>Projects Access</div>
                       <div style={{ fontSize: '24px', color: '#172B4D', fontWeight: 800, lineHeight: 1, marginBottom: '8px' }}>{currentTeam?.spaces?.length || 0}</div>
                       <div style={{ fontSize: '12px', color: '#36B37E', fontWeight: 600 }}>↑ 15% <span style={{ color: '#8A94A6', fontWeight: 500 }}>vs last month</span></div>
                    </div>
                 </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)' }}>
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <CheckCircle2 size={20} />
                    </div>
                    <div>
                       <div style={{ fontSize: '13px', color: '#6B778C', fontWeight: 600, marginBottom: '4px' }}>Tasks Completed</div>
                       <div style={{ fontSize: '24px', color: '#172B4D', fontWeight: 800, lineHeight: 1, marginBottom: '8px' }}>128</div>
                       <div style={{ fontSize: '12px', color: '#36B37E', fontWeight: 600 }}>↑ 18% <span style={{ color: '#8A94A6', fontWeight: 500 }}>vs last month</span></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* MAIN TABS */}
           <div style={{ borderBottom: '1px solid #DFE1E6', marginBottom: '24px', display: 'flex', gap: '8px' }}>
              {(['Teams', 'Members', 'Roles'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMainNavTab(tab)}
                  style={{
                    padding: '0 16px', height: '44px', background: 'none', border: 'none',
                    borderBottom: mainNavTab === tab ? '2px solid #0052CC' : '2px solid transparent',
                    color: mainNavTab === tab ? '#0052CC' : '#6B778C',
                    fontSize: '14px', fontWeight: mainNavTab === tab ? 700 : 500,
                    cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s',
                  }}
                >
                  {tab === 'Roles' ? 'Roles & Permissions' : tab}
                </button>
              ))}
           </div>

           {/* MEMBERS TAB */}
           {mainNavTab === 'Members' && (
             <MembersTab
               teams={teams.map(t => ({ id: t.id, name: t.name }))}
               currentTeamId={currentTeam?.id}
             />
           )}

           {/* ROLES & PERMISSIONS TAB */}
           {mainNavTab === 'Roles' && <RolesTab />}

           {/* 3 COLUMN LAYOUT — Teams Tab */}
           <div style={{ display: mainNavTab === 'Teams' ? 'block' : 'none' }}>
           <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              
              {/* LEFT COLUMN: YOUR TEAMS */}
              <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Your Teams</h2>
                    <button style={{ background: 'none', border: 'none', color: '#0052CC', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={14}/> New Team</button>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teams.map(team => {
                       const isActive = currentTeam?.id === team.id;
                       const colors = [
                          { bg: '#F4F1FD', text: '#6554C0', icon: Folder },
                          { bg: '#E3FCEF', text: '#36B37E', icon: LinkIcon },
                          { bg: '#E9F2FF', text: '#0052CC', icon: Search },
                          { bg: '#FFEBE6', text: '#FF5630', icon: Bell },
                          { bg: '#FFF0B3', text: '#FF8B00', icon: Shield },
                          { bg: '#E3FCEF', text: '#36B37E', icon: Settings }
                       ];
                       const colorObj = colors[team.name.length % colors.length];
                       const Icon = colorObj.icon;

                       return (
                       <div key={team.id} onClick={() => setCurrentTeam(team)} style={{ background: isActive ? 'white' : '#FAFBFC', border: isActive ? '1px solid #DFE1E6' : '1px solid transparent', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', boxShadow: isActive ? '0 2px 4px rgba(9, 30, 66, 0.03)' : 'none', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                             <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: colorObj.bg, color: colorObj.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={20} />
                             </div>
                             <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', marginBottom: '4px' }}>{team.name}</div>
                                <div style={{ fontSize: '12px', color: '#6B778C', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                   {team._count?.members || team.members?.length || 0} members <Circle size={6} className="fill-current" style={{ color: isActive ? '#0052CC' : '#FF8B00' }}/>
                                </div>
                             </div>
                          </div>
                          <button style={{ background: 'none', border: 'none', color: '#8A94A6', cursor: 'pointer', padding: '4px' }}><MoreHorizontal size={16} /></button>
                       </div>
                       );
                    })}
                 </div>

                 <button style={{ background: 'none', border: 'none', color: '#6B778C', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', cursor: 'pointer', marginTop: '8px' }}>
                    <Folder size={16} /> View Archived Teams
                 </button>
              </div>

              {/* CENTER COLUMN: SELECTED TEAM */}
              <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)', padding: '24px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                       <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Folder size={28} />
                       </div>
                       <div>
                          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: 0, marginBottom: '6px' }}>{currentTeam?.name || 'Loading...'}</h2>
                          <p style={{ fontSize: '13px', color: '#6B778C', margin: 0, fontWeight: 500 }}>{members.length} members • {currentTeam?.spaces?.length || 0} projects</p>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                       <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#6B778C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Settings size={16} /></button>
                       <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#6B778C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MoreHorizontal size={16} /></button>
                    </div>
                 </div>

                 {/* TEAM TABS */}
                 <div style={{ borderBottom: '1px solid #DFE1E6', marginBottom: '24px', display: 'flex', gap: '32px' }}>
                    {['Members', 'Projects', 'Activity', 'Settings'].map(tab => (
                       <div 
                         key={tab} 
                         onClick={() => setInnerTeamTab(tab)}
                         style={{ 
                            paddingBottom: '12px', 
                            borderBottom: innerTeamTab === tab ? '2px solid #0052CC' : '2px solid transparent', 
                            color: innerTeamTab === tab ? '#0052CC' : '#6B778C', 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            cursor: 'pointer' 
                         }}>
                          {tab}
                       </div>
                    ))}
                 </div>

                 {/* TABLE CONTROLS */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                       <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                       <input 
                         type="text" 
                         placeholder="Search members..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         style={{ width: '100%', height: '36px', paddingLeft: '36px', paddingRight: '16px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none' }}
                       />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                       <button style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                         <Search size={14} /> Filter
                       </button>
                       <select 
                         value={roleFilter}
                         onChange={(e) => setRoleFilter(e.target.value)}
                         style={{ height: '36px', padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #DFE1E6', background: 'white', color: '#172B4D', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%236B778C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
                       >
                         <option value="ALL">Role</option>
                         <option value="OWNER">Owner</option>
                         <option value="ADMIN">Admin</option>
                         <option value="MANAGER">Manager</option>
                         <option value="MEMBER">Member</option>
                         <option value="GUEST">Guest</option>
                       </select>
                    </div>
                 </div>

                 {/* MEMBERS TABLE */}
                 <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                       <thead>
                          <tr style={{ borderBottom: '1px solid #DFE1E6' }}>
                             <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Member</th>
                             <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Role</th>
                             <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Projects</th>
                             <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Tasks</th>
                             <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Status</th>
                             <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                          </tr>
                       </thead>
                       <tbody>
                          {filteredMembers.map((member) => (
                             <tr key={member.id} style={{ borderBottom: '1px solid #F4F5F7' }}>
                                <td style={{ padding: '16px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F4F1FD', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, overflow: 'hidden' }}>
                                         {member.user?.image ? <img src={member.user.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                      </div>
                                      <div>
                                         <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', marginBottom: '2px' }}>{member.user?.name || 'Unknown User'}</div>
                                         <div style={{ fontSize: '12px', color: '#6B778C' }}>{member.user?.email || 'No email'}</div>
                                      </div>
                                   </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                   <select 
                                     value={member.role}
                                     onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                     style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: 'none', background: member.role === 'ADMIN' || member.role === 'OWNER' ? '#E9F2FF' : member.role === 'MANAGER' ? '#E3FCEF' : '#F4F1FD', color: member.role === 'ADMIN' || member.role === 'OWNER' ? '#0052CC' : member.role === 'MANAGER' ? '#36B37E' : '#6554C0', cursor: 'pointer', appearance: 'none', outline: 'none' }}
                                   >
                                     <option value="OWNER">Owner</option>
                                     <option value="ADMIN">Admin</option>
                                     <option value="MANAGER">Manager</option>
                                     <option value="MEMBER">Member</option>
                                     <option value="GUEST">Guest</option>
                                   </select>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{currentTeam?.spaces?.length || 0}</td>
                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{Math.floor(Math.random() * 30) + 5}</td>
                                <td style={{ padding: '16px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: member.status === 'ONLINE' ? '#36B37E' : '#FF8B00' }}>
                                      <Circle size={8} className="fill-current" /> {member.status === 'ONLINE' ? 'Online' : 'Away'}
                                   </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                   <button onClick={() => handleRemoveMember(member.id)} style={{ background: 'none', border: '1px solid #DFE1E6', borderRadius: '6px', padding: '6px', color: '#6B778C', cursor: 'pointer', marginLeft: 'auto' }} title="Remove Member">
                                      <MoreHorizontal size={16} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                          {filteredMembers.length === 0 && (
                             <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#8A94A6', fontSize: '13px' }}>No members found.</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                    <div style={{ fontSize: '12px', color: '#6B778C', fontWeight: 500 }}>Showing 1 to {filteredMembers.length} of {members.length} members</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                       <button style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#6B778C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /></button>
                       <button style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #DFE1E6', background: '#F4F5F7', color: '#0052CC', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>1</button>
                       <button style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #DFE1E6', background: 'white', color: '#6B778C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={14} /></button>
                    </div>
                 </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 
                 {/* TEAM ACTIVITY */}
                 <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                       <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Team Activity</h3>
                       <button style={{ background: '#EEF2FF', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#0052CC', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>View all</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                       {activities.slice(0, 5).map((act, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                             <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: ['#F4F1FD', '#FFF0B3', '#E9F2FF', '#FFEBE6', '#E3FCEF'][i % 5], color: ['#6554C0', '#FF8B00', '#0052CC', '#FF5630', '#36B37E'][i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700 }}>
                                {act.user?.substring(0, 2).toUpperCase() || 'U'}
                             </div>
                             <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', marginBottom: '2px' }}>{act.user}</div>
                                <div style={{ fontSize: '12px', color: '#6B778C', lineHeight: 1.4 }}>{act.action}</div>
                                <div style={{ fontSize: '11px', color: '#8A94A6', marginTop: '4px', fontWeight: 500 }}>{act.time}</div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* INVITE MEMBERS */}
                 <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)', padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D', margin: 0, marginBottom: '6px' }}>Invite Members</h3>
                    <p style={{ fontSize: '13px', color: '#6B778C', margin: 0, marginBottom: '16px' }}>Invite your team members to collaborate.</p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                       <input 
                         id="invite-email-input"
                         type="email"
                         placeholder="Enter email address"
                         value={inviteEmails}
                         onChange={(e) => setInviteEmails(e.target.value)}
                         style={{ flex: 1, minWidth: 0, height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none' }}
                       />
                       <select
                         value={inviteRole}
                         onChange={(e) => setInviteRole(e.target.value)}
                         style={{ width: '100px', flexShrink: 0, height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', fontWeight: 600, color: '#172B4D', outline: 'none', background: 'white' }}
                       >
                         <option value="MEMBER">Member</option>
                         <option value="ADMIN">Admin</option>
                         <option value="GUEST">Guest</option>
                       </select>
                    </div>
                    <button 
                      onClick={handleInvite}
                      disabled={isInviting || !inviteEmails.trim()}
                      style={{ width: '100%', height: '40px', borderRadius: '8px', border: 'none', background: '#EEF2FF', color: '#0052CC', fontSize: '13px', fontWeight: 700, cursor: (isInviting || !inviteEmails.trim()) ? 'not-allowed' : 'pointer', opacity: (isInviting || !inviteEmails.trim()) ? 0.6 : 1, transition: 'all 0.2s' }}
                    >
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </button>
                 </div>

                 {/* HELP CARD */}
                 <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)', padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D', margin: 0, marginBottom: '6px' }}>Need help?</h3>
                    <p style={{ fontSize: '13px', color: '#6B778C', margin: 0, marginBottom: '16px', lineHeight: 1.4 }}>Learn how to manage your team effectively.</p>
                    <button style={{ background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: '8px', padding: '8px 16px', color: '#0052CC', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                       <HelpCircle size={14} /> View Help Center
                    </button>
                 </div>

              </div>
           </div>
           </div>
        </div>
      </div>
    </div>
  );
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

function TopMember({ name, score }: { name: string; score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#42526E' }}>
          {name.substring(0, 2).toUpperCase()}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#172B4D' }}>{name}</span>
      </div>
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0052CC' }}>{score}</span>
    </div>
  );
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

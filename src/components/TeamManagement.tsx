"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Mail, Crown, Shield, User, Settings, MoreHorizontal,
  X, Search, Filter, ChevronDown, Check, AlertCircle, Trash2, Edit3,
  Eye, EyeOff, Lock, Unlock, Calendar, Activity
} from 'lucide-react';
import { TeamRole, hasPermission, Permission } from '@/lib/rbac';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

// Types
interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  role: TeamRole;
  joinedAt: string;
  lastActiveAt?: string;
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
}

interface TeamManagementProps {
  team: Team;
  currentUserRole: TeamRole;
  onMemberInvite: (email: string, role: TeamRole) => void;
  onMemberRemove: (memberId: string) => void;
  onMemberRoleChange: (memberId: string, newRole: TeamRole) => void;
  onMemberTransfer: (memberId: string) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  team,
  currentUserRole,
  onMemberInvite,
  onMemberRemove,
  onMemberRoleChange,
  onMemberTransfer
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'projects'>('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLinkProjectModalOpen, setIsLinkProjectModalOpen] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>(TeamRole.MEMBER);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<TeamRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Check permissions
  const canInviteMembers = hasPermission('ADMIN', currentUserRole, Permission.INVITE_MEMBERS, 'team');
  const canRemoveMembers = hasPermission('ADMIN', currentUserRole, Permission.REMOVE_MEMBERS, 'team');
  const canManageRoles = hasPermission('ADMIN', currentUserRole, Permission.MANAGE_ROLES, 'team');
  const canManageProjects = currentUserRole === TeamRole.ADMIN || currentUserRole === TeamRole.MANAGER;

  // Fetch all projects for linking
  useEffect(() => {
    if (activeTab === 'projects') {
      setLoadingProjects(true);
      apiGet('/api/projects', null).then(res => {
        if (res.success) setAllProjects(res.data);
        setLoadingProjects(false);
      });
    }
  }, [activeTab]);

  // Filter members
  const filteredMembers = team.members.filter(member => {
    const matchesSearch = member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.isActive) ||
                         (statusFilter === 'inactive' && !member.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role hierarchy
  const roleHierarchy = {
    [TeamRole.ADMIN]: 4,
    [TeamRole.MANAGER]: 3,
    [TeamRole.MEMBER]: 2,
    [TeamRole.VIEWER]: 1
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case TeamRole.ADMIN: return <Crown className="w-4 h-4" />;
      case TeamRole.MANAGER: return <Shield className="w-4 h-4" />;
      case TeamRole.MEMBER: return <User className="w-4 h-4" />;
      case TeamRole.VIEWER: return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case TeamRole.ADMIN: return 'text-purple-600 bg-purple-100';
      case TeamRole.MANAGER: return 'text-blue-600 bg-blue-100';
      case TeamRole.MEMBER: return 'text-green-600 bg-green-100';
      case TeamRole.VIEWER: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    onMemberInvite(inviteEmail, inviteRole);
    setInviteEmail('');
    setInviteRole(TeamRole.MEMBER);
    setIsInviteModalOpen(false);
  };

  const handleRoleChange = (memberId: string, newRole: TeamRole) => {
    if (!canManageRoles) return;
    onMemberRoleChange(memberId, newRole);
  };

  const handleRemoveMember = (memberId: string) => {
    if (!canRemoveMembers) return;
    onMemberRemove(memberId);
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getAvailableRoles = (currentRole: TeamRole): TeamRole[] => {
    const currentLevel = roleHierarchy[currentRole];
    return Object.entries(roleHierarchy)
      .filter(([_, level]) => level <= currentLevel)
      .map(([role]) => role as TeamRole);
  };

  const handleLinkProject = async (projectId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const newTeamIds = [...(project.teamIds || []), team.id];
    try {
      const response = await apiPatch(`/api/projects/${projectId}`, null, { teamIds: newTeamIds });
      if (response.success) {
        setIsLinkProjectModalOpen(false);
        setAllProjects(prev => prev.map(p => p.id === projectId ? { ...p, teamIds: newTeamIds } : p));
      }
    } catch (err) {
      console.error('Error linking project:', err);
    }
  };

  const handleUnlinkProject = async (projectId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const newTeamIds = (project.teamIds || []).filter((id: string) => id !== team.id);
    try {
      const response = await apiPatch(`/api/projects/${projectId}`, null, { teamIds: newTeamIds });
      if (response.success) {
        setAllProjects(prev => prev.map(p => p.id === projectId ? { ...p, teamIds: newTeamIds } : p));
      }
    } catch (err) {
      console.error('Error unlinking project:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'members'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'projects'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Linked Projects
        </button>
      </div>

      {activeTab === 'members' ? (
        <>
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {team.members.length} members
            </span>
          </div>
          
          {canInviteMembers && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as TeamRole | 'all')}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value={TeamRole.ADMIN}>Admins</option>
            <option value={TeamRole.MANAGER}>Managers</option>
            <option value={TeamRole.MEMBER}>Members</option>
            <option value={TeamRole.VIEWER}>Viewers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMemberSelection(member.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {member.user.image ? (
                      <img src={member.user.image} alt={member.user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-sm font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{member.user.name}</h3>
                      {!member.isActive && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                      {member.lastActiveAt && (
                        <span>Last active {new Date(member.lastActiveAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    <span>{member.role}</span>
                  </div>

                  {/* Actions */}
                  {canManageRoles && (
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                        className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={member.id === team.members[0]?.id} // Can't change first admin's role
                      >
                        {getAvailableRoles(currentUserRole).map(role => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {canRemoveMembers && member.role !== TeamRole.ADMIN && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMembers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </div>

        </>
      ) : (
        <>
          {/* Projects View */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Linked Projects</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {allProjects.filter(p => p.teamIds?.includes(team.id)).length} projects
                </span>
              </div>
              
              {canManageProjects && (
                <button
                  onClick={() => setIsLinkProjectModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Link Project</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loadingProjects ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : allProjects.filter(p => p.teamIds?.includes(team.id)).length === 0 ? (
              <div className="p-8 text-center">
                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No projects linked to this team yet</p>
              </div>
            ) : (
              allProjects.filter(p => p.teamIds?.includes(team.id)).map(project => (
                <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                    </div>
                  </div>
                  {canManageProjects && (
                    <button
                      onClick={() => handleUnlinkProject(project.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Invite Modal (same as before) */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsInviteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {getAvailableRoles(currentUserRole).map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Project Modal */}
      <AnimatePresence>
        {isLinkProjectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsLinkProjectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Link Existing Project</h3>
                  <button
                    onClick={() => setIsLinkProjectModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">
                  Select a project to link it to this team. Members of this team will be able to see and contribute to the project.
                </p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allProjects.filter(p => !p.teamIds?.includes(team.id)).length === 0 ? (
                    <p className="text-center py-4 text-gray-500 text-sm">No available projects to link</p>
                  ) : (
                    allProjects.filter(p => !p.teamIds?.includes(team.id)).map(project => (
                      <button
                        key={project.id}
                        onClick={() => handleLinkProject(project.id)}
                        className="w-full flex items-center gap-3 p-3 text-left border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all group"
                      >
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center group-hover:bg-blue-100">
                          <Settings className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{project.description}</div>
                        </div>
                        <Check className="w-4 h-4 text-blue-500 ml-auto opacity-0 group-hover:opacity-100" />
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setIsLinkProjectModalOpen(false)}
                    className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;

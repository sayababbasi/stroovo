"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Users, Settings, ChevronRight, X, Menu,
  ArrowLeft, ArrowRight, Filter, MoreHorizontal, UserPlus,
  Network, Zap, Brain, BarChart2, Calendar, Target,
  Activity, TrendingUp, AlertCircle, CheckCircle, Clock,
  MessageSquare, Folder, FileText, Hash, Globe, Shield,
  ChevronDown
} from 'lucide-react';

// Import team components I created
import TeamSidebar from '@/components/TeamSidebar';
import TeamWorkspace from '@/components/TeamWorkspace';
import TeamManagement from '@/components/TeamManagement';
import TeamInsights from '@/components/TeamInsights';
import GlobalSearch from '@/components/GlobalSearch';
import OptimizedTaskBoard from '@/components/OptimizedTaskBoard';
import Sidebar from '@/components/Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import TaskModal from '@/components/TaskModal';

// Import types and utilities
import { TeamRole, hasPermission, Permission } from '@/lib/rbac';
import { socketService } from '@/lib/socket';
import { useTeamStore, Team, TeamMember, TeamSpace, TeamList } from '@/lib/store/team-store';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function TeamsPage() {
  const { user: authUser } = useAuth();
  // Use global store
  const {
    teams,
    currentTeam,
    currentSpaceId,
    currentListId,
    setTeams,
    setCurrentTeam,
    setCurrentSpaceId,
    setCurrentListId,
    loading,
    setLoading,
    error,
    setError,
  } = useTeamStore();

  // Local state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeView, setActiveView] = useState<'workspace' | 'management' | 'insights' | 'tasks'>('workspace');
  const [currentUserRole, setCurrentUserRole] = useState<TeamRole>(TeamRole.MEMBER);
  
  // Create Team Modal State
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [realUserId, setRealUserId] = useState<string | null>(authUser?.id || null);

  // Fetch projects for Task Modal
  useEffect(() => {
    apiGet('/api/projects', null).then(res => {
      if (res.success && res.data) {
        setProjects(res.data);
      }
    });
  }, []);

  // Get current user from auth
  const currentUserId = authUser?.email || 'admin@revoticai.com';

  // Fetch teams from backend
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet(`/api/teams?include=spaces,lists&_t=${Date.now()}`, null, { timeout: 30000 });

      if (response.success && response.data) {
        // Ensure response.data is an array
        const teamsArray = Array.isArray(response.data) ? response.data : [];
        // Add empty spaces array if not present
        const teamsWithSpaces = teamsArray.map((team: any) => ({
          ...team,
          spaces: team.spaces || []
        }));
        setTeams(teamsWithSpaces);
      } else {
        console.error('Failed to fetch teams:', response.error);
        setError(response.error || 'Failed to load teams');
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [setTeams, setLoading, setError]);

  // Initialize WebSocket connection
  useEffect(() => {
    socketService.connect();

    // Listen for real-time updates
    const handleTeamUpdate = (data: any) => {
      if (currentTeam && data.teamId === currentTeam.id) {
        fetchTeams();
      }
    };

    const handleMemberAdded = (data: any) => {
      if (currentTeam && data.teamId === currentTeam.id) {
        fetchTeams();
      }
    };

    const handleMemberRemoved = (data: any) => {
      if (currentTeam && data.teamId === currentTeam.id) {
        fetchTeams();
      }
    };

    socketService.onTeamUpdate?.(handleTeamUpdate);
    socketService.onMemberAdded?.(handleMemberAdded);
    socketService.onMemberRemoved?.(handleMemberRemoved);

    return () => {
      socketService.offTeamUpdate?.(handleTeamUpdate);
      socketService.offMemberAdded?.(handleMemberAdded);
      socketService.offMemberRemoved?.(handleMemberRemoved);
      socketService.disconnect();
    };
  }, [currentTeam, fetchTeams]);

  // Initial data fetch
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Initial team selection
  useEffect(() => {
    if (!currentTeam && teams.length > 0) {
      setCurrentTeam(teams[0]);
    }
  }, [teams, currentTeam, setCurrentTeam]);

  // Sync user info and role when team changes
  // Set user role and ID from team members
  useEffect(() => {
    if (!currentTeam || !authUser) return;

    // Set real ID immediately from auth context
    setRealUserId(authUser.id);

    const userMember = currentTeam.members.find((m: TeamMember) => 
      m.user.id === authUser.id || m.user.email === authUser.email
    );

    if (userMember) {
      setCurrentUserRole(userMember.role as TeamRole);
    }
  }, [currentTeam, authUser]);

  // Handle team selection
  const handleTeamSelect = useCallback((team: Team) => {
    setCurrentTeam(team);
    setCurrentSpaceId(null);
    setCurrentListId(null);

    // Join team room for real-time updates
    socketService.joinTeam(team.id);
  }, [setCurrentTeam, setCurrentSpaceId, setCurrentListId]);

  // Handle space selection
  const handleSpaceSelect = useCallback((spaceId: string) => {
    setCurrentSpaceId(spaceId);
    setCurrentListId(null);
  }, [setCurrentSpaceId, setCurrentListId]);

  // Handle list selection
  const handleListSelect = useCallback((listId: string) => {
    setCurrentListId(listId);
  }, [setCurrentListId]);

  // Handle task creation
  const handleTaskCreate = useCallback(() => {
    if (!currentTeam) return;
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  }, [currentTeam]);

  const handleSaveTask = async (taskData: any) => {
    if (!currentTeam) return;

    try {
      const payload = {
        ...taskData,
        teamId: currentTeam.id,
        spaceId: currentSpaceId || undefined,
        listId: currentListId || undefined,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
      };

      let response;
      if (taskToEdit) {
        response = await apiPatch(`/api/tasks/${taskToEdit.id}`, null, payload);
      } else {
        response = await apiPost('/api/team-tasks', null, payload);
      }

      if (response.success) {
        setIsTaskModalOpen(false);
        setTaskToEdit(null);
        setTasksRefreshKey(prev => prev + 1);
        await fetchTeams(); // Refresh data
      } else {
        const detailMsg = response.details ? JSON.stringify(response.details, null, 2) : '';
        alert(`${response.error || 'Failed to save task'}${detailMsg ? '\n\nDetails: ' + detailMsg : ''}`);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      alert('An unexpected error occurred while saving the task.');
    }
  };

  // Handle Team Creation
  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreatingTeam(true);
    try {
      const response = await apiPost('/api/teams', null, {
        name: newTeamName,
        description: newTeamDescription,
      });

      if (response.success) {
        setIsCreateTeamModalOpen(false);
        setNewTeamName('');
        setNewTeamDescription('');
        await fetchTeams();
        // The newly created team should be automatically selected by fetchTeams if none is selected
      } else {
        alert(response.error || 'Failed to create team');
      }
    } catch (err) {
      console.error('Error creating team:', err);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Handle task editing
  const handleTaskEdit = useCallback(async (taskId: string) => {
    try {
      const response = await apiGet(`/api/tasks/${taskId}`, null);
      if (response.success && response.data) {
        setTaskToEdit(response.data);
        setIsTaskModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching task for edit:', err);
    }
  }, []);

  // Handle task deletion
  const handleTaskDelete = useCallback((taskId: string) => {
    if (!currentTeam) return;

    if (confirm('Are you sure you want to delete this task?')) {
      apiDelete(`/api/tasks/${taskId}`, null)
        .then(response => {
          if (response.success) {
            fetchTeams(); // Refresh data
          }
        })
        .catch(err => console.error('Error deleting task:', err));
    }
  }, [currentTeam, fetchTeams]);

  // Handle member invitation
  const handleMemberInvite = useCallback(async (email: string, role: TeamRole) => {
    if (!currentTeam) return;

    const response = await apiPost('/api/team-members', null, { teamId: currentTeam.id, email, role }, { timeout: 30000 });
    
    if (response.success) {
      fetchTeams(); // Refresh data
    } else {
      console.error('Error inviting member:', response.error);
    }
  }, [currentTeam, fetchTeams]);

  // Handle member removal
  const handleMemberRemove = useCallback(async (memberId: string) => {
    if (!currentTeam) return;

    if (confirm('Are you sure you want to remove this member?')) {
      const response = await apiDelete(`/api/team-members/${memberId}`, null, { timeout: 30000 });
      
      if (response.success) {
        fetchTeams(); // Refresh data
      } else {
        console.error('Error removing member:', response.error);
      }
    }
  }, [currentTeam, fetchTeams]);

  // Handle member role change
  const handleMemberRoleChange = useCallback(async (memberId: string, newRole: TeamRole) => {
    if (!currentTeam) return;

    const response = await apiPatch(`/api/team-members/${memberId}`, null, { role: newRole }, { timeout: 30000 });
    
    if (response.success) {
      fetchTeams(); // Refresh data
    } else {
      console.error('Error changing member role:', response.error);
    }
  }, [currentTeam, fetchTeams]);

  // Handle search result click
  const handleSearchResultClick = useCallback((result: any) => {
    // Navigate to search result
    console.log('Navigate to:', result);
    setSearchOpen(false);
  }, []);

  // Get team icon and color helpers
  const getTeamIcon = (teamName: string) => {
    const icons = [Network, Folder, Users, Zap, Brain, BarChart2, Calendar, Target];
    return icons[teamName.length % icons.length] || Network;
  };

  const getTeamColor = (teamName: string) => {
    const colors = ['#0052CC', '#6554C0', '#FF8B00', '#36B37E', '#FF5630', '#00B8D9', '#FFAB00', '#42526E'];
    return colors[teamName.length % colors.length] || '#0052CC';
  };

  // Render loading state
  if (loading && teams.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-white border-r border-gray-200 animate-pulse">
          <div className="h-16 bg-gray-200 border-b border-gray-200" />
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teams...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchTeams}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', display: 'flex', height: '100vh', overflow: 'hidden', background: '#FFFFFF' }}>
        {/* Team Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} border-r border-gray-200 transition-all duration-300 flex-shrink-0 overflow-y-auto`}>
          <TeamSidebar
            teams={teams}
            selectedTeamId={currentTeam?.id}
            selectedSpaceId={currentSpaceId || undefined}
            selectedListId={currentListId || undefined}
            onTeamSelect={(teamId: string) => {
              const team = teams.find(t => t.id === teamId);
              if (team) handleTeamSelect(team);
            }}
            onSpaceSelect={handleSpaceSelect}
            onListSelect={handleListSelect}
            onCreateTeam={() => setIsCreateTeamModalOpen(true)}
          />
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentTeam && (
                <>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${getTeamColor(currentTeam.name)}15` }}
                  >
                    {React.createElement(getTeamIcon(currentTeam.name), {
                      className: 'w-5 h-5',
                      style: { color: getTeamColor(currentTeam.name) }
                    })}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{currentTeam.name}</h1>
                    <p className="text-sm text-gray-500">
                      {currentTeam.members?.length || 0} members • {currentTeam.spaces?.length || 0} spaces
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'workspace', label: 'Workspace', icon: Folder },
                  { id: 'tasks', label: 'Tasks', icon: CheckCircle },
                  { id: 'management', label: 'Team', icon: Users },
                  { id: 'insights', label: 'Insights', icon: Brain }
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeView === view.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {React.createElement(view.icon, { className: 'w-4 h-4' })}
                    {!sidebarCollapsed && <span>{view.label}</span>}
                  </button>
                ))}
              </div>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              {currentTeam ? (
                <>
                  {/* Workspace View */}
                  {activeView === 'workspace' && (
                    <TeamWorkspace
                      team={currentTeam}
                      selectedSpaceId={currentSpaceId || undefined}
                      selectedListId={currentListId || undefined}
                      onTaskCreate={handleTaskCreate}
                      onTaskEdit={handleTaskEdit}
                      refreshKey={tasksRefreshKey}
                      currentUserId={realUserId || currentUserId}
                    />
                  )}

                  {/* Tasks View */}
                  {activeView === 'tasks' && (
                    <OptimizedTaskBoard
                      teamId={currentTeam.id}
                      spaceId={currentSpaceId || undefined}
                      listId={currentListId || undefined}
                      currentUserRole={currentUserRole}
                      onTaskCreate={handleTaskCreate}
                      onTaskEdit={handleTaskEdit}
                      onTaskDelete={handleTaskDelete}
                      refreshKey={tasksRefreshKey}
                    />
                  )}

                  {/* Team Management View */}
                  {activeView === 'management' && (
                    <TeamManagement
                      team={{
                        ...currentTeam,
                        members: currentTeam?.members.map((member: any) => ({
                          ...member,
                          isActive: true // Add missing isActive property
                        })) || []
                      }}
                      currentUserRole={currentUserRole}
                      onMemberInvite={handleMemberInvite}
                      onMemberRemove={handleMemberRemove}
                      onMemberRoleChange={handleMemberRoleChange}
                      onMemberTransfer={() => console.log('Transfer ownership')}
                    />
                  )}

                  {/* Insights View */}
                  {activeView === 'insights' && (
                    <TeamInsights
                      teamId={currentTeam.id}
                      currentUserRole={currentUserRole}
                    />
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Team Selected</h2>
                    <p className="text-gray-500 mb-6">Select a team from sidebar to get started</p>
                    <button
                      onClick={() => setIsCreateTeamModalOpen(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Create Team
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        teamId={currentTeam?.id || ''}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onResultClick={handleSearchResultClick}
      />

      {/* Create Team Modal */}
      <Dialog open={isCreateTeamModalOpen} onOpenChange={setIsCreateTeamModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="e.g. Engineering, Marketing..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamDesc">Description (Optional)</Label>
              <Textarea
                id="teamDesc"
                placeholder="Briefly describe what this team does..."
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateTeamModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingTeam || !newTeamName.trim()}>
                {isCreatingTeam ? 'Creating...' : 'Create Team'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Creation/Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        task={taskToEdit}
        projects={projects}
      />
      </div>
    </div>
  );
}

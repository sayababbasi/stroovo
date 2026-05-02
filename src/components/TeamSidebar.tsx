"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Inbox, CheckSquare, Calendar, ChevronDown, ChevronRight,
  Plus, Search, Users, Network, Folder, FileText, Image, Database,
  Hash, MoreHorizontal, Settings, Star, Archive, Trash2
} from 'lucide-react';
import { apiGet } from '@/lib/api';

// Types
interface Team {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  avatar?: string;
  members: TeamMember[];
  spaces: TeamSpace[];
  _count?: {
    members: number;
    spaces: number;
  };
}

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  role: string;
  joinedAt: string;
}

interface TeamSpace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  lists: TeamList[];
  _count?: {
    lists: number;
  };
}

interface TeamList {
  id: string;
  name: string;
  type: 'TASKS' | 'DOCS' | 'ASSETS';
  _count?: {
    tasks: number;
  };
}

interface TeamSidebarProps {
  teams?: Team[];
  selectedTeamId?: string;
  selectedSpaceId?: string;
  selectedListId?: string;
  onTeamSelect: (teamId: string) => void;
  onSpaceSelect: (spaceId: string) => void;
  onListSelect: (listId: string) => void;
  onCreateTeam?: () => void;
  onCreateSpace?: (teamId: string) => void;
  onCreateList?: (spaceId: string) => void;
}

const TeamSidebar: React.FC<TeamSidebarProps> = ({
  teams: initialTeams,
  selectedTeamId,
  selectedSpaceId,
  selectedListId,
  onTeamSelect,
  onSpaceSelect,
  onListSelect,
  onCreateTeam,
  onCreateSpace,
  onCreateList
}) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams || []);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());

  // Fetch teams if not provided via props
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        console.log('TeamSidebar: Fetching teams...');
        const response = await apiGet(`/api/teams?include=spaces,lists&_t=${Date.now()}`, null, { timeout: 30000 });
        
        if (response.success && response.data) {
          const teamsArray = Array.isArray(response.data) ? response.data : [];
          setTeams(teamsArray);
        }
      } catch (error) {
        console.error('TeamSidebar: Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    if (initialTeams === undefined || initialTeams === null) {
      fetchTeams();
    } else {
      setLoading(false);
    }
  }, [initialTeams]);

  // Update internal teams if prop changes
  useEffect(() => {
    if (initialTeams) {
      setTeams(initialTeams);
      setLoading(false);
    }
  }, [initialTeams]);

  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;
    
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  // Toggle team expansion
  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Toggle space expansion
  const toggleSpace = (spaceId: string) => {
    setExpandedSpaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spaceId)) {
        newSet.delete(spaceId);
      } else {
        newSet.add(spaceId);
      }
      return newSet;
    });
  };

  // Get icon for list type
  const getListIcon = (type: string) => {
    switch (type) {
      case 'TASKS': return <CheckSquare className="w-4 h-4" />;
      case 'DOCS': return <FileText className="w-4 h-4" />;
      case 'ASSETS': return <Image className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  // Get icon for space
  const getSpaceIcon = (icon?: string) => {
    if (icon) {
      // Return emoji if provided
      return <span className="text-lg">{icon}</span>;
    }
    return <Folder className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
          <button
            onClick={onCreateTeam}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Navigation */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="space-y-1">
            {[
              { icon: Home, label: 'Home', id: 'home' },
              { icon: Inbox, label: 'Inbox', id: 'inbox' },
              { icon: CheckSquare, label: 'My Tasks', id: 'my-tasks' },
              { icon: Calendar, label: 'Schedule', id: 'schedule' }
            ].map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Teams */}
        <div className="p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Teams
          </div>
          
          <AnimatePresence>
            {filteredTeams.map((team) => (
              <div key={team.id} className="mb-2">
                {/* Team Header */}
                <div
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTeamId === team.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onTeamSelect(team.id);
                    toggleTeam(team.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                      {team.avatar ? (
                        <img src={team.avatar} alt={team.name} className="w-4 h-4 rounded" />
                      ) : (
                        <Network className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{team.name}</div>
                      <div className="text-xs text-gray-500">
                        {team._count?.members || team.members?.length || 0} members • {team._count?.spaces || team.spaces?.length || 0} spaces
                      </div>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform ${
                      expandedTeams.has(team.id) ? 'rotate-90' : ''
                    }`} 
                  />
                </div>

                {/* Spaces */}
                <AnimatePresence>
                  {expandedTeams.has(team.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 mt-1"
                    >
                      {team.spaces?.map((space) => (
                        <div key={space.id} className="mb-1">
                          {/* Space Header */}
                          <div
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedSpaceId === space.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              onSpaceSelect(space.id);
                              toggleSpace(space.id);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{ backgroundColor: space.color ? `${space.color}20` : '#f3f4f6' }}
                              >
                                {getSpaceIcon(space.icon)}
                              </div>
                              <span className="text-sm">{space.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">
                                {space._count?.lists || space.lists.length}
                              </span>
                              <ChevronRight 
                                className={`w-3 h-3 transition-transform ${
                                  expandedSpaces.has(space.id) ? 'rotate-90' : ''
                                }`} 
                              />
                            </div>
                          </div>

                          {/* Lists */}
                          <AnimatePresence>
                            {expandedSpaces.has(space.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-4 mt-1"
                              >
                                {space.lists?.map((list) => (
                                  <div
                                    key={list.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                      selectedListId === list.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => onListSelect(list.id)}
                                  >
                                    {getListIcon(list.type)}
                                    <span className="text-sm">{list.name}</span>
                                    {list._count?.tasks && (
                                      <span className="text-xs text-gray-500 ml-auto">
                                        {list._count.tasks}
                                      </span>
                                    )}
                                  </div>
                                ))}

                                {/* Add List Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateList?.(space.id);
                                  }}
                                  className="flex items-center gap-2 p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Add List</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {/* Add Space Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateSpace?.(team.id);
                        }}
                        className="flex items-center gap-2 p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Space</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>

          {filteredTeams.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No teams found</p>
              <button
                onClick={onCreateTeam}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Create your first team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSidebar;

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus, Search, Filter, MoreHorizontal, Calendar, Clock, User,
  Tag, Paperclip, MessageSquare, CheckSquare, Square, AlertCircle,
  ChevronDown, ChevronUp, Edit3, Trash2, Eye, EyeOff, Lock,
  Unlock, Users, Target, TrendingUp, BarChart2, Zap, ArrowRight,
  Copy, Archive, Flag, Star, Hash
} from 'lucide-react';
import { TeamRole, hasPermission, Permission } from '@/lib/rbac';

// Types
interface TeamTask {
  id: string;
  title: string;
  description?: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee?: {
    id: string;
    name: string;
    image?: string;
  };
  dueDate?: string;
  progress: number;
  tags: string[];
  subtasks: SubTask[];
  comments: Comment[];
  attachments: number;
  team: {
    id: string;
    name: string;
  };
  space: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  list: {
    id: string;
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
}

interface TeamTaskBoardProps {
  teamId: string;
  spaceId?: string;
  listId?: string;
  currentUserRole: TeamRole;
  onTaskCreate: () => void;
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

type GroupBy = 'status' | 'priority' | 'assignee' | 'dueDate' | 'space' | 'list';
type SortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
type SortOrder = 'asc' | 'desc';

const TeamTaskBoard: React.FC<TeamTaskBoardProps> = ({
  teamId,
  spaceId,
  listId,
  currentUserRole,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete
}) => {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Check permissions
  const canCreateTasks = hasPermission('ADMIN', currentUserRole, Permission.CREATE_TASK, 'team');
  const canEditTasks = hasPermission('ADMIN', currentUserRole, Permission.EDIT_TASK, 'team');
  const canDeleteTasks = hasPermission('ADMIN', currentUserRole, Permission.DELETE_TASK, 'team');
  const canAssignTasks = hasPermission('ADMIN', currentUserRole, Permission.ASSIGN_TASK, 'team');

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('teamId', teamId);
        if (spaceId) params.append('spaceId', spaceId);
        if (listId) params.append('listId', listId);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (priorityFilter !== 'all') params.append('priority', priorityFilter);

        const response = await fetch(`/api/tasks?${params}`);
        if (response.ok) {
          const tasksData = await response.json();
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [teamId, spaceId, listId, statusFilter, priorityFilter]);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Group tasks
  const groupedTasks = sortedTasks.reduce((groups, task) => {
    let key = '';
    
    switch (groupBy) {
      case 'status':
        key = task.status.replace('_', ' ');
        break;
      case 'priority':
        key = task.priority;
        break;
      case 'assignee':
        key = task.assignee?.name || 'Unassigned';
        break;
      case 'dueDate':
        if (!task.dueDate) {
          key = 'No Due Date';
        } else {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) key = 'Overdue';
          else if (diffDays === 0) key = 'Today';
          else if (diffDays === 1) key = 'Tomorrow';
          else if (diffDays <= 7) key = 'This Week';
          else if (diffDays <= 30) key = 'This Month';
          else key = 'Later';
        }
        break;
      case 'space':
        key = task.space.name;
        break;
      case 'list':
        key = task.list.name;
        break;
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
    
    return groups;
  }, {} as Record<string, TeamTask[]>);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TODO': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'BLOCKED': return 'bg-red-100 text-red-700 border-red-200';
      case 'REVIEW': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'BACKLOG': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <AlertCircle className="w-3 h-3" />;
      case 'HIGH': return <Flag className="w-3 h-3" />;
      case 'MEDIUM': return <Star className="w-3 h-3" />;
      case 'LOW': return <Hash className="w-3 h-3" />;
      default: return <Hash className="w-3 h-3" />;
    }
  };

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Calculate completion percentage
  const getCompletionPercentage = (task: TeamTask) => {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.isCompleted).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {filteredTasks.length} tasks
            </span>
          </div>
          
          {canCreateTasks && (
            <button
              onClick={onTaskCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="status">Group by Status</option>
            <option value="priority">Group by Priority</option>
            <option value="assignee">Group by Assignee</option>
            <option value="dueDate">Group by Due Date</option>
            <option value="space">Group by Space</option>
            <option value="list">Group by List</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as SortBy);
              setSortOrder(order as SortOrder);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="createdAt-desc">Recently Created</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="dueDate-asc">Due Date (Earliest)</option>
            <option value="dueDate-desc">Due Date (Latest)</option>
            <option value="priority-desc">Priority (Highest)</option>
            <option value="priority-asc">Priority (Lowest)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Task Board */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto">
            {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => (
              <div key={groupKey} className="flex-1 min-w-[300px]">
                <div className="bg-gray-50 rounded-t-lg p-3 border border-gray-200 border-b-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">{groupKey}</h3>
                    <span className="text-xs text-gray-500">{groupTasks.length}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-b-lg p-3 space-y-2 min-h-[400px] border border-gray-200">
                  <AnimatePresence>
                    {groupTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onTaskEdit(task.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleTaskSelection(task.id);
                              }}
                              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {task.title}
                                </h4>
                              </div>
                              
                              {task.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Tags */}
                              {task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {task.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {task.tags.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                      +{task.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Progress Bar */}
                              {task.subtasks.length > 0 && (
                                <div className="mb-2">
                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span>{getCompletionPercentage(task)}% complete</span>
                                    <span>{task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div
                                      className="bg-blue-500 h-1 rounded-full transition-all"
                                      style={{ width: `${getCompletionPercentage(task)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskExpansion(task.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {expandedTasks.has(task.id) ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Task Footer */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {task.assignee && (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                  {task.assignee.image ? (
                                    <img src={task.assignee.image} alt={task.assignee.name} className="w-5 h-5 rounded-full" />
                                  ) : (
                                    <span className="text-xs">
                                      {task.assignee.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-600">{task.assignee.name}</span>
                              </div>
                            )}
                            
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}

                            {task.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}

                            {task.attachments > 0 && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Paperclip className="w-3 h-3" />
                                <span>{task.attachments}</span>
                              </div>
                            )}
                          </div>

                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {expandedTasks.has(task.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-gray-100"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Priority:</span>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} text-white`}>
                                      {getPriorityIcon(task.priority)}
                                      <span>{task.priority}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    {canEditTasks && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTaskEdit(task.id);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      >
                                        <Edit3 className="w-3 h-3 text-gray-400" />
                                      </button>
                                    )}
                                    
                                    {canDeleteTasks && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTaskDelete(task.id);
                                        }}
                                        className="p-1 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {task.space && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Space:</span>
                                    <div className="flex items-center gap-1">
                                      {task.space.icon && <span className="text-xs">{task.space.icon}</span>}
                                      <span className="text-xs text-gray-700">{task.space.name}</span>
                                    </div>
                                  </div>
                                )}

                                {task.list && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">List:</span>
                                    <span className="text-xs text-gray-700">{task.list.name}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Created:</span>
                                  <span className="text-xs text-gray-700">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No tasks found</p>
            {canCreateTasks && (
              <button
                onClick={onTaskCreate}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Create your first task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamTaskBoard;

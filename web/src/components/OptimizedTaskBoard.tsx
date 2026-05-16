"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, MoreHorizontal, Calendar, Clock, User,
  Tag, Paperclip, MessageSquare, CheckSquare, Square, AlertCircle,
  ChevronDown, ChevronUp, Edit3, Trash2, Eye, EyeOff, Lock,
  Unlock, Users, Target, TrendingUp, BarChart2, Zap, ArrowRight,
  Copy, Archive, Flag, Star, Hash, Loader2
} from 'lucide-react';
import {
  useVirtualization,
  useLazyLoad,
  useDebounce,
  useCachedFetch,
  useOptimisticUpdate,
  usePerformanceMonitor
} from '@/hooks/useVirtualization';
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
  subtasks: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
  comments: number;
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

interface OptimizedTaskBoardProps {
  teamId: string;
  spaceId?: string;
  listId?: string;
  currentUserRole: TeamRole;
  onTaskCreate: () => void;
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  refreshKey?: number;
}

const ITEM_HEIGHT = 120; // Height of each task item
const CONTAINER_HEIGHT = 600; // Height of the visible container
const OVERSCAN = 5; // Number of items to render outside visible area

// Sub-component for virtualized columns to follow Rules of Hooks
const VirtualizedColumn = ({ 
  groupKey, 
  tasks, 
  renderTaskItem,
  containerHeight,
  itemHeight,
  overscan
}: { 
  groupKey: string; 
  tasks: any[]; 
  renderTaskItem: (task: any, style: React.CSSProperties) => React.ReactNode;
  containerHeight: number;
  itemHeight: number;
  overscan: number;
}) => {
  const {
    virtualizedItems,
    totalHeight,
    scrollElementRef,
    handleScroll
  } = useVirtualization(tasks, {
    itemHeight,
    containerHeight,
    overscan
  });

  return (
    <div className="flex-1 min-w-[300px] flex flex-col">
      <div className="bg-gray-50 rounded-t-lg p-3 border border-gray-200 border-b-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{groupKey}</h3>
          <span className="text-xs text-gray-500">{tasks.length}</span>
        </div>
      </div>

      <div
        ref={scrollElementRef}
        onScroll={handleScroll}
        className="bg-gray-50 rounded-b-lg border border-gray-200 overflow-hidden"
        style={{ height: containerHeight }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {virtualizedItems.map(({ index, key, style }) => {
            const task = tasks[index];
            if (!task) return null;
            return renderTaskItem(task, style);
          })}
        </div>
      </div>
    </div>
  );
};


const OptimizedTaskBoard: React.FC<OptimizedTaskBoardProps> = ({
  teamId,
  spaceId,
  listId,
  currentUserRole,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  refreshKey
}) => {
  const { measureFunction } = usePerformanceMonitor('OptimizedTaskBoard');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'assignee'>('status');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Check permissions
  const canCreateTasks = hasPermission('ADMIN', currentUserRole, Permission.CREATE_TASK, 'team');
  const canEditTasks = hasPermission('ADMIN', currentUserRole, Permission.EDIT_TASK, 'team');
  const canDeleteTasks = hasPermission('ADMIN', currentUserRole, Permission.DELETE_TASK, 'team');

  // Memoize fetcher to avoid infinite loops in useLazyLoad
  const fetchTasks = useCallback(async (page: number, limit: number) => {
    const params = new URLSearchParams({
      teamId,
      page: page.toString(),
      limit: limit.toString()
    });

    if (spaceId) params.append('spaceId', spaceId);
    if (listId) params.append('listId', listId);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (priorityFilter !== 'all') params.append('priority', priorityFilter);
    if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const response = await fetch(`/api/team-tasks?${params}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');

    const data = await response.json();
    return data;
  }, [teamId, spaceId, listId, statusFilter, priorityFilter, debouncedSearchQuery, sortBy, sortOrder]);

  // Lazy load tasks
  const {
    items: tasks,
    loading: tasksLoading,
    error: tasksError,
    hasMore,
    loadMore,
    reset,
    refresh,
    observerRef
  } = useLazyLoad<TeamTask>({
    fetcher: fetchTasks,
    pageSize: 50,
    threshold: 0.8
  });

  // Refresh when key or props change
  useEffect(() => {
    refresh();
  }, [refreshKey, teamId, spaceId, listId, refresh]);

  // Optimistic updates for task operations
  const {
    data: optimizedTasks,
    loading: updateLoading,
    update: optimisticUpdate,
    reset: resetOptimistic
  } = useOptimisticUpdate(tasks, async (updatedTasks) => {
    // This would sync with the backend
    return updatedTasks;
  });

  // Filter and sort tasks (memoized)
  const filteredAndSortedTasks = useMemo(() => {
    const filterAndSortFn = () => {
      // Deduplicate by id first
      const seen = new Set<string>();
      let filtered = optimizedTasks.filter(task => {
        if (seen.has(task.id)) return false;
        seen.add(task.id);
        return true;
      });

      // Apply filters
      if (statusFilter !== 'all') {
        filtered = filtered.filter(task => task.status === statusFilter);
      }

      if (priorityFilter !== 'all') {
        filtered = filtered.filter(task => task.priority === priorityFilter);
      }

      // Apply search
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        filtered = filtered.filter(task =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Sort
      filtered.sort((a, b) => {
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

      return filtered;
    };

    return measureFunction(filterAndSortFn, 'filterAndSortTasks')();
  }, [optimizedTasks, statusFilter, priorityFilter, debouncedSearchQuery, sortBy, sortOrder, measureFunction]);

  // Group tasks (memoized)
  const groupedTasks = useMemo(() => {
    const groupTasksFn = () => {
      return filteredAndSortedTasks.reduce((groups: Record<string, TeamTask[]>, task: TeamTask) => {
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
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(task);

        return groups;
      }, {} as Record<string, TeamTask[]>);
    };

    return measureFunction(groupTasksFn, 'groupTasks')();
  }, [filteredAndSortedTasks, groupBy, measureFunction]);



  // Event handlers
  const handleTaskToggle = useCallback((taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  const handleTaskExpand = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const handleTaskStatusChange = useCallback((taskId: string, newStatus: string) => {
    optimisticUpdate(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, [optimisticUpdate, tasks]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TODO': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'BLOCKED': return 'bg-red-100 text-red-700 border-red-200';
      case 'REVIEW': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'BACKLOG': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }, []);

  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }, []);

  // Render task item
  const renderTaskItem = useCallback((task: TeamTask, style: React.CSSProperties) => {
    const isExpanded = expandedTasks.has(task.id);
    const isSelected = selectedTasks.includes(task.id);
    const completionPercentage = task.subtasks.length > 0
      ? Math.round((task.subtasks.filter(st => st.isCompleted).length / task.subtasks.length) * 100)
      : 0;

    return (
      <motion.div
        key={task.id}
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onTaskEdit(task.id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleTaskToggle(task.id);
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

              {/* Progress Bar */}
              {task.subtasks.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{completionPercentage}% complete</span>
                    <span>{task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTaskExpand(task.id);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
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

            {task.comments > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments}</span>
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
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 pt-3 border-t border-gray-100"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Priority:</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} text-white`}>
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

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Space:</span>
                <span className="text-xs text-gray-700">{task.space.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">List:</span>
                <span className="text-xs text-gray-700">{task.list.name}</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }, [
    expandedTasks,
    selectedTasks,
    onTaskEdit,
    onTaskDelete,
    canEditTasks,
    canDeleteTasks,
    handleTaskToggle,
    handleTaskExpand,
    getStatusColor,
    getPriorityColor
  ]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {filteredAndSortedTasks.length} tasks
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
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="status">Group by Status</option>
            <option value="priority">Group by Priority</option>
            <option value="assignee">Group by Assignee</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as any);
              setSortOrder(order as any);
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

      {/* Virtualized Task Board */}
      <div className="p-4">
        {tasksLoading && filteredAndSortedTasks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : tasksError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-red-600">{tasksError}</p>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
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
        ) : (
          <div className="flex gap-4 overflow-x-auto">
            {Object.entries(groupedTasks).map(([groupKey, tasks]) => (
              <VirtualizedColumn
                key={groupKey}
                groupKey={groupKey}
                tasks={tasks}
                renderTaskItem={renderTaskItem}
                containerHeight={CONTAINER_HEIGHT}
                itemHeight={ITEM_HEIGHT}
                overscan={OVERSCAN}
              />
            ))}
          </div>

        )}

        {/* Load More Trigger */}
        <div ref={observerRef} className="py-4 text-center">
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={tasksLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {tasksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedTaskBoard;

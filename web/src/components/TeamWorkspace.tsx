"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, CheckSquare, Calendar, BarChart2, Plus, Search,
  Filter, MoreHorizontal, User, Clock, AlertCircle, ChevronDown,
  Paperclip, Send, Smile, AtSign, Bold, Italic, Link2, Code,
  Image as ImageIcon, File, Zap, Target, TrendingUp, Users,
  Settings, Archive, Trash2, Edit3, Eye, EyeOff, Lock
} from 'lucide-react';
import { socketService } from '@/lib/socket';
import { CalendarView } from '@/app/calendar/page';
import { TimelineView } from '@/app/timeline/page';

// Types
interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: TeamMember[];
  spaces: TeamSpace[];
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
  lists: TeamList[];
}

interface TeamList {
  id: string;
  name: string;
  type: 'TASKS' | 'DOCS' | 'ASSETS';
}

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

interface TeamMessage {
  id: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'EMOJI';
  user: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  reactions: MessageReaction[];
  replies: TeamMessage[];
}

interface MessageReaction {
  emoji: string;
  users: Array<{ id: string; name: string }>;
}

interface TeamWorkspaceProps {
  team: Team;
  selectedSpaceId?: string;
  selectedListId?: string;
  onTaskCreate?: () => void;
  onTaskEdit?: (taskId: string) => void;
  refreshKey?: number;
  currentUserId?: string;
}

type TabType = 'chat' | 'tasks' | 'schedule' | 'gantt';

const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({
  team,
  selectedSpaceId,
  selectedListId,
  onTaskCreate,
  onTaskEdit,
  refreshKey,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'assignee'>('status');
  const [messageInput, setMessageInput] = useState('');

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!team.id) return;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const params = new URLSearchParams();
        params.append('teamId', team.id);
        if (selectedSpaceId) params.append('spaceId', selectedSpaceId);
        if (selectedListId) params.append('listId', selectedListId);

        const response = await fetch(`/api/team-tasks?${params}`, {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          const tasksData = await response.json();
          setTasks(tasksData);
        } else {
          console.error('Failed to fetch tasks:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [team.id, selectedSpaceId, selectedListId, refreshKey]);

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    if (!team.id) return;

    socketService.connect();
    socketService.joinTeam(team.id);

    const handleTaskCreated = (data: any) => {
      if (data.teamId === team.id) {
        setTasks(prev => [data.task, ...prev]);
      }
    };

    const handleTaskUpdated = (data: any) => {
      if (data.teamId === team.id) {
        setTasks(prev => prev.map(task => 
          task.id === data.task.id ? data.task : task
        ));
      }
    };

    const handleTaskDeleted = (data: any) => {
      if (data.teamId === team.id) {
        setTasks(prev => prev.filter(task => task.id !== data.taskId));
      }
    };

    const handleMessageSent = (data: any) => {
      if (data.teamId === team.id && activeTab === 'chat') {
        setMessages(prev => [...prev, data.message]);
      }
    };

    socketService.onTaskCreated(handleTaskCreated);
    socketService.onTaskUpdated(handleTaskUpdated);
    socketService.onTaskDeleted(handleTaskDeleted);
    socketService.onMessageSent(handleMessageSent);

    return () => {
      socketService.offTaskCreated?.(handleTaskCreated);
      socketService.offTaskUpdated?.(handleTaskUpdated);
      socketService.offTaskDeleted?.(handleTaskDeleted);
      socketService.offMessageSent?.(handleMessageSent);
      socketService.leaveTeam(team.id);
    };
  }, [team.id, activeTab]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!team.id || activeTab !== 'chat') return;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`/api/team-messages?teamId=${team.id}`, {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          const messagesData = await response.json();
          // Extract data array from success response if wrapped
          const actualMessages = messagesData.success && messagesData.data ? messagesData.data : (Array.isArray(messagesData) ? messagesData : []);
          setMessages(actualMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [team.id, activeTab]);

  // Filter and group tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    return filtered;
  }, [tasks, searchQuery, statusFilter]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TeamTask[]> = {};

    filteredTasks.forEach(task => {
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
    });

    return groups;
  }, [filteredTasks, groupBy]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'TODO': return 'bg-gray-100 text-gray-700';
      case 'BLOCKED': return 'bg-red-100 text-red-700';
      case 'REVIEW': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
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

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/team-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          teamId: team.id,
          userId: currentUserId || 'admin@revoticai.com', // Use prop or fallback
          content: messageInput,
          type: 'TEXT'
        })
      });
      clearTimeout(timeout);

      if (response.ok) {
        const newMessage = await response.json();
        // Unwrap if response is { success: true, data: message }
        const actualMessage = newMessage.success && newMessage.data ? newMessage.data : newMessage;
        setMessages(prev => [...prev, actualMessage]);
        setMessageInput('');
        
        // Broadcast message to other team members
        socketService.getSocket()?.emit('message-sent', {
          teamId: team.id,
          message: actualMessage
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to send message:', errorData.error || response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const tabs = [
    { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
    { id: 'schedule' as TabType, label: 'Schedule', icon: Calendar },
    { id: 'gantt' as TabType, label: 'Gantt', icon: BarChart2 }
  ];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                {team.avatar ? (
                  <img src={team.avatar} alt={team.name} className="w-8 h-8 rounded" />
                ) : (
                  <Users className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{team.name}</h1>
                {team.description && (
                  <p className="text-sm text-gray-500">{team.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 px-4 border-t border-gray-100">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}

          <button className="flex items-center gap-2 py-3 text-gray-400 hover:text-gray-600 transition-colors ml-auto">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add View</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {message.user.image ? (
                        <img src={message.user.image} alt={message.user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="text-xs font-medium">
                          {message.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 bg-white p-3 rounded-lg">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-4 h-4 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Smile className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              {/* Task Controls */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                      <option value="BLOCKED">Blocked</option>
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
                  </div>

                  <button
                    onClick={onTaskCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Task</span>
                  </button>
                </div>
              </div>

              {/* Task Board */}
              <div className="flex-1 overflow-x-auto p-4">
                <div className="flex gap-4 h-full">
                  {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => (
                    <div key={groupKey} className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-t-lg p-3">
                        <h3 className="text-sm font-semibold text-gray-700">{groupKey}</h3>
                        <span className="text-xs text-gray-500">{groupTasks.length} tasks</span>
                      </div>

                      <div className="bg-gray-50 rounded-b-lg p-3 space-y-2 min-h-[400px]">
                        {groupTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onTaskEdit?.(task.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {task.title}
                              </h4>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            </div>

                            {task.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {task.assignee && (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    {task.assignee.image ? (
                                      <img src={task.assignee.image} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
                                    ) : (
                                      <span className="text-xs">
                                        {task.assignee.name.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </div>

                            {task.subtasks.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">
                                  {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length} subtasks
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-blue-500 h-1 rounded-full"
                                    style={{
                                      width: `${(task.subtasks.filter(st => st.isCompleted).length / task.subtasks.length) * 100}%`
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              <CalendarView hideHeader hideSidebar teamId={team.id} />
            </motion.div>
          )}

          {activeTab === 'gantt' && (
            <motion.div
              key="gantt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              <TimelineView hideHeader teamId={team.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamWorkspace;

"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Activity,
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  PanelRightClose,
  Paperclip,
  Plus,
  Shield,
  Trash2,
  Zap,
  Link2,
  X,
  Facebook,
  Star,
  MoreVertical,
  Circle,
  MessageSquare,
  Smile,
  Send,
  AlignLeft,
  Check,
  Pencil
} from 'lucide-react';
import type { HealthStatus, Priority, RiskLevel, Task, TaskStatus } from './types';
import {
  HEALTH_COLORS,
  PRIORITIES,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  RISK_CONFIG,
  STATUSES,
  STATUS_BG,
  STATUS_COLORS,
  STATUS_LABELS,
} from './types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Section({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: 'none',
          background: 'transparent',
          padding: '12px 0',
          cursor: 'pointer',
          color: '#42526E',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {icon}
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        {badge}
        {open ? <ChevronUp size={16} color="#8A94A6" /> : <ChevronDown size={16} color="#8A94A6" />}
      </button>
      {open ? children : null}
    </div>
  );
}

function SelectPill<T extends string>({
  value,
  options,
  labels,
  colors,
  backgrounds,
  onChange,
}: {
  value: T;
  options: T[];
  labels: Record<T, string>;
  colors: Record<T, string>;
  backgrounds?: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {/* Visual Overlay */}
      <div style={{ 
        position: 'absolute', inset: 0, pointerEvents: 'none', 
        background: backgrounds?.[value] ?? '#F4F5F7', 
        border: `1px solid ${colors[value]}33`, 
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[value] }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: colors[value] }}>{labels[value]}</span>
        </div>
        <ChevronDown size={14} color={colors[value]} style={{ opacity: 0.6 }} />
      </div>
      
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        style={{
          width: '100%',
          opacity: 0,
          padding: '8px 10px',
          fontSize: 12,
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TaskDetailsPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, fieldOrUpdates: keyof Task | any, value?: unknown) => void;
}

export default function TaskDetailsPanel({ task, onClose, onUpdate }: TaskDetailsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdminOrCEO = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'CEO' || user?.role === 'PROJECT_MANAGER';

  useEffect(() => {
    const width = isExpanded ? 800 : 420;
    window.dispatchEvent(new CustomEvent('task-details-resize', { detail: { width } }));
  }, [isExpanded]);

  useEffect(() => {
    const width = isExpanded ? 800 : 420;
    window.dispatchEvent(new CustomEvent('task-details-open', { detail: { width } }));
    return () => {
      window.dispatchEvent(new Event('task-details-close'));
    };
  }, []);

  const rawInsight = useMemo(() => {
    const source = (task.aiInsights as any)?.riskAnalysis || task.aiInsights || task.ai || {};
    return source as Record<string, any>;
  }, [task.ai, task.aiInsights]);

  const ai = useMemo(() => {
    const reasons = Array.isArray(rawInsight.reasons)
      ? rawInsight.reasons
      : Array.isArray(rawInsight.factors)
        ? rawInsight.factors
        : [];
    const suggestions = Array.isArray(rawInsight.recommendations)
      ? rawInsight.recommendations
      : Array.isArray(rawInsight.suggestions)
        ? rawInsight.suggestions
        : [];

    return {
      riskLevel: String(rawInsight.riskLevel || 'LOW').toLowerCase() as RiskLevel,
      delayProbability: Number(task.delayProbability ?? rawInsight.delayProbability ?? 0),
      reasons,
      suggestions,
      aiEnhanced: Boolean(rawInsight.aiEnhanced),
    };
  }, [rawInsight, task.delayProbability]);

  const risk = RISK_CONFIG[ai.riskLevel] || RISK_CONFIG.low;
  const projectName =
    typeof task.project === 'object' && task.project ? task.project.name : task.project || 'No Project';
  const assigneeName =
    typeof task.assignee === 'object' && task.assignee ? task.assignee.name : task.assignee || 'Unassigned';
  const healthRaw = (task.health || 'on_track') as HealthStatus;

  const [subtasks, setSubtasks] = useState(task.subTasks || task.subtasks || []);
  const [generationHistory, setGenerationHistory] = useState(task.generationHistory || []);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>(task.files as any || []);
  const [dependencies, setDependencies] = useState<any[]>(task.dependencies || []);
  const [description, setDescription] = useState(task.description || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isLinkingTask, setIsLinkingTask] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [isSearchingTasks, setIsSearchingTasks] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    setSubtasks(task.subTasks || task.subtasks || []);
    setGenerationHistory(task.generationHistory || []);
    setDescription(task.description || '');
  }, [task]);

  // Fetch full task data (files, dependencies) on panel open
  // since the task list API only returns counts, not the actual records
  useEffect(() => {
    const fetchFullTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}`, { cache: 'no-store' });
        if (res.ok) {
          const full = await res.json();
          setFiles(full.files || []);
          setDependencies(full.dependencies || []);
        }
      } catch (err) {
        console.error('Failed to load task details:', err);
      }
    };
    fetchFullTask();
  }, [task.id]);

  const refreshTask = useCallback(async () => {
    const response = await fetch(`/api/tasks/${task.id}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to refresh task');
    }

    const fresh = await response.json();
    setSubtasks(fresh.subTasks || []);
    setGenerationHistory(fresh.generationHistory || []);
    setFiles(fresh.files || []);
    setDependencies(fresh.dependencies || []);
    onUpdate(task.id, {
      progress: fresh.progress,
      subTasks: fresh.subTasks,
      aiInsights: fresh.aiInsights,
      delayProbability: fresh.delayProbability,
      riskScore: fresh.riskScore,
      generationHistory: fresh.generationHistory,
      files: fresh.files,
      dependencies: fresh.dependencies,
    } as any);
  }, [onUpdate, task.id]);

  useEffect(() => {
    void fetch('/api/users')
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setAvailableUsers(Array.isArray(data) ? data : []))
      .catch(() => setAvailableUsers([]));

    void fetch(`/api/tasks/${task.id}/comments`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));
  }, [task.id]);

  useEffect(() => {
    if (ai.reasons.length === 0) {
      void triggerAnalysis();
    }
  }, [task.id]);

  const triggerAnalysis = useCallback(async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}/analyze`, { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Risk analysis failed');
      }

      onUpdate(task.id, {
        aiInsights: {
          riskAnalysis: payload.insights,
          riskLevel: payload.insights?.riskLevel,
          reasons: payload.insights?.reasons,
          recommendations: payload.insights?.recommendations,
          delayProbability: payload.delayProbability,
        },
        delayProbability: payload.delayProbability,
        riskScore: payload.riskScore,
      } as any);
      toast.success('Risk analysis updated');
    } catch (error: any) {
      toast.error(error.message || 'Risk analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, onUpdate, task.id]);

  const updateTask = async (updates: Record<string, unknown>) => {
    try {
      await onUpdate(task.id, updates as any);
    } catch {
      toast.error('Task update failed');
    }
  };

  const handleGenerateSubtasks = async (regenerate: boolean) => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}/generate-subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to generate subtasks');
      }

      toast.success(regenerate ? 'Alternative subtasks generated' : 'AI subtasks generated');
      await refreshTask();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate subtasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSubtask = async (subtaskId: string, nextStatus: TaskStatus) => {
    const previous = subtasks;
    const updated = subtasks.map((item: any) => (item.id === subtaskId ? { ...item, status: nextStatus } : item));
    setSubtasks(updated);

    try {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }
      await refreshTask();
    } catch (error: any) {
      setSubtasks(previous);
      toast.error(error.message || 'Failed to update subtask');
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    const previous = subtasks;
    setSubtasks((current) => current.filter((item: any) => item.id !== subtaskId));

    try {
      const response = await fetch(`/api/tasks/${subtaskId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete subtask');
      }
      await refreshTask();
    } catch (error: any) {
      setSubtasks(previous);
      toast.error(error.message || 'Failed to delete subtask');
    }
  };

  const createManualSubtask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget; // Cache reference
    const formData = new FormData(form);
    const title = String(formData.get('title') || '').trim();
    if (!title) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          projectId:
            typeof task.project === 'object'
              ? task.project.id || task.projectId
              : task.projectId,
          parentId: task.id,
          status: 'TODO',
          priority: task.priority,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create subtask');
      }
      (form.elements.namedItem('title') as HTMLInputElement).value = '';
      await refreshTask();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subtask');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileUrl = URL.createObjectURL(file);
      const res = await fetch(`/api/tasks/${task.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          fileType: file.type
        })
      });

      if (!res.ok) throw new Error('Failed to attach file');

      const newFile = await res.json();
      setFiles(prev => [newFile, ...prev]);
      toast.success('File attached successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkDependency = async (dependencyId: string) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependencyId })
      });
      if (!res.ok) throw new Error('Failed to link task');
      const updatedDeps = await res.json();
      setDependencies(updatedDeps);
      setIsLinkingTask(false);
      setTaskSearchQuery('');
      toast.success('Task linked successfully');
    } catch (err: any) {
      toast.error(err.message || 'Linking failed');
    }
  };

  const handleUnlinkDependency = async (dependencyId: string) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/dependencies?dependencyId=${dependencyId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to unlink task');
      const updatedDeps = await res.json();
      setDependencies(updatedDeps);
      toast.success('Task unlinked');
    } catch (err: any) {
      toast.error(err.message || 'Unlinking failed');
    }
  };

  const searchTasks = async (query: string) => {
    setTaskSearchQuery(query);
    if (query.length < 2) {
      setAvailableTasks([]);
      return;
    }
    setIsSearchingTasks(true);
    try {
      const res = await fetch(`/api/tasks?projectId=${task.projectId}&search=${query}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out current task and already linked ones
        const filtered = (data.tasks || data).filter((t: any) =>
          t.id !== task.id && !dependencies.some(d => d.id === t.id)
        );
        setAvailableTasks(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingTasks(false);
    }
  };

  const postComment = async () => {
    if (!commentText.trim() || isPostingComment) return;
    setIsPostingComment(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to post comment');
      }

      setComments((current) => [payload, ...current]);
      setCommentText('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) {
      setEditingCommentId(null);
      return;
    }
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editCommentText }),
      });
      if (response.ok) {
        toast.success('Comment updated');
        setEditingCommentId(null);
        setComments(comments.map(c => c.id === commentId ? { ...c, content: editCommentText } : c));
      } else {
        toast.error('Failed to update comment');
      }
    } catch (error) {
      toast.error('Error updating comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!commentId) return;
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Comment deleted');
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      toast.error('Error deleting comment');
    } finally {
      setCommentToDelete(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isExpanded ? 800 : 420,
        background: '#FAFBFC',
        borderLeft: '1px solid #E8EAED',
        boxShadow: '-6px 0 28px rgba(9,30,66,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          padding: '24px 24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Top Actions Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Circle size={16} color="#6554C0" />
            <div style={{ fontSize: 13, fontWeight: 600, color: '#42526E' }}>{projectName}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setIsExpanded(!isExpanded)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8A94A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PanelRightClose size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8A94A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Title Row */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#172B4D', lineHeight: 1.3, marginBottom: 12 }}>{task.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {task.title.toLowerCase().includes('facebook') && <Facebook size={18} color="#1877F2" />}
            </div>
            <div style={{ display: 'flex', gap: 12, color: '#8A94A6', alignItems: 'center' }}>
              <Star 
                size={16} 
                cursor="pointer" 
                fill={isStarred ? "#FFAB00" : "none"} 
                color={isStarred ? "#FFAB00" : "#8A94A6"}
                onClick={() => { setIsStarred(!isStarred); toast.success(isStarred ? 'Task unstarred' : 'Task starred'); }}
              />
              <Paperclip 
                size={16} 
                cursor="pointer" 
                onClick={() => fileInputRef.current?.click()}
              />
              <div style={{ position: 'relative' }}>
                <MoreVertical 
                  size={16} 
                  cursor="pointer" 
                  onClick={() => setShowMenu(!showMenu)} 
                />
                {showMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                    <div style={{ position: 'absolute', top: 24, right: 0, background: 'white', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #E8EAED', padding: 4, zIndex: 11, minWidth: 140 }}>
                      <div onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); setShowMenu(false); }} style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#42526E', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Copy Link</div>
                      <div onClick={() => { toast.error('Delete functionality requires confirmation'); setShowMenu(false); }} style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#FF5630', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = '#FFEBE6'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Delete Task</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        <div
          style={{
            background: 'white',
            border: '1px solid #E8EAED',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr',
              gap: '12px 16px',
              alignItems: 'center'
            }}
          >
            <span style={{ color: '#42526E', fontSize: 12, fontWeight: 600 }}>Assignee</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', border: '1px solid #E8EAED', borderRadius: 8, background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, paddingRight: 8 }}>
                  {(() => {
                    const assigneeId = (task as any).assigneeId;
                    if (!assigneeId) return <div style={{ fontSize: 12, fontWeight: 600, color: '#8A94A6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Unassigned</div>;
                    const u = availableUsers.find(u => u.id === assigneeId);
                    const init = u ? u.name.substring(0, 2).toUpperCase() : '??';
                    const name = u ? u.name : 'Unknown';
                    return (
                      <>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#6554C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{init}</div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      </>
                    );
                  })()}
                </div>
                <ChevronDown size={14} color="#8A94A6" style={{ flexShrink: 0 }} />
              </div>
              <select
                value={(task as any).assigneeId || ''}
                onChange={(event) => void updateTask({ assigneeId: event.target.value || null })}
                style={{ width: '100%', opacity: 0, padding: '8px 10px', cursor: 'pointer', appearance: 'none', fontSize: 12 }}
              >
                <option value="">Unassigned</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <span style={{ color: '#42526E', fontSize: 12, fontWeight: 600 }}>Status</span>
            <SelectPill value={task.status} options={STATUSES} labels={STATUS_LABELS} colors={STATUS_COLORS} backgrounds={STATUS_BG} onChange={(value) => void updateTask({ status: value })} />

            <span style={{ color: '#42526E', fontSize: 12, fontWeight: 600 }}>Priority</span>
            <SelectPill value={task.priority} options={PRIORITIES} labels={PRIORITY_LABELS} colors={PRIORITY_COLORS} onChange={(value) => void updateTask({ priority: value })} />

            <span style={{ color: '#42526E', fontSize: 12, fontWeight: 600 }}>Due Date</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', border: '1px solid #E8EAED', borderRadius: 8, background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="#8A94A6" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: task.dueDate ? '#172B4D' : '#8A94A6' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                  </span>
                </div>
                <Calendar size={14} color="#8A94A6" style={{ opacity: 0 }} /> {/* Spacer */}
              </div>
              <input
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''}
                onChange={(event) =>
                  void updateTask({
                    dueDate: event.target.value ? new Date(event.target.value).toISOString() : null,
                  })
                }
                style={{ width: '100%', opacity: 0, padding: '8px 10px', cursor: 'pointer', appearance: 'none' }}
              />
            </div>

            <span style={{ color: '#42526E', fontSize: 12, fontWeight: 600 }}>Health</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 32 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: HEALTH_COLORS[healthRaw] }} />
              <div style={{ color: '#172B4D', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{healthRaw.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>

        <Section title="Description" icon={<AlignLeft size={14} color="#8A94A6" />}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => void updateTask({ description })}
              placeholder="Add a description..."
              style={{
                width: '100%',
                minHeight: 110,
                borderRadius: 12,
                border: '1px solid #E8EAED',
                padding: '12px 12px 32px 12px',
                fontSize: 13,
                color: '#42526E',
                resize: 'vertical',
                outline: 'none',
                background: 'white',
              }}
            />
            <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8, color: '#8A94A6' }}>
              <Star 
                size={14} 
                cursor="pointer" 
                fill={isStarred ? "#FFAB00" : "none"} 
                color={isStarred ? "#FFAB00" : "#8A94A6"}
                onClick={() => { setIsStarred(!isStarred); toast.success(isStarred ? 'Task unstarred' : 'Task starred'); }}
              />
              <Paperclip 
                size={14} 
                cursor="pointer" 
                onClick={() => fileInputRef.current?.click()}
              />
            </div>
          </div>
        </Section>

        <Section
          title="AI Analysis"
          icon={<Bot size={14} color="#6554C0" />}
          badge={<span style={{ fontSize: 10, fontWeight: 800, color: risk.text, background: risk.bg, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{risk.label}</span>}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={() => void triggerAnalysis()}
              disabled={isAnalyzing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                border: '1px solid #EAE6FF',
                background: 'white',
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#6554C0',
                cursor: 'pointer',
              }}
            >
              {isAnalyzing ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={12} />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>
          <div style={{ border: '1px solid #E8EAED', borderRadius: 12, padding: 20, background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color={risk.text} />
                <span style={{ fontSize: 14, fontWeight: 800, color: risk.text }}>{risk.label}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#172B4D' }}>{ai.delayProbability}%</span>
                <span style={{ fontSize: 11, color: '#8A94A6', fontWeight: 600 }}>delay probability</span>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: '#F4F5F7', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ width: `${Math.min(100, ai.delayProbability)}%`, height: '100%', background: risk.text }} />
            </div>

            {ai.reasons.length > 0 ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#172B4D', marginBottom: 12 }}>Risk Drivers</div>
                {ai.reasons.map((reason, index) => (
                  <div key={`${reason}-${index}`} style={{ display: 'flex', gap: 10, background: '#FAFBFC', border: '1px solid #E8EAED', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: 12, color: '#42526E' }}>
                    <AlertTriangle size={14} color={risk.text} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ lineHeight: 1.4 }}>{reason}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {ai.suggestions.length > 0 ? (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#6554C0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lightbulb size={14} /> Action Suggestions
                </div>
                {ai.suggestions.map((suggestion, index) => (
                  <div key={`${suggestion}-${index}`} style={{ display: 'flex', gap: 10, background: '#F8F7FF', border: '1px solid #EAE6FF', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: 12, color: '#42526E' }}>
                    <Zap size={14} color="#6554C0" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ lineHeight: 1.4 }}>{suggestion}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Section>

        <Section
          title="Subtasks"
          icon={<CheckCircle2 size={14} color="#36B37E" />}
          badge={<span style={{ fontSize: 12, fontWeight: 600, color: '#8A94A6' }}>{subtasks.filter((item: any) => item.status === 'DONE').length} / {subtasks.length} completed</span>}
        >
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              onClick={() => void handleGenerateSubtasks(subtasks.length > 0)}
              disabled={isGenerating}
              style={{ borderRadius: 8, border: '1px solid #EAE6FF', background: '#F8F7FF', padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#6554C0', cursor: 'pointer' }}
            >
              {isGenerating ? 'Generating...' : subtasks.length > 0 ? 'Regenerate' : 'AI Generate'}
            </button>
          </div>

          {generationHistory.length > 0 ? (
            <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #E8EAED', background: '#FAFBFC' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#172B4D', marginBottom: 6 }}>Generation History</div>
              {generationHistory.slice(0, 3).map((entry: any) => (
                <div key={entry.id} style={{ fontSize: 11, color: '#6B778C', marginBottom: 4 }}>
                  {timeAgo(entry.createdAt)} · {entry.metadata?.regeneration ? 'Regenerated' : 'Generated'} · {(entry.metadata?.titles || []).length} item(s)
                </div>
              ))}
            </div>
          ) : null}

          {subtasks.map((subtask: any) => (
            <div key={subtask.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px', marginBottom: 8, border: '1px solid #E8EAED', borderRadius: 8, background: 'white' }}>
              <input
                type="checkbox"
                checked={subtask.status === 'DONE'}
                onChange={(event) => void toggleSubtask(subtask.id, event.target.checked ? 'DONE' : 'TODO')}
                style={{ marginTop: 2, accentColor: '#6554C0', width: 16, height: 16, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', textDecoration: subtask.status === 'DONE' ? 'line-through' : 'none' }}>{subtask.title}</div>
                {subtask.description ? <div style={{ fontSize: 11, color: '#8A94A6', marginTop: 4, lineHeight: 1.4 }}>{subtask.description}</div> : null}
              </div>
              {(subtask.aiInsights?.generatedByAI || subtask.aiInsights?.semanticHash) ? (
                <span style={{ fontSize: 10, fontWeight: 800, color: '#6554C0', background: '#F8F7FF', padding: '4px 8px', borderRadius: 6 }}>AI</span>
              ) : null}
              <button onClick={() => void deleteSubtask(subtask.id)} style={{ border: 'none', background: 'transparent', color: '#8A94A6', cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <form onSubmit={createManualSubtask} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input name="title" placeholder="Add a subtask..." style={{ flex: 1, borderRadius: 8, border: '1px solid #E8EAED', padding: '10px 12px', fontSize: 12, outline: 'none' }} />
            <button type="submit" style={{ borderRadius: 8, border: 'none', background: '#F8F7FF', color: '#6554C0', padding: '0 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Add
            </button>
          </form>
        </Section>

        <Section title="Files" icon={<Paperclip size={14} color="#8A94A6" />} badge={<span style={{ fontSize: 12, fontWeight: 600, color: '#8A94A6' }}>{files.length}</span>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.map((file) => (
              <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid #E8EAED', borderRadius: 8, textDecoration: 'none', background: 'white', transition: '0.2s' }}>
                <div style={{ padding: 8, background: '#F8F7FF', borderRadius: 8 }}>
                  <Paperclip size={16} color="#6554C0" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: '#8A94A6', marginTop: 2 }}>{file.type} · {Math.round(file.size / 1024)} KB</div>
                </div>
                <ChevronDown size={14} color="#8A94A6" style={{ transform: 'rotate(-90deg)' }} /> {/* Using Chevron as a mock download icon */}
              </a>
            ))}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1px dashed #E8EAED', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#42526E', fontSize: 12, fontWeight: 600 }}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isUploading ? 'Uploading...' : 'Add File'}
            </button>
          </div>
        </Section>

        <Section title="Dependencies" icon={<Link2 size={14} color="#8A94A6" />} badge={<span style={{ fontSize: 12, fontWeight: 600, color: '#8A94A6' }}>{dependencies.length}</span>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dependencies.map((dep) => (
              <div key={dep.id} className="group" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid #E8EAED', borderRadius: 8, background: 'white', position: 'relative' }}>
                <div style={{ padding: 8, background: STATUS_BG[dep.status as TaskStatus] || '#F4F5F7', borderRadius: 8 }}>
                  <Link2 size={16} color={STATUS_COLORS[dep.status as TaskStatus] || '#8A94A6'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{dep.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[dep.status as TaskStatus] || '#8A94A6', marginTop: 2 }}>{STATUS_LABELS[dep.status as TaskStatus] || dep.status}</div>
                </div>
                <button
                  onClick={() => handleUnlinkDependency(dep.id)}
                  style={{ display: 'none', border: 'none', background: 'transparent', color: '#FF5630', cursor: 'pointer', padding: 4 }}
                  className="group-hover:block"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {isLinkingTask ? (
              <div style={{ marginTop: 8 }}>
                <input
                  autoFocus
                  placeholder="Search tasks to link..."
                  value={taskSearchQuery}
                  onChange={(e) => searchTasks(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #6554C0', fontSize: 12, outline: 'none', marginBottom: 8 }}
                />
                {isSearchingTasks && <div style={{ fontSize: 11, color: '#8A94A6', marginBottom: 8 }}>Searching...</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 150, overflowY: 'auto' }}>
                  {availableTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleLinkDependency(t.id)}
                      style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 6, border: '1px solid #E8EAED', background: 'white', cursor: 'pointer', fontSize: 12, color: '#172B4D' }}
                    >
                      {t.title}
                    </button>
                  ))}
                  {taskSearchQuery.length >= 2 && availableTasks.length === 0 && !isSearchingTasks && (
                    <div style={{ fontSize: 11, color: '#8A94A6', padding: '4px 8px' }}>No tasks found</div>
                  )}
                </div>
                <button
                  onClick={() => setIsLinkingTask(false)}
                  style={{ background: 'none', border: 'none', color: '#8A94A6', fontSize: 11, cursor: 'pointer', marginTop: 8 }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLinkingTask(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1px dashed #E8EAED', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#42526E', fontSize: 12, fontWeight: 600 }}
              >
                <Plus size={14} /> Link Task
              </button>
            )}
          </div>
        </Section>

        <Section title="Activity" icon={<Activity size={14} color="#8A94A6" />}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: 12, borderBottom: '1px solid #E8EAED', padding: '16px 0', position: 'relative' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6554C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {comment.user?.name ? comment.user.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#172B4D' }}>{comment.user?.name || 'User'}</div>
                  <div style={{ fontSize: 11, color: '#8A94A6' }}>{timeAgo(comment.createdAt)}</div>
                </div>
                {editingCommentId === comment.id ? (
                  <div style={{ marginTop: 8 }}>
                    <textarea 
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      style={{ width: '100%', minHeight: 60, padding: 8, borderRadius: 8, border: '1px solid #6554C0', outline: 'none', fontSize: 13, color: '#42526E', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => handleEditComment(comment.id)} style={{ padding: '6px 12px', background: '#6554C0', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingCommentId(null)} style={{ padding: '6px 12px', background: '#F4F5F7', color: '#42526E', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#42526E', lineHeight: 1.5 }}>{comment.content}</div>
                )}
              </div>
              {isAdminOrCEO && editingCommentId !== comment.id && (
                <div style={{ position: 'absolute', top: 16, right: 0, display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); }} 
                    style={{ border: 'none', background: 'transparent', color: '#8A94A6', cursor: 'pointer', padding: 4 }}
                    title="Edit Comment"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => setCommentToDelete(comment.id)} 
                    style={{ border: 'none', background: 'transparent', color: '#FF5630', cursor: 'pointer', padding: 4 }}
                    title="Delete Comment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 ? <div style={{ fontSize: 12, color: '#8A94A6' }}>No comments yet.</div> : null}
        </Section>
      </div>

      <div style={{ borderTop: '1px solid #E8EAED', padding: 24, background: '#FAFBFC' }}>
        <Section title="Comment" icon={<MessageSquare size={14} color="#8A94A6" />}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E8EAED', padding: '12px 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void postComment();
                }
              }}
              placeholder={`Comment on ${assigneeName}'s task...`}
              style={{ flex: 1, minHeight: 60, border: 'none', resize: 'none', outline: 'none', fontSize: 13, color: '#42526E' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, color: '#8A94A6' }}>
                <Paperclip size={16} cursor="pointer" onClick={() => fileInputRef.current?.click()} />
                <div style={{ position: 'relative' }}>
                  <Smile size={16} cursor="pointer" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                  {showEmojiPicker && (
                    <div style={{ position: 'absolute', bottom: 32, left: 0, zIndex: 100 }}>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowEmojiPicker(false)} />
                      <div style={{ position: 'relative', zIndex: 100 }}>
                        <EmojiPicker 
                          onEmojiClick={(emojiData: any) => {
                            setCommentText(prev => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Star 
                  size={16} 
                  cursor="pointer" 
                  fill={isStarred ? "#FFAB00" : "none"} 
                  color={isStarred ? "#FFAB00" : "#8A94A6"}
                  onClick={() => { setIsStarred(!isStarred); toast.success(isStarred ? 'Task unstarred' : 'Task starred'); }}
                />
              </div>
              <button
                onClick={() => void postComment()}
                disabled={isPostingComment || !commentText.trim()}
                style={{ borderRadius: 8, border: 'none', background: commentText.trim() ? '#6554C0' : '#E8EAED', color: 'white', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: commentText.trim() ? 'pointer' : 'not-allowed' }}
              >
                {isPostingComment ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </Section>
      </div>

      <Dialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button 
              onClick={() => setCommentToDelete(null)}
              style={{ padding: '8px 16px', borderRadius: 8, background: '#F4F5F7', color: '#42526E', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => handleDeleteComment(commentToDelete!)}
              style={{ padding: '8px 16px', borderRadius: 8, background: '#FF5630', color: 'white', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

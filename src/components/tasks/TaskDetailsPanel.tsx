"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
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
          gap: 8,
          border: 'none',
          background: 'transparent',
          padding: '10px 0',
          cursor: 'pointer',
          color: '#172B4D',
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {icon}
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        {badge}
        {open ? <ChevronUp size={14} color="#8A94A6" /> : <ChevronDown size={14} color="#8A94A6" />}
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
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      style={{
        borderRadius: 999,
        border: `1px solid ${colors[value]}33`,
        background: backgrounds?.[value] ?? '#F4F5F7',
        color: colors[value],
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 700,
        outline: 'none',
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  );
}

interface TaskDetailsPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, fieldOrUpdates: keyof Task | any, value?: unknown) => void;
}

export default function TaskDetailsPanel({ task, onClose, onUpdate }: TaskDetailsPanelProps) {
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
  const [dependencies, setDependencies] = useState<any[]>(task.dependencies || (task as any).taskDependencies || []);
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
        const res = await fetch(`/api/tasks/${task.id}`);
        if (res.ok) {
          const full = await res.json();
          setFiles(full.files || []);
          setDependencies(full.taskDependencies || full.dependencies || []);
        }
      } catch (err) {
        console.error('Failed to load task details:', err);
      }
    };
    fetchFullTask();
  }, [task.id]);

  const refreshTask = useCallback(async () => {
    const response = await fetch(`/api/tasks/${task.id}`);
    if (!response.ok) {
      throw new Error('Failed to refresh task');
    }

    const fresh = await response.json();
    setSubtasks(fresh.subTasks || []);
    setGenerationHistory(fresh.generationHistory || []);
    setFiles(fresh.files || []);
    setDependencies(fresh.taskDependencies || fresh.dependencies || []);
    onUpdate(task.id, {
      progress: fresh.progress,
      subTasks: fresh.subTasks,
      aiInsights: fresh.aiInsights,
      delayProbability: fresh.delayProbability,
      riskScore: fresh.riskScore,
      generationHistory: fresh.generationHistory,
      files: fresh.files,
      dependencies: fresh.taskDependencies || fresh.dependencies,
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
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
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
      (event.currentTarget.elements.namedItem('title') as HTMLInputElement).value = '';
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        background: 'white',
        borderLeft: '1px solid #E8EAED',
        boxShadow: '-6px 0 28px rgba(9,30,66,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid #F4F5F7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8A94A6', marginBottom: 8 }}>{projectName}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#172B4D', lineHeight: 1.3 }}>{task.title}</div>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8A94A6' }}>
          <PanelRightClose size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '96px 1fr',
            gap: '12px 14px',
            marginBottom: 20,
            paddingBottom: 20,
            borderBottom: '1px solid #F4F5F7',
          }}
        >
          <span style={{ color: '#8A94A6', fontSize: 12, fontWeight: 600 }}>Assignee</span>
          <select
            value={(task as any).assigneeId || ''}
            onChange={(event) => void updateTask({ assigneeId: event.target.value || null })}
            style={{ borderRadius: 10, border: '1px solid #DFE1E6', padding: '8px 10px', fontSize: 12, fontWeight: 600 }}
          >
            <option value="">Unassigned</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <span style={{ color: '#8A94A6', fontSize: 12, fontWeight: 600 }}>Status</span>
          <SelectPill value={task.status} options={STATUSES} labels={STATUS_LABELS} colors={STATUS_COLORS} backgrounds={STATUS_BG} onChange={(value) => void updateTask({ status: value })} />

          <span style={{ color: '#8A94A6', fontSize: 12, fontWeight: 600 }}>Priority</span>
          <SelectPill value={task.priority} options={PRIORITIES} labels={PRIORITY_LABELS} colors={PRIORITY_COLORS} onChange={(value) => void updateTask({ priority: value })} />

          <span style={{ color: '#8A94A6', fontSize: 12, fontWeight: 600 }}>Due Date</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#172B4D' }}>
            <Calendar size={14} color="#8A94A6" />
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''}
              onChange={(event) =>
                void updateTask({
                  dueDate: event.target.value ? new Date(event.target.value).toISOString() : null,
                })
              }
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#172B4D' }}
            />
          </label>

          <span style={{ color: '#8A94A6', fontSize: 12, fontWeight: 600 }}>Health</span>
          <div style={{ color: HEALTH_COLORS[healthRaw], fontSize: 13, fontWeight: 700 }}>{healthRaw.replace(/_/g, ' ')}</div>
        </div>

        <Section title="Description" icon={<Activity size={13} color="#8A94A6" />}>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => void updateTask({ description })}
            placeholder="Add a description..."
            style={{
              width: '100%',
              minHeight: 90,
              borderRadius: 10,
              border: '1px solid #DFE1E6',
              padding: 12,
              fontSize: 13,
              color: '#42526E',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </Section>

        <Section
          title="AI Analysis"
          icon={<Bot size={13} color="#6554C0" />}
          badge={<span style={{ fontSize: 10, fontWeight: 700, color: risk.text, background: risk.bg, padding: '2px 8px', borderRadius: 999 }}>{risk.label}</span>}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button
              onClick={() => void triggerAnalysis()}
              disabled={isAnalyzing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                border: '1px solid #DFE1E6',
                background: '#F4F5F7',
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: '#6554C0',
                cursor: 'pointer',
              }}
            >
              {isAnalyzing ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={12} />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>
          <div style={{ border: '1px solid #E8EAED', borderRadius: 12, padding: 16, background: 'linear-gradient(135deg, #F8F7FF 0%, #F0F5FF 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <Shield size={14} color={risk.text} />
              <span style={{ fontSize: 12, fontWeight: 700, color: risk.text }}>{risk.label}</span>
              <span style={{ fontSize: 11, color: '#6B778C' }}>{ai.delayProbability}% delay probability</span>
              {ai.aiEnhanced ? <span style={{ fontSize: 10, fontWeight: 700, color: '#6554C0', background: '#EAE6FF', padding: '2px 6px', borderRadius: 999 }}>AI Enhanced</span> : null}
            </div>
            <div style={{ height: 6, borderRadius: 999, background: '#E8EAED', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: `${Math.min(100, ai.delayProbability)}%`, height: '100%', background: risk.text }} />
            </div>

            {ai.reasons.length > 0 ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#172B4D', marginBottom: 8 }}>Risk Drivers</div>
                {ai.reasons.map((reason, index) => (
                  <div key={`${reason}-${index}`} style={{ display: 'flex', gap: 8, background: 'white', border: '1px solid #F0F0F4', borderRadius: 8, padding: '8px 10px', marginBottom: 6, fontSize: 12, color: '#172B4D' }}>
                    <AlertTriangle size={12} color={risk.text} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {ai.suggestions.length > 0 ? (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6554C0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lightbulb size={12} /> Action Suggestions
                </div>
                {ai.suggestions.map((suggestion, index) => (
                  <div key={`${suggestion}-${index}`} style={{ background: 'white', border: '1px solid #F0F0F4', borderRadius: 8, padding: '8px 10px', marginBottom: 6, fontSize: 12, color: '#172B4D' }}>
                    {suggestion}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Section>

        <Section
          title="Subtasks"
          icon={<CheckCircle2 size={13} color="#36B37E" />}
          badge={<span style={{ fontSize: 10, fontWeight: 700, color: '#8A94A6' }}>{subtasks.filter((item: any) => item.status === 'DONE').length}/{subtasks.length}</span>}
        >
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={() => void handleGenerateSubtasks(subtasks.length > 0)}
              disabled={isGenerating}
              style={{ borderRadius: 8, border: '1px solid #DFE1E6', background: '#F4F5F7', padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#0052CC', cursor: 'pointer' }}
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
            <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #F4F5F7' }}>
              <input
                type="checkbox"
                checked={subtask.status === 'DONE'}
                onChange={(event) => void toggleSubtask(subtask.id, event.target.checked ? 'DONE' : 'TODO')}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#172B4D', textDecoration: subtask.status === 'DONE' ? 'line-through' : 'none' }}>{subtask.title}</div>
                {subtask.description ? <div style={{ fontSize: 11, color: '#6B778C', marginTop: 2 }}>{subtask.description}</div> : null}
              </div>
              {(subtask.aiInsights?.generatedByAI || subtask.aiInsights?.semanticHash) ? (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#0052CC', background: '#E6EFFF', padding: '2px 6px', borderRadius: 999 }}>AI</span>
              ) : null}
              <button onClick={() => void deleteSubtask(subtask.id)} style={{ border: 'none', background: 'transparent', color: '#8A94A6', cursor: 'pointer' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}


          <form onSubmit={createManualSubtask} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input name="title" placeholder="Add a subtask..." style={{ flex: 1, borderRadius: 8, border: '1px solid #DFE1E6', padding: '8px 10px', fontSize: 12 }} />
            <button type="submit" style={{ borderRadius: 8, border: 'none', background: '#E6EFFF', color: '#0052CC', padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Add
            </button>
          </form>
        </Section>

        <Section title="Files" icon={<Paperclip size={13} color="#8A94A6" />} badge={<span style={{ fontSize: 10, fontWeight: 700, color: '#8A94A6' }}>{files.length}</span>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.map((file) => (
              <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #E8EAED', borderRadius: 10, textDecoration: 'none', background: '#FAFBFC', transition: '0.2s' }}>
                <div style={{ padding: 6, background: 'white', borderRadius: 6, border: '1px solid #E8EAED' }}>
                  <Paperclip size={14} color="#0052CC" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ fontSize: 10, color: '#8A94A6' }}>{file.type} · {Math.round(file.size / 1024)} KB</div>
                </div>
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
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1px dashed #DFE1E6', borderRadius: 10, background: 'transparent', cursor: 'pointer', color: '#6B778C', fontSize: 12, fontWeight: 600 }}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isUploading ? 'Uploading...' : 'Add File'}
            </button>
          </div>
        </Section>

        <Section title="Dependencies" icon={<Link2 size={13} color="#8A94A6" />} badge={<span style={{ fontSize: 10, fontWeight: 700, color: '#8A94A6' }}>{dependencies.length}</span>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dependencies.map((dep) => (
              <div key={dep.id} className="group" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #E8EAED', borderRadius: 10, background: 'white', position: 'relative' }}>
                <div style={{ padding: 6, background: STATUS_BG[dep.status as TaskStatus] || '#F4F5F7', borderRadius: 6 }}>
                  <Link2 size={14} color={STATUS_COLORS[dep.status as TaskStatus] || '#8A94A6'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{dep.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLORS[dep.status as TaskStatus] || '#8A94A6' }}>{STATUS_LABELS[dep.status as TaskStatus] || dep.status}</div>
                </div>
                <button
                  onClick={() => handleUnlinkDependency(dep.id)}
                  style={{ display: 'none', border: 'none', background: 'transparent', color: '#FF5630', cursor: 'pointer', padding: 4 }}
                  className="group-hover:block"
                >
                  <X size={12} />
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
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #0052CC', fontSize: 12, outline: 'none', marginBottom: 8 }}
                />
                {isSearchingTasks && <div style={{ fontSize: 11, color: '#8A94A6', marginBottom: 8 }}>Searching...</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 150, overflowY: 'auto' }}>
                  {availableTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleLinkDependency(t.id)}
                      style={{ textAlign: 'left', padding: '6px 10px', borderRadius: 6, border: '1px solid #DFE1E6', background: 'white', cursor: 'pointer', fontSize: 12, color: '#172B4D' }}
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
                  style={{ background: 'none', border: 'none', color: '#6B778C', fontSize: 11, cursor: 'pointer', marginTop: 8 }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLinkingTask(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1px dashed #DFE1E6', borderRadius: 10, background: 'transparent', cursor: 'pointer', color: '#6B778C', fontSize: 12, fontWeight: 600 }}
              >
                <Plus size={14} /> Link Task
              </button>
            )}
          </div>
        </Section>

        <Section title="Activity" icon={<Activity size={13} color="#8A94A6" />}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ borderBottom: '1px solid #F4F5F7', padding: '8px 0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#172B4D' }}>{comment.user?.name || 'User'}</div>
              <div style={{ fontSize: 11, color: '#8A94A6', marginBottom: 4 }}>{timeAgo(comment.createdAt)}</div>
              <div style={{ fontSize: 13, color: '#42526E', lineHeight: 1.5 }}>{comment.content}</div>
            </div>
          ))}
          {comments.length === 0 ? <div style={{ fontSize: 12, color: '#8A94A6' }}>No comments yet.</div> : null}
        </Section>
      </div>

      <div style={{ borderTop: '1px solid #F4F5F7', padding: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void postComment();
              }
            }}
            placeholder={`Comment on ${assigneeName}'s task`}
            style={{ flex: 1, borderRadius: 999, border: '1px solid #DFE1E6', padding: '10px 14px', fontSize: 13 }}
          />
          <button
            onClick={() => void postComment()}
            disabled={isPostingComment || !commentText.trim()}
            style={{ borderRadius: 999, border: 'none', background: commentText.trim() ? '#0052CC' : '#DFE1E6', color: 'white', padding: '0 14px', cursor: commentText.trim() ? 'pointer' : 'not-allowed' }}
          >
            {isPostingComment ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

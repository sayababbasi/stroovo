'use client';

import { useEffect, useState } from 'react';
import type { Task } from '@/types';

interface ProjectOption {
    id: string;
    name: string;
}

interface TaskFormData {
    title?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
    description?: string;
    projectId?: string;
    assigneeId?: string;
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: TaskFormData) => Promise<void>;
    task: Task | null;
    projects: ProjectOption[];
}

export default function TaskModal({ isOpen, onClose, onSave, task, projects }: TaskModalProps) {
    const [form, setForm] = useState<TaskFormData>({
        title: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: null,
        description: '',
        projectId: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            title: task?.title || '',
            status: task?.status || 'TODO',
            priority: task?.priority || 'MEDIUM',
            dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : null,
            description: task?.description || '',
            projectId: task?.projectId || task?.project?.id || projects[0]?.id || '',
            assigneeId: task?.assigneeId || undefined,
        });
    }, [isOpen, projects, task]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (field: keyof TaskFormData, value: string) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.title?.trim() || !form.projectId) {
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                ...form,
                title: form.title.trim(),
                dueDate: form.dueDate || null,
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {task ? 'Edit Task' : 'Create Task'}
                        </h2>
                        <p className="text-sm text-slate-500">Manage task details and assignment.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                        <input
                            value={form.title || ''}
                            onChange={(event) => handleChange('title', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            placeholder="Task title"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={form.description || ''}
                            onChange={(event) => handleChange('description', event.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            placeholder="Describe the task"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Project</label>
                            <select
                                value={form.projectId || ''}
                                onChange={(event) => handleChange('projectId', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                required
                            >
                                <option value="" disabled>Select a project</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate || ''}
                                onChange={(event) => handleChange('dueDate', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                            <select
                                value={form.status || 'TODO'}
                                onChange={(event) => handleChange('status', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">Review</option>
                                <option value="DONE">Done</option>
                                <option value="BLOCKED">Blocked</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                            <select
                                value={form.priority || 'MEDIUM'}
                                onChange={(event) => handleChange('priority', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {isSaving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

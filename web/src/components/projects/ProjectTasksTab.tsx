"use client";

import React, { useState } from 'react';
import { Layout, List as ListIcon, AlignLeft, Users, GitMerge, Filter, ChevronDown, ArrowUpDown } from 'lucide-react';
import TaskBoard, { ProjectTask } from './TaskBoard';
import ListView from './ListView';
import TimelineView from './TimelineView';
import TaskDetailModal from './TaskDetailModal';

export default function ProjectTasksTab({ 
    tasks, 
    onTaskMove, 
    onAddTask,
    onTaskUpdated
}: { 
    tasks: ProjectTask[], 
    onTaskMove: (taskId: string, newStatus: string) => void,
    onAddTask: (status: string) => void,
    onTaskUpdated?: (task: ProjectTask) => void
}) {
    const [viewTab, setViewTab] = useState('board');
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

    // Handle generic task update (for inline edits in ListView)
    const handleTaskUpdate = (taskId: string, field: string, value: any) => {
        if (field === 'status') {
            onTaskMove(taskId, value);
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0, height: '100%' }}>
            
            {/* VIEWS TOOLBAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', background: '#F4F5F7', padding: 4, borderRadius: 10 }}>
                    <div className={`v-tab ${viewTab === 'board' ? 'active' : ''}`} onClick={() => setViewTab('board')}><Layout size={14} /> Board</div>
                    <div className={`v-tab ${viewTab === 'list' ? 'active' : ''}`} onClick={() => setViewTab('list')}><ListIcon size={14} /> List</div>
                    <div className={`v-tab ${viewTab === 'timeline' ? 'active' : ''}`} onClick={() => setViewTab('timeline')}><AlignLeft size={14} /> Timeline</div>
                    <div className={`v-tab ${viewTab === 'workload' ? 'active' : ''}`} onClick={() => setViewTab('workload')}><Users size={14} /> Workload</div>
                    <div className={`v-tab ${viewTab === 'dependencies' ? 'active' : ''}`} onClick={() => setViewTab('dependencies')}><GitMerge size={14} /> Dependencies</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-secondary" style={{ padding: '0 12px', height: 32 }}><Filter size={14} /> Filter <ChevronDown size={14} color="#8A94A6" /></button>
                    <button className="btn-secondary" style={{ padding: '0 12px', height: 32 }}>Group: Status <ChevronDown size={14} color="#8A94A6" /></button>
                    <button className="btn-secondary" style={{ padding: '0 12px', height: 32 }}><ArrowUpDown size={14} /> Sort</button>
                    <button className="btn-secondary" style={{ padding: '0 8px', height: 32 }}><Layout size={14} /></button>
                </div>
            </div>

            {/* TAB CONTENT */}
            {viewTab === 'board' && (
                <TaskBoard tasks={tasks} onTaskMove={onTaskMove} onAddTask={onAddTask} onTaskClick={setSelectedTask} />
            )}

            {viewTab === 'list' && (
                <ListView tasks={tasks} onTaskUpdate={handleTaskUpdate} onTaskClick={setSelectedTask} />
            )}
            
            {viewTab === 'timeline' && (
                <TimelineView tasks={tasks} onTaskClick={setSelectedTask} />
            )}
            
            {viewTab === 'workload' && (
                <div className="p-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                    Workload View Context - Coming Soon
                </div>
            )}
            
            {viewTab === 'dependencies' && (
                <div className="p-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                    Dependencies View Context - Coming Soon
                </div>
            )}

            {selectedTask && (
                <TaskDetailModal 
                    task={selectedTask} 
                    onClose={() => setSelectedTask(null)} 
                    onTaskUpdated={(t) => {
                        setSelectedTask(t);
                        onTaskUpdated && onTaskUpdated(t);
                    }} 
                />
            )}
        </div>
    );
}

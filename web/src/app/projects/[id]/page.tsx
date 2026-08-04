"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Star, ChevronDown, Share, MoreHorizontal, Plus } from 'lucide-react';
import ProjectOverviewTab from '@/components/projects/ProjectOverviewTab';
import ProjectTasksTab from '@/components/projects/ProjectTasksTab';
import ProjectAIAssistant from '@/components/projects/ProjectAIAssistant';
import { ProjectTask } from '@/components/projects/TaskBoard';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState('Overview');
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data);
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
      toast.success("Task updated");
      fetchProjectData(); // Refresh to recalculate progress/risk
    } catch (error) {
      toast.error("Failed to update task");
      fetchProjectData(); // Revert
    }
  };

  const handleAddTask = async (status: string) => {
    const title = window.prompt("Enter task title:");
    if (!title) return;

    try {
      const res = await axios.post(`/api/projects/${id}/tasks`, {
        title,
        status,
        type: 'TASK',
        priority: 'MEDIUM'
      });
      setTasks([...tasks, res.data]);
      toast.success("Task added");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  if (loading) {
    return (
      <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#6B778C' }}>Loading project details...</div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#EF4444' }}>Project not found.</div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{`
        .p-panel { background: white; border: 1px solid #DFE1E6; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(9,30,66,.04); }
        .p-tab { padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; color: #6B778C; transition: all 0.2s; }
        .p-tab.active { color: #0052CC; border-bottom-color: #0052CC; }
        .p-tab:hover:not(.active) { color: #172B4D; }
        .v-tab { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; transition: all 0.2s; color: #6B778C; }
        .v-tab.active { background: white; border-color: #DFE1E6; color: #0052CC; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .btn-primary { background: #0052CC; color: white; border: none; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
        .btn-secondary { background: white; color: #172B4D; border: 1px solid #DFE1E6; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
        .k-col { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; }
        .k-header { padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; border: 1px solid #DFE1E6; border-bottom: none; background: white; }
        .k-body { padding: 10px; background: #F4F5F7; border: 1px solid #DFE1E6; border-top: none; border-radius: 0 0 8px 8px; minHeight: 400px; display: flex; flex-direction: column; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 4px; }
      `}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* ── HEADER ── */}
        <div style={{ padding: '24px 32px 0 32px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', margin: 0 }}>Projects / {project.name}</h1>
                <Star size={18} color={project.isStarred ? "#FFAB00" : "#6B778C"} style={{ cursor: 'pointer' }} />
              </div>
              <p style={{ fontSize: 13, color: '#6B778C', margin: 0 }}>{project.description || "No description provided."}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#172B4D', background: 'white', border: '1px solid #DFE1E6', padding: '6px 12px', borderRadius: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: project.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }} /> {project.status} <ChevronDown size={14} color="#8A94A6" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Simulated Members List */}
                {['https://i.pravatar.cc/150?u=ali', 'https://i.pravatar.cc/150?u=sara', 'https://i.pravatar.cc/150?u=usman'].map((img, i) => (
                  <img key={i} src={img} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid white', marginLeft: i > 0 ? -10 : 0 }} />
                ))}
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid white', marginLeft: -10, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#42526E', zIndex: 1 }}>+8</div>
              </div>
              <button className="btn-secondary"><Share size={14} /> Share</button>
              <button className="btn-secondary" style={{ padding: '0 8px' }}><MoreHorizontal size={16} /></button>
              <button className="btn-primary" onClick={() => handleAddTask('TODO')}><Plus size={14} /> Add Task <ChevronDown size={14} style={{ opacity: 0.8 }} /></button>
            </div>
          </div>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #DFE1E6' }}>
            {['Overview', 'Tasks', 'Timeline', 'Files', 'Risks', 'Automation', 'Insights', 'Settings'].map(t => (
              <div key={t} className={`p-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
            ))}
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', gap: 24 }}>
            {activeTab === 'Overview' && (
                <>
                    <ProjectOverviewTab 
                        project={project} 
                        tasks={tasks} 
                        progress={project.progress || 0} 
                        riskScore={project.riskScore || 0} 
                        onAction={(action) => console.log(action)} 
                    />
                    <ProjectAIAssistant project={project} tasks={tasks} riskScore={project.riskScore || 0} />
                </>
            )}

            {activeTab === 'Tasks' && (
                <ProjectTasksTab 
                    tasks={tasks} 
                    onTaskMove={handleTaskMove}
                    onAddTask={handleAddTask}
                />
            )}
            
            {activeTab !== 'Overview' && activeTab !== 'Tasks' && (
                <div className="p-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                    {activeTab} Content - Coming Soon
                </div>
            )}
        </div>
      </div>
    </main>
  );
}


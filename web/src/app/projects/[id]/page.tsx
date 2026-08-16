
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Star, ChevronDown, Share, MoreHorizontal, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectOverviewTab from '@/components/projects/ProjectOverviewTab';
import ProjectTasksTab from '@/components/projects/ProjectTasksTab';
import ProjectTimelineTab from '@/components/projects/ProjectTimelineTab';
import ProjectFilesTab from '@/components/projects/ProjectFilesTab';
import ProjectRisksTab from '@/components/projects/ProjectRisksTab';
import ProjectAutomationTab from '@/components/projects/ProjectAutomationTab';
import ProjectInsightsTab from '@/components/projects/ProjectInsightsTab';
import ProjectSettingsTab from '@/components/projects/ProjectSettingsTab';
import ProjectAIAssistant from '@/components/projects/ProjectAIAssistant';
import { ProjectTask } from '@/components/projects/TaskBoard';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState('Overview');
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data);
      setTasks(res.data.tasks || []);
      setFiles(res.data.files || []);
      setActivityLogs(res.data.activityLogs || []);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
      toast.success("Task updated");
      fetchProjectData();
    } catch (error) {
      toast.error("Failed to update task");
      fetchProjectData();
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

  const startDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Aug 1';
  const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 31, 2026';
  const readableId = `RA3-${project.id.substring(0,3).toUpperCase()}`;

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{`
        .p-panel { background: white; border: 1px solid #DFE1E6; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(9,30,66,.02); }
        .p-tab { padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; color: #6B778C; transition: all 0.2s; white-space: nowrap; }
        .p-tab.active { color: #0052CC; border-bottom-color: #0052CC; }
        .p-tab:hover:not(.active) { color: #172B4D; }
        .v-tab { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; transition: all 0.2s; color: #6B778C; }
        .v-tab.active { background: white; border-color: #DFE1E6; color: #0052CC; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .btn-primary { background: #0052CC; color: white; border: none; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #0747A6; }
        .btn-secondary { background: white; color: #172B4D; border: 1px solid #DFE1E6; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-secondary:hover { background: #F4F5F7; border-color: #C1C7D0; }
        .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; display: inline-block; white-space: nowrap; letter-spacing: 0.5px; }
        
        .layout-grid { display: flex; gap: 32px; flex-direction: row; }
        .layout-main { flex: 1; min-width: 0; display: flex; flexDirection: column; }
        .layout-sidebar { width: 320px; flex-shrink: 0; }
        
        @media (max-width: 1200px) {
          .layout-grid { flex-direction: column; }
          .layout-sidebar { width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 4px; }
      `}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* ── HEADER ── */}
        <div style={{ padding: '24px 40px 0 40px', background: 'white' }}>
          
          <div style={{ fontSize: 13, color: '#0052CC', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, cursor: 'pointer' }} onClick={() => window.history.back()}>
            <ChevronLeft size={16} /> Projects <ChevronRight size={14} color="#6B778C" /> <span style={{ color: '#6B778C' }}>{project.name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 4, height: 28, background: '#0052CC', borderRadius: 2 }} />
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#172B4D', margin: 0, letterSpacing: '-0.5px' }}>{project.name}</h1>
                <Star size={20} color={project.isStarred ? "#FFAB00" : "#C1C7D0"} fill={project.isStarred ? "#FFAB00" : "none"} style={{ cursor: 'pointer' }} />
              </div>
              <p style={{ fontSize: 14, color: '#42526E', margin: '0 0 16px 0' }}>{project.description || "Core 30-Day Content & Product Execution Engine for REVOTICAI"}</p>
              
              {/* Metadata Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <span className="status-pill" style={{ background: project.status === 'ACTIVE' ? '#E6EFFF' : '#F4F5F7', color: project.status === 'ACTIVE' ? '#0052CC' : '#42526E' }}>
                  {project.status === 'ACTIVE' ? 'IN PROGRESS' : project.status}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                  <div style={{ border: '1px solid #DFE1E6', padding: '2px 6px', borderRadius: 4 }}>{readableId}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {startDate} - {endDate}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                  Owner <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#4C9AFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>SA</div> {project.manager?.name || 'Sayab Abbasi'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                  Team
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {['https://i.pravatar.cc/150?u=ali', 'https://i.pravatar.cc/150?u=sara', 'https://i.pravatar.cc/150?u=usman'].map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid white', marginLeft: i > 0 ? -6 : 0, zIndex: 10-i }} />
                    ))}
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid white', marginLeft: -6, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#42526E', zIndex: 1 }}>+8</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                  Client <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} /></div> REVOTIC AI
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#172B4D', background: 'white', border: '1px solid #DFE1E6', padding: '0 12px', height: 36, borderRadius: 8, cursor: 'pointer' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> ACTIVE <ChevronDown size={14} color="#8A94A6" />
              </div>
              <button className="btn-secondary"><Share size={14} /> Share</button>
              <button className="btn-secondary" style={{ padding: '0 8px' }}><MoreHorizontal size={16} /></button>
              <button className="btn-primary" onClick={() => handleAddTask('TODO')}><Plus size={14} /> Add Task <ChevronDown size={14} style={{ opacity: 0.8 }} /></button>
            </div>
          </div>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #DFE1E6', overflowX: 'auto' }}>
            {['Overview', 'Tasks', 'Timeline', 'Files', 'Risks', 'Automation', 'Insights', 'Settings'].map(t => (
              <div key={t} className={`p-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
            ))}
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
            {activeTab === 'Overview' && (
                <div className="layout-grid">
                    <div className="layout-main">
                        <ProjectOverviewTab 
                            project={project} 
                            tasks={tasks} 
                            progress={project.progress || 0} 
                            riskScore={project.riskScore || 0} 
                            onAction={(action) => console.log(action)} 
                        />
                    </div>
                    <div className="layout-sidebar">
                        <ProjectAIAssistant project={project} tasks={tasks} riskScore={project.riskScore || 0} />
                    </div>
                </div>
            )}

            {activeTab === 'Tasks' && (
                <ProjectTasksTab 
                    tasks={tasks} 
                    onTaskMove={handleTaskMove}
                    onAddTask={handleAddTask}
                />
            )}

            {activeTab === 'Timeline' && (
                <ProjectTimelineTab 
                    project={project}
                    tasks={tasks} 
                />
            )}

            {activeTab === 'Files' && (
                <ProjectFilesTab 
                    project={project}
                    files={files} 
                />
            )}

            {activeTab === 'Risks' && (
                <ProjectRisksTab 
                    project={project}
                    risks={project.risks || []} 
                />
            )}

            {activeTab === 'Automation' && (
                <ProjectAutomationTab 
                    project={project}
                />
            )}

            {activeTab === 'Insights' && (
                <ProjectInsightsTab 
                    project={project}
                    tasks={tasks}
                />
            )}

            {activeTab === 'Settings' && (
                <ProjectSettingsTab 
                    project={project}
                    onProjectUpdated={fetchProjectData}
                />
            )}
            
            {activeTab !== 'Overview' && activeTab !== 'Tasks' && activeTab !== 'Timeline' && activeTab !== 'Files' && activeTab !== 'Risks' && activeTab !== 'Automation' && activeTab !== 'Insights' && activeTab !== 'Settings' && (
                <div className="p-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C', height: 400 }}>
                    {activeTab} Content - Coming Soon
                </div>
            )}
        </div>
      </div>
    </main>
  );
}

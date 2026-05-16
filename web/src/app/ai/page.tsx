'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Bot, Send, Sparkles, AlertTriangle, Zap, CheckCircle, Target, Loader2, Save } from 'lucide-react';

interface GeneratedTask {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subtasks: string[];
  selected?: boolean;
}

export default function AIPage() {
    const [goal, setGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('tasks');

    const suggestions = [
        { icon: AlertTriangle, color: '#FF5630', title: 'Deadline Risk', desc: '"API Integration" task is at risk of missing its deadline' },
        { icon: Zap, color: '#FFAB00', title: 'Priority Adjustment', desc: 'Consider prioritizing "Design System Update" based on dependencies' },
        { icon: Sparkles, color: '#0052CC', title: 'Optimization', desc: 'Sprint 24 is overloaded. Consider moving 2 tasks to Sprint 25' },
    ];

    const priorityColors = {
        LOW: '#6B778C',
        MEDIUM: '#FFAB00',
        HIGH: '#FF5630',
        URGENT: '#DE350B'
    };

    const generateTasks = async () => {
        if (!goal.trim()) return;
        
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ goal: goal.trim() }),
            });

            const result = await response.json();
            
            if (response.ok) {
                setGeneratedTasks(result.data.tasks.map((task: GeneratedTask) => ({ ...task, selected: true })));
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch {
            alert('Failed to generate tasks. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const saveTasks = async () => {
        if (!selectedProject || generatedTasks.filter(t => t.selected).length === 0) {
            alert('Please select a project and at least one task');
            return;
        }

        setIsSaving(true);
        try {
            const selectedTasks = generatedTasks
                .map((task, index) => task.selected ? index : -1)
                .filter(index => index !== -1);

            const response = await fetch('/api/ai/save-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goal: goal.trim(),
                    projectId: selectedProject,
                    selectedTasks,
                }),
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`Successfully saved ${result.data.totalSaved} tasks to project!`);
                setGeneratedTasks([]);
                setGoal('');
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch {
            alert('Failed to save tasks. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTaskSelection = (index: number) => {
        setGeneratedTasks(prev => 
            prev.map((task, i) => 
                i === index ? { ...task, selected: !task.selected } : task
            )
        );
    };

    const toggleAllTasks = () => {
        const allSelected = generatedTasks.every(task => task.selected);
        setGeneratedTasks(prev => 
            prev.map(task => ({ ...task, selected: !allSelected }))
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Stroovo AI</h1>
                        <span style={{ background: '#6554C0', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>BETA</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Stroovo AI-powered task generation and workflow automation</p>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {/* Tab Navigation */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #DFE1E6' }}>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            style={{
                                padding: '12px 16px',
                                background: activeTab === 'tasks' ? '#0052CC' : 'transparent',
                                color: activeTab === 'tasks' ? 'white' : '#6B778C',
                                border: 'none',
                                borderBottom: activeTab === 'tasks' ? '2px solid #0052CC' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '14px',
                            }}
                        >
                            <Target size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />
                            Task Generation
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            style={{
                                padding: '12px 16px',
                                background: activeTab === 'chat' ? '#0052CC' : 'transparent',
                                color: activeTab === 'chat' ? 'white' : '#6B778C',
                                border: 'none',
                                borderBottom: activeTab === 'chat' ? '2px solid #0052CC' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '14px',
                            }}
                        >
                            <Bot size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />
                            AI Chat
                        </button>
                    </div>

                    {activeTab === 'tasks' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Task Generation Panel */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Goal Input */}
                                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '20px' }}>
                                    <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Generate Tasks from Goal</h3>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#172B4D' }}>
                                            What do you want to accomplish?
                                        </label>
                                        <textarea
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            placeholder="e.g., Build a customer dashboard, Launch Q4 marketing campaign, Set up customer support system"
                                            style={{
                                                width: '100%',
                                                minHeight: '80px',
                                                padding: '12px',
                                                border: '1px solid #DFE1E6',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                resize: 'vertical',
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={generateTasks}
                                        disabled={!goal.trim() || isGenerating}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: goal.trim() && !isGenerating ? '#0052CC' : '#F4F5F7',
                                            color: goal.trim() && !isGenerating ? 'white' : '#6B778C',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: goal.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Generate Tasks
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Generated Tasks */}
                                {generatedTasks.length > 0 && (
                                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h3 style={{ fontWeight: 600 }}>Generated Tasks ({generatedTasks.length})</h3>
                                            <button
                                                onClick={toggleAllTasks}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#F4F5F7',
                                                    border: '1px solid #DFE1E6',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Toggle All
                                            </button>
                                        </div>

                                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {generatedTasks.map((task, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => toggleTaskSelection(index)}
                                                    style={{
                                                        padding: '12px',
                                                        border: `1px solid ${task.selected ? '#0052CC' : '#DFE1E6'}`,
                                                        borderRadius: '6px',
                                                        background: task.selected ? '#F0F7FF' : 'white',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                        <div style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            border: `2px solid ${task.selected ? '#0052CC' : '#DFE1E6'}`,
                                                            borderRadius: '4px',
                                                            background: task.selected ? '#0052CC' : 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginTop: '2px',
                                                            flexShrink: 0,
                                                        }}>
                                                            {task.selected && <CheckCircle size={14} color="white" />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>
                                                                {task.title}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '8px' }}>
                                                                {task.description}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span
                                                                    style={{
                                                                        padding: '2px 8px',
                                                                        background: priorityColors[task.priority] + '20',
                                                                        color: priorityColors[task.priority],
                                                                        borderRadius: '12px',
                                                                        fontSize: '11px',
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {task.priority}
                                                                </span>
                                                                {task.subtasks.length > 0 && (
                                                                    <span style={{ fontSize: '11px', color: '#6B778C' }}>
                                                                        {task.subtasks.length} subtasks
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Save to Project */}
                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #DFE1E6' }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#172B4D' }}>
                                                    Save to Project
                                                </label>
                                                <select
                                                    value={selectedProject}
                                                    onChange={(e) => setSelectedProject(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px',
                                                        border: '1px solid #DFE1E6',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    <option value="">Select a project...</option>
                                                    <option value="project-1">Mobile App Development</option>
                                                    <option value="project-2">Website Redesign</option>
                                                    <option value="project-3">Marketing Campaign Q4</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={saveTasks}
                                                disabled={!selectedProject || generatedTasks.filter(t => t.selected).length === 0 || isSaving}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: selectedProject && generatedTasks.filter(t => t.selected).length > 0 && !isSaving ? '#0052CC' : '#F4F5F7',
                                                    color: selectedProject && generatedTasks.filter(t => t.selected).length > 0 && !isSaving ? 'white' : '#6B778C',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: selectedProject && generatedTasks.filter(t => t.selected).length > 0 && !isSaving ? 'pointer' : 'not-allowed',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                }}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={16} />
                                                        Add {generatedTasks.filter(t => t.selected).length} Tasks to Project
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Smart Suggestions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '20px' }}>
                                    <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Smart Suggestions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {suggestions.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#F4F5F7', borderRadius: '6px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <s.icon size={18} color={s.color} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{s.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#6B778C' }}>{s.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ background: 'linear-gradient(135deg, #0052CC 0%, #6554C0 100%)', borderRadius: '8px', padding: '24px', color: 'white' }}>
                                    <Bot size={32} style={{ marginBottom: '12px' }} />
                                    <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>AI-Powered Insights</h3>
                                    <p style={{ fontSize: '13px', opacity: 0.9 }}>
                                        Based on your team&apos;s patterns, productivity peaks on Tuesdays and Wednesdays. Consider scheduling important tasks during these days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Chat Interface */
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', height: '500px' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #DFE1E6' }}>
                                <h3 style={{ fontWeight: 600 }}>Chat with AI</h3>
                            </div>

                            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', maxWidth: '80%' }}>
                                    <div style={{ fontSize: '13px', color: '#172B4D' }}>
                                        Hello! I&apos;m your AI assistant. I can help you with task prioritization, deadline management, and productivity insights. What would you like to know?
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '16px 20px', borderTop: '1px solid #DFE1E6' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input type="text" placeholder="Ask me anything..." style={{ flex: 1, padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }} />
                                    <button style={{ padding: '10px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

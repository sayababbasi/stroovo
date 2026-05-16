"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
    addEdge, 
    Background, 
    Controls, 
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    MarkerType,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TriggerNode, AINode, ActionNode, LogicNode } from './CanvasNodes';
import { Play, Save, Trash2, Plus, Sparkles, ChevronLeft } from 'lucide-react';

const nodeTypes = {
    trigger: TriggerNode,
    ai: AINode,
    action: ActionNode,
    logic: LogicNode,
};

const initialNodes = [
    {
        id: '1',
        type: 'trigger',
        position: { x: 400, y: 50 },
        data: { label: 'Task Overdue' },
    },
    {
        id: '2',
        type: 'ai',
        position: { x: 400, y: 150 },
        data: { label: 'Analyze Delay Risk' },
    },
    {
        id: '3',
        type: 'logic',
        position: { x: 400, y: 250 },
        data: { label: 'If Risk > 80%' },
    },
    {
        id: '4',
        type: 'action',
        position: { x: 250, y: 400 },
        data: { label: 'Notify Manager' },
    },
    {
        id: '5',
        type: 'action',
        position: { x: 550, y: 400 },
        data: { label: 'Re-prioritize Task' },
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    { 
        id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', label: 'YES',
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
    },
    { 
        id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', label: 'NO',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' }
    },
];

export const AutomationCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ 
            ...params, 
            animated: true, 
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
        }, eds)),
        [setEdges]
    );

    return (
        <div className="w-full h-full bg-white relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50/50"
            >
                <Background color="#e2e8f0" gap={20} />
                <Controls className="!bg-white !border-gray-100 !shadow-xl !rounded-xl overflow-hidden" />
                <MiniMap 
                    className="!bg-white !border-gray-100 !shadow-xl !rounded-2xl" 
                    nodeColor={(node: any) => {
                        switch (node.type) {
                            case 'trigger': return '#10b981';
                            case 'ai': return '#6366f1';
                            case 'logic': return '#111827';
                            default: return '#e2e8f0';
                        }
                    }}
                />
                
                <Panel position="top-left" className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-gray-50 transition-all">
                        <Plus size={14} />
                        Add Node
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                        <Sparkles size={14} />
                        AI Optimize
                    </button>
                </Panel>

                <Panel position="top-right" className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                        <Play size={14} />
                        Test Flow
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                        <Save size={14} />
                        Save Flow
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
};

"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { 
    Zap, BrainCircuit, Rocket, 
    Split, Timer, Shield, AlertTriangle 
} from 'lucide-react';

export const TriggerNode = memo(({ data }: any) => {
    return (
        <div className="px-4 py-3 shadow-xl rounded-2xl bg-white border-2 border-emerald-500 min-w-[200px]">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Zap size={16} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trigger</div>
                    <div className="text-xs font-black text-gray-900">{data.label}</div>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
        </div>
    );
});

export const AINode = memo(({ data }: any) => {
    return (
        <div className="px-4 py-3 shadow-xl rounded-2xl bg-indigo-600 border-2 border-indigo-400 min-w-[200px] text-white">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-md">
                    <BrainCircuit size={16} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">AI Action</div>
                    <div className="text-xs font-black">{data.label}</div>
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-2 border-indigo-600" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-indigo-600" />
        </div>
    );
});

export const ActionNode = memo(({ data }: any) => {
    return (
        <div className="px-4 py-3 shadow-xl rounded-2xl bg-white border-2 border-indigo-100 min-w-[200px]">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Rocket size={16} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</div>
                    <div className="text-xs font-black text-gray-900">{data.label}</div>
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-100 border-2 border-white" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-100 border-2 border-white" />
        </div>
    );
});

export const LogicNode = memo(({ data }: any) => {
    return (
        <div className="px-4 py-3 shadow-xl rounded-2xl bg-gray-900 border-2 border-gray-700 min-w-[180px] text-white">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 text-white rounded-xl">
                    <Split size={16} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Logic</div>
                    <div className="text-xs font-black">{data.label}</div>
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-700 border-2 border-white" />
            <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
            <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} className="w-3 h-3 bg-rose-500 border-2 border-white" />
        </div>
    );
});

TriggerNode.displayName = "TriggerNode";
AINode.displayName = "AINode";
ActionNode.displayName = "ActionNode";
LogicNode.displayName = "LogicNode";

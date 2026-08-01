"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FolderTree, Users, MoreHorizontal, Move, GripVertical, AlertCircle } from 'lucide-react';
import Can from '@/components/auth/Can';
import { P } from '@/lib/permissions/registry';
import AdminMoveTeamModal from './AdminMoveTeamModal';
import AdminTeamHierarchyDetailDrawer from './AdminTeamHierarchyDetailDrawer';

function TreeNode({ 
    team, 
    allTeams, 
    level = 0, 
    search, 
    expandedNodes, 
    toggleNode,
    onDragStart,
    onDragOver,
    onDrop,
    onSelect
}: any) {
    const children = allTeams.filter((t: any) => t.parentTeamId === team.id).sort((a: any, b: any) => a.name.localeCompare(b.name));
    const isExpanded = expandedNodes.has(team.id);
    const hasChildren = children.length > 0;
    const isMatch = search && (
        team.name.toLowerCase().includes(search.toLowerCase()) || 
        (team.teamType && team.teamType.toLowerCase().includes(search.toLowerCase())) ||
        (team.lead && team.lead.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <div 
                draggable
                onDragStart={(e) => onDragStart(e, team)}
                onDragOver={(e) => onDragOver(e, team)}
                onDrop={(e) => onDrop(e, team)}
                style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #F4F5F7', 
                    paddingLeft: `${level * 32 + 16}px`, background: isMatch ? '#E6FCFF' : 'white', cursor: 'grab' 
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: '20px' }} onClick={() => hasChildren && toggleNode(team.id)}>
                        {hasChildren ? (isExpanded ? <ChevronDown size={16} color="#6B778C" /> : <ChevronRight size={16} color="#6B778C" />) : <span style={{ width: 16 }} />}
                    </div>
                    <FolderTree size={16} color="#0052CC" />
                    <span style={{ fontWeight: 600, color: '#172B4D', fontSize: '14px' }}>{team.name}</span>
                    <span style={{ fontSize: '12px', color: '#6B778C', background: '#F4F5F7', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>
                        {team.teamType || 'TEAM'}
                    </span>
                    {team.status === 'ARCHIVED' && (
                        <span style={{ fontSize: '12px', color: '#BF2600', background: '#FFEBE6', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>
                            Archived
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B778C', fontSize: '13px', width: '100px' }}>
                        <Users size={14} /> {team._count?.members || 0}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '150px' }}>
                        {team.lead ? (
                            <>
                                <img src={team.lead.image || `https://ui-avatars.com/api/?name=${team.lead.name}`} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                                <span style={{ fontSize: '13px', color: '#42526E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.lead.name}</span>
                            </>
                        ) : <span style={{ fontSize: '13px', color: '#8A94A6', fontStyle: 'italic' }}>No lead</span>}
                    </div>
                    <button 
                        onClick={() => onSelect(team)}
                        style={{ height: '28px', padding: '0 12px', borderRadius: '4px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Details
                    </button>
                    <GripVertical size={16} color="#C1C7D0" style={{ cursor: 'grab' }} />
                </div>
            </div>
            
            {isExpanded && hasChildren && (
                <div>
                    {children.map((child: any) => (
                        <TreeNode 
                            key={child.id} 
                            team={child} 
                            allTeams={allTeams} 
                            level={level + 1} 
                            search={search}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminHierarchyTree({ teams, search, expandAllFlag, collapseAllFlag, onRefresh }: any) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    
    // Drag state
    const [draggedTeam, setDraggedTeam] = useState<any>(null);
    const [dragOverTeam, setDragOverTeam] = useState<any>(null);
    
    // Move Modal state
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [moveTargetParent, setMoveTargetParent] = useState<any>(null);

    // Detail drawer state
    const [selectedTeam, setSelectedTeam] = useState<any>(null);

    const rootTeams = teams.filter((t: any) => !t.parentTeamId).sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Handle expand/collapse all
    useEffect(() => {
        if (expandAllFlag > 0) {
            setExpandedNodes(new Set(teams.map((t: any) => t.id)));
        }
    }, [expandAllFlag, teams]);

    useEffect(() => {
        if (collapseAllFlag > 0) {
            setExpandedNodes(new Set());
        }
    }, [collapseAllFlag]);

    // Auto-expand search matches
    useEffect(() => {
        if (!search) return;
        const matches = teams.filter((t: any) => 
            t.name.toLowerCase().includes(search.toLowerCase()) || 
            (t.teamType && t.teamType.toLowerCase().includes(search.toLowerCase())) ||
            (t.lead && t.lead.name.toLowerCase().includes(search.toLowerCase()))
        );
        
        if (matches.length > 0) {
            const newExpanded = new Set(expandedNodes);
            matches.forEach((m: any) => {
                let current = m;
                while (current.parentTeamId) {
                    newExpanded.add(current.parentTeamId);
                    current = teams.find((t: any) => t.id === current.parentTeamId);
                    if (!current) break;
                }
            });
            setExpandedNodes(newExpanded);
        }
    }, [search, teams]);

    const toggleNode = (id: string) => {
        const next = new Set(expandedNodes);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedNodes(next);
    };

    const handleDragStart = (e: React.DragEvent, team: any) => {
        e.dataTransfer.setData('teamId', team.id);
        setDraggedTeam(team);
    };

    const handleDragOver = (e: React.DragEvent, team: any) => {
        e.preventDefault(); // Necessary to allow dropping
        // We could highlight the row here
    };

    const handleDrop = (e: React.DragEvent, targetTeam: any) => {
        e.preventDefault();
        const draggedTeamId = e.dataTransfer.getData('teamId');
        if (!draggedTeamId || draggedTeamId === targetTeam.id) return;

        const dragged = teams.find((t: any) => t.id === draggedTeamId);
        if (!dragged) return;

        // Open modal
        setDraggedTeam(dragged);
        setMoveTargetParent(targetTeam);
        setMoveModalOpen(true);
    };

    const handleRootDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedTeamId = e.dataTransfer.getData('teamId');
        if (!draggedTeamId) return;

        const dragged = teams.find((t: any) => t.id === draggedTeamId);
        if (!dragged || !dragged.parentTeamId) return; // Already at root

        setDraggedTeam(dragged);
        setMoveTargetParent(null); // null means move to root
        setMoveModalOpen(true);
    };

    return (
        <>
            <div 
                style={{ border: '1px solid #DFE1E6', borderRadius: '8px', overflow: 'hidden' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleRootDrop(e)}
            >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#6B778C', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                    <div style={{ flex: 1 }}>Hierarchy Structure</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
                        <div style={{ width: '100px' }}>Members</div>
                        <div style={{ width: '150px' }}>Team Lead</div>
                        <div style={{ width: '100px' }}>Actions</div>
                    </div>
                </div>

                {rootTeams.map((team: any) => (
                    <TreeNode 
                        key={team.id} 
                        team={team} 
                        allTeams={teams} 
                        search={search}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onSelect={setSelectedTeam}
                    />
                ))}
                
                {rootTeams.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#6B778C' }}>
                        No hierarchy found. Create a root team to begin.
                    </div>
                )}
            </div>

            <AdminMoveTeamModal 
                isOpen={moveModalOpen}
                onClose={() => setMoveModalOpen(false)}
                onSuccess={onRefresh}
                team={draggedTeam}
                targetParent={moveTargetParent}
                allTeams={teams}
            />

            <AdminTeamHierarchyDetailDrawer 
                isOpen={!!selectedTeam}
                onClose={() => setSelectedTeam(null)}
                team={selectedTeam}
                allTeams={teams}
                onRefresh={onRefresh}
            />
        </>
    );
}

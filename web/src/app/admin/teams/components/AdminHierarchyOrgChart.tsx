"use client";

import React from 'react';
import { Users, FolderTree } from 'lucide-react';

function OrgNode({ team, allTeams, level = 0 }: any) {
    const children = allTeams.filter((t: any) => t.parentTeamId === team.id).sort((a: any, b: any) => a.name.localeCompare(b.name));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* The Node */}
            <div style={{ 
                background: 'white', 
                border: '1px solid #DFE1E6', 
                borderRadius: '8px', 
                padding: '12px 16px', 
                minWidth: '160px',
                maxWidth: '220px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(9,30,66,0.08)',
                position: 'relative',
                zIndex: 2
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#EAE6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FolderTree size={16} color="#6554C0" />
                    </div>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#172B4D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {team.name}
                </h4>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6B778C', textTransform: 'uppercase' }}>
                    {team.teamType || 'TEAM'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderTop: '1px solid #F4F5F7', paddingTop: '8px' }}>
                    {team.lead ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <img src={team.lead.image || `https://ui-avatars.com/api/?name=${team.lead.name}`} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '11px', color: '#42526E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{team.lead.name}</span>
                        </div>
                    ) : <span style={{ fontSize: '11px', color: '#8A94A6', fontStyle: 'italic' }}>No lead</span>}
                </div>
            </div>

            {/* Connecting Lines and Children */}
            {children.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Vertical Line down from parent */}
                    <div style={{ width: '2px', height: '20px', background: '#DFE1E6' }} />
                    
                    {/* Horizontal Line connecting children */}
                    {children.length > 1 && (
                        <div style={{ display: 'flex', width: '100%' }}>
                            <div style={{ width: '50%', borderTop: '2px solid transparent' }} />
                            <div style={{ width: '50%', borderTop: '2px solid transparent' }} />
                        </div>
                    )}
                    
                    {/* Horizontal connector line block */}
                    <div style={{ display: 'flex', position: 'relative' }}>
                        {children.length > 1 && (
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: '50%', 
                                transform: 'translateX(-50%)', 
                                width: `calc(100% - ${100 / children.length}%)`, 
                                height: '2px', 
                                background: '#DFE1E6' 
                            }} />
                        )}
                        {children.map((child: any) => (
                            <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
                                <div style={{ width: '2px', height: '20px', background: '#DFE1E6' }} />
                                <OrgNode team={child} allTeams={allTeams} level={level + 1} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminHierarchyOrgChart({ teams, search }: { teams: any[], search: string }) {
    const rootTeams = teams.filter((t: any) => !t.parentTeamId).sort((a: any, b: any) => a.name.localeCompare(b.name));

    return (
        <div style={{ overflow: 'auto', padding: '32px', minHeight: '500px', background: '#F9FAFC', borderRadius: '8px' }}>
            {rootTeams.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6B778C' }}>No hierarchy data.</div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '64px' }}>
                    {rootTeams.map((root: any) => (
                        <OrgNode key={root.id} team={root} allTeams={teams} />
                    ))}
                </div>
            )}
        </div>
    );
}

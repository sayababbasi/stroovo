"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Target, MoreVertical } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function TeamManagementPanel() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder API call for teams - will be implemented on backend
    setTimeout(() => {
      setTeams([
        { id: '1', name: 'Engineering Core', description: 'Platform stability and arch', members: 12, performance: 94 },
        { id: '2', name: 'Product Growth', description: 'Acquisition and retention logic', members: 8, performance: 88 }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
      
      {/* Create Team Card */}
      <div style={{ 
        background: '#FAFbfc', borderRadius: '8px', border: '2px dashed #DFE1E6', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        minHeight: '220px', cursor: 'pointer', transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = '#F4F5F7'}
      onMouseOut={(e) => e.currentTarget.style.background = '#FAFbfc'}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E6EFFF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Plus size={24} />
        </div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>Create New Team</div>
        <div style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Setup a new workspace group</div>
      </div>

      {loading ? (
        <div style={{ color: '#6B778C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading teams...</div>
      ) : (
        teams.map(team => (
          <div key={team.id} style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', margin: '0 0 4px 0' }}>{team.name}</h3>
                <p style={{ fontSize: '14px', color: '#6B778C', margin: 0 }}>{team.description}</p>
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B778C' }}><MoreVertical size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #DFE1E6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#172B4D', fontSize: '14px', fontWeight: 500 }}>
                <Users size={16} color="#6B778C" /> {team.members} Members
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#36B37E', fontSize: '14px', fontWeight: 500 }}>
                <Target size={16} color="#36B37E" /> {team.performance}% Velocity
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

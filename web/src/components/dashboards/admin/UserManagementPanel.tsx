"use client";

import React, { useState, useEffect } from 'react';
import { MoreVertical, Search, Edit2, Trash2, UserPlus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function UserManagementPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', margin: 0 }}>System Users</h3>
        <button style={{ 
          background: '#0052CC', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px',
          fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <UserPlus size={16} /> Add User
        </button>
      </div>

      <div style={{ padding: '16px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="#6B778C" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '8px 12px 8px 36px', borderRadius: '4px',
              border: '2px solid #DFE1E6', fontSize: '14px', outline: 'none'
            }} 
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F4F5F7', color: '#6B778C', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 24px', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '12px 24px', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '12px 24px', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '12px 24px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 24px', fontWeight: 600, width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B778C' }}>Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B778C' }}>No users found.</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #DFE1E6', fontSize: '14px', color: '#172B4D' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {u.name?.charAt(0) || u.email?.charAt(0)}
                    </div>
                    {u.name || 'Unnamed User'}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#6B778C' }}>{u.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      background: u.role === 'ADMIN' ? '#FFEBE6' : u.role === 'CEO' ? '#E6EFFF' : '#E3FCEF',
                      color: u.role === 'ADMIN' ? '#DE350B' : u.role === 'CEO' ? '#0052CC' : '#006644'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#36B37E', fontWeight: 500 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#36B37E' }}></div>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B778C' }}><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import {
    MoreVertical,
    UserPlus,
    Search,
    Mail,
    Shield,
    Calendar,
    Trash2,
    Edit2
} from 'lucide-react';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    _count: {
        tasks: number;
        managedProjects: number;
    };
}

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            // Ensure data is an array before setting state
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem 0.625rem 2.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            fontSize: '0.875rem'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <UserPlus size={18} />
                    <span>Add User</span>
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>User</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Role</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Joined</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Activity</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--muted-foreground)', fontWeight: 600 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}>
                                            {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{user.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        color: user.role === 'ADMIN' ? '#ef4444' : '#3b82f6'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                        {user._count.managedProjects} Projects • {user._count.tasks} Tasks
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.4rem' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn btn-ghost" style={{ padding: '0.4rem', color: '#ef4444' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

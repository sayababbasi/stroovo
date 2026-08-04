"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, UserCheck, Plus, Search, RefreshCw, 
  Trash2, Edit3, DollarSign, ChevronRight, Check, X, 
  Briefcase, Shield, Layers, LayoutGrid, List, AlertCircle, Eye, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  budget: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  headId: string | null;
  head: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  } | null;
  members: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    isActive: boolean;
  }[];
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string | null;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Drawer / Detail state
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    budget: '',
    status: 'ACTIVE',
    headId: '',
    memberIds: [] as string[]
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Departments & Users
  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, userRes] = await Promise.all([
        fetch('/api/departments', { credentials: 'include' }),
        fetch('/api/users', { credentials: 'include' })
      ]);

      if (deptRes.ok) {
        const dData = await deptRes.json();
        setDepartments(Array.isArray(dData) ? dData : []);
      }

      if (userRes.ok) {
        const uData = await userRes.json();
        const rawUsers = Array.isArray(uData) ? uData : Array.isArray(uData.users) ? uData.users : [];
        setUsers(rawUsers);
      }
    } catch (error) {
      toast.error('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const totalMembers = new Set(departments.flatMap(d => d.members.map(m => m.id))).size;
    const totalHeads = departments.filter(d => d.headId).length;
    const totalBudget = departments.reduce((acc, d) => acc + (d.budget || 0), 0);

    return { totalDepts, totalMembers, totalHeads, totalBudget };
  }, [departments]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.code && dept.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dept.head?.name && dept.head.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || dept.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      budget: '',
      status: 'ACTIVE',
      headId: '',
      memberIds: []
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || '',
      budget: dept.budget !== null && dept.budget !== undefined ? String(dept.budget) : '',
      status: dept.status || 'ACTIVE',
      headId: dept.headId || '',
      memberIds: dept.members.map(m => m.id)
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Save Department (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Department name is required');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments';
      const method = editingDept ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || data.details || 'Failed to save department');
        return;
      }

      toast.success(editingDept ? 'Department updated successfully!' : 'Department created successfully!');
      setIsFormModalOpen(false);
      fetchData();
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Department
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? Members will be unassigned.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success(`Department "${name}" deleted`);
        if (selectedDept?.id === id) setSelectedDept(null);
        fetchData();
      } else {
        toast.error('Failed to delete department');
      }
    } catch {
      toast.error('Network error during deletion');
    }
  };

  // User Initials Helper
  const getUserInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    }
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#172B4D', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Department Management
          </h1>
          <p style={{ color: '#6B778C', margin: 0, fontSize: '15px' }}>
            Manage organizational divisions, department heads, team assignments, and operational budgets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #EBECF0',
              color: '#6B778C',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync
          </button>

          <button
            onClick={handleOpenCreate}
            style={{
              padding: '11px 22px',
              background: '#0052CC',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 82, 204, 0.25)'
            }}
          >
            <Plus size={18} /> Add Department
          </button>
        </div>
      </header>

      {/* Live Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #EBECF0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E3F2FD', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#36B37E', background: '#E3FCEF', padding: '3px 8px', borderRadius: '6px' }}>ACTIVE</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#172B4D' }}>{stats.totalDepts}</div>
          <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px', fontWeight: 600 }}>Total Departments</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBECF0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EAE6FF', color: '#6554C0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6554C0', background: '#F4F0FF', padding: '3px 8px', borderRadius: '6px' }}>ASSIGNED</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#172B4D' }}>{stats.totalMembers}</div>
          <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px', fontWeight: 600 }}>Total Department Members</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBECF0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FFF7E6', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFAB00', background: '#FFF0D6', padding: '3px 8px', borderRadius: '6px' }}>LEADERSHIP</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#172B4D' }}>{stats.totalHeads}</div>
          <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px', fontWeight: 600 }}>Department Heads</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBECF0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E6FCFF', color: '#00B8D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00B8D9', background: '#E0F9FD', padding: '3px 8px', borderRadius: '6px' }}>ANNUAL</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#172B4D' }}>
            ${stats.totalBudget.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px', fontWeight: 600 }}>Total Department Budget</div>
        </div>
      </div>

      {/* Control Bar (Search & Views) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
          <input
            type="text"
            placeholder="Search by department, code, or head..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              fontSize: '13px',
              border: '1px solid #DFE1E6',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#172B4D',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              fontSize: '13px',
              border: '1px solid #DFE1E6',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#172B4D',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          <div style={{ display: 'flex', background: '#F4F5F7', padding: '3px', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#0052CC' : '#6B778C',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#0052CC' : '#6B778C',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <List size={14} /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #EBECF0', padding: '60px', textAlign: 'center' }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: '#0052CC', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B778C', fontWeight: 600 }}>Loading departments...</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #EBECF0', padding: '60px', textAlign: 'center' }}>
          <Building2 size={48} style={{ color: '#C1C7D0', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: '0 0 6px' }}>No departments found</h3>
          <p style={{ color: '#6B778C', margin: 0 }}>Click "Add Department" above to create your first department.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredDepartments.map(dept => (
            <motion.div
              key={dept.id}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 82, 204, 0.08)' }}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #DFE1E6',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#172B4D', margin: 0 }}>{dept.name}</h3>
                      {dept.code && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#E3F2FD', color: '#0052CC', padding: '2px 6px', borderRadius: '4px' }}>
                          {dept.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: dept.status === 'ACTIVE' ? '#E3FCEF' : '#FFEBE6',
                    color: dept.status === 'ACTIVE' ? '#36B37E' : '#FF5630'
                  }}>
                    {dept.status}
                  </span>
                </div>

                {/* Description */}
                {dept.description && (
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: '0 0 16px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {dept.description}
                  </p>
                )}

                {/* Department Head Box */}
                <div style={{ background: '#FAFBFC', border: '1px solid #EBECF0', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
                    DEPARTMENT HEAD
                  </div>
                  {dept.head ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0052CC', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getUserInitials(dept.head.name, dept.head.email)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>{dept.head.name || dept.head.email}</div>
                        <div style={{ fontSize: '11px', color: '#6B778C' }}>{dept.head.role}</div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8993A4', fontStyle: 'italic' }}>No Head Assigned</span>
                  )}
                </div>
              </div>

              <div>
                {/* Members & Budget Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F4F5F7', paddingTop: '14px', marginBottom: '14px' }}>
                  {/* Member Avatars Stack */}
                  <div>
                    <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 700, marginBottom: '4px' }}>
                      {dept.members.length} Member{dept.members.length !== 1 ? 's' : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {dept.members.slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id}
                          title={m.name || m.email}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: '#0052CC',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white',
                            marginLeft: idx > 0 ? '-8px' : '0'
                          }}
                        >
                          {getUserInitials(m.name, m.email)}
                        </div>
                      ))}
                      {dept.members.length > 4 && (
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B778C', marginLeft: '6px' }}>
                          +{dept.members.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 700, marginBottom: '2px' }}>Budget</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#172B4D' }}>
                      {dept.budget ? `$${dept.budget.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedDept(dept)}
                    style={{ flex: 1, padding: '7px', fontSize: '12px', fontWeight: 700, color: '#0052CC', background: '#E3F2FD', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Eye size={13} /> View Roster
                  </button>
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    style={{ padding: '7px 10px', fontSize: '12px', fontWeight: 600, color: '#42526E', background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer' }}
                    title="Edit Department"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    style={{ padding: '7px 10px', fontSize: '12px', fontWeight: 600, color: '#FF5630', background: '#FFEBE6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    title="Delete Department"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #EBECF0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FB', borderBottom: '1px solid #EBECF0' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase' }}>Department</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase' }}>Department Head</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase' }}>Members</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase' }}>Budget</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map(dept => (
                <tr key={dept.id} style={{ borderBottom: '1px solid #F4F5F7' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 800, color: '#172B4D', fontSize: '14px' }}>
                      {dept.name} {dept.code && <span style={{ fontSize: '11px', fontWeight: 700, color: '#0052CC', background: '#E3F2FD', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{dept.code}</span>}
                    </div>
                    {dept.description && <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>{dept.description}</div>}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {dept.head ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0052CC', color: 'white', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getUserInitials(dept.head.name, dept.head.email)}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>{dept.head.name || dept.head.email}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#8993A4', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0052CC' }}>{dept.members.length} members</span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>
                    {dept.budget ? `$${dept.budget.toLocaleString()}` : 'N/A'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: dept.status === 'ACTIVE' ? '#E3FCEF' : '#FFEBE6', color: dept.status === 'ACTIVE' ? '#36B37E' : '#FF5630' }}>
                      {dept.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button onClick={() => setSelectedDept(dept)} style={{ padding: '6px 10px', fontSize: '12px', color: '#0052CC', background: '#E3F2FD', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Roster</button>
                      <button onClick={() => handleOpenEdit(dept)} style={{ padding: '6px 10px', fontSize: '12px', color: '#42526E', background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(dept.id, dept.name)} style={{ padding: '6px 10px', fontSize: '12px', color: '#FF5630', background: '#FFEBE6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT DEPARTMENT MODAL */}
      {isFormModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsFormModalOpen(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '600px', maxWidth: '100%', maxHeight: '90vh', boxShadow: '0 20px 60px rgba(9, 30, 66, 0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: 0 }}>
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B778C' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ background: '#FFEBE6', border: '1px solid #FF5630', color: '#BF2600', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                  {formError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineering"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Department Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ENG"
                    value={formData.code}
                    onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Department Head
                  </label>
                  <select
                    value={formData.headId}
                    onChange={e => setFormData(p => ({ ...p, headId: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="">No Department Head</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Annual Budget ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={formData.budget}
                    onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of department goals and responsibilities..."
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Assign Members Multiselect */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                  Assign Department Members ({formData.memberIds.length} selected)
                </label>
                <div style={{ border: '1px solid #DFE1E6', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', padding: '8px' }}>
                  {users.map(u => {
                    const isChecked = formData.memberIds.includes(u.id);

                    return (
                      <label
                        key={u.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: isChecked ? '#E3F2FD' : 'transparent',
                          cursor: 'pointer',
                          marginBottom: '4px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormData(p => ({ ...p, memberIds: [...p.memberIds, u.id] }));
                            } else {
                              setFormData(p => ({ ...p, memberIds: p.memberIds.filter(id => id !== u.id) }));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0052CC', color: 'white', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getUserInitials(u.name, u.email)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#172B4D' }}>{u.name || u.email}</span>
                          <span style={{ fontSize: '11px', color: '#6B778C', marginLeft: '6px' }}>({u.role})</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsFormModalOpen(false)} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, color: '#42526E', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '9px 24px', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', background: '#0052CC', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DEPARTMENT ROSTER / DETAIL DRAWER */}
      {selectedDept && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(9, 30, 66, 0.4)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSelectedDept(null)}>
          <div style={{ width: '480px', maxWidth: '100%', background: '#FFFFFF', height: '100%', boxShadow: '-8px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #EBECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '.06em', background: '#E3F2FD', padding: '2px 6px', borderRadius: '4px' }}>
                  {selectedDept.code || 'DEPT'}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: '6px 0 2px' }}>{selectedDept.name}</h2>
                <p style={{ fontSize: '12px', color: '#6B778C', margin: 0 }}>{selectedDept.members.length} Assigned Members</p>
              </div>
              <button onClick={() => setSelectedDept(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B778C' }}>
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {selectedDept.description && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B778C', textTransform: 'uppercase' }}>About Department</label>
                  <p style={{ fontSize: '13px', color: '#172B4D', margin: '4px 0 0', lineHeight: 1.5 }}>{selectedDept.description}</p>
                </div>
              )}

              {/* Head Section */}
              <div style={{ background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '14px', marginBottom: '24px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '.05em' }}>DEPARTMENT HEAD</label>
                {selectedDept.head ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0052CC', color: 'white', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getUserInitials(selectedDept.head.name, selectedDept.head.email)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#172B4D' }}>{selectedDept.head.name || selectedDept.head.email}</div>
                      <div style={{ fontSize: '12px', color: '#6B778C' }}>{selectedDept.head.email} • {selectedDept.head.role}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#8993A4', fontStyle: 'italic', marginTop: '6px' }}>No Department Head Assigned</div>
                )}
              </div>

              {/* Members Roster */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#172B4D', textTransform: 'uppercase' }}>DEPARTMENT ROSTER ({selectedDept.members.length})</label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedDept.members.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FFFFFF', border: '1px solid #EBECF0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0052CC', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getUserInitials(m.name, m.email)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>{m.name || m.email}</div>
                          <div style={{ fontSize: '11px', color: '#6B778C' }}>{m.email}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#F4F5F7', color: '#42526E' }}>
                        {m.role}
                      </span>
                    </div>
                  ))}

                  {selectedDept.members.length === 0 && (
                    <div style={{ padding: '20px', textTransform: 'uppercase', textAlign: 'center', fontSize: '12px', color: '#8993A4' }}>
                      No members assigned to this department yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

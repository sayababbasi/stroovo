"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Lock, Briefcase, Building2, Phone, ShieldCheck, 
  UserCheck, CheckCircle2, Upload, Eye, EyeOff, Plus, Trash2, 
  Mail, Calendar, Globe, MapPin, Sparkles, Check, AlertCircle, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialUser?: any | null;
}

interface Department {
  id: string;
  name: string;
  code: string | null;
}

interface Team {
  id: string;
  name: string;
}

interface ManagerOption {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function AddUserModal({ isOpen, onClose, onSuccess, initialUser }: AddUserModalProps) {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(initialUser);

  // Form State matching all prompt & reference requirements
  const [formData, setFormData] = useState({
    // Personal Information
    photo: '',
    firstName: '',
    lastName: '',
    displayName: '',
    dob: '',

    // Account & Authentication
    email: '',
    username: '',
    employeeId: '',
    invitationMethod: 'SEND_EMAIL',
    password: '',
    accountStatus: 'ACTIVE',
    requireEmailVerification: true,
    require2FA: false,

    // Employment Information
    jobTitle: '',
    department: '',
    deptId: '',
    teamId: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    joiningDate: '',
    managerId: '',

    // Contact Information
    phone: '',
    country: 'United States',
    city: '',
    officeLocation: '',
    timezone: '(UTC+05:00) Asia/Karachi',

    // Access & Permissions
    role: 'TEAM_MEMBER',
    workspaceAccess: 'FULL',
    permissionProfile: 'STANDARD',
    canManageUsers: false,
    canManageProjects: true,
    canManageGoals: true,
    canViewReports: true,

    // Profile & Preferences
    bio: '',
    skills: ['Project Management', 'Leadership', 'Communication'] as string[],
    language: 'English',
    notificationPreference: 'Email',
    themePreference: 'System Default'
  });

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      if (initialUser) {
        // Populate fields from initialUser
        const nameParts = (initialUser.name || '').split(' ');
        setFormData({
          photo: initialUser.image || '',
          firstName: initialUser.firstName || nameParts[0] || '',
          lastName: initialUser.lastName || nameParts.slice(1).join(' ') || '',
          displayName: initialUser.displayName || initialUser.name || '',
          dob: initialUser.dob ? new Date(initialUser.dob).toISOString().split('T')[0] : '',
          email: initialUser.email || '',
          username: initialUser.username || initialUser.email?.split('@')[0] || '',
          employeeId: initialUser.employeeId || '',
          invitationMethod: 'SEND_EMAIL',
          password: '',
          accountStatus: initialUser.isActive === false ? 'SUSPENDED' : 'ACTIVE',
          requireEmailVerification: true,
          require2FA: Boolean(initialUser.twoFactorEnabled),
          jobTitle: initialUser.designation || initialUser.title || '',
          department: initialUser.department || '',
          deptId: initialUser.deptId || '',
          teamId: initialUser.teamId || '',
          employmentType: initialUser.employmentType || 'Full-time',
          experienceLevel: initialUser.experienceLevel || 'Mid',
          joiningDate: initialUser.joiningDate ? new Date(initialUser.joiningDate).toISOString().split('T')[0] : '',
          managerId: initialUser.managerId || '',
          phone: initialUser.contact || initialUser.phone || '',
          country: initialUser.country || 'United States',
          city: initialUser.city || '',
          officeLocation: initialUser.officeLocation || initialUser.address || '',
          timezone: initialUser.timezone || '(UTC+05:00) Asia/Karachi',
          role: initialUser.role || 'TEAM_MEMBER',
          workspaceAccess: 'FULL',
          permissionProfile: 'STANDARD',
          canManageUsers: initialUser.role === 'ADMIN' || initialUser.role === 'SUPER_ADMIN',
          canManageProjects: true,
          canManageGoals: true,
          canViewReports: true,
          bio: initialUser.bio || '',
          skills: initialUser.skills && initialUser.skills.length > 0 ? initialUser.skills : ['Project Management', 'Leadership'],
          language: initialUser.language || 'English',
          notificationPreference: 'Email',
          themePreference: 'System Default'
        });
      } else {
        // Reset form
        setFormData({
          photo: '',
          firstName: '',
          lastName: '',
          displayName: '',
          dob: '',
          email: '',
          username: '',
          employeeId: '',
          invitationMethod: 'SEND_EMAIL',
          password: '',
          accountStatus: 'ACTIVE',
          requireEmailVerification: true,
          require2FA: false,
          jobTitle: '',
          department: '',
          deptId: '',
          teamId: '',
          employmentType: 'Full-time',
          experienceLevel: 'Mid',
          joiningDate: '',
          managerId: '',
          phone: '',
          country: 'United States',
          city: '',
          officeLocation: '',
          timezone: '(UTC+05:00) Asia/Karachi',
          role: 'TEAM_MEMBER',
          workspaceAccess: 'FULL',
          permissionProfile: 'STANDARD',
          canManageUsers: false,
          canManageProjects: true,
          canManageGoals: true,
          canViewReports: true,
          bio: '',
          skills: ['Project Management', 'Leadership', 'Communication'],
          language: 'English',
          notificationPreference: 'Email',
          themePreference: 'System Default'
        });
      }
    } else {
      setActiveSection(1);
      setFormError('');
    }
  }, [isOpen, initialUser]);

  const fetchDropdownData = async () => {
    try {
      const [deptRes, teamRes, userRes] = await Promise.all([
        fetch('/api/departments', { credentials: 'include' }),
        fetch('/api/admin/teams', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' })
      ]);

      if (deptRes.ok) {
        const dData = await deptRes.json();
        setDepartments(Array.isArray(dData) ? dData : []);
      }

      if (teamRes.ok) {
        const tData = await teamRes.json();
        const rawTeams = Array.isArray(tData) ? tData : Array.isArray(tData.data) ? tData.data : [];
        setTeams(rawTeams);
      }

      if (userRes.ok) {
        const uData = await userRes.json();
        const rawUsers = Array.isArray(uData) ? uData : Array.isArray(uData.users) ? uData.users : [];
        setManagers(rawUsers);
      }
    } catch (e) {
      console.error('Failed to load dropdown options', e);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#DFE1E6' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: '#FF5630' };
    if (score === 2) return { score: 50, label: 'Fair', color: '#FFAB00' };
    if (score === 3) return { score: 75, label: 'Good', color: '#36B37E' };
    return { score: 100, label: 'Strong', color: '#008DA6' };
  };

  const strength = getPasswordStrength(formData.password);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(p => ({ ...p, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== skillToRemove) }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft) {
      if (!formData.firstName.trim() && !formData.displayName.trim()) {
        setActiveSection(1);
        setFormError('Name is required');
        return;
      }
      if (!formData.email.trim()) {
        setActiveSection(2);
        setFormError('Work Email is required');
        return;
      }
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim() || formData.displayName || formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        employeeId: formData.employeeId,
        password: formData.password || undefined,
        invitationMethod: formData.invitationMethod,
        accountStatus: formData.accountStatus,
        isActive: formData.accountStatus === 'ACTIVE',
        requireEmailVerification: formData.requireEmailVerification,
        require2FA: formData.require2FA,
        jobTitle: formData.jobTitle,
        department: formData.department,
        deptId: formData.deptId,
        teamId: formData.teamId,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        joiningDate: formData.joiningDate,
        dob: formData.dob,
        managerId: formData.managerId,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        officeLocation: formData.officeLocation,
        timezone: formData.timezone,
        language: formData.language,
        role: formData.role,
        workspaceAccess: formData.workspaceAccess,
        permissionProfile: formData.permissionProfile,
        bio: formData.bio,
        skills: formData.skills,
        image: formData.photo,
        status: isDraft ? 'DRAFT' : formData.accountStatus
      };

      const url = isEditMode ? `/api/admin/users/${initialUser.id}` : '/api/admin/users';
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || data.details || 'Failed to save user');
        return;
      }

      toast.success(isEditMode ? 'User profile updated successfully!' : isDraft ? 'User draft saved!' : 'User created & invitation sent!');
      onSuccess();
      onClose();
    } catch {
      setFormError('Network error while saving user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const sectionProgress = Math.round((activeSection / 7) * 100);

  const getUserInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName || lastName) {
      return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
    }
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(9, 30, 66, 0.54)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '1100px',
        maxWidth: '96vw',
        height: '88vh',
        boxShadow: '0 24px 64px rgba(9, 30, 66, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>

        {/* Modal Top Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #EBECF0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#E3F2FD',
              color: '#0052CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: 0, letterSpacing: '-0.01em' }}>
                {isEditMode ? 'Edit User Profile' : 'Add New User'}
              </h2>
              <p style={{ fontSize: '13px', color: '#6B778C', margin: '2px 0 0' }}>
                {isEditMode ? `Update details and permissions for ${formData.displayName || formData.email}` : 'Create a new user account and set permissions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #DFE1E6',
              background: '#FFFFFF',
              color: '#6B778C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Main Split Content Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left Stepper Sidebar (260px) */}
          <aside style={{
            width: '260px',
            background: '#FAFBFC',
            borderRight: '1px solid #EBECF0',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            flexShrink: 0
          }}>
            <div>
              {/* Step Progress Indicator */}
              <div style={{ marginBottom: '20px', padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#6B778C', marginBottom: '6px' }}>
                  <span>Step {activeSection} of 7</span>
                  <span>{sectionProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#DFE1E6', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${sectionProgress}%`, height: '100%', background: '#0052CC', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Navigation Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { id: 1, label: 'Personal Information', sub: 'Basic personal details', icon: User },
                  { id: 2, label: 'Account & Authentication', sub: 'Login and security settings', icon: Lock },
                  { id: 3, label: 'Employment Information', sub: 'Job and employment details', icon: Briefcase },
                  { id: 4, label: 'Organization & Team', sub: 'Department and team setup', icon: Building2 },
                  { id: 5, label: 'Contact Information', sub: 'Phone, address and location', icon: Phone },
                  { id: 6, label: 'Access & Permissions', sub: 'Role and permission settings', icon: ShieldCheck },
                  { id: 7, label: 'Profile & Preferences', sub: 'Additional profile settings', icon: UserCheck },
                ].map(item => {
                  const isActive = activeSection === item.id;
                  const IconComp = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: isActive ? '#E3F2FD' : 'transparent',
                        color: isActive ? '#0052CC' : '#42526E',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconComp size={18} style={{ marginTop: '2px', color: isActive ? '#0052CC' : '#6B778C' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: isActive ? 800 : 600, margin: 0 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '11px', color: isActive ? '#0052CC' : '#6B778C', opacity: 0.8 }}>
                          {item.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Notice Card */}
            <div style={{
              background: '#E3F2FD',
              border: '1px solid #B3D4FF',
              borderRadius: '12px',
              padding: '14px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0052CC', fontWeight: 800, fontSize: '12.5px', marginBottom: '4px' }}>
                <Mail size={15} /> User Management
              </div>
              <p style={{ fontSize: '11.5px', color: '#0052CC', margin: 0, lineHeight: 1.4 }}>
                {isEditMode ? 'Changes to user profile will update across the entire workspace instantly.' : 'An invitation email with login instructions will be sent.'}
              </p>
            </div>
          </aside>

          {/* Right Main Form Content (Scrollable) */}
          <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>

            {formError && (
              <div style={{
                background: '#FFEBE6',
                border: '1px solid #FF5630',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '13px',
                color: '#BF2600',
                fontWeight: 600,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={18} />
                {formError}
              </div>
            )}

            {/* SECTION 1: PERSONAL INFORMATION */}
            {activeSection === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>Personal Information</h3>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Add the basic personal details of the user.</p>
                </div>

                {/* Profile Photo Row */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '8px' }}>
                    Profile Photo / Display Picture
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: '#0052CC',
                      color: 'white',
                      border: '2px solid #E3F2FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      fontSize: '28px',
                      fontWeight: 800
                    }}>
                      {formData.photo ? (
                        <img src={formData.photo} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        getUserInitials(formData.firstName, formData.lastName, formData.email)
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0052CC',
                          background: '#E3F2FD',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginBottom: '6px'
                        }}
                      >
                        Upload Photo
                      </button>
                      {formData.photo && (
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, photo: '' }))}
                          style={{
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#FF5630',
                            background: '#FFEBE6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginLeft: '8px'
                          }}
                        >
                          Remove
                        </button>
                      )}
                      <div style={{ fontSize: '11px', color: '#6B778C' }}>JPG, PNG or GIF. If uploaded, used as DP; otherwise initial character is shown.</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      First Name <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Last Name <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Display Name <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter display name (e.g. John Doe)"
                      value={formData.displayName}
                      onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: ACCOUNT & AUTHENTICATION */}
            {activeSection === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>Account & Authentication</h3>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Set up login credentials and account security.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Work Email <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter work email address"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Username <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter employee ID"
                      value={formData.employeeId}
                      onChange={e => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Invitation Method
                    </label>
                    <select
                      value={formData.invitationMethod}
                      onChange={e => setFormData(p => ({ ...p, invitationMethod: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="SEND_EMAIL">Send Invitation Email</option>
                      <option value="MANUAL">Manual Temporary Password</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      {isEditMode ? 'New Password (Optional)' : 'Temporary Password'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isEditMode ? 'Leave blank to keep unchanged' : '••••••••'}
                        value={formData.password}
                        onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                        style={{ width: '100%', padding: '10px 36px 10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B778C' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: strength.color }}>
                          <span>Password Strength: {strength.label}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#DFE1E6', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${strength.score}%`, height: '100%', background: strength.color, transition: 'width 0.2s' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Account Status
                    </label>
                    <select
                      value={formData.accountStatus}
                      onChange={e => setFormData(p => ({ ...p, accountStatus: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Security Feature Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                  <div style={{ border: '1px solid #EBECF0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Require Email Verification</div>
                      <div style={{ fontSize: '11px', color: '#6B778C' }}>User must verify email before logging in</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.requireEmailVerification}
                      onChange={e => setFormData(p => ({ ...p, requireEmailVerification: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ border: '1px solid #EBECF0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Require Two-Factor Authentication (2FA)</div>
                      <div style={{ fontSize: '11px', color: '#6B778C' }}>User must setup 2FA on first login</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.require2FA}
                      onChange={e => setFormData(p => ({ ...p, require2FA: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: EMPLOYMENT INFORMATION */}
            {activeSection === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>Employment Information</h3>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Add employment and job related information.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Job Title <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter job title"
                      value={formData.jobTitle}
                      onChange={e => setFormData(p => ({ ...p, jobTitle: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Department <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <select
                      value={formData.deptId}
                      onChange={e => {
                        const sel = departments.find(d => d.id === e.target.value);
                        setFormData(p => ({ ...p, deptId: e.target.value, department: sel?.name || '' }));
                      }}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="">Select department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Team
                    </label>
                    <select
                      value={formData.teamId}
                      onChange={e => setFormData(p => ({ ...p, teamId: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="">Select team</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={e => setFormData(p => ({ ...p, employmentType: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Experience Level
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={e => setFormData(p => ({ ...p, experienceLevel: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={e => setFormData(p => ({ ...p, joiningDate: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                    Reporting Manager
                  </label>
                  <select
                    value={formData.managerId}
                    onChange={e => setFormData(p => ({ ...p, managerId: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="">Search and select manager...</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.name || m.email} ({m.role})</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '11px', color: '#6B778C', marginTop: '4px' }}>Select the direct reporting manager</div>
                </div>
              </div>
            )}

            {/* SECTION 4 OR ORG VIEW */}
            {activeSection === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>Organization & Team Setup</h3>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Configure organizational division and primary workspace team.</p>
                </div>

                <div style={{ border: '1px solid #EBECF0', borderRadius: '12px', padding: '20px', background: '#FAFBFC' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', marginBottom: '12px' }}>Selected Division Structure</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 700 }}>Department</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0052CC' }}>{formData.department || 'Not Selected'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 700 }}>Assigned Team</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#172B4D' }}>
                        {teams.find(t => t.id === formData.teamId)?.name || 'General Team'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: CONTACT INFORMATION */}
            {activeSection === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>Contact Information</h3>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Add contact details and office location.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Office Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter office address"
                      value={formData.officeLocation}
                      onChange={e => setFormData(p => ({ ...p, officeLocation: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={e => setFormData(p => ({ ...p, timezone: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="(UTC+05:00) Asia/Karachi">(UTC+05:00) Asia/Karachi</option>
                      <option value="(UTC+00:00) UTC / London">(UTC+00:00) London</option>
                      <option value="(UTC-05:00) America/New_York">(UTC-05:00) New York</option>
                      <option value="(UTC-08:00) America/Los_Angeles">(UTC-08:00) San Francisco</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: ACCESS & PERMISSIONS */}
            {activeSection === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>Access & Permissions</h3>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Define user role and system access permissions.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Access Level / Role <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="ADMIN">Admin</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="EXECUTIVE">Executive</option>
                      <option value="TEAM_MEMBER">Team Member</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Workspace Access <span style={{ color: '#DE350B' }}>*</span>
                    </label>
                    <select
                      value={formData.workspaceAccess}
                      onChange={e => setFormData(p => ({ ...p, workspaceAccess: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="FULL">Full Access</option>
                      <option value="RESTRICTED">Restricted Access</option>
                      <option value="READ_ONLY">Read-Only Access</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Permission Profile
                    </label>
                    <select
                      value={formData.permissionProfile}
                      onChange={e => setFormData(p => ({ ...p, permissionProfile: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="STANDARD">Standard User Profile</option>
                      <option value="ADMIN">Administrator Profile</option>
                      <option value="CUSTOM">Custom Matrix</option>
                    </select>
                  </div>
                </div>

                {/* Feature Permission Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                  <div style={{ border: '1px solid #EBECF0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Can Manage Users</div>
                      <div style={{ fontSize: '11px', color: '#6B778C' }}>Add, edit and manage users</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.canManageUsers}
                      onChange={e => setFormData(p => ({ ...p, canManageUsers: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ border: '1px solid #EBECF0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Can Manage Projects</div>
                      <div style={{ fontSize: '11px', color: '#6B778C' }}>Create and manage projects</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.canManageProjects}
                      onChange={e => setFormData(p => ({ ...p, canManageProjects: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ border: '1px solid #EBECF0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Can Manage Goals</div>
                      <div style={{ fontSize: '11px', color: '#6B778C' }}>Create and manage goals & OKRs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.canManageGoals}
                      onChange={e => setFormData(p => ({ ...p, canManageGoals: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ border: '1px solid #EBECF0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Can View Reports</div>
                      <div style={{ fontSize: '11px', color: '#6B778C' }}>View analytics and enterprise reports</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.canViewReports}
                      onChange={e => setFormData(p => ({ ...p, canViewReports: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: PROFILE & PREFERENCES */}
            {activeSection === 7 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D', margin: '0 0 4px' }}>Profile & Preferences (Optional)</h3>
                  <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>Add additional profile information and preferences.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      maxLength={500}
                      placeholder="Write a short bio about the user..."
                      value={formData.bio}
                      onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ fontSize: '10px', color: '#6B778C', textAlign: 'right', marginTop: '2px' }}>
                      {formData.bio.length}/500
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Skills
                    </label>
                    <input
                      type="text"
                      placeholder="Add skills and press enter..."
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {formData.skills.map(s => (
                        <span key={s} style={{ fontSize: '11px', fontWeight: 700, background: '#E3F2FD', color: '#0052CC', padding: '4px 10px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {s}
                          <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(s)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Preferred Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={e => setFormData(p => ({ ...p, language: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Notification Preferences
                    </label>
                    <select
                      value={formData.notificationPreference}
                      onChange={e => setFormData(p => ({ ...p, notificationPreference: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="Email">Email Only</option>
                      <option value="Push">In-App Push</option>
                      <option value="Slack">Slack & Email</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E', display: 'block', marginBottom: '6px' }}>
                      Theme Preference
                    </label>
                    <select
                      value={formData.themePreference}
                      onChange={e => setFormData(p => ({ ...p, themePreference: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #DFE1E6', borderRadius: '8px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="System Default">System Default</option>
                      <option value="Light">Light Mode</option>
                      <option value="Dark">Dark Mode</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* Sticky Footer Action Bar */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #EBECF0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#42526E',
              background: '#FFFFFF',
              border: '1px solid #DFE1E6',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              style={{
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#42526E',
                background: '#FFFFFF',
                border: '1px solid #DFE1E6',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              style={{
                padding: '10px 28px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#FFFFFF',
                background: '#0052CC',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 82, 204, 0.25)'
              }}
            >
              {isEditMode ? <UserCheck size={16} /> : <Mail size={16} />}
              {isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Creating User...') : (isEditMode ? 'Save User Changes' : 'Create & Send Invitation')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

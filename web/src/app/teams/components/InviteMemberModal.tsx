"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, UserPlus, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Team {
  id: string;
  name: string;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentTeam?: Team | null;
  teams?: Team[];
}

const ROLES = [
  { value: 'ADMIN', label: 'Admin', desc: 'Full access to team settings and members' },
  { value: 'MANAGER', label: 'Manager', desc: 'Can manage tasks, projects and members' },
  { value: 'MEMBER', label: 'Member', desc: 'Standard access to team workspace' },
  { value: 'VIEWER', label: 'Viewer', desc: 'Read-only access to team content' },
];

export default function InviteMemberModal({ isOpen, onClose, onSuccess, currentTeam, teams = [] }: InviteMemberModalProps) {
  const { user: authUser } = useAuth();
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [selectedTeamId, setSelectedTeamId] = useState(currentTeam?.id || '');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentTeam?.id) setSelectedTeamId(currentTeam.id);
  }, [currentTeam]);

  if (!isOpen) return null;

  const parsedEmails = emails
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter((e) => e && e.includes('@'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTeamId) {
      setError('Please select a team');
      return;
    }
    if (parsedEmails.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const email of parsedEmails) {
        const res = await apiPost('/api/team-invitations', null, {
          teamId: selectedTeamId,
          email,
          role,
          invitedBy: authUser?.id || '',
          message,
        });

        if (res.success) {
          successCount++;
        } else {
          errors.push(`${email}: ${res.error || 'Failed'}`);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} invitation${successCount > 1 ? 's' : ''} sent!`);
        onSuccess();
        handleClose();
      }
      if (errors.length > 0) {
        setError(errors.join('\n'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmails('');
    setRole('MEMBER');
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(9, 30, 66, 0.54)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          background: 'white', borderRadius: '12px',
          width: '560px', maxWidth: '95vw', maxHeight: '90vh',
          boxShadow: '0 20px 60px rgba(9, 30, 66, 0.20)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Invite Members</h2>
              <p style={{ fontSize: '13px', color: '#6B778C', margin: 0, marginTop: '2px' }}>Add new members to your team workspace</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#6B778C', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Email Addresses */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>
              Email Addresses <span style={{ color: '#DE350B' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#8A94A6' }} />
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="Enter email addresses, separated by commas or new lines..."
                rows={3}
                style={{
                  width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                  borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit', color: '#172B4D', lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {parsedEmails.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {parsedEmails.map((email, i) => (
                  <span key={i} style={{
                    background: '#EEF2FF', color: '#0052CC', padding: '2px 10px',
                    borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                  }}>
                    {email}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Role and Team row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>
                Role <span style={{ color: '#DE350B' }}>*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                  border: '1px solid #DFE1E6', fontSize: '13px', fontWeight: 500, color: '#172B4D',
                  outline: 'none', background: 'white', cursor: 'pointer',
                }}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <p style={{ fontSize: '11px', color: '#8A94A6', marginTop: '6px' }}>
                {ROLES.find((r) => r.value === role)?.desc}
              </p>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>
                Team <span style={{ color: '#DE350B' }}>*</span>
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                style={{
                  width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                  border: '1px solid #DFE1E6', fontSize: '13px', fontWeight: 500, color: '#172B4D',
                  outline: 'none', background: 'white', cursor: 'pointer',
                }}
              >
                <option value="">Select team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', display: 'block', marginBottom: '8px' }}>
              Personal Message <span style={{ fontSize: '12px', fontWeight: 400, color: '#8A94A6' }}>(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to your invitation..."
              rows={2}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #DFE1E6', fontSize: '13px', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit', color: '#172B4D', lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFEBE6', border: '1px solid #FFB4A0', borderRadius: '8px',
              padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <AlertCircle size={16} style={{ color: '#DE350B', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: '#DE350B', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{error}</p>
            </div>
          )}

          {/* Info note */}
          <div style={{ background: '#F4F5F7', borderRadius: '8px', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B778C', margin: 0, lineHeight: 1.5 }}>
              Invitations expire in <strong>7 days</strong>. Recipients will receive an email to join your workspace. They must have an existing account or sign up when they accept.
            </p>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                height: '40px', padding: '0 20px', borderRadius: '8px',
                border: '1px solid #DFE1E6', background: 'white', color: '#172B4D',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || parsedEmails.length === 0}
              style={{
                height: '40px', padding: '0 20px', borderRadius: '8px',
                border: 'none', background: isLoading || parsedEmails.length === 0 ? '#8A94A6' : '#0052CC',
                color: 'white', fontSize: '13px', fontWeight: 600,
                cursor: isLoading || parsedEmails.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {isLoading ? 'Sending...' : `Send ${parsedEmails.length > 1 ? `${parsedEmails.length} Invites` : 'Invite'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

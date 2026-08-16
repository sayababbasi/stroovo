"use client";

import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, Clock, ExternalLink, MessageSquare, Users, Shield, CheckCircle2 } from 'lucide-react';

export interface MemberDetail {
  memberId: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  systemRole: string;
  teamRole: string;
  isActive: boolean;
  lastLoginAt: string | null;
  joinedAt: string;
  teams: { id: string; name: string; role: string }[];
  taskCount: number;
  projectCount: number;
  commentCount: number;
}

interface MemberDrawerProps {
  member: MemberDetail | null;
  onClose: () => void;
}

function Avatar({ name, image, size = 64 }: { name: string | null; image: string | null; size?: number }) {
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const colors = ['#6554C0', '#0052CC', '#36B37E', '#FF8B00', '#FF5630'];
  const colorIndex = (name || '').length % colors.length;

  if (image) {
    return (
      <img
        src={image}
        alt={name || 'User'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #DFE1E6' }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${colors[colorIndex]}20`,
      color: colors[colorIndex],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, border: `2px solid ${colors[colorIndex]}30`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: '#E9F2FF', text: '#0052CC' },
  MANAGER: { bg: '#E3FCEF', text: '#006644' },
  MEMBER: { bg: '#F4F1FD', text: '#6554C0' },
  VIEWER: { bg: '#F4F5F7', text: '#42526E' },
  OWNER: { bg: '#FFF0B3', text: '#974F0C' },
  TEAM_MEMBER: { bg: '#F4F1FD', text: '#6554C0' },
};

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_COLORS[role?.toUpperCase()] || { bg: '#F4F5F7', text: '#42526E' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 700,
      background: colors.bg, color: colors.text, display: 'inline-block',
    }}>
      {role}
    </span>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return ' ';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return 'Never';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 2) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function MemberDrawer({ member, onClose }: MemberDrawerProps) {
  if (!member) return null;

  const isOnline = member.lastLoginAt && (Date.now() - new Date(member.lastLoginAt).getTime() < 15 * 60 * 1000);

  // Derive permissions from role
  const rolePermissions: Record<string, string[]> = {
    ADMIN: ['Create Projects', 'Manage Tasks', 'Invite Members', 'Manage Settings', 'View Analytics', 'Delete Content'],
    MANAGER: ['Create Projects', 'Manage Tasks', 'Invite Members', 'View Analytics'],
    MEMBER: ['Create Tasks', 'View Projects', 'Comment on Tasks'],
    VIEWER: ['View Projects', 'View Tasks'],
  };

  const perms = rolePermissions[member.teamRole?.toUpperCase()] || rolePermissions['MEMBER'];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 900,
          background: 'rgba(9, 30, 66, 0.40)',
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 901,
          width: '400px', maxWidth: '95vw',
          background: 'white', boxShadow: '-4px 0 24px rgba(9, 30, 66, 0.15)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Member Profile</h2>
            <button
              onClick={onClose}
              style={{ background: '#F4F5F7', border: 'none', borderRadius: '6px', padding: '6px', color: '#42526E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Avatar name={member.name} image={member.image} size={60} />
              <span style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '12px', height: '12px', borderRadius: '50%',
                background: isOnline ? '#36B37E' : '#DFE1E6',
                border: '2px solid white',
              }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: 0, marginBottom: '4px' }}>
                {member.name || 'Unknown User'}
              </h3>
              <p style={{ fontSize: '13px', color: '#6B778C', margin: 0, marginBottom: '8px' }}>{member.email}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <RoleBadge role={member.teamRole} />
                <span style={{ fontSize: '12px', color: isOnline ? '#36B37E' : '#6B778C', fontWeight: 600 }}>
                  ● {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {[
              { icon: <Mail size={16} />, label: 'Email', href: `mailto:${member.email}` },
              { icon: <MessageSquare size={16} />, label: 'Message', href: '#' },
              { icon: <Calendar size={16} />, label: 'Schedule', href: '#' },
              { icon: <ExternalLink size={16} />, label: 'Profile', href: '#' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                title={action.label}
                style={{
                  flex: 1, height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                  borderRadius: '8px', border: '1px solid #DFE1E6', background: '#FAFBFC',
                  color: '#42526E', textDecoration: 'none', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {action.icon}
                <span>{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Contact Info */}
          <section>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, marginBottom: '12px' }}>
              Contact Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={14} style={{ color: '#8A94A6', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>{member.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={14} style={{ color: '#8A94A6', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>
                  Joined {formatDate(member.joinedAt)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={14} style={{ color: '#8A94A6', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>
                  Last active {timeAgo(member.lastLoginAt)}
                </span>
              </div>
            </div>
          </section>

          {/* Member Stats */}
          <section>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, marginBottom: '12px' }}>
              Member Stats
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Projects', value: member.projectCount, color: '#0052CC' },
                { label: 'Tasks', value: member.taskCount, color: '#6554C0' },
                { label: 'Completed', value: Math.floor(member.taskCount * 0.7), color: '#36B37E' },
                { label: 'Comments', value: member.commentCount, color: '#FF8B00' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: '#F8F9FA', borderRadius: '10px', padding: '12px 16px',
                  border: '1px solid #F0F1F3',
                }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: '#6B778C', fontWeight: 500, marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Teams */}
          <section>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, marginBottom: '12px' }}>
              Teams
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {member.teams.map((team) => (
                <div key={team.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: '8px',
                  padding: '6px 12px',
                }}>
                  <Users size={14} style={{ color: '#6B778C' }} />
                  <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 600 }}>{team.name}</span>
                  <RoleBadge role={team.role} />
                </div>
              ))}
              {member.teams.length === 0 && (
                <p style={{ fontSize: '13px', color: '#8A94A6' }}>No teams assigned</p>
              )}
            </div>
          </section>

          {/* Permissions */}
          <section>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, marginBottom: '12px' }}>
              Permissions (via {member.teamRole} role)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {perms.map((perm) => (
                <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={14} style={{ color: '#36B37E', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#172B4D' }}>{perm}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

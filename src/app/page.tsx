"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import ExecutiveDashboard from '@/components/dashboards/executive/ExecutiveDashboard';
import LandingPage from './landing/page';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const role = user.role?.toUpperCase();
      // Only redirect specific roles to their dashboards
      if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'TEAM_LEADER') {
        router.push('/teams');
      } else if (role === 'TEAM_MEMBER') {
        router.push('/my-tasks');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} color="#0052CC"/>
      </div>
    );
  }

  // Show Landing Page if not logged in
  if (!user) {
    return <LandingPage />;
  }

  // Render Dashboard for Executive/Manager roles who stay on root
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFBFC' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
        <ExecutiveDashboard user={user} />
      </main>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

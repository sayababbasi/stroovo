'use client';

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app:error]', error);
    toast.error('An unexpected error occurred');
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F4F5F7', padding: 24 }}>
      <div style={{ maxWidth: 480, background: 'white', border: '1px solid #E8EAED', borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#172B4D', marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 14, color: '#42526E', marginBottom: 16 }}>
          The application hit an unexpected error. Retry the last action, and if the issue persists, inspect the server logs.
        </div>
        <button
          onClick={reset}
          style={{ border: 'none', borderRadius: 10, background: '#0052CC', color: 'white', padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

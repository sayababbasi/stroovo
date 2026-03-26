"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const { login: authLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await authLogin(email.trim().toLowerCase(), password);
            if (!result.success) {
                setError(result.error || 'Login failed');
                setLoading(false);
                return;
            }
            router.push(redirect);
            router.refresh();
        } catch {
            setError('Network error');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d1f3c 0%, #1a365d 100%)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#36B37E',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                    }}>
                        <span style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>W</span>
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D' }}>Sign in</h1>
                    <p style={{ fontSize: '14px', color: '#6B778C', marginTop: '4px' }}>Dashboard & Admin</p>
                </div>

                {error && (
                    <div style={{
                        background: '#FFEBE6',
                        border: '1px solid #FF5630',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        color: '#BF2600',
                        fontSize: '14px',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            autoComplete="email"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #DFE1E6',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #DFE1E6',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: loading ? '#6B778C' : '#0052CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6B778C' }}>
                    <Link href="/" style={{ color: '#0052CC', textDecoration: 'none' }}>Back to dashboard</Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1f3c', color: '#B8C7D9' }}>
                Loading…
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

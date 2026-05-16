"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const { signup, isLoading: authLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        const result = await signup(name, email, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'Signup failed');
        }

        setIsLoading(false);
    };

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7' }}>
                <Loader2 size={32} className="animate-spin" color="#0052CC" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d1f3c 0%, #1a365d 100%)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'white',
                borderRadius: '12px',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#36B37E',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <span style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>W</span>
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>Create your account</h1>
                    <p style={{ fontSize: '14px', color: '#6B778C', marginTop: '8px' }}>Start managing your work today</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: '#FFEBE6',
                        border: '1px solid #FF5630',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        color: '#BF2600',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#172B4D' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#172B4D' }}>
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#172B4D' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', padding: '12px 44px 12px 44px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6B778C', marginTop: '6px' }}>Must be at least 8 characters</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#172B4D' }}>
                            Confirm Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: isLoading ? '#6B778C' : '#0052CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                {/* Login Link */}
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B778C' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#0052CC', fontWeight: 500, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

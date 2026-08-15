"use client";

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Mail, Eye, EyeOff, Shield } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams?.get('redirect') || '/dashboard';
    const { login: authLogin, isAuthenticated } = useAuth();

    // Check if user is already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirect);
        }
    }, [isAuthenticated, router, redirect]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            console.log('Login form submitted for:', email);
            const result = await authLogin(email.trim().toLowerCase(), password);
            console.log('Auth result:', result);
            if (!result.success) {
                // Handle structured error objects
                let errorMessage = 'Invalid credentials';
                if (result.error) {
                    if (typeof result.error === 'string') {
                        errorMessage = result.error;
                    } else if ((result.error as any).message) {
                        errorMessage = (result.error as any).message;
                    } else if ((result.error as any).code) {
                        errorMessage = `Authentication failed (${(result.error as any).code})`;
                    }
                }
                setError(errorMessage);
                setLoading(false);
                return;
            }

            // Hardened redirect sequence
            setLoading(false);
            // Give localStorage time to settle
            setTimeout(() => {
                window.location.href = redirect;
            }, 1000);
        } catch (err: any) {
            console.error('Login submit error:', err);
            setError('Unable to connect to server');
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            background: '#F9FAFB', /* Off-white to make the white card pop */
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background elements to match the subtle wavy lines in mockup */}
            <svg
                style={{ position: 'absolute', bottom: 0, left: 0, width: '60%', height: '50%', zIndex: 0, pointerEvents: 'none', opacity: 0.8 }}
                viewBox="0 0 1000 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <path d="M0 200 C 200 100, 300 300, 500 200 C 700 100, 800 250, 1000 150 L 1000 400 L 0 400 Z" stroke="url(#paint0_linear)" strokeWidth="1" fill="none" strokeDasharray="3 4" />
                <path d="M0 220 C 250 80, 350 320, 550 180 C 750 60, 850 280, 1000 120 L 1000 400 L 0 400 Z" stroke="url(#paint1_linear)" strokeWidth="1" fill="none" strokeDasharray="2 5" />
                <path d="M0 240 C 200 150, 400 250, 600 200 C 800 150, 900 200, 1000 180 L 1000 400 L 0 400 Z" stroke="url(#paint2_linear)" strokeWidth="1" fill="none" strokeDasharray="4 3" />
                <path d="M0 260 C 300 180, 450 280, 650 150 C 800 80, 900 220, 1000 160 L 1000 400 L 0 400 Z" stroke="url(#paint3_linear)" strokeWidth="1" fill="none" strokeDasharray="3 4" />
                <path d="M0 280 C 250 200, 400 150, 600 250 C 750 300, 900 200, 1000 220 L 1000 400 L 0 400 Z" stroke="url(#paint0_linear)" strokeWidth="1" fill="none" strokeDasharray="1 6" />
                <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="1000" y2="400" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0052CC" stopOpacity="0.4" />
                        <stop offset="1" stopColor="#6554C0" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="0" y1="0" x2="1000" y2="400" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#36C5F0" stopOpacity="0.3" />
                        <stop offset="1" stopColor="#6554C0" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="1000" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6554C0" stopOpacity="0.3" />
                        <stop offset="1" stopColor="#0052CC" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="paint3_linear" x1="0" y1="200" x2="1000" y2="200" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0052CC" stopOpacity="0.2" />
                        <stop offset="1" stopColor="#36C5F0" stopOpacity="0.05" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Back to Home Button - Mobile Only */}
            <div className="mobile-only" style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 50 }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', textDecoration: 'none', fontWeight: 600, padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Home
                </Link>
            </div>

            {/* LEFT SIDE: Content & Illustration (Approx 55% width) */}
            <div style={{
                flex: '1 1 55%',
                display: 'flex',
                flexDirection: 'column',
                padding: '32px 0 32px 80px', /* Add padding for the back button */
                position: 'relative',
                zIndex: 1,
                boxSizing: 'border-box',
                background: '#ffffff',
                borderRight: '1px solid #F1F5F9'
            }} className="desktop-only">
                
                {/* Desktop Back Button - In normal flow at the top */}
                <div style={{ marginLeft: '-40px' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748B', textDecoration: 'none', fontWeight: 600, padding: '8px 16px', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back to Home
                    </Link>
                </div>

                {/* Vertically Centered Wrapper */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>



                {/* Main Content Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, maxWidth: '440px', marginTop: '-40px' }}>

                    {/* Text Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {/* Logo - Inline above the text so it never overlaps and stays aligned */}
                        <Link href="/" style={{ display: 'inline-flex', marginBottom: '8px' }}>
                            <img src="/logo.png" alt="Stroovo Logo" style={{ height: '72px', width: 'auto', cursor: 'pointer' }} />
                        </Link>

                        <h1 style={{
                            fontSize: '64px',
                            fontWeight: 800,
                            color: '#0F172A',
                            lineHeight: 1.1,
                            marginBottom: '24px',
                            letterSpacing: '-2px'
                        }}>
                            Work smarter.<br />
                            Collaborate better.<br />
                            <span style={{
                                background: 'linear-gradient(90deg, #6554C0 0%, #0052CC 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'inline-block'
                            }}>Move faster.</span>
                        </h1>

                        <p style={{
                            fontSize: '18px',
                            color: '#475569',
                            lineHeight: 1.6,
                            marginBottom: '48px',
                            maxWidth: '95%',
                            fontWeight: 400
                        }}>
                            All-in-one workspace to manage projects,<br />tasks, your team and AI in one place.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Feature 1 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%',
                                    background: 'rgba(101, 84, 192, 0.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#6554C0',
                                    flexShrink: 0
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Collaborate</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>Work together in real time</p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 82, 204, 0.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#0052CC',
                                    flexShrink: 0
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Organize</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>Keep everything structured</p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%',
                                    background: 'rgba(54, 197, 240, 0.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#36C5F0',
                                    flexShrink: 0
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Deliver</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>Ship faster with confidence</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Illustration - Absolutely positioned and massively scaled */}
                    <div style={{
                        position: 'absolute',
                        left: '180px',
                        top: '55%',
                        transform: 'translateY(-50%)',
                        width: '950px',
                        height: 'auto',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}>
                        <img
                            src="/images/login-illustration.png"
                            alt="Stroovo Interface Illustration"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div style="padding: 40px; background: rgba(0,82,204,0.05); border-radius: 20px; text-align: center; color: #0052CC; font-weight: 600;">[Please save the 3D illustration as /public/images/login-illustration.png]</div>';
                            }}
                        />
                    </div>
                </div>

                {/* Security Badge - Absolutely positioned bottom left */}
                <div style={{
                    position: 'absolute',
                    bottom: '55px',
                    left: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 20px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.1)',
                    border: '1px solid #F1F5F9',
                    zIndex: 10
                }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 82, 204, 0.04)', border: '1px solid rgba(0, 82, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0052CC' }}>
                        <Shield size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px', marginBottom: '2px' }}>Enterprise-grade security</div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>Your data is encrypted and protected</div>
                    </div>
                </div>
                </div>

            </div>


            {/* RIGHT SIDE: Login Form (Approx 45% width) */}
            <div style={{
                flex: '1 1 45%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10,
                background: 'transparent'
            }} className="form-panel-responsive">

                {/* The Login Card */}
                <div style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'white',
                    borderRadius: '28px',
                    padding: '40px 48px',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0,0,0,0.1)',
                    border: '1px solid #F1F5F9',
                    boxSizing: 'border-box'
                }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(101, 84, 192, 0.08)',
                            margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#0052CC'
                        }}>
                            <Shield size={20} strokeWidth={2.5} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Welcome back</h2>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Sign in to your Stroovo workspace</p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '16px',
                            color: '#991B1B',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
                                Work Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ceo@revoticai.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 42px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: '#1E293B',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0052CC'}
                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                                    Password
                                </label>
                                <Link href="#" style={{ fontSize: '12px', fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 42px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: '#1E293B',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0052CC'}
                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#94A3B8',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <div style={{ position: 'relative', width: '16px', height: '16px' }}>
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{
                                        width: '100%', height: '100%',
                                        cursor: 'pointer',
                                        opacity: 0,
                                        position: 'absolute',
                                        zIndex: 2
                                    }}
                                />
                                <div style={{
                                    width: '100%', height: '100%',
                                    background: rememberMe ? '#6554C0' : '#F8FAFC',
                                    border: rememberMe ? 'none' : '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    position: 'absolute',
                                    zIndex: 1
                                }}>
                                    {rememberMe && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <label htmlFor="remember" style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, cursor: 'pointer' }}>
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(90deg, #6554C0 0%, #0052CC 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                opacity: loading ? 0.7 : 1,
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 14px rgba(0, 82, 204, 0.25)',
                                marginTop: '10px'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 82, 204, 0.35)';
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 82, 204, 0.25)';
                            }}
                        >
                            {loading ? 'Signing In...' : 'Sign in to Stroovo'}
                            {!loading && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px' }}>OR CONTINUE WITH</span>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                    </div>

                    {/* Social Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => setError('Please contact your administrator to get access.')}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                padding: '10px', background: 'white', border: '1px solid #E2E8F0',
                                borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1E293B'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setError('Please contact your administrator to get access.')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H1z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>
                                Continue with Microsoft
                            </button>
                            <button
                                type="button"
                                onClick={() => setError('Please contact your administrator to get access.')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 54 54"><path d="M19.712.001c-6.105 0-11.056 4.951-11.056 11.056 0 6.104 4.951 11.056 11.056 11.056h11.056V11.057C30.768 4.952 25.817.001 19.712.001" fill="#36C5F0" /><path d="M0 19.712c0 6.104 4.952 11.056 11.057 11.056s11.056-4.952 11.056-11.056V8.656H11.057C4.952 8.656 0 13.607 0 19.712" fill="#2EB67D" /><path d="M11.057 30.768c-6.104 0-11.056 4.952-11.056 11.056 0 6.105 4.952 11.056 11.056 11.056s11.056-4.951 11.056-11.056V30.768H11.057z" fill="#E01E5A" /><path d="M30.768 11.057c0-6.105-4.951-11.056-11.056-11.056s-11.056 4.951-11.056 11.056v11.056h11.056c6.105 0 11.056-4.951 11.056-11.056" fill="#ECB22E" /></svg>
                                Continue with Slack
                            </button>
                        </div>
                    </div>

                    {/* Footer link */}
                    <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748B' }}>
                        Need an account? <Link href="/contact" style={{ color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>Contact us for an account or demo</Link>
                    </div>
                </div>

                {/* Bottom Trust Badges */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    marginTop: '24px',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontWeight: 500
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        SSO Ready
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        SOC 2 Type II
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        GDPR Compliant
                    </div>
                </div>

            </div>

            <style jsx>{`
                @media (min-width: 1024px) {
                    .desktop-only { display: flex !important; }
                    .mobile-only { display: none !important; }
                }
                @media (max-width: 1023px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }
                    .form-panel-responsive { flex: 1 1 100% !important; padding: 20px; background: #F8FAFC !important; }
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>Initializing WORKFLOW Secure Auth...</div>}>
            <LoginForm />
        </Suspense>
    );
}

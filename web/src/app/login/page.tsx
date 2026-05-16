"use client";

import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Mail, Eye, EyeOff, Github, Slack, Layers, Database, Cpu, Share2, CheckCircle2 } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams?.get('redirect') || '/dashboard';
    const { login: authLogin } = useAuth();

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
            window.location.href = redirect;
        } catch (err: any) {
            console.error('Login submit error:', err);
            setError('Unable to connect to server');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            position: 'relative',
            background: 'white',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden'
        }}>
            {/* Left Side: Illustration Panel - PRECISE 80vw split as per user request */}
            <div style={{
                width: '80vw',
                height: '100vh',
                background: '#4B6A78', // Premium slate
                display: 'flex', // Default to visible
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                color: 'white',
                position: 'relative',
                border: 'none',
                boxSizing: 'border-box'
            }} className="desktop-only">
                {/* Branding at Top Left */}
                <div style={{ 
                    position: 'absolute', 
                    top: '40px', 
                    left: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: 'white',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 100
                }}>
                    <img 
                        src="/logo.png" 
                        alt="Stroovo Logo" 
                        style={{ height: '44px', width: 'auto', display: 'block' }} 
                    />
                </div>

                <div style={{ width: '100%', maxWidth: '580px', display: 'flex', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
                    {/* Process Diagram SVG - 100% Transparent */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="orbGradModern" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
                                    <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.05 }} />
                                </linearGradient>
                            </defs>
                            <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10 10" />
                            <circle cx="250" cy="250" r="180" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                            <circle cx="250" cy="250" r="60" fill="url(#orbGradModern)" stroke="white" strokeWidth="2" />
                            <circle cx="250" cy="100" r="40" fill="url(#orbGradModern)" stroke="white" strokeWidth="2" />
                            <circle cx="100" cy="350" r="40" fill="url(#orbGradModern)" stroke="white" strokeWidth="2" />
                            <circle cx="400" cy="350" r="40" fill="url(#orbGradModern)" stroke="white" strokeWidth="2" />
                            <line x1="250" y1="160" x2="250" y2="190" stroke="white" strokeWidth="2" />
                            <line x1="135" y1="325" x2="200" y2="285" stroke="white" strokeWidth="2" />
                            <line x1="365" y1="325" x2="300" y2="285" stroke="white" strokeWidth="2" />
                            <text x="250" y="255" fontFamily="Arial" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">PROCESS</text>
                            <text x="250" y="105" fontFamily="Arial" fontSize="10" fill="white" textAnchor="middle">DESIGN</text>
                            <text x="100" y="355" fontFamily="Arial" fontSize="10" fill="white" textAnchor="middle">DEVELOP</text>
                            <text x="400" y="355" fontFamily="Arial" fontSize="10" fill="white" textAnchor="middle">DONE</text>
                        </svg>
                        <div style={{ position: 'absolute', top: '250px', left: '250px', transform: 'translate(-50%, -150%)' }}><Cpu size={24} color="white" /></div>
                        <div style={{ position: 'absolute', top: '100px', left: '250px', transform: 'translate(-50%, -50%)' }}><Layers size={20} color="white" /></div>
                        <div style={{ position: 'absolute', top: '350px', left: '100px', transform: 'translate(-50%, -50%)' }}><Database size={20} color="white" /></div>
                        <div style={{ position: 'absolute', top: '350px', left: '400px', transform: 'translate(-50%, -50%)' }}><CheckCircle2 size={20} color="white" /></div>
                        <div style={{ position: 'absolute', top: '250px', left: '250px', transform: 'translate(-50%, 40%)' }}><Share2 size={20} color="white" /></div>
                    </div>
                </div>
            </div>

            {/* Right Side: Narrow Light Panel - 20vw */}
            <div style={{
                width: '25vw',
                height: '100vh',
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: 'none',
                position: 'relative'
            }} className="right-panel-responsive">
            </div>

            {/* THE LOGIN CARD - Centered exactly on the 80% Seam */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '70%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                width: '100%',
                maxWidth: '430px',
                background: 'white',
                borderRadius: '24px',
                padding: '52px 42px',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.1)',
            }} className="login-card-responsive">
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{ margin: '0 auto 16px', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4B6A78" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><circle cx="12" cy="16" r="1.5" fill="#4B6A78"></circle></svg>
                    </div>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: '0', letterSpacing: '0.5px' }}>SECURE LOGIN</h1>
                </div>

                {error && (
                    <div style={{
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '24px',
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
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                            Work Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Work Email"
                            required
                            style={{
                                width: '100%',
                                padding: '13px 16px',
                                border: '1.5px solid #E2E8F0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                color: '#1E293B'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                                Password
                            </label>
                            <Link href="#" style={{ fontSize: '11px', fontWeight: 700, color: '#4B6A78', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '13px 16px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#1E293B'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94A3B8',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4B6A78' }}
                        />
                        <label htmlFor="remember" style={{ fontSize: '13px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                            Remember Me
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: loading ? '#94A3B8' : '#4B6A78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Processing...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ margin: '32px 0 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1, height: '1.5px', background: '#F1F5F9' }} />
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800 }}>OR</span>
                    <div style={{ flex: 1, height: '1.5px', background: '#F1F5F9' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: 'white',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#1E293B'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Sign up with Google
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}
                        >
                            <svg width="18" height="18" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>Microsoft
                        </button>
                        <button
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}
                        >
                            <svg width="18" height="18" viewBox="0 0 54 54"><path d="M19.712.001c-6.105 0-11.056 4.951-11.056 11.056 0 6.104 4.951 11.056 11.056 11.056h11.056V11.057C30.768 4.952 25.817.001 19.712.001" fill="#36C5F0" /><path d="M0 19.712c0 6.104 4.952 11.056 11.057 11.056s11.056-4.952 11.056-11.056V8.656H11.057C4.952 8.656 0 13.607 0 19.712" fill="#2EB67D" /><path d="M11.057 30.768c-6.104 0-11.056 4.952-11.056 11.056 0 6.105 4.952 11.056 11.056 11.056s11.056-4.951 11.056-11.056V30.768H11.057z" fill="#E01E5A" /><path d="M30.768 11.057c0-6.105-4.951-11.056-11.056-11.056s-11.056 4.951-11.056 11.056v11.056h11.056c6.105 0 11.056-4.951 11.056-11.056" fill="#ECB22E" /></svg>Slack
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (min-width: 1024px) {
                    .desktop-only { display: flex !important; }
                }
                @media (max-width: 1023px) {
                    .right-panel-responsive { width: 100vw !important; }
                    .login-card-responsive { transform: translate(-50%, -50%) !important; left: 50% !important; max-width: 90% !important; }
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

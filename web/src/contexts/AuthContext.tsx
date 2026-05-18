"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Client-side auth uses relative paths to leverage Next.js rewrites
const API_URL = ''; 

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    title?: string;
    contact?: string;
    image?: string;
    tenantId?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresMFA?: boolean; sessionId?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    verifyMFA: (sessionId: string, token: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);

    // Initialize auth state from cookies/localStorage on mount
    useEffect(() => {
        initializeAuth().finally(() => setIsLoading(false));
    }, []);

    // Clear refresh timeout on unmount
    useEffect(() => {
        return () => {
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
        };
    }, [refreshTimeout]);

    const initializeAuth = async () => {
        try {
            console.log('[Auth] Initializing auth state...');
            // Try to load from localStorage first for faster UX
            const storedToken = localStorage.getItem('stroovo_token');
            const storedUser = localStorage.getItem('stroovo_user');
            
            console.log('[Auth] Stored token found:', !!storedToken);
            console.log('[Auth] Stored user found:', !!storedUser);

            if (storedToken && storedUser) {
                setAccessToken(storedToken);
                setUser(JSON.parse(storedUser));
                console.log('[Auth] Hydrated state from localStorage');
            }

            const currentToken = accessToken || storedToken;
            if (!currentToken) {
                console.log('[Auth] No token available, skipping verification');
                return false;
            }

            console.log('[Auth] Verifying token with backend...');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            headers['Authorization'] = `Bearer ${currentToken}`;
            
            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            console.log('[Auth] /me response status:', response.status);

            if (response.ok) {
                const userData = await response.json();
                console.log('[Auth] Token verified successfully');
                setUser(userData.user);
                setAccessToken(userData.accessToken || currentToken);
                
                // Update storage
                localStorage.setItem('stroovo_token', userData.accessToken || currentToken);
                localStorage.setItem('stroovo_user', JSON.stringify(userData.user));
                
                // Update cookie to 7 days (604800 seconds)
                document.cookie = `accessToken=${userData.accessToken || currentToken}; path=/; max-age=604800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
                
                return true;
            } else if (response.status === 401 || response.status === 403 || response.status === 404) {
                console.warn('[Auth] Token verification explicitly failed, status:', response.status);
                // Clear session only on explicit authentication failure
                localStorage.removeItem('stroovo_token');
                localStorage.removeItem('stroovo_user');
                setUser(null);
                setAccessToken(null);
                document.cookie = `accessToken=; path=/; max-age=0; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
                return false;
            } else {
                console.warn('[Auth] Server returned temporary error:', response.status, '- keeping session active');
                return true;
            }
        } catch (error) {
            console.error('[Auth] Failed to initialize auth due to network error:', error, '- keeping session active');
            return true;
        }
    };

    const scheduleTokenRefresh = () => {
        // Disabled active 13-minute refresh loop to avoid calling unimplemented endpoint.
        // Session validity is securely verified on mount and backend requests.
    };

    const login = async (email: string, password: string) => {
        try {
            // Use raw fetch to get a proper Response with .json() and .ok
            const res = await fetch(`${API_URL}/api/auth/login-simple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle structured error objects
                let errorMessage = 'Login failed';
                if (data.error) {
                    if (typeof data.error === 'string') {
                        errorMessage = data.error;
                    } else if (data.error.message) {
                        errorMessage = data.error.message;
                    } else if (data.error.code) {
                        errorMessage = `Authentication failed (${data.error.code})`;
                    }
                }
                return { success: false, error: errorMessage };
            }

            // Handle MFA requirement
            if (data.requiresMFA) {
                return { 
                    success: false, 
                    requiresMFA: true, 
                    sessionId: data.sessionId,
                    error: 'MFA verification required'
                };
            }

            // Successful login
            setUser(data.user);
            setAccessToken(data.accessToken);
            
            // Persist to localStorage for client-side state
            localStorage.setItem('stroovo_token', data.accessToken);
            localStorage.setItem('stroovo_user', JSON.stringify(data.user));
            
            // Set cookie for middleware/server-side state for 7 days
            document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Signup failed' };
            }

            const tokenToUse = data.accessToken || data.token;

            // Successful signup
            setUser(data.user);
            setAccessToken(tokenToUse);
            
            // Persist token and user in local storage
            localStorage.setItem('stroovo_token', tokenToUse);
            localStorage.setItem('stroovo_user', JSON.stringify(data.user));
            
            // Set cookie for middleware/server-side state for 7 days
            document.cookie = `accessToken=${tokenToUse}; path=/; max-age=604800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;

            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const logout = async () => {
        try {
            // Clear refresh timeout
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
                setRefreshTimeout(null);
            }

            // Call logout API
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API success
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('stroovo_token');
            localStorage.removeItem('stroovo_user');
            document.cookie = `accessToken=; path=/; max-age=0; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
            router.push('/login');
        }
    };

    const refreshTokenFn = async (): Promise<boolean> => {
        try {
            // Use raw fetch for refresh — apiPost returns ApiResponse, not raw Response
            const res = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({}),
            });

            if (!res.ok) {
                // Token refresh failed, clear state
                setUser(null);
                setAccessToken(null);
                localStorage.removeItem('stroovo_token');
                localStorage.removeItem('stroovo_user');
                if (refreshTimeout) {
                    clearTimeout(refreshTimeout);
                    setRefreshTimeout(null);
                }
                return false;
            }

            const data = await res.json();
            setUser(data.user);
            setAccessToken(data.accessToken);
            localStorage.setItem('stroovo_token', data.accessToken);
            localStorage.setItem('stroovo_user', JSON.stringify(data.user));
            scheduleTokenRefresh();
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            // Clear state on error
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('stroovo_token');
            localStorage.removeItem('stroovo_user');
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
                setRefreshTimeout(null);
            }
            return false;
        }
    };

    const verifyMFA = async (sessionId: string, token: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    email: '', // Will be handled by session
                    password: '', // Will be handled by session
                    mfaToken: token,
                    sessionId
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'MFA verification failed' };
            }

            // Successful MFA verification
            setUser(data.user);
            setAccessToken(data.accessToken);
            scheduleTokenRefresh();

            return { success: true };
        } catch (error) {
            console.error('MFA verification error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
                refreshToken: refreshTokenFn,
                verifyMFA,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

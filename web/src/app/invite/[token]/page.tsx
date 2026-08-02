"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  // Unwrap the token from the promised params
  const { token } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [inviteData, setInviteData] = useState<{
    email: string;
    invitedBy: string;
    tenantName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/invite/validate/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "Failed to validate invitation.");
        } else {
          setInviteData(data.data);
        }
      } catch (err) {
        setError("Network error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: formData.name,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to accept invitation");
        setIsSubmitting(false);
        return;
      }

      // Store tokens manually to help AuthContext pick it up without a full page reload if needed
      if (data.accessToken && data.user) {
        localStorage.setItem('stroovo_token', data.accessToken);
        localStorage.setItem('stroovo_user', JSON.stringify(data.user));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        // Force reload so AuthContext picks up new cookies/localStorage cleanly
        setTimeout(() => window.location.reload(), 100);
      }, 1500);

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Validating your invitation...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !inviteData) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-destructive/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold">Invalid Invitation</CardTitle>
          <CardDescription>
            This invitation link is no longer valid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/10 text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
        <CardContent className="pt-10 pb-8 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome aboard!</h2>
            <p className="text-muted-foreground text-sm">
              Your account has been created. Redirecting to your dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-border/50">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex justify-center mb-2">
          {/* Mock Logo or branding here */}
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-inner">
            S
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Join {inviteData?.tenantName}</CardTitle>
        <CardDescription className="text-center text-sm leading-relaxed">
          You've been invited by <span className="font-semibold text-foreground">{inviteData?.invitedBy}</span> to join their workspace. Set up your account to get started.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                value={inviteData?.email || ""} 
                disabled 
                className="pl-9 bg-muted/50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="name" 
                placeholder="John Doe" 
                className="pl-9 transition-all focus-visible:ring-primary"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                className="pl-9 transition-all focus-visible:ring-primary"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="confirmPassword" 
                type="password" 
                className="pl-9 transition-all focus-visible:ring-primary"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button type="submit" className="w-full font-semibold shadow-sm mt-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Creating Account...
              </>
            ) : "Accept Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

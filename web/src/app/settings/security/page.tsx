"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Mail, 
  Lock, 
  AlertTriangle, 
  Check, 
  X,
  Clock,
  Monitor,
  Globe,
  LogOut,
  RefreshCw,
  Download,
  Trash2
} from "lucide-react";

export default function SecuritySettingsPage() {
  const { user, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<any>(null);
  const [mfaVerificationCode, setMfaVerificationCode] = useState("");

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState<any>(null);

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: true,
    twoFactorRequired: false,
  });

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    try {
      // Load MFA status
      const mfaResponse = await fetch("/api/auth/mfa/setup");
      const mfaData = await mfaResponse.json();
      setMfaEnabled(mfaData.enabled);

      // Load sessions
      const sessionsResponse = await fetch("/api/auth/sessions");
      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData.sessions);
      setSessionStats(sessionsData.stats);

    } catch (error) {
      console.error("Error loading security data:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Password changed successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASetup = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (response.ok) {
        setMfaSetupData(data);
      } else {
        setError(data.error || "Failed to setup MFA");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAEnable = async () => {
    if (!mfaVerificationCode) {
      setError("Verification code is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mfaVerificationCode }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess("MFA enabled successfully");
        setMfaEnabled(true);
        setMfaSetupData(null);
        setMfaVerificationCode("");
      } else {
        setError(data.error || "Failed to enable MFA");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFADisable = async (password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess("MFA disabled successfully");
        setMfaEnabled(false);
      } else {
        setError(data.error || "Failed to disable MFA");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        setSuccess("Session revoked successfully");
        loadSecurityData(); // Reload sessions
      } else {
        setError("Failed to revoke session");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sessions/revoke-others", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setSuccess("Other sessions revoked successfully");
        loadSecurityData(); // Reload sessions
      } else {
        setError("Failed to revoke sessions");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getSessionIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "desktop": return <Monitor className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account security and privacy settings
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="mfa">2FA</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MFA Tab */}
          <TabsContent value="mfa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Two-Factor Authentication</span>
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authentication App</p>
                    <p className="text-sm text-gray-600">
                      Use an app like Google Authenticator or Authy
                    </p>
                  </div>
                  <Badge variant={mfaEnabled ? "default" : "secondary"}>
                    {mfaEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {!mfaEnabled && !mfaSetupData && (
                  <Button onClick={handleMFASetup} disabled={isLoading}>
                    {isLoading ? "Setting up..." : "Setup 2FA"}
                  </Button>
                )}

                {mfaSetupData && (
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Scan the QR code below with your authenticator app
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-center">
                      <img 
                        src={mfaSetupData.qrCode} 
                        alt="QR Code" 
                        className="w-48 h-48"
                      />
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">
                        Can't scan? Enter this code manually:
                      </p>
                      <code className="text-xs bg-gray-100 p-2 rounded">
                        {mfaSetupData.secret}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mfa-code">Verification Code</Label>
                      <Input
                        id="mfa-code"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={mfaVerificationCode}
                        onChange={(e) => setMfaVerificationCode(e.target.value.replace(/\D/g, ""))}
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleMFAEnable} disabled={isLoading || mfaVerificationCode.length !== 6}>
                        {isLoading ? "Enabling..." : "Enable 2FA"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setMfaSetupData(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {mfaEnabled && (
                  <div className="space-y-4">
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertDescription>
                        Two-factor authentication is enabled and protecting your account
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        const password = prompt("Enter your password to disable 2FA:");
                        if (password) handleMFADisable(password);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Disabling..." : "Disable 2FA"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Active Sessions</span>
                </CardTitle>
                <CardDescription>
                  Manage and monitor your active login sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sessionStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{sessionStats.totalSessions}</p>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{sessionStats.activeSessions}</p>
                      <p className="text-sm text-gray-600">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{sessionStats.devices?.length || 0}</p>
                      <p className="text-sm text-gray-600">Devices</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{sessionStats.locations?.length || 0}</p>
                      <p className="text-sm text-gray-600">Locations</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Active Sessions</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRevokeAllOtherSessions}
                      disabled={isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Revoke Other Sessions
                    </Button>
                  </div>

                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSessionIcon(session.device)}
                        <div>
                          <p className="font-medium">{session.browser} on {session.os}</p>
                          <p className="text-sm text-gray-600">
                            {session.ipAddress} • {session.location || "Unknown location"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last active: {formatDate(session.lastActivityAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {session.isCurrent && (
                          <Badge variant="default">Current</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={isLoading || session.isCurrent}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription>
                  Control your privacy and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">
                        Receive security alerts via email
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Alerts</p>
                      <p className="text-sm text-gray-600">
                        Get notified of new login attempts
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-600">
                        Automatically log out after inactivity
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.sessionTimeout}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, sessionTimeout: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Data Management</h3>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

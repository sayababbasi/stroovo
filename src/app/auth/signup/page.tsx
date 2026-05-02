"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Check, X, Shield, User, Mail, Lock, AlertTriangle } from "lucide-react";
import { validatePasswordStrength } from "@/lib/auth/security";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Real-time validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (name.length > 50) return "Name must not exceed 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  // Validate password strength
  useEffect(() => {
    if (formData.password) {
      const validation = validatePasswordStrength(formData.password);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  // Dynamic field validation
  useEffect(() => {
    if (touchedFields.name) {
      setFieldErrors(prev => ({ ...prev, name: validateName(formData.name) }));
    }
  }, [formData.name, touchedFields.name]);

  useEffect(() => {
    if (touchedFields.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(formData.email) }));
    }
  }, [formData.email, touchedFields.email]);

  useEffect(() => {
    if (touchedFields.confirmPassword && formData.password) {
      setFieldErrors(prev => ({ 
        ...prev, 
        confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword) 
      }));
    }
  }, [formData.confirmPassword, formData.password, touchedFields.confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
    setSuccess(false); // Clear success on input change
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleFieldFocus = (fieldName: string) => {
    // Clear error for this field when user starts typing
    setFieldErrors(prev => ({ ...prev, [fieldName]: "" }));
  };

  const validateForm = (): boolean => {
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);

    // Set all field errors
    setFieldErrors({
      name: nameError,
      email: emailError,
      password: "",
      confirmPassword: confirmPasswordError,
    });

    // Mark all fields as touched
    setTouchedFields({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (nameError || emailError || confirmPasswordError) {
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (passwordStrength && !passwordStrength.isValid) {
      setError("Password does not meet security requirements");
      return false;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setError("You must accept the terms and privacy policy");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      
      if (result.success) {
        setSuccess(true);
        // Show success message briefly before redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "bg-gray-200";
    
    switch (passwordStrength.strength) {
      case "WEAK": return "bg-red-500";
      case "FAIR": return "bg-orange-500";
      case "GOOD": return "bg-yellow-500";
      case "STRONG": return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  const getPasswordStrengthTextColor = () => {
    if (!passwordStrength) return "text-gray-500";
    
    switch (passwordStrength.strength) {
      case "WEAK": return "text-red-600";
      case "FAIR": return "text-orange-600";
      case "GOOD": return "text-yellow-600";
      case "STRONG": return "text-green-600";
      default: return "text-gray-500";
    }
  };

  const getPasswordStrengthVariant = () => {
    if (!passwordStrength) return "secondary";
    return passwordStrength.isValid ? "default" : "destructive";
  };

  const getPasswordStrengthText = () => {
    if (!passwordStrength) return "";
    
    switch (passwordStrength.strength) {
      case "WEAK": return "Weak";
      case "FAIR": return "Fair";
      case "GOOD": return "Good";
      case "STRONG": return "Strong";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Create your account</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Join thousands of teams managing work efficiently</p>
        </div>

        {/* Signup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Fill in your information to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Account created successfully! Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Full Name</span>
                  {touchedFields.name && fieldErrors.name && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('name')}
                  onBlur={() => handleFieldBlur('name')}
                  className={touchedFields.name && fieldErrors.name ? "border-red-500 focus:border-red-500" : ""}
                  required
                  disabled={isSubmitting}
                />
                {touchedFields.name && fieldErrors.name && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
                {touchedFields.name && !fieldErrors.name && formData.name && (
                  <p className="text-sm text-green-600 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Name looks good</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                  {touchedFields.email && fieldErrors.email && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={() => handleFieldBlur('email')}
                  className={touchedFields.email && fieldErrors.email ? "border-red-500 focus:border-red-500" : ""}
                  required
                  disabled={isSubmitting}
                />
                {touchedFields.email && fieldErrors.email && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
                {touchedFields.email && !fieldErrors.email && formData.email && (
                  <p className="text-sm text-green-600 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Email format is valid</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Password</span>
                  {touchedFields.password && !formData.password && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('password')}
                    onBlur={() => handleFieldBlur('password')}
                    className={touchedFields.password && !formData.password ? "border-red-500 focus:border-red-500" : ""}
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Enhanced Password Strength Indicator */}
                {passwordStrength && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Password Strength</span>
                      <Badge variant={getPasswordStrengthVariant()}>
                        <span className={getPasswordStrengthTextColor()}>
                          {getPasswordStrengthText()}
                        </span>
                      </Badge>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={passwordStrength.score * 10} 
                        className="h-3"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength.score * 10}%` }}
                      />
                    </div>
                    
                    {/* Password Requirements with Dynamic Icons */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 font-medium">Password requirements:</p>
                      {passwordStrength.feedback.map((requirement: string, index: number) => {
                        const isMet = !requirement.includes("must") && !requirement.includes("include") && !requirement.includes("avoid");
                        return (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            {isMet ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-red-500" />
                            )}
                            <span className={isMet ? "text-green-600 line-through" : "text-red-600"}>
                              {requirement}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Confirm Password</span>
                  {touchedFields.confirmPassword && fieldErrors.confirmPassword && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('confirmPassword')}
                    onBlur={() => handleFieldBlur('confirmPassword')}
                    className={touchedFields.confirmPassword && fieldErrors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {touchedFields.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
                {touchedFields.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Passwords match!</span>
                  </p>
                )}
              </div>

              {/* Terms and Privacy */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (e.target.checked) setError(""); // Clear error when checked
                    }}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and understand the privacy policy
                    {!acceptTerms && touchedFields.password && formData.password && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={acceptPrivacy}
                    onChange={(e) => {
                      setAcceptPrivacy(e.target.checked);
                      if (e.target.checked) setError(""); // Clear error when checked
                    }}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                    I have read and agree to the{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline font-medium">
                      Privacy Policy
                    </Link>
                    {!acceptPrivacy && touchedFields.password && formData.password && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                </div>
                
                {/* Dynamic validation message for checkboxes */}
                {touchedFields.password && formData.password && (!acceptTerms || !acceptPrivacy) && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>You must accept both terms and privacy policy to continue</span>
                  </p>
                )}
                
                {acceptTerms && acceptPrivacy && (
                  <p className="text-sm text-green-600 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Thank you for accepting our terms</span>
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                disabled={isSubmitting || !passwordStrength?.isValid || !acceptTerms || !acceptPrivacy}
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4" />
                    <span>Account Created!</span>
                  </div>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>
              
              {/* Dynamic form completion indicator */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <span className={`flex items-center space-x-1 ${
                    formData.name && !fieldErrors.name ? 'text-green-600' : ''
                  }`}>
                    <User className="h-3 w-3" />
                    <span>Name</span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className={`flex items-center space-x-1 ${
                    formData.email && !fieldErrors.email ? 'text-green-600' : ''
                  }`}>
                    <Mail className="h-3 w-3" />
                    <span>Email</span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className={`flex items-center space-x-1 ${
                    formData.password && passwordStrength?.isValid ? 'text-green-600' : ''
                  }`}>
                    <Lock className="h-3 w-3" />
                    <span>Password</span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className={`flex items-center space-x-1 ${
                    acceptTerms && acceptPrivacy ? 'text-green-600' : ''
                  }`}>
                    <Shield className="h-3 w-3" />
                    <span>Terms</span>
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                </span>
                <Link
                  href="/auth/login"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Security Features */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 text-center sm:text-left">Why choose our platform?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Enterprise Security</p>
                <p className="text-xs text-gray-600">Bank-level encryption</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">2FA Protection</p>
                <p className="text-xs text-gray-600">Multi-factor authentication</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Privacy First</p>
                <p className="text-xs text-gray-600">Your data is yours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

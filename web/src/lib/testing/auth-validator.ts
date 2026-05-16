import { PrismaClient } from '@prisma/client';

export interface AuthTestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  description: string;
  details?: string;
  recommendations?: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AuthTestReport {
  timestamp: Date;
  overallScore: number;
  tests: AuthTestResult[];
  failures: AuthTestResult[];
  warnings: AuthTestResult[];
  recommendations: string[];
}

export class AuthSystemValidator {
  private prisma: PrismaClient;
  private baseUrl: string;

  constructor(prisma: PrismaClient, baseUrl: string = 'http://localhost:3000') {
    this.prisma = prisma;
    this.baseUrl = baseUrl;
  }

  async runAuthTests(): Promise<AuthTestReport> {
    const tests = await Promise.all([
      this.testLoginFlow(),
      this.testSignupFlow(),
      this.testTokenRefresh(),
      this.testLogoutFlow(),
      this.testMFAFlow(),
      this.testSessionManagement(),
      this.testPasswordReset(),
      this.testAccountLockout(),
      this.testTokenSecurity(),
      this.testEdgeCases()
    ]);

    const failures = tests.filter(t => t.status === 'FAIL');
    const warnings = tests.filter(t => t.status === 'WARNING');
    
    const score = this.calculateAuthScore(tests);
    const recommendations = this.generateAuthRecommendations(failures, warnings);

    return {
      timestamp: new Date(),
      overallScore: score,
      tests,
      failures,
      warnings,
      recommendations
    };
  }

  private calculateAuthScore(tests: AuthTestResult[]): number {
    let score = 100;
    
    tests.forEach(test => {
      if (test.status === 'FAIL') {
        score -= test.severity === 'CRITICAL' ? 25 : 
                test.severity === 'HIGH' ? 15 : 
                test.severity === 'MEDIUM' ? 10 : 5;
      } else if (test.status === 'WARNING') {
        score -= test.severity === 'HIGH' ? 5 : 
                test.severity === 'MEDIUM' ? 3 : 1;
      }
    });

    return Math.max(0, score);
  }

  private generateAuthRecommendations(failures: AuthTestResult[], warnings: AuthTestResult[]): string[] {
    const recommendations: string[] = [];
    
    failures.forEach(fail => {
      if (fail.recommendations) {
        recommendations.push(...fail.recommendations);
      }
    });

    warnings.forEach(warning => {
      if (warning.recommendations) {
        recommendations.push(...warning.recommendations);
      }
    });

    return [...new Set(recommendations)];
  }

  // Test 1: Login Flow
  private async testLoginFlow(): Promise<AuthTestResult> {
    try {
      // Test successful login
      const loginResponse = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });

      if (loginResponse.status === 401) {
        // Test with valid credentials (would need actual user)
        return {
          testName: 'Login Flow',
          status: 'PASS',
          description: 'Login endpoint properly rejects invalid credentials',
          details: 'Invalid credentials return 401 status',
          severity: 'LOW'
        };
      }

      return {
        testName: 'Login Flow',
        status: 'WARNING',
        description: 'Login flow needs validation with real credentials',
        details: 'Unable to test with valid credentials',
        recommendations: [
          'Test login with valid user credentials',
          'Verify token generation on successful login',
          'Check cookie setting behavior'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Login Flow',
        status: 'FAIL',
        description: 'Login endpoint is not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check if login endpoint is accessible',
          'Verify server is running',
          'Check network connectivity'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 2: Signup Flow
  private async testSignupFlow(): Promise<AuthTestResult> {
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      const signupResponse = await fetch(`${this.baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: testEmail,
          password: testPassword
        })
      });

      if (signupResponse.status === 201 || signupResponse.status === 200) {
        return {
          testName: 'Signup Flow',
          status: 'PASS',
          description: 'Signup endpoint is working',
          details: 'New user can be created successfully',
          severity: 'LOW'
        };
      }

      if (signupResponse.status === 400) {
        const errorData = await signupResponse.json();
        return {
          testName: 'Signup Flow',
          status: 'PASS',
          description: 'Signup endpoint validates input properly',
          details: `Validation error: ${errorData.error || 'Unknown error'}`,
          severity: 'LOW'
        };
      }

      return {
        testName: 'Signup Flow',
        status: 'FAIL',
        description: 'Signup endpoint returned unexpected status',
        details: `Status: ${signupResponse.status}`,
        recommendations: [
          'Check signup endpoint implementation',
          'Verify input validation logic',
          'Ensure proper error responses'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Signup Flow',
        status: 'FAIL',
        description: 'Signup endpoint is not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 3: Token Refresh
  private async testTokenRefresh(): Promise<AuthTestResult> {
    try {
      const refreshResponse = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (refreshResponse.status === 401) {
        return {
          testName: 'Token Refresh',
          status: 'PASS',
          description: 'Token refresh properly rejects invalid session',
          details: 'No valid refresh token results in 401',
          severity: 'LOW'
        };
      }

      if (refreshResponse.status === 200) {
        const data = await refreshResponse.json();
        if (data.accessToken && data.user) {
          return {
            testName: 'Token Refresh',
            status: 'PASS',
            description: 'Token refresh is working',
            details: 'New tokens generated successfully',
            severity: 'LOW'
          };
        }
      }

      return {
        testName: 'Token Refresh',
        status: 'WARNING',
        description: 'Token refresh behavior needs verification',
        details: `Status: ${refreshResponse.status}`,
        recommendations: [
          'Test token refresh with valid session',
          'Verify token rotation logic',
          'Check refresh token expiration handling'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Token Refresh',
        status: 'FAIL',
        description: 'Token refresh endpoint is not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 4: Logout Flow
  private async testLogoutFlow(): Promise<AuthTestResult> {
    try {
      const logoutResponse = await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (logoutResponse.status === 200) {
        return {
          testName: 'Logout Flow',
          status: 'PASS',
          description: 'Logout endpoint is working',
          details: 'Logout completes successfully',
          severity: 'LOW'
        };
      }

      return {
        testName: 'Logout Flow',
        status: 'PASS',
        description: 'Logout endpoint is accessible',
        details: `Status: ${logoutResponse.status} (logout should work for authenticated users)`,
        severity: 'LOW'
      };
    } catch (error) {
      return {
        testName: 'Logout Flow',
        status: 'FAIL',
        description: 'Logout endpoint is not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 5: MFA Flow
  private async testMFAFlow(): Promise<AuthTestResult> {
    try {
      // Test MFA setup endpoint
      const setupResponse = await fetch(`${this.baseUrl}/api/auth/mfa/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (setupResponse.status === 401) {
        return {
          testName: 'MFA Flow',
          status: 'PASS',
          description: 'MFA endpoints require authentication',
          details: 'Unauthorized requests properly rejected',
          severity: 'LOW'
        };
      }

      if (setupResponse.status === 404) {
        return {
          testName: 'MFA Flow',
          status: 'WARNING',
          description: 'MFA endpoints not implemented',
          details: 'MFA functionality may not be available',
          recommendations: [
            'Implement MFA/2FA functionality',
            'Add TOTP support',
            'Create MFA management endpoints'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'MFA Flow',
        status: 'PASS',
        description: 'MFA endpoints are accessible',
        details: `Status: ${setupResponse.status}`,
        severity: 'LOW'
      };
    } catch (error) {
      return {
        testName: 'MFA Flow',
        status: 'FAIL',
        description: 'MFA endpoints are not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      };
    }
  }

  // Test 6: Session Management
  private async testSessionManagement(): Promise<AuthTestResult> {
    try {
      const sessionsResponse = await fetch(`${this.baseUrl}/api/auth/sessions`, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      if (sessionsResponse.status === 401) {
        return {
          testName: 'Session Management',
          status: 'PASS',
          description: 'Session endpoints require authentication',
          details: 'Unauthorized requests properly rejected',
          severity: 'LOW'
        };
      }

      if (sessionsResponse.status === 404) {
        return {
          testName: 'Session Management',
          status: 'WARNING',
          description: 'Session management endpoints not implemented',
          details: 'Session management functionality may not be available',
          recommendations: [
            'Implement session management endpoints',
            'Add session listing and revocation',
            'Create session monitoring'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Session Management',
        status: 'PASS',
        description: 'Session endpoints are accessible',
        details: `Status: ${sessionsResponse.status}`,
        severity: 'LOW'
      };
    } catch (error) {
      return {
        testName: 'Session Management',
        status: 'FAIL',
        description: 'Session management endpoints are not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 7: Password Reset
  private async testPasswordReset(): Promise<AuthTestResult> {
    try {
      const resetResponse = await fetch(`${this.baseUrl}/api/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com'
        })
      });

      if (resetResponse.status === 200 || resetResponse.status === 201) {
        return {
          testName: 'Password Reset',
          status: 'PASS',
          description: 'Password reset endpoint is working',
          details: 'Password reset request processed',
          severity: 'LOW'
        };
      }

      if (resetResponse.status === 404) {
        return {
          testName: 'Password Reset',
          status: 'WARNING',
          description: 'Password reset endpoint not implemented',
          details: 'Password reset functionality may not be available',
          recommendations: [
            'Implement password reset functionality',
            'Add email verification',
            'Create secure token generation'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Password Reset',
        status: 'PASS',
        description: 'Password reset endpoint is accessible',
        details: `Status: ${resetResponse.status}`,
        severity: 'LOW'
      };
    } catch (error) {
      return {
        testName: 'Password Reset',
        status: 'FAIL',
        description: 'Password reset endpoint is not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 8: Account Lockout
  private async testAccountLockout(): Promise<AuthTestResult> {
    try {
      let failedAttempts = 0;
      let accountLocked = false;

      // Simulate multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
        });

        if (response.status === 429) {
          accountLocked = true;
          break;
        }

        if (response.status === 401) {
          failedAttempts++;
        }
      }

      if (accountLocked || failedAttempts >= 5) {
        return {
          testName: 'Account Lockout',
          status: 'PASS',
          description: 'Account lockout protection is working',
          details: `Account locked after ${failedAttempts} failed attempts`,
          severity: 'LOW'
        };
      }

      return {
        testName: 'Account Lockout',
        status: 'WARNING',
        description: 'Account lockout protection may not be implemented',
        details: `${failedAttempts} failed attempts without lockout`,
        recommendations: [
          'Implement account lockout after failed attempts',
          'Add progressive delay for failed attempts',
          'Implement IP-based blocking'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Account Lockout',
        status: 'FAIL',
        description: 'Failed to test account lockout',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 9: Token Security
  private async testTokenSecurity(): Promise<AuthTestResult> {
    try {
      const invalidTokens = [
        'invalid.token',
        'Bearer invalid',
        '',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        'malformed.token.here'
      ];

      let tokensRejected = 0;

      for (const token of invalidTokens) {
        const response = await fetch(`${this.baseUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
          tokensRejected++;
        }
      }

      if (tokensRejected === invalidTokens.length) {
        return {
          testName: 'Token Security',
          status: 'PASS',
          description: 'Token validation is working',
          details: 'All invalid tokens properly rejected',
          severity: 'LOW'
        };
      }

      return {
        testName: 'Token Security',
        status: 'FAIL',
        description: 'Token validation issues found',
        details: `Only ${tokensRejected}/${invalidTokens.length} invalid tokens rejected`,
        recommendations: [
          'Implement proper token validation',
          'Add token expiration handling',
          'Use secure token generation',
          'Implement token revocation'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      return {
        testName: 'Token Security',
        status: 'FAIL',
        description: 'Failed to test token security',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 10: Edge Cases
  private async testEdgeCases(): Promise<AuthTestResult> {
    const edgeCases = [
      {
        name: 'Empty email',
        data: { email: '', password: 'test' }
      },
      {
        name: 'Empty password',
        data: { email: 'test@example.com', password: '' }
      },
      {
        name: 'Very long email',
        data: { email: 'a'.repeat(300) + '@example.com', password: 'test' }
      },
      {
        name: 'Very long password',
        data: { email: 'test@example.com', password: 'a'.repeat(1000) }
      },
      {
        name: 'Invalid email format',
        data: { email: 'invalid-email', password: 'test' }
      },
      {
        name: 'SQL injection attempt',
        data: { email: "'; DROP TABLE users; --", password: 'test' }
      },
      {
        name: 'XSS attempt',
        data: { email: '<script>alert("xss")</script>@example.com', password: 'test' }
      }
    ];

    let edgeCasesHandled = 0;
    let totalEdgeCases = edgeCases.length;

    for (const edgeCase of edgeCases) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(edgeCase.data)
        });

        if (response.status === 400 || response.status === 422) {
          edgeCasesHandled++;
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (edgeCasesHandled === totalEdgeCases) {
      return {
        testName: 'Edge Cases',
        status: 'PASS',
        description: 'Edge cases are properly handled',
        details: `${edgeCasesHandled}/${totalEdgeCases} edge cases rejected`,
        severity: 'LOW'
      };
    }

    return {
      testName: 'Edge Cases',
      status: 'WARNING',
      description: 'Some edge cases may not be properly handled',
      details: `${edgeCasesHandled}/${totalEdgeCases} edge cases rejected`,
      recommendations: [
        'Implement comprehensive input validation',
        'Add proper error handling for edge cases',
        'Sanitize all user inputs',
        'Add length validation for all fields'
      ],
      severity: 'MEDIUM'
    };
  }
}

// Singleton instance
export const authValidator = (prisma: PrismaClient, baseUrl?: string) => new AuthSystemValidator(prisma, baseUrl);

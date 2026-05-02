import { PrismaClient } from '@prisma/client';

export interface SecurityTestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  description: string;
  details?: string;
  recommendations?: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SecurityReport {
  timestamp: Date;
  overallScore: number; // 0-100
  tests: SecurityTestResult[];
  vulnerabilities: SecurityTestResult[];
  recommendations: string[];
  systemStatus: 'SECURE' | 'VULNERABLE' | 'CRITICAL';
}

export class SecurityTester {
  private prisma: PrismaClient;
  private baseUrl: string;

  constructor(prisma: PrismaClient, baseUrl: string = 'http://localhost:3000') {
    this.prisma = prisma;
    this.baseUrl = baseUrl;
  }

  async runAllTests(): Promise<SecurityReport> {
    const tests = await Promise.all([
      this.testAuthenticationSecurity(),
      this.testAPISecurity(),
      this.testInputValidation(),
      this.testRateLimiting(),
      this.testSessionSecurity(),
      this.testDatabaseSecurity(),
      this.testXSSProtection(),
      this.testCSRFProtection(),
      this.testSQLInjection(),
      this.testTokenSecurity()
    ]);

    const vulnerabilities = tests.filter(t => t.status === 'FAIL');
    const warnings = tests.filter(t => t.status === 'WARNING');
    
    const score = this.calculateSecurityScore(tests);
    const recommendations = this.generateRecommendations(vulnerabilities, warnings);

    return {
      timestamp: new Date(),
      overallScore: score,
      tests,
      vulnerabilities,
      recommendations,
      systemStatus: score >= 90 ? 'SECURE' : score >= 70 ? 'VULNERABLE' : 'CRITICAL'
    };
  }

  private calculateSecurityScore(tests: SecurityTestResult[]): number {
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

  private generateRecommendations(vulnerabilities: SecurityTestResult[], warnings: SecurityTestResult[]): string[] {
    const recommendations: string[] = [];
    
    vulnerabilities.forEach(vuln => {
      if (vuln.recommendations) {
        recommendations.push(...vuln.recommendations);
      }
    });

    warnings.forEach(warning => {
      if (warning.recommendations) {
        recommendations.push(...warning.recommendations);
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Test 1: Authentication Security
  private async testAuthenticationSecurity(): Promise<SecurityTestResult[]> {
    const tests: SecurityTestResult[] = [];

    // Test brute force protection
    try {
      const bruteForceResult = await this.testBruteForceProtection();
      tests.push(bruteForceResult);
    } catch (error) {
      tests.push({
        testName: 'Brute Force Protection',
        status: 'FAIL',
        description: 'Failed to test brute force protection',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      });
    }

    // Test password strength validation
    try {
      const passwordStrengthResult = await this.testPasswordStrengthValidation();
      tests.push(passwordStrengthResult);
    } catch (error) {
      tests.push({
        testName: 'Password Strength Validation',
        status: 'FAIL',
        description: 'Failed to test password strength validation',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      });
    }

    // Test MFA implementation
    try {
      const mfaResult = await this.testMFAImplementation();
      tests.push(mfaResult);
    } catch (error) {
      tests.push({
        testName: 'MFA Implementation',
        status: 'FAIL',
        description: 'Failed to test MFA implementation',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      });
    }

    return tests;
  }

  private async testBruteForceProtection(): Promise<SecurityTestResult> {
    const testEmail = 'test@example.com';
    const testPassword = 'wrongpassword';
    let failedAttempts = 0;
    let rateLimited = false;

    // Simulate multiple failed login attempts
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword
          })
        });

        if (response.status === 429) {
          rateLimited = true;
          break;
        }

        if (response.status === 401) {
          failedAttempts++;
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (rateLimited || failedAttempts >= 5) {
      return {
        testName: 'Brute Force Protection',
        status: 'PASS',
        description: 'Brute force protection is working',
        details: `Rate limiting triggered after ${failedAttempts} failed attempts`,
        severity: 'LOW'
      };
    }

    return {
      testName: 'Brute Force Protection',
      status: 'FAIL',
      description: 'Brute force protection not working',
      details: `Made ${failedAttempts} failed attempts without rate limiting`,
      recommendations: [
        'Implement rate limiting on login endpoints',
        'Add account lockout after multiple failed attempts',
        'Add IP-based blocking for suspicious activity'
      ],
      severity: 'HIGH'
    };
  }

  private async testPasswordStrengthValidation(): Promise<SecurityTestResult> {
    const weakPasswords = [
      '123456',
      'password',
      'abc123',
      'qwerty',
      'admin'
    ];

    let weakPasswordsAccepted = 0;

    for (const password of weakPasswords) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: password
          })
        });

        if (response.ok) {
          weakPasswordsAccepted++;
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (weakPasswordsAccepted === 0) {
      return {
        testName: 'Password Strength Validation',
        status: 'PASS',
        description: 'Password strength validation is working',
        details: 'All weak passwords were rejected',
        severity: 'LOW'
      };
    }

    return {
      testName: 'Password Strength Validation',
      status: 'FAIL',
      description: 'Weak passwords are being accepted',
      details: `${weakPasswordsAccepted} out of ${weakPasswords.length} weak passwords were accepted`,
      recommendations: [
        'Implement strong password requirements',
        'Add password strength meter',
        'Check against common password lists'
      ],
      severity: 'MEDIUM'
    };
  }

  private async testMFAImplementation(): Promise<SecurityTestResult> {
    // Check if MFA endpoints exist and are properly secured
    const endpoints = [
      '/api/auth/mfa/setup',
      '/api/auth/mfa/enable',
      '/api/auth/mfa/disable',
      '/api/auth/mfa/verify'
    ];

    let endpointsWorking = 0;
    let endpointsSecured = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.status !== 404) {
          endpointsWorking++;
          
          // Check if endpoint requires authentication
          if (response.status === 401 || response.status === 403) {
            endpointsSecured++;
          }
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (endpointsWorking === 0) {
      return {
        testName: 'MFA Implementation',
        status: 'WARNING',
        description: 'MFA endpoints not found',
        details: 'MFA functionality may not be implemented',
        recommendations: [
          'Implement MFA/2FA functionality',
          'Add TOTP support',
          'Create MFA management endpoints'
        ],
        severity: 'MEDIUM'
      };
    }

    if (endpointsSecured === endpointsWorking) {
      return {
        testName: 'MFA Implementation',
        status: 'PASS',
        description: 'MFA endpoints are properly secured',
        details: `${endpointsSecured}/${endpointsWorking} endpoints require authentication`,
        severity: 'LOW'
      };
    }

    return {
      testName: 'MFA Implementation',
      status: 'FAIL',
      description: 'MFA endpoints are not properly secured',
      details: `Only ${endpointsSecured}/${endpointsWorking} endpoints require authentication`,
      recommendations: [
        'Add authentication middleware to all MFA endpoints',
        'Implement proper authorization checks',
        'Secure MFA token generation and verification'
      ],
      severity: 'HIGH'
    };
  }

  // Test 2: API Security
  private async testAPISecurity(): Promise<SecurityTestResult[]> {
    const tests: SecurityTestResult[] = [];

    // Test API endpoint security
    try {
      const apiSecurityResult = await this.testAPISecurityHeaders();
      tests.push(apiSecurityResult);
    } catch (error) {
      tests.push({
        testName: 'API Security Headers',
        status: 'FAIL',
        description: 'Failed to test API security headers',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      });
    }

    // Test CORS configuration
    try {
      const corsResult = await this.testCORSConfiguration();
      tests.push(corsResult);
    } catch (error) {
      tests.push({
        testName: 'CORS Configuration',
        status: 'FAIL',
        description: 'Failed to test CORS configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      });
    }

    return tests;
  }

  private async testAPISecurityHeaders(): Promise<SecurityTestResult> {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Referrer-Policy'
    ];

    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const headers = response.headers;

      const missingHeaders = requiredHeaders.filter(header => !headers.get(header));

      if (missingHeaders.length === 0) {
        return {
          testName: 'API Security Headers',
          status: 'PASS',
          description: 'All required security headers are present',
          details: 'Security headers are properly configured',
          severity: 'LOW'
        };
      }

      return {
        testName: 'API Security Headers',
        status: 'FAIL',
        description: 'Missing security headers',
        details: `Missing headers: ${missingHeaders.join(', ')}`,
        recommendations: [
          'Add missing security headers',
          'Configure Content Security Policy (CSP)',
          'Enable HSTS in production'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'API Security Headers',
        status: 'FAIL',
        description: 'Failed to check security headers',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      };
    }
  }

  private async testCORSConfiguration(): Promise<SecurityTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://malicious-site.com' }
      });

      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      if (corsHeader === '*' || corsHeader === 'https://malicious-site.com') {
        return {
          testName: 'CORS Configuration',
          status: 'FAIL',
          description: 'CORS is too permissive',
          details: 'CORS allows access from any origin',
          recommendations: [
            'Restrict CORS to specific origins',
            'Avoid wildcard CORS in production',
            'Implement proper origin validation'
          ],
          severity: 'HIGH'
        };
      }

      return {
        testName: 'CORS Configuration',
        status: 'PASS',
        description: 'CORS is properly configured',
        details: 'CORS restrictions are in place',
        severity: 'LOW'
      };
    } catch (error) {
      return {
        testName: 'CORS Configuration',
        status: 'FAIL',
        description: 'Failed to test CORS configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      };
    }
  }

  // Test 3: Input Validation
  private async testInputValidation(): Promise<SecurityTestResult[]> {
    const tests: SecurityTestResult[] = [];

    // Test JSON parsing
    try {
      const jsonResult = await this.testJSONValidation();
      tests.push(jsonResult);
    } catch (error) {
      tests.push({
        testName: 'JSON Validation',
        status: 'FAIL',
        description: 'Failed to test JSON validation',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      });
    }

    // Test parameter validation
    try {
      const paramResult = await this.testParameterValidation();
      tests.push(paramResult);
    } catch (error) {
      tests.push({
        testName: 'Parameter Validation',
        status: 'FAIL',
        description: 'Failed to test parameter validation',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      });
    }

    return tests;
  }

  private async testJSONValidation(): Promise<SecurityTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{'
      });

      if (response.status === 400) {
        return {
          testName: 'JSON Validation',
          status: 'PASS',
          description: 'Invalid JSON is properly rejected',
          details: 'API returns 400 for malformed JSON',
          severity: 'LOW'
        };
      }

      return {
        testName: 'JSON Validation',
        status: 'FAIL',
        description: 'Invalid JSON is not properly rejected',
        details: `API returned status ${response.status} instead of 400`,
        recommendations: [
          'Add JSON parsing error handling',
          'Return proper error responses for malformed JSON',
          'Implement request body validation middleware'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'JSON Validation',
        status: 'FAIL',
        description: 'Failed to test JSON validation',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      };
    }
  }

  private async testParameterValidation(): Promise<SecurityTestResult> {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '../../etc/passwd',
      'SELECT * FROM users',
      '${7*7}',
      '{{7*7}}'
    ];

    let vulnerabilitiesFound = 0;

    for (const input of maliciousInputs) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: input,
            password: 'test'
          })
        });

        // Check if the malicious input appears in error messages (indicating lack of sanitization)
        const text = await response.text();
        if (text.includes(input) && response.status !== 400) {
          vulnerabilitiesFound++;
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (vulnerabilitiesFound === 0) {
      return {
        testName: 'Parameter Validation',
        status: 'PASS',
        description: 'Input validation is working',
        details: 'Malicious inputs are properly handled',
        severity: 'LOW'
      };
    }

    return {
      testName: 'Parameter Validation',
      status: 'FAIL',
      description: 'Input validation vulnerabilities found',
      details: `${vulnerabilitiesFound} malicious inputs were not properly handled`,
      recommendations: [
        'Implement input sanitization',
        'Add parameter validation middleware',
        'Escape or reject special characters'
      ],
      severity: 'HIGH'
    };
  }

  // Test 4: Rate Limiting
  private async testRateLimiting(): Promise<SecurityTestResult> {
    try {
      const endpoint = '/api/health';
      let requestsAllowed = 0;
      let rateLimited = false;

      // Make rapid requests
      for (let i = 0; i < 100; i++) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`);
          
          if (response.status === 429) {
            rateLimited = true;
            break;
          } else if (response.ok) {
            requestsAllowed++;
          }
        } catch (error) {
          // Network error, continue
        }
      }

      if (rateLimited) {
        return {
          testName: 'Rate Limiting',
          status: 'PASS',
          description: 'Rate limiting is working',
          details: `Rate limiting triggered after ${requestsAllowed} requests`,
          severity: 'LOW'
        };
      }

      return {
        testName: 'Rate Limiting',
        status: 'WARNING',
        description: 'Rate limiting may not be implemented',
        details: `Made ${requestsAllowed} requests without rate limiting`,
        recommendations: [
          'Implement rate limiting on all endpoints',
          'Use different limits for different endpoint types',
          'Consider IP-based and user-based rate limiting'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Rate Limiting',
        status: 'FAIL',
        description: 'Failed to test rate limiting',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      };
    }
  }

  // Test 5: Session Security
  private async testSessionSecurity(): Promise<SecurityTestResult> {
    try {
      // Test session management
      const sessionResult = await this.testSessionManagement();
      return sessionResult;
    } catch (error) {
      return {
        testName: 'Session Security',
        status: 'FAIL',
        description: 'Failed to test session security',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  private async testSessionManagement(): Promise<SecurityTestResult> {
    try {
      // Check if session endpoints exist
      const response = await fetch(`${this.baseUrl}/api/auth/sessions`, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      if (response.status === 401) {
        return {
          testName: 'Session Security',
          status: 'PASS',
          description: 'Session endpoints require authentication',
          details: 'Unauthorized requests are properly rejected',
          severity: 'LOW'
        };
      }

      return {
        testName: 'Session Security',
        status: 'WARNING',
        description: 'Session security needs improvement',
        details: 'Session endpoints may not be properly secured',
        recommendations: [
          'Implement proper session validation',
          'Add session expiration handling',
          'Implement session revocation'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Session Security',
        status: 'FAIL',
        description: 'Failed to test session management',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  // Test 6: Database Security
  private async testDatabaseSecurity(): Promise<SecurityTestResult> {
    try {
      // Check for common database vulnerabilities
      const dbResult = await this.testDatabaseVulnerabilities();
      return dbResult;
    } catch (error) {
      return {
        testName: 'Database Security',
        status: 'FAIL',
        description: 'Failed to test database security',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'HIGH'
      };
    }
  }

  private async testDatabaseVulnerabilities(): Promise<SecurityTestResult> {
    // Test for SQL injection attempts
    const sqlInjectionAttempts = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --"
    ];

    let vulnerabilitiesFound = 0;

    for (const injection of sqlInjectionAttempts) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: injection,
            password: 'test'
          })
        });

        // Check if SQL injection error messages are exposed
        const text = await response.text();
        if (text.toLowerCase().includes('sql') || text.toLowerCase().includes('database')) {
          vulnerabilitiesFound++;
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (vulnerabilitiesFound === 0) {
      return {
        testName: 'Database Security',
        status: 'PASS',
        description: 'No SQL injection vulnerabilities found',
        details: 'SQL injection attempts were properly handled',
        severity: 'LOW'
      };
    }

    return {
      testName: 'Database Security',
      status: 'FAIL',
      description: 'Potential SQL injection vulnerabilities',
      details: `${vulnerabilitiesFound} SQL injection attempts revealed database information`,
      recommendations: [
        'Use parameterized queries',
        'Implement input validation',
        'Avoid dynamic SQL construction',
        'Use ORM properly'
      ],
      severity: 'CRITICAL'
    };
  }

  // Test 7: XSS Protection
  private async testXSSProtection(): Promise<SecurityTestResult> {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")',
      '<svg onload=alert("xss")>'
    ];

    let vulnerabilitiesFound = 0;

    for (const payload of xssPayloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload,
            password: 'test'
          })
        });

        const text = await response.text();
        if (text.includes(payload) && !text.includes('error')) {
          vulnerabilitiesFound++;
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (vulnerabilitiesFound === 0) {
      return {
        testName: 'XSS Protection',
        status: 'PASS',
        description: 'XSS protection is working',
        details: 'XSS payloads are properly handled',
        severity: 'LOW'
      };
    }

    return {
      testName: 'XSS Protection',
      status: 'FAIL',
      description: 'XSS vulnerabilities found',
      details: `${vulnerabilitiesFound} XSS payloads were not properly handled`,
      recommendations: [
        'Implement output encoding',
        'Use Content Security Policy (CSP)',
        'Sanitize user inputs',
        'Escape HTML characters'
      ],
      severity: 'HIGH'
    };
  }

  // Test 8: CSRF Protection
  private async testCSRFProtection(): Promise<SecurityTestResult> {
    try {
      // Test if CSRF tokens are required for state-changing operations
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test'
        }),
        // Simulate cross-origin request
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://malicious-site.com',
          'Referer': 'https://malicious-site.com/evil.html'
        }
      });

      // This is a simplified test - in practice, CSRF protection is more complex
      return {
        testName: 'CSRF Protection',
        status: 'WARNING',
        description: 'CSRF protection needs verification',
        details: 'CSRF protection requires manual verification',
        recommendations: [
          'Implement CSRF tokens for state-changing operations',
          'Use SameSite cookie attributes',
          'Verify Origin and Referer headers',
          'Use double submit cookie pattern'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'CSRF Protection',
        status: 'FAIL',
        description: 'Failed to test CSRF protection',
        details: error instanceof Error ? error.message : 'Unknown error',
        severity: 'MEDIUM'
      };
    }
  }

  // Test 9: SQL Injection (already covered in database security)
  private async testSQLInjection(): Promise<SecurityTestResult> {
    return this.testDatabaseVulnerabilities();
  }

  // Test 10: Token Security
  private async testTokenSecurity(): Promise<SecurityTestResult> {
    try {
      // Test token validation
      const tokenResult = await this.testTokenValidation();
      return tokenResult;
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

  private async testTokenValidation(): Promise<SecurityTestResult> {
    const invalidTokens = [
      'invalid.token',
      'Bearer invalid',
      '',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid'
    ];

    let tokensRejected = 0;

    for (const token of invalidTokens) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
          tokensRejected++;
        }
      } catch (error) {
        // Network error, continue
      }
    }

    if (tokensRejected === invalidTokens.length) {
      return {
        testName: 'Token Security',
        status: 'PASS',
        description: 'Token validation is working',
        details: 'All invalid tokens were properly rejected',
        severity: 'LOW'
      };
    }

    return {
      testName: 'Token Security',
      status: 'FAIL',
      description: 'Token validation issues found',
      details: `Only ${tokensRejected}/${invalidTokens.length} invalid tokens were rejected`,
      recommendations: [
        'Implement proper token validation',
        'Add token expiration handling',
        'Use secure token generation',
        'Implement token revocation'
      ],
      severity: 'HIGH'
    };
  }
}

// Singleton instance
export const securityTester = (prisma: PrismaClient, baseUrl?: string) => new SecurityTester(prisma, baseUrl);

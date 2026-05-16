import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client/index';
import { securityTester } from '@/lib/security/security-tester';

describe('Security System Tests', () => {
  let prisma: PrismaClient;
  let tester: ReturnType<typeof securityTester>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    tester = securityTester(prisma, 'http://localhost:3000');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication Security', () => {
    it('should have brute force protection', async () => {
      const report = await tester.runAllTests();
      const bruteForceTest = report.tests.find(t => t.testName === 'Brute Force Protection');
      
      expect(bruteForceTest).toBeDefined();
      expect(bruteForceTest?.status).toBe('PASS');
    });

    it('should enforce password strength', async () => {
      const report = await tester.runAllTests();
      const passwordTest = report.tests.find(t => t.testName === 'Password Strength Validation');
      
      expect(passwordTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(passwordTest?.status);
    });

    it('should implement MFA properly', async () => {
      const report = await tester.runAllTests();
      const mfaTest = report.tests.find(t => t.testName === 'MFA Implementation');
      
      expect(mfaTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(mfaTest?.status);
    });
  });

  describe('API Security', () => {
    it('should have proper security headers', async () => {
      const report = await tester.runAllTests();
      const headersTest = report.tests.find(t => t.testName === 'API Security Headers');
      
      expect(headersTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(headersTest?.status);
    });

    it('should have proper CORS configuration', async () => {
      const report = await tester.runAllTests();
      const corsTest = report.tests.find(t => t.testName === 'CORS Configuration');
      
      expect(corsTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(corsTest?.status);
    });
  });

  describe('Input Validation', () => {
    it('should validate JSON input properly', async () => {
      const report = await tester.runAllTests();
      const jsonTest = report.tests.find(t => t.testName === 'JSON Validation');
      
      expect(jsonTest).toBeDefined();
      expect(jsonTest?.status).toBe('PASS');
    });

    it('should validate parameters properly', async () => {
      const report = await tester.runAllTests();
      const paramTest = report.tests.find(t => t.testName === 'Parameter Validation');
      
      expect(paramTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(paramTest?.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting', async () => {
      const report = await tester.runAllTests();
      const rateLimitTest = report.tests.find(t => t.testName === 'Rate Limiting');
      
      expect(rateLimitTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(rateLimitTest?.status);
    });
  });

  describe('Session Security', () => {
    it('should secure sessions properly', async () => {
      const report = await tester.runAllTests();
      const sessionTest = report.tests.find(t => t.testName === 'Session Security');
      
      expect(sessionTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(sessionTest?.status);
    });
  });

  describe('Database Security', () => {
    it('should prevent SQL injection', async () => {
      const report = await tester.runAllTests();
      const sqlTest = report.tests.find(t => t.testName === 'Database Security');
      
      expect(sqlTest).toBeDefined();
      expect(sqlTest?.status).toBe('PASS');
    });
  });

  describe('XSS Protection', () => {
    it('should prevent XSS attacks', async () => {
      const report = await tester.runAllTests();
      const xssTest = report.tests.find(t => t.testName === 'XSS Protection');
      
      expect(xssTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(xssTest?.status);
    });
  });

  describe('CSRF Protection', () => {
    it('should have CSRF protection measures', async () => {
      const report = await tester.runAllTests();
      const csrfTest = report.tests.find(t => t.testName === 'CSRF Protection');
      
      expect(csrfTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(csrfTest?.status);
    });
  });

  describe('Token Security', () => {
    it('should validate tokens properly', async () => {
      const report = await tester.runAllTests();
      const tokenTest = report.tests.find(t => t.testName === 'Token Security');
      
      expect(tokenTest).toBeDefined();
      expect(tokenTest?.status).toBe('PASS');
    });
  });

  describe('Overall Security Health', () => {
    it('should have good overall security score', async () => {
      const report = await tester.runAllTests();
      
      expect(report.overallScore).toBeGreaterThan(70);
      expect(report.vulnerabilities.length).toBeLessThan(3);
    });

    it('should not have critical vulnerabilities', async () => {
      const report = await tester.runAllTests();
      
      const criticalVulns = report.vulnerabilities.filter(v => v.severity === 'CRITICAL');
      expect(criticalVulns.length).toBe(0);
    });

    it('should have limited high severity vulnerabilities', async () => {
      const report = await tester.runAllTests();
      
      const highVulns = report.vulnerabilities.filter(v => v.severity === 'HIGH');
      expect(highVulns.length).toBeLessThan(2);
    });
  });

  describe('Security Recommendations', () => {
    it('should provide actionable recommendations', async () => {
      const report = await tester.runAllTests();
      
      if (report.vulnerabilities.length > 0) {
        expect(report.recommendations.length).toBeGreaterThan(0);
        expect(report.recommendations[0]).toBeDefined();
        expect(typeof report.recommendations[0]).toBe('string');
      }
    });
  });
});

import { PrismaClient } from '@prisma/client/index';
import { authValidator } from '@/lib/testing/auth-validator';
import { aiValidator } from '@/lib/testing/ai-validator';
import { notificationValidator } from '@/lib/testing/notification-validator';
import { securityTester } from '@/lib/security/security-tester';
import { loadTester } from '@/lib/testing/load-tester';
import { systemHealthMonitor } from '@/lib/monitoring/system-health';

export interface ComprehensiveTestReport {
  timestamp: Date;
  overallScore: number;
  systemStatus: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
  reports: {
    auth: any;
    ai: any;
    notifications: any;
    security: any;
    load: any;
    system: any;
  };
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  recommendations: string[];
  readinessScore: number; // 0-100
}

export class ComprehensiveTestRunner {
  private prisma: PrismaClient;
  private baseUrl: string;

  constructor(prisma: PrismaClient, baseUrl: string = 'http://localhost:3000') {
    this.prisma = prisma;
    this.baseUrl = baseUrl;
  }

  async runAllTests(): Promise<ComprehensiveTestReport> {
    console.log('🚀 Starting comprehensive system validation...');
    
    const startTime = Date.now();
    
    try {
      // Run all test suites
      const [
        authReport,
        aiReport,
        notificationReport,
        securityReport,
        loadReport,
        systemHealth
      ] = await Promise.allSettled([
        this.runAuthTests(),
        this.runAITests(),
        this.runNotificationTests(),
        this.runSecurityTests(),
        this.runLoadTests(),
        this.runSystemHealthCheck()
      ]);

      const reports = {
        auth: authReport.status === 'fulfilled' ? authReport.value : null,
        ai: aiReport.status === 'fulfilled' ? aiReport.value : null,
        notifications: notificationReport.status === 'fulfilled' ? notificationReport.value : null,
        security: securityReport.status === 'fulfilled' ? securityReport.value : null,
        load: loadReport.status === 'fulfilled' ? loadReport.value : null,
        system: systemHealth.status === 'fulfilled' ? systemHealth.value : null
      };

      // Calculate overall metrics
      const summary = this.calculateSummary(reports);
      const overallScore = this.calculateOverallScore(reports);
      const systemStatus = this.determineSystemStatus(overallScore);
      const recommendations = this.generateRecommendations(reports);
      const readinessScore = this.calculateReadinessScore(reports);

      const duration = Date.now() - startTime;

      const comprehensiveReport: ComprehensiveTestReport = {
        timestamp: new Date(),
        overallScore,
        systemStatus,
        reports,
        summary,
        recommendations,
        readinessScore
      };

      // Store comprehensive report
      await this.storeComprehensiveReport(comprehensiveReport, duration);

      console.log(`✅ Comprehensive validation completed in ${duration}ms`);
      console.log(`📊 Overall Score: ${overallScore}/100`);
      console.log(`🎯 System Status: ${systemStatus}`);
      console.log(`🚦 Readiness Score: ${readinessScore}/100`);

      return comprehensiveReport;
    } catch (error) {
      console.error('❌ Comprehensive test suite failed:', error);
      throw error;
    }
  }

  private async runAuthTests() {
    console.log('🔐 Running authentication tests...');
    const validator = authValidator(this.prisma, this.baseUrl);
    return await validator.runAuthTests();
  }

  private async runAITests() {
    console.log('🤖 Running AI system tests...');
    const validator = aiValidator(this.prisma, this.baseUrl);
    return await validator.runAITests();
  }

  private async runNotificationTests() {
    console.log('📧 Running notification system tests...');
    const validator = notificationValidator(this.prisma, this.baseUrl);
    return await validator.runNotificationTests();
  }

  private async runSecurityTests() {
    console.log('🛡️ Running security tests...');
    const tester = securityTester(this.prisma, this.baseUrl);
    return await tester.runAllTests();
  }

  private async runLoadTests() {
    console.log('⚡ Running load tests...');
    const tester = loadTester(this.prisma, this.baseUrl);
    return await tester.runLoadTests();
  }

  private async runSystemHealthCheck() {
    console.log('🏥 Running system health check...');
    const monitor = systemHealthMonitor(this.prisma);
    return await monitor.getOverallHealth();
  }

  private calculateSummary(reports: any) {
    const allTests = Object.values(reports).filter(Boolean).flatMap(report => {
      if (report.tests) return report.tests;
      if (report.checks) return report.checks;
      return [];
    });

    const summary = {
      totalTests: allTests.length,
      passed: allTests.filter(t => t.status === 'PASS').length,
      failed: allTests.filter(t => t.status === 'FAIL').length,
      warnings: allTests.filter(t => t.status === 'WARNING').length,
      criticalIssues: allTests.filter(t => t.severity === 'CRITICAL').length,
      highIssues: allTests.filter(t => t.severity === 'HIGH').length,
      mediumIssues: allTests.filter(t => t.severity === 'MEDIUM').length,
      lowIssues: allTests.filter(t => t.severity === 'LOW').length
    };

    return summary;
  }

  private calculateOverallScore(reports: any): number {
    const scores = Object.values(reports).filter(Boolean).map(report => {
      if (report.overallScore) return report.overallScore;
      if (report.score) return report.score;
      return 0;
    });

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  private determineSystemStatus(score: number): 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'NEEDS_IMPROVEMENT' | 'CRITICAL' {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 70) return 'ACCEPTABLE';
    if (score >= 50) return 'NEEDS_IMPROVEMENT';
    return 'CRITICAL';
  }

  private generateRecommendations(reports: any): string[] {
    const allRecommendations = Object.values(reports).filter(Boolean).flatMap(report => {
      if (report.recommendations) return report.recommendations;
      return [];
    });

    return [...new Set(allRecommendations)];
  }

  private calculateReadinessScore(reports: any): number {
    let score = 100;
    
    // Deduct points for critical issues
    const criticalIssues = Object.values(reports).filter(Boolean).flatMap(report => {
      if (report.vulnerabilities) return report.vulnerabilities.filter((v: any) => v.severity === 'CRITICAL');
      if (report.failures) return report.failures.filter((f: any) => f.severity === 'CRITICAL');
      return [];
    });
    
    score -= criticalIssues.length * 20;

    // Deduct points for high issues
    const highIssues = Object.values(reports).filter(Boolean).flatMap(report => {
      if (report.vulnerabilities) return report.vulnerabilities.filter((v: any) => v.severity === 'HIGH');
      if (report.failures) return report.failures.filter((f: any) => f.severity === 'HIGH');
      return [];
    });
    
    score -= highIssues.length * 10;

    // Deduct points for medium issues
    const mediumIssues = Object.values(reports).filter(Boolean).flatMap(report => {
      if (report.vulnerabilities) return report.vulnerabilities.filter((v: any) => v.severity === 'MEDIUM');
      if (report.failures) return report.failures.filter((f: any) => f.severity === 'MEDIUM');
      return [];
    });
    
    score -= mediumIssues.length * 5;

    // Bonus points for excellent performance
    const excellentReports = Object.values(reports).filter(report => 
      report && report.overallScore >= 90
    );
    
    score += excellentReports.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  private async storeComprehensiveReport(report: ComprehensiveTestReport, duration: number) {
    try {
      await this.prisma.comprehensiveTest.create({
        data: {
          overallScore: report.overallScore,
          systemStatus: report.systemStatus,
          readinessScore: report.readinessScore,
          totalTests: report.summary.totalTests,
          passed: report.summary.passed,
          failed: report.summary.failed,
          warnings: report.summary.warnings,
          criticalIssues: report.summary.criticalIssues,
          highIssues: report.summary.highIssues,
          mediumIssues: report.summary.mediumIssues,
          lowIssues: report.summary.lowIssues,
          duration: duration,
          metadata: {
            report: report,
            timestamp: report.timestamp,
            baseUrl: this.baseUrl
          }
        }
      });
    } catch (error) {
      console.error('Failed to store comprehensive report:', error);
    }
  }

  // Quick health check for CI/CD
  async quickHealthCheck(): Promise<{ healthy: boolean; score: number; issues: string[] }> {
    try {
      const monitor = systemHealthMonitor(this.prisma);
      const health = await monitor.getOverallHealth();
      
      const issues = health.checks
        .filter(check => check.status === 'unhealthy')
        .map(check => `${check.service}: ${check.error || 'Unknown error'}`);

      return {
        healthy: health.status === 'healthy',
        score: health.checks.filter(c => c.status === 'healthy').length / health.checks.length * 100,
        issues
      };
    } catch (error) {
      return {
        healthy: false,
        score: 0,
        issues: ['Health check failed']
      };
    }
  }

  // Production readiness check
  async productionReadinessCheck(): Promise<{
    ready: boolean;
    score: number;
    blockers: string[];
    warnings: string[];
  }> {
    const report = await this.runAllTests();
    
    const blockers = report.recommendations.filter(rec => 
      rec.toLowerCase().includes('critical') || 
      rec.toLowerCase().includes('security') ||
      rec.toLowerCase().includes('implement')
    );

    const warnings = report.recommendations.filter(rec => 
      !blockers.includes(rec)
    );

    return {
      ready: report.readinessScore >= 80 && report.summary.criticalIssues === 0,
      score: report.readinessScore,
      blockers,
      warnings
    };
  }
}

// Singleton instance
export const comprehensiveTestRunner = (prisma: PrismaClient, baseUrl?: string) => 
  new ComprehensiveTestRunner(prisma, baseUrl);

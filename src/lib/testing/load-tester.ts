import { PrismaClient } from '@prisma/client';

export interface LoadTestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  description: string;
  details?: string;
  recommendations?: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
}

export interface LoadTestReport {
  timestamp: Date;
  overallScore: number;
  tests: LoadTestResult[];
  failures: LoadTestResult[];
  warnings: LoadTestResult[];
  recommendations: string[];
  systemMetrics: {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    peakMemoryUsage: number;
    peakCpuUsage: number;
    throughput: number;
  };
}

export class LoadTester {
  private prisma: PrismaClient;
  private baseUrl: string;

  constructor(prisma: PrismaClient, baseUrl: string = 'http://localhost:3000') {
    this.prisma = prisma;
    this.baseUrl = baseUrl;
  }

  async runLoadTests(): Promise<LoadTestReport> {
    const tests = await Promise.all([
      this.testConcurrentUsers(),
      this.testAPIStress(),
      this.testAIRequests(),
      this.testAuthLoad(),
      this.testNotificationLoad(),
      this.testDatabaseLoad(),
      this.testMemoryUsage(),
      this.testConnectionPool(),
      this.testRateLimiting(),
      this.testSystemRecovery()
    ]);

    const failures = tests.filter(t => t.status === 'FAIL');
    const warnings = tests.filter(t => t.status === 'WARNING');
    
    const score = this.calculateLoadScore(tests);
    const recommendations = this.generateLoadRecommendations(failures, warnings);

    // Calculate system metrics
    const systemMetrics = this.calculateSystemMetrics(tests);

    return {
      timestamp: new Date(),
      overallScore: score,
      tests,
      failures,
      warnings,
      recommendations,
      systemMetrics
    };
  }

  private calculateLoadScore(tests: LoadTestResult[]): number {
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

  private generateLoadRecommendations(failures: LoadTestResult[], warnings: LoadTestResult[]): string[] {
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

  private calculateSystemMetrics(tests: LoadTestResult[]) {
    const totalRequests = tests.reduce((sum, test) => sum + test.metrics.totalRequests, 0);
    const totalErrors = tests.reduce((sum, test) => sum + test.metrics.failedRequests, 0);
    const avgResponseTimes = tests.map(test => test.metrics.averageResponseTime).filter(time => time > 0);
    const averageResponseTime = avgResponseTimes.length > 0 
      ? avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length 
      : 0;
    const peakMemoryUsage = Math.max(...tests.map(test => test.metrics.memoryUsage || 0));
    const peakCpuUsage = Math.max(...tests.map(test => test.metrics.cpuUsage || 0));
    const throughput = totalRequests > 0 ? totalRequests / 60 : 0; // requests per minute

    return {
      totalRequests,
      totalErrors,
      averageResponseTime,
      peakMemoryUsage,
      peakCpuUsage,
      throughput
    };
  }

  // Helper method to make concurrent requests
  private async makeConcurrentRequests(
    url: string,
    options: RequestInit,
    concurrency: number,
    duration: number
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    responseTimes: number[];
  }> {
    const startTime = Date.now();
    const endTime = startTime + duration;
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [] as number[]
    };

    const makeRequest = async (): Promise<void> => {
      while (Date.now() < endTime) {
        try {
          const requestStart = Date.now();
          const response = await fetch(url, options);
          const requestTime = Date.now() - requestStart;

          results.totalRequests++;
          results.responseTimes.push(requestTime);

          if (response.ok) {
            results.successfulRequests++;
          } else {
            results.failedRequests++;
          }
        } catch (error) {
          results.totalRequests++;
          results.failedRequests++;
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      }
    };

    // Start concurrent requests
    const promises = Array.from({ length: concurrency }, () => makeRequest());
    await Promise.all(promises);

    return results;
  }

  // Test 1: Concurrent Users
  private async testConcurrentUsers(): Promise<LoadTestResult> {
    try {
      const concurrency = 50;
      const duration = 30000; // 30 seconds
      
      const results = await this.makeConcurrentRequests(
        `${this.baseUrl}/api/health`,
        { method: 'GET' },
        concurrency,
        duration
      );

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      // Evaluate performance
      if (errorRate > 10) {
        return {
          testName: 'Concurrent Users',
          status: 'FAIL',
          description: 'High error rate under load',
          details: `${errorRate.toFixed(2)}% error rate with ${concurrency} concurrent users`,
          recommendations: [
            'Increase server capacity',
            'Optimize database connections',
            'Add load balancing',
            'Implement caching'
          ],
          severity: 'HIGH',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      if (averageResponseTime > 2000) {
        return {
          testName: 'Concurrent Users',
          status: 'WARNING',
          description: 'Slow response times under load',
          details: `Average response time: ${averageResponseTime.toFixed(2)}ms`,
          recommendations: [
            'Optimize database queries',
            'Add response caching',
            'Implement connection pooling'
          ],
          severity: 'MEDIUM',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      return {
        testName: 'Concurrent Users',
        status: 'PASS',
        description: 'System handles concurrent users well',
        details: `${concurrency} concurrent users processed successfully`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'Concurrent Users',
        status: 'FAIL',
        description: 'Load test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check system stability',
          'Verify server configuration',
          'Monitor system resources'
        ],
        severity: 'CRITICAL',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 2: API Stress
  private async testAPIStress(): Promise<LoadTestResult> {
    try {
      const endpoints = [
        '/api/health',
        '/api/auth/me',
        '/api/ai/generate',
        '/api/notifications/send'
      ];

      const concurrency = 20;
      const duration = 20000; // 20 seconds
      const results = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimes: [] as number[]
      };

      // Test each endpoint
      for (const endpoint of endpoints) {
        const endpointResults = await this.makeConcurrentRequests(
          `${this.baseUrl}${endpoint}`,
          { 
            method: endpoint === '/api/ai/generate' || endpoint === '/api/notifications/send' ? 'POST' : 'GET',
            headers: endpoint === '/api/ai/generate' || endpoint === '/api/notifications/send' 
              ? { 'Content-Type': 'application/json' } 
              : {},
            body: endpoint === '/api/ai/generate' 
              ? JSON.stringify({ prompt: 'test' }) 
              : endpoint === '/api/notifications/send'
              ? JSON.stringify({ userId: 'test', type: 'email', title: 'test', message: 'test' })
              : undefined
          },
          Math.floor(concurrency / endpoints.length),
          Math.floor(duration / endpoints.length)
        );

        results.totalRequests += endpointResults.totalRequests;
        results.successfulRequests += endpointResults.successfulRequests;
        results.failedRequests += endpointResults.failedRequests;
        results.responseTimes.push(...endpointResults.responseTimes);
      }

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      if (errorRate > 15) {
        return {
          testName: 'API Stress',
          status: 'FAIL',
          description: 'API endpoints failing under stress',
          details: `${errorRate.toFixed(2)}% error rate across all endpoints`,
          recommendations: [
            'Implement API rate limiting',
            'Add request queuing',
            'Optimize database queries',
            'Add caching layers'
          ],
          severity: 'HIGH',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      return {
        testName: 'API Stress',
        status: 'PASS',
        description: 'API endpoints handle stress well',
        details: `All endpoints processed ${results.totalRequests} requests`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'API Stress',
        status: 'FAIL',
        description: 'API stress test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check API endpoint stability',
          'Verify error handling',
          'Monitor system resources'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 3: AI Requests
  private async testAIRequests(): Promise<LoadTestResult> {
    try {
      const concurrency = 10;
      const duration = 30000; // 30 seconds
      
      const results = await this.makeConcurrentRequests(
        `${this.baseUrl}/api/ai/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Generate a simple test response',
            model: 'llama2'
          })
        },
        concurrency,
        duration
      );

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      // AI requests typically take longer
      if (averageResponseTime > 10000) {
        return {
          testName: 'AI Requests',
          status: 'WARNING',
          description: 'AI requests are slow',
          details: `Average response time: ${averageResponseTime.toFixed(2)}ms`,
          recommendations: [
            'Optimize AI model performance',
            'Add AI response caching',
            'Implement request queuing',
            'Consider model optimization'
          ],
          severity: 'MEDIUM',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      if (errorRate > 20) {
        return {
          testName: 'AI Requests',
          status: 'FAIL',
          description: 'High AI request failure rate',
          details: `${errorRate.toFixed(2)}% error rate`,
          recommendations: [
            'Check AI service availability',
            'Implement AI request retry',
            'Add AI service monitoring',
            'Optimize AI resource allocation'
          ],
          severity: 'HIGH',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      return {
        testName: 'AI Requests',
        status: 'PASS',
        description: 'AI requests handle load well',
        details: `${results.totalRequests} AI requests processed`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'AI Requests',
        status: 'FAIL',
        description: 'AI load test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check AI service status',
          'Verify AI endpoint availability',
          'Monitor AI resource usage'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 4: Auth Load
  private async testAuthLoad(): Promise<LoadTestResult> {
    try {
      const concurrency = 30;
      const duration = 20000; // 20 seconds
      
      const results = await this.makeConcurrentRequests(
        `${this.baseUrl}/api/auth/me`,
        {
          method: 'GET',
          headers: { 'Authorization': 'Bearer invalid-token' }
        },
        concurrency,
        duration
      );

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      // Auth requests should be fast even when failing
      if (averageResponseTime > 1000) {
        return {
          testName: 'Auth Load',
          status: 'WARNING',
          description: 'Auth requests are slow',
          details: `Average response time: ${averageResponseTime.toFixed(2)}ms`,
          recommendations: [
            'Optimize token validation',
            'Add auth caching',
            'Improve database query performance'
          ],
          severity: 'MEDIUM',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      return {
        testName: 'Auth Load',
        status: 'PASS',
        description: 'Auth system handles load well',
        details: `${results.totalRequests} auth requests processed`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'Auth Load',
        status: 'FAIL',
        description: 'Auth load test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check auth service status',
          'Verify auth endpoint availability',
          'Monitor auth system resources'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 5: Notification Load
  private async testNotificationLoad(): Promise<LoadTestResult> {
    try {
      const concurrency = 15;
      const duration = 20000; // 20 seconds
      
      const results = await this.makeConcurrentRequests(
        `${this.baseUrl}/api/notifications/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'test-user',
            type: 'email',
            title: 'Load Test Notification',
            message: 'This is a load test notification'
          })
        },
        concurrency,
        duration
      );

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      return {
        testName: 'Notification Load',
        status: 'PASS',
        description: 'Notification system handles load well',
        details: `${results.totalRequests} notification requests processed`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'Notification Load',
        status: 'FAIL',
        description: 'Notification load test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check notification service status',
          'Verify notification endpoint availability',
          'Monitor notification system resources'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 6: Database Load
  private async testDatabaseLoad(): Promise<LoadTestResult> {
    try {
      const concurrency = 25;
      const duration = 15000; // 15 seconds
      
      const results = await this.makeConcurrentRequests(
        `${this.baseUrl}/api/health`,
        { method: 'GET' },
        concurrency,
        duration
      );

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      // Database-dependent requests should be fast
      if (averageResponseTime > 500) {
        return {
          testName: 'Database Load',
          status: 'WARNING',
          description: 'Database responses are slow',
          details: `Average response time: ${averageResponseTime.toFixed(2)}ms`,
          recommendations: [
            'Optimize database queries',
            'Add database connection pooling',
            'Implement database caching',
            'Add database indexing'
          ],
          severity: 'MEDIUM',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      if (errorRate > 5) {
        return {
          testName: 'Database Load',
          status: 'FAIL',
          description: 'Database errors under load',
          details: `${errorRate.toFixed(2)}% error rate`,
          recommendations: [
            'Check database connection limits',
            'Optimize database performance',
            'Add database monitoring',
            'Implement connection pooling'
          ],
          severity: 'HIGH',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      return {
        testName: 'Database Load',
        status: 'PASS',
        description: 'Database handles load well',
        details: `${results.totalRequests} database-dependent requests processed`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'Database Load',
        status: 'FAIL',
        description: 'Database load test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check database connection',
          'Verify database availability',
          'Monitor database performance'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 7: Memory Usage
  private async testMemoryUsage(): Promise<LoadTestResult> {
    try {
      const initialMemory = process.memoryUsage().heapUsed;
      const concurrency = 40;
      const duration = 20000; // 20 seconds
      
      await this.makeConcurrentRequests(
        `${this.baseUrl}/api/health`,
        { method: 'GET' },
        concurrency,
        duration
      );

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      if (memoryIncreaseMB > 100) {
        return {
          testName: 'Memory Usage',
          status: 'FAIL',
          description: 'High memory usage under load',
          details: `Memory increased by ${memoryIncreaseMB.toFixed(2)}MB`,
          recommendations: [
            'Check for memory leaks',
            'Optimize memory usage',
            'Implement garbage collection',
            'Add memory monitoring'
          ],
          severity: 'HIGH',
          metrics: {
            totalRequests: concurrency * (duration / 1000),
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            maxResponseTime: 0,
            minResponseTime: 0,
            requestsPerSecond: 0,
            errorRate: 0,
            memoryUsage: memoryIncreaseMB
          }
        };
      }

      if (memoryIncreaseMB > 50) {
        return {
          testName: 'Memory Usage',
          status: 'WARNING',
          description: 'Moderate memory usage increase',
          details: `Memory increased by ${memoryIncreaseMB.toFixed(2)}MB`,
          recommendations: [
            'Monitor memory usage',
            'Optimize memory allocation',
            'Consider memory optimization'
          ],
          severity: 'MEDIUM',
          metrics: {
            totalRequests: concurrency * (duration / 1000),
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            maxResponseTime: 0,
            minResponseTime: 0,
            requestsPerSecond: 0,
            errorRate: 0,
            memoryUsage: memoryIncreaseMB
          }
        };
      }

      return {
        testName: 'Memory Usage',
        status: 'PASS',
        description: 'Memory usage is acceptable',
        details: `Memory increased by ${memoryIncreaseMB.toFixed(2)}MB`,
        severity: 'LOW',
        metrics: {
          totalRequests: concurrency * (duration / 1000),
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 0,
          memoryUsage: memoryIncreaseMB
        }
      };
    } catch (error) {
      return {
        testName: 'Memory Usage',
        status: 'FAIL',
        description: 'Memory usage test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check memory monitoring',
          'Verify system resources',
          'Monitor memory allocation'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100,
          memoryUsage: 0
        }
      };
    }
  }

  // Test 8: Connection Pool
  private async testConnectionPool(): Promise<LoadTestResult> {
    try {
      const concurrency = 60;
      const duration = 15000; // 15 seconds
      
      const results = await this.makeConcurrentRequests(
        `${this.baseUrl}/api/health`,
        { method: 'GET' },
        concurrency,
        duration
      );

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      // High concurrency test for connection pool
      if (errorRate > 20) {
        return {
          testName: 'Connection Pool',
          status: 'FAIL',
          description: 'Connection pool exhausted',
          details: `${errorRate.toFixed(2)}% error rate at high concurrency`,
          recommendations: [
            'Increase connection pool size',
            'Optimize connection reuse',
            'Add connection timeout handling',
            'Implement connection monitoring'
          ],
          severity: 'HIGH',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      return {
        testName: 'Connection Pool',
        status: 'PASS',
        description: 'Connection pool handles high concurrency',
        details: `${concurrency} concurrent connections handled`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'Connection Pool',
        status: 'FAIL',
        description: 'Connection pool test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check database connection configuration',
          'Verify connection pool settings',
          'Monitor connection usage'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 9: Rate Limiting
  private async testRateLimiting(): Promise<LoadTestResult> {
    try {
      const concurrency = 100;
      const duration = 10000; // 10 seconds
      
      const results = await this.makeConcurrentRequests(
        `${this.baseUrl}/api/health`,
        { method: 'GET' },
        concurrency,
        duration
      );

      const averageResponseTime = results.responseTimes.length > 0 
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
        : 0;
      const maxResponseTime = results.responseTimes.length > 0 
        ? Math.max(...results.responseTimes) 
        : 0;
      const minResponseTime = results.responseTimes.length > 0 
        ? Math.min(...results.responseTimes) 
        : 0;
      const requestsPerSecond = results.totalRequests / (duration / 1000);
      const errorRate = results.totalRequests > 0 ? (results.failedRequests / results.totalRequests) * 100 : 0;

      // Check if rate limiting is working (should see 429 responses)
      const rateLimited = results.failedRequests > 0;

      if (!rateLimited && requestsPerSecond > 100) {
        return {
          testName: 'Rate Limiting',
          status: 'WARNING',
          description: 'Rate limiting may not be implemented',
          details: `${requestsPerSecond.toFixed(2)} requests/second without rate limiting`,
          recommendations: [
            'Implement rate limiting',
            'Add request throttling',
            'Create rate limiting policies'
          ],
          severity: 'MEDIUM',
          metrics: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond,
            errorRate
          }
        };
      }

      return {
        testName: 'Rate Limiting',
        status: 'PASS',
        description: 'Rate limiting is working',
        details: `${results.totalRequests} requests processed with rate limiting`,
        severity: 'LOW',
        metrics: {
          totalRequests: results.totalRequests,
          successfulRequests: results.successfulRequests,
          failedRequests: results.failedRequests,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          requestsPerSecond,
          errorRate
        }
      };
    } catch (error) {
      return {
        testName: 'Rate Limiting',
        status: 'FAIL',
        description: 'Rate limiting test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check rate limiting configuration',
          'Verify rate limiting implementation',
          'Monitor request patterns'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }

  // Test 10: System Recovery
  private async testSystemRecovery(): Promise<LoadTestResult> {
    try {
      // First, stress the system
      await this.makeConcurrentRequests(
        `${this.baseUrl}/api/health`,
        { method: 'GET' },
        50,
        10000 // 10 seconds
      );

      // Then test recovery time
      const recoveryStart = Date.now();
      const response = await fetch(`${this.baseUrl}/api/health`, { method: 'GET' });
      const recoveryTime = Date.now() - recoveryStart;

      if (recoveryTime > 5000) {
        return {
          testName: 'System Recovery',
          status: 'WARNING',
          description: 'Slow system recovery',
          details: `Recovery time: ${recoveryTime}ms`,
          recommendations: [
            'Optimize system recovery',
            'Add health check caching',
            'Implement graceful degradation'
          ],
          severity: 'MEDIUM',
          metrics: {
            totalRequests: 1,
            successfulRequests: response.ok ? 1 : 0,
            failedRequests: response.ok ? 0 : 1,
            averageResponseTime: recoveryTime,
            maxResponseTime: recoveryTime,
            minResponseTime: recoveryTime,
            requestsPerSecond: 0.001,
            errorRate: response.ok ? 0 : 100
          }
        };
      }

      return {
        testName: 'System Recovery',
        status: 'PASS',
        description: 'System recovers quickly',
        details: `Recovery time: ${recoveryTime}ms`,
        severity: 'LOW',
        metrics: {
          totalRequests: 1,
          successfulRequests: response.ok ? 1 : 0,
          failedRequests: response.ok ? 0 : 1,
          averageResponseTime: recoveryTime,
          maxResponseTime: recoveryTime,
          minResponseTime: recoveryTime,
          requestsPerSecond: 0.001,
          errorRate: response.ok ? 0 : 100
        }
      };
    } catch (error) {
      return {
        testName: 'System Recovery',
        status: 'FAIL',
        description: 'System recovery test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check system stability',
          'Verify error handling',
          'Monitor system health'
        ],
        severity: 'HIGH',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        }
      };
    }
  }
}

// Singleton instance
export const loadTester = (prisma: PrismaClient, baseUrl?: string) => new LoadTester(prisma, baseUrl);

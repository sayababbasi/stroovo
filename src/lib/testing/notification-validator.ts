import { PrismaClient } from '@prisma/client';

export interface NotificationTestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  description: string;
  details?: string;
  recommendations?: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  responseTime?: number;
  channel?: string;
}

export interface NotificationTestReport {
  timestamp: Date;
  overallScore: number;
  tests: NotificationTestResult[];
  failures: NotificationTestResult[];
  warnings: NotificationTestResult[];
  recommendations: string[];
  channelMetrics: {
    email: { success: number; failed: number; avgTime: number };
    whatsapp: { success: number; failed: number; avgTime: number };
    push: { success: number; failed: number; avgTime: number };
  };
}

export class NotificationSystemValidator {
  private prisma: PrismaClient;
  private baseUrl: string;

  constructor(prisma: PrismaClient, baseUrl: string = 'http://localhost:3000') {
    this.prisma = prisma;
    this.baseUrl = baseUrl;
  }

  async runNotificationTests(): Promise<NotificationTestReport> {
    const tests = await Promise.all([
      this.testEmailNotification(),
      this.testWhatsAppNotification(),
      this.testPushNotification(),
      this.testBulkNotifications(),
      this.testNotificationQueue(),
      this.testFailureRetry(),
      this.testDuplicatePrevention(),
      this.testNotificationTemplates(),
      this.testNotificationPreferences(),
      this.testNotificationLogging()
    ]);

    const failures = tests.filter(t => t.status === 'FAIL');
    const warnings = tests.filter(t => t.status === 'WARNING');
    
    const score = this.calculateNotificationScore(tests);
    const recommendations = this.generateNotificationRecommendations(failures, warnings);

    // Calculate channel metrics
    const channelMetrics = this.calculateChannelMetrics(tests);

    return {
      timestamp: new Date(),
      overallScore: score,
      tests,
      failures,
      warnings,
      recommendations,
      channelMetrics
    };
  }

  private calculateNotificationScore(tests: NotificationTestResult[]): number {
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

  private generateNotificationRecommendations(failures: NotificationTestResult[], warnings: NotificationTestResult[]): string[] {
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

  private calculateChannelMetrics(tests: NotificationTestResult[]) {
    const emailTests = tests.filter(t => t.channel === 'email');
    const whatsappTests = tests.filter(t => t.channel === 'whatsapp');
    const pushTests = tests.filter(t => t.channel === 'push');

    const calculateMetrics = (channelTests: NotificationTestResult[]) => {
      const success = channelTests.filter(t => t.status === 'PASS').length;
      const failed = channelTests.filter(t => t.status === 'FAIL').length;
      const times = channelTests.filter(t => t.responseTime).map(t => t.responseTime!);
      const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;

      return { success, failed, avgTime };
    };

    return {
      email: calculateMetrics(emailTests),
      whatsapp: calculateMetrics(whatsappTests),
      push: calculateMetrics(pushTests)
    };
  }

  // Test 1: Email Notification
  private async testEmailNotification(): Promise<NotificationTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          type: 'email',
          title: 'Test Email Notification',
          message: 'This is a test email notification',
          priority: 'low'
        })
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        if (data.success || data.id) {
          return {
            testName: 'Email Notification',
            status: 'PASS',
            description: 'Email notification sent successfully',
            details: `Email sent in ${responseTime}ms`,
            responseTime,
            channel: 'email',
            severity: 'LOW'
          };
        }

        return {
          testName: 'Email Notification',
          status: 'FAIL',
          description: 'Email notification response invalid',
          details: 'Response missing success indicator',
          responseTime,
          channel: 'email',
          recommendations: [
            'Check email service configuration',
            'Verify email service integration',
            'Add proper response formatting'
          ],
          severity: 'HIGH'
        };
      }

      if (response.status === 404) {
        return {
          testName: 'Email Notification',
          status: 'WARNING',
          description: 'Email notification endpoint not found',
          details: 'Email functionality may not be implemented',
          responseTime,
          channel: 'email',
          recommendations: [
            'Implement email notification endpoint',
            'Configure email service integration',
            'Add email template system'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Email Notification',
        status: 'FAIL',
        description: 'Email notification failed',
        details: `Status: ${response.status}`,
        responseTime,
        channel: 'email',
        recommendations: [
          'Check email service status',
          'Verify email configuration',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        testName: 'Email Notification',
        status: 'FAIL',
        description: 'Email notification endpoint not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        channel: 'email',
        recommendations: [
          'Check if notification service is running',
          'Verify network connectivity',
          'Check email service configuration'
        ],
        severity: 'CRITICAL'
      };
    }
  }

  // Test 2: WhatsApp Notification
  private async testWhatsAppNotification(): Promise<NotificationTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          type: 'whatsapp',
          title: 'Test WhatsApp Notification',
          message: 'This is a test WhatsApp notification',
          priority: 'medium'
        })
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        if (data.success || data.id) {
          return {
            testName: 'WhatsApp Notification',
            status: 'PASS',
            description: 'WhatsApp notification sent successfully',
            details: `WhatsApp sent in ${responseTime}ms`,
            responseTime,
            channel: 'whatsapp',
            severity: 'LOW'
          };
        }

        return {
          testName: 'WhatsApp Notification',
          status: 'FAIL',
          description: 'WhatsApp notification response invalid',
          details: 'Response missing success indicator',
          responseTime,
          channel: 'whatsapp',
          recommendations: [
            'Check WhatsApp service configuration',
            'Verify WhatsApp API integration',
            'Add proper response formatting'
          ],
          severity: 'HIGH'
        };
      }

      if (response.status === 404) {
        return {
          testName: 'WhatsApp Notification',
          status: 'WARNING',
          description: 'WhatsApp notification endpoint not found',
          details: 'WhatsApp functionality may not be implemented',
          responseTime,
          channel: 'whatsapp',
          recommendations: [
            'Implement WhatsApp notification endpoint',
            'Configure WhatsApp Business API',
            'Add WhatsApp message templates'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'WhatsApp Notification',
        status: 'FAIL',
        description: 'WhatsApp notification failed',
        details: `Status: ${response.status}`,
        responseTime,
        channel: 'whatsapp',
        recommendations: [
          'Check WhatsApp service status',
          'Verify WhatsApp API credentials',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        testName: 'WhatsApp Notification',
        status: 'FAIL',
        description: 'WhatsApp notification endpoint not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        channel: 'whatsapp',
        recommendations: [
          'Check if notification service is running',
          'Verify WhatsApp API connectivity',
          'Check WhatsApp service configuration'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 3: Push Notification
  private async testPushNotification(): Promise<NotificationTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          type: 'push',
          title: 'Test Push Notification',
          message: 'This is a test push notification',
          priority: 'high'
        })
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        if (data.success || data.id) {
          return {
            testName: 'Push Notification',
            status: 'PASS',
            description: 'Push notification sent successfully',
            details: `Push sent in ${responseTime}ms`,
            responseTime,
            channel: 'push',
            severity: 'LOW'
          };
        }

        return {
          testName: 'Push Notification',
          status: 'FAIL',
          description: 'Push notification response invalid',
          details: 'Response missing success indicator',
          responseTime,
          channel: 'push',
          recommendations: [
            'Check push service configuration',
            'Verify push notification service',
            'Add proper response formatting'
          ],
          severity: 'HIGH'
        };
      }

      if (response.status === 404) {
        return {
          testName: 'Push Notification',
          status: 'WARNING',
          description: 'Push notification endpoint not found',
          details: 'Push functionality may not be implemented',
          responseTime,
          channel: 'push',
          recommendations: [
            'Implement push notification endpoint',
            'Configure push notification service',
            'Add device token management'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Push Notification',
        status: 'FAIL',
        description: 'Push notification failed',
        details: `Status: ${response.status}`,
        responseTime,
        channel: 'push',
        recommendations: [
          'Check push service status',
          'Verify push notification credentials',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        testName: 'Push Notification',
        status: 'FAIL',
        description: 'Push notification endpoint not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        channel: 'push',
        recommendations: [
          'Check if notification service is running',
          'Verify push notification connectivity',
          'Check push service configuration'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 4: Bulk Notifications
  private async testBulkNotifications(): Promise<NotificationTestResult> {
    const startTime = Date.now();
    
    try {
      const bulkNotifications = [
        {
          userId: 'user-1',
          type: 'email',
          title: 'Bulk Test 1',
          message: 'This is bulk test notification 1'
        },
        {
          userId: 'user-2',
          type: 'push',
          title: 'Bulk Test 2',
          message: 'This is bulk test notification 2'
        },
        {
          userId: 'user-3',
          type: 'whatsapp',
          title: 'Bulk Test 3',
          message: 'This is bulk test notification 3'
        }
      ];

      const response = await fetch(`${this.baseUrl}/api/notifications/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: bulkNotifications
        })
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        if (data.success || data.processed) {
          return {
            testName: 'Bulk Notifications',
            status: 'PASS',
            description: 'Bulk notifications processed successfully',
            details: `Processed ${bulkNotifications.length} notifications in ${responseTime}ms`,
            responseTime,
            severity: 'LOW'
          };
        }

        return {
          testName: 'Bulk Notifications',
          status: 'FAIL',
          description: 'Bulk notification response invalid',
          details: 'Response missing processing indicator',
          responseTime,
          recommendations: [
            'Check bulk notification processing',
            'Verify queue handling',
            'Add proper response formatting'
          ],
          severity: 'HIGH'
        };
      }

      if (response.status === 404) {
        return {
          testName: 'Bulk Notifications',
          status: 'WARNING',
          description: 'Bulk notification endpoint not found',
          details: 'Bulk functionality may not be implemented',
          responseTime,
          recommendations: [
            'Implement bulk notification endpoint',
            'Add queue processing system',
            'Create batch processing logic'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Bulk Notifications',
        status: 'FAIL',
        description: 'Bulk notifications failed',
        details: `Status: ${response.status}`,
        responseTime,
        recommendations: [
          'Check bulk notification service',
          'Verify queue configuration',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        testName: 'Bulk Notifications',
        status: 'FAIL',
        description: 'Bulk notification endpoint not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        recommendations: [
          'Check if notification service is running',
          'Verify bulk notification endpoint',
          'Check queue service configuration'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 5: Notification Queue
  private async testNotificationQueue(): Promise<NotificationTestResult> {
    try {
      // Test queue status endpoint
      const response = await fetch(`${this.baseUrl}/api/notifications/queue/status`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.queue && typeof data.queue === 'object') {
          return {
            testName: 'Notification Queue',
            status: 'PASS',
            description: 'Notification queue status accessible',
            details: `Queue status: ${JSON.stringify(data.queue)}`,
            severity: 'LOW'
          };
        }

        return {
          testName: 'Notification Queue',
          status: 'FAIL',
          description: 'Queue status response invalid',
          details: 'Response missing queue information',
          recommendations: [
            'Check queue service configuration',
            'Verify queue status endpoint',
            'Add proper queue monitoring'
          ],
          severity: 'HIGH'
        };
      }

      if (response.status === 404) {
        return {
          testName: 'Notification Queue',
          status: 'WARNING',
          description: 'Queue status endpoint not found',
          details: 'Queue monitoring may not be implemented',
          recommendations: [
            'Implement queue status endpoint',
            'Add queue monitoring',
            'Create queue management API'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Notification Queue',
        status: 'FAIL',
        description: 'Queue status check failed',
        details: `Status: ${response.status}`,
        recommendations: [
          'Check queue service status',
          'Verify queue configuration',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      return {
        testName: 'Notification Queue',
        status: 'FAIL',
        description: 'Queue status endpoint not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check if queue service is running',
          'Verify queue endpoint',
          'Check queue configuration'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 6: Failure Retry
  private async testFailureRetry(): Promise<NotificationTestResult> {
    try {
      // Test with invalid user ID to simulate failure
      const response = await fetch(`${this.baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'invalid-user-id',
          type: 'email',
          title: 'Test Failure Retry',
          message: 'This should fail and trigger retry'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if retry mechanism is indicated
        if (data.retryScheduled || data.queued) {
          return {
            testName: 'Failure Retry',
            status: 'PASS',
            description: 'Failure retry mechanism is working',
            details: 'Failed notification scheduled for retry',
            severity: 'LOW'
          };
        }

        return {
          testName: 'Failure Retry',
          status: 'WARNING',
          description: 'Retry mechanism may not be implemented',
          details: 'Failed notification not scheduled for retry',
          recommendations: [
            'Implement retry mechanism',
            'Add exponential backoff',
            'Create retry queue'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Failure Retry',
        status: 'WARNING',
        description: 'Could not test retry mechanism',
        details: 'Endpoint returned error',
        recommendations: [
          'Implement proper failure handling',
          'Add retry logic',
          'Create failure monitoring'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Failure Retry',
        status: 'FAIL',
        description: 'Failed to test retry mechanism',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check notification service status',
          'Verify retry configuration',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 7: Duplicate Prevention
  private async testDuplicatePrevention(): Promise<NotificationTestResult> {
    try {
      const notificationData = {
        userId: 'test-user-id',
        type: 'email',
        title: 'Duplicate Test',
        message: 'This is a duplicate test notification'
      };

      // Send same notification twice
      const [response1, response2] = await Promise.all([
        fetch(`${this.baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData)
        }),
        fetch(`${this.baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData)
        })
      ]);

      if (response1.ok && response2.ok) {
        const [data1, data2] = await Promise.all([
          response1.json(),
          response2.json()
        ]);

        // Check if duplicate was prevented
        if (data1.duplicate || data2.duplicate || data1.id === data2.id) {
          return {
            testName: 'Duplicate Prevention',
            status: 'PASS',
            description: 'Duplicate prevention is working',
            details: 'Duplicate notifications were prevented',
            severity: 'LOW'
          };
        }

        return {
          testName: 'Duplicate Prevention',
          status: 'WARNING',
          description: 'Duplicate prevention may not be implemented',
          details: 'Duplicate notifications were not prevented',
          recommendations: [
            'Implement duplicate detection',
            'Add notification deduplication',
            'Create unique notification keys'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Duplicate Prevention',
        status: 'FAIL',
        description: 'Could not test duplicate prevention',
        details: 'One or both requests failed',
        recommendations: [
          'Check notification service status',
          'Verify duplicate prevention logic',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      return {
        testName: 'Duplicate Prevention',
        status: 'FAIL',
        description: 'Failed to test duplicate prevention',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check notification service status',
          'Verify duplicate prevention configuration',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 8: Notification Templates
  private async testNotificationTemplates(): Promise<NotificationTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/templates`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.templates && Array.isArray(data.templates) && data.templates.length > 0) {
          return {
            testName: 'Notification Templates',
            status: 'PASS',
            description: 'Notification templates are available',
            details: `Found ${data.templates.length} templates`,
            severity: 'LOW'
          };
        }

        return {
          testName: 'Notification Templates',
          status: 'WARNING',
          description: 'No notification templates found',
          details: 'Template system may not be implemented',
          recommendations: [
            'Create notification templates',
            'Implement template engine',
            'Add template management'
          ],
          severity: 'MEDIUM'
        };
      }

      if (response.status === 404) {
        return {
          testName: 'Notification Templates',
          status: 'WARNING',
          description: 'Template endpoint not found',
          details: 'Template system may not be implemented',
          recommendations: [
            'Implement template endpoint',
            'Create template management system',
            'Add template editor'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Notification Templates',
        status: 'FAIL',
        description: 'Template check failed',
        details: `Status: ${response.status}`,
        recommendations: [
          'Check template service status',
          'Verify template configuration',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      return {
        testName: 'Notification Templates',
        status: 'FAIL',
        description: 'Failed to check notification templates',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check template service status',
          'Verify template endpoint',
          'Check template configuration'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 9: Notification Preferences
  private async testNotificationPreferences(): Promise<NotificationTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/preferences/test-user-id`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.preferences && typeof data.preferences === 'object') {
          return {
            testName: 'Notification Preferences',
            status: 'PASS',
            description: 'Notification preferences are accessible',
            details: 'User preferences retrieved successfully',
            severity: 'LOW'
          };
        }

        return {
          testName: 'Notification Preferences',
          status: 'WARNING',
          description: 'Preferences response invalid',
          details: 'Preferences data not properly formatted',
          recommendations: [
            'Check preferences service configuration',
            'Verify preferences endpoint',
            'Add proper response formatting'
          ],
          severity: 'MEDIUM'
        };
      }

      if (response.status === 404) {
        return {
          testName: 'Notification Preferences',
          status: 'WARNING',
          description: 'Preferences endpoint not found',
          details: 'Preferences system may not be implemented',
          recommendations: [
            'Implement preferences endpoint',
            'Create user preference management',
            'Add preference UI'
          ],
          severity: 'MEDIUM'
        };
      }

      return {
        testName: 'Notification Preferences',
        status: 'FAIL',
        description: 'Preferences check failed',
        details: `Status: ${response.status}`,
        recommendations: [
          'Check preferences service status',
          'Verify preferences configuration',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    } catch (error) {
      return {
        testName: 'Notification Preferences',
        status: 'FAIL',
        description: 'Failed to check notification preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check preferences service status',
          'Verify preferences endpoint',
          'Check preferences configuration'
        ],
        severity: 'HIGH'
      };
    }
  }

  // Test 10: Notification Logging
  private async testNotificationLogging(): Promise<NotificationTestResult> {
    try {
      // Check if notification logs are stored
      const logs = await this.prisma.notificationLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      if (logs.length > 0) {
        return {
          testName: 'Notification Logging',
          status: 'PASS',
          description: 'Notification logging is working',
          details: `Found ${logs.length} recent notification logs`,
          severity: 'LOW'
        };
      }

      return {
        testName: 'Notification Logging',
        status: 'WARNING',
        description: 'No notification logs found',
        details: 'Logging system may not be implemented',
        recommendations: [
          'Implement notification logging',
          'Add log retention policy',
          'Create log monitoring'
        ],
        severity: 'MEDIUM'
      };
    } catch (error) {
      return {
        testName: 'Notification Logging',
        status: 'FAIL',
        description: 'Failed to check notification logging',
        details: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [
          'Check logging service status',
          'Verify log table exists',
          'Add proper error handling'
        ],
        severity: 'HIGH'
      };
    }
  }
}

// Singleton instance
export const notificationValidator = (prisma: PrismaClient, baseUrl?: string) => new NotificationSystemValidator(prisma, baseUrl);

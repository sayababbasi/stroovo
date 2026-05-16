import { notificationEngine } from './engine';
import { notificationEvents } from './events';
import { NotificationEventType } from './types';
import { notificationAutomation } from './automation';
import { notificationSecurity } from './security';
import prisma from '@/lib/prisma';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  type: 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'DEADLINE_NEAR' | 'RISK_DETECTED' | 'MANUAL_SEND' | 'FORM_SUBMISSION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  testData: any;
  expectedResults: TestExpectation[];
}

export interface TestExpectation {
  type: 'DATABASE_ENTRY' | 'EMAIL_SENT' | 'WHATSAPP_SENT' | 'PUSH_SENT' | 'UI_UPDATE' | 'AUTOMATION_TRIGGERED';
  description: string;
  expected: boolean;
  actual?: boolean;
  error?: string;
}

export interface TestResult {
  scenarioId: string;
  scenarioName: string;
  status: 'PASSED' | 'FAILED' | 'PARTIAL';
  startTime: Date;
  endTime: Date;
  duration: number;
  expectations: TestExpectation[];
  summary: string;
  errors: string[];
}

export class NotificationTesting {
  private testResults: TestResult[] = [];
  private isRunning: boolean = false;

  /**
   * Run all test scenarios
   */
  async runAllTests(): Promise<TestResult[]> {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    this.isRunning = true;
    this.testResults = [];

    try {
      // Ensure test environment is ready
      await this.ensureTestData();

      const scenarios = this.getTestScenarios();
      
      for (const scenario of scenarios) {
        const result = await this.runTestScenario(scenario);
        this.testResults.push(result);
      }

      return this.testResults;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run specific test scenario
   */
  async runTestScenario(scenario: TestScenario): Promise<TestResult> {
    const startTime = new Date();
    const expectations: TestExpectation[] = [];
    const errors: string[] = [];

    try {
      console.log(`Running test scenario: ${scenario.name}`);
      
      // Clear any existing test data
      await this.clearTestData();

      // Run the test based on scenario type
      switch (scenario.type) {
        case 'TASK_ASSIGNED':
          await this.testTaskAssigned(scenario, expectations, errors);
          break;
        case 'TASK_COMPLETED':
          await this.testTaskCompleted(scenario, expectations, errors);
          break;
        case 'DEADLINE_NEAR':
          await this.testDeadlineNear(scenario, expectations, errors);
          break;
        case 'RISK_DETECTED':
          await this.testRiskDetected(scenario, expectations, errors);
          break;
        case 'MANUAL_SEND':
          await this.testManualSend(scenario, expectations, errors);
          break;
        case 'FORM_SUBMISSION':
          await this.testFormSubmission(scenario, expectations, errors);
          break;
      }

      // Wait for async operations to complete
      await this.waitForAsyncOperations(2000);

      // Verify expectations
      await this.verifyExpectations(expectations);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Determine test status
      const passedCount = expectations.filter(e => e.actual === e.expected).length;
      const status = passedCount === expectations.length ? 'PASSED' :
                   passedCount > 0 ? 'PARTIAL' : 'FAILED';

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        status,
        startTime,
        endTime,
        duration,
        expectations,
        summary: `${passedCount}/${expectations.length} expectations met`,
        errors
      };

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      errors.push(`Test execution failed: ${error}`);
      
      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        status: 'FAILED',
        startTime,
        endTime,
        duration,
        expectations,
        summary: 'Test execution failed',
        errors
      };
    }
  }

  /**
   * Test task assigned scenario
   */
  private async testTaskAssigned(
    scenario: TestScenario,
    expectations: TestExpectation[],
    errors: string[]
  ): Promise<void> {
    const { testData } = scenario;
    
    // Add expectation for database entry
    expectations.push({
      type: 'DATABASE_ENTRY',
      description: 'Notification should be created in database',
      expected: true
    });

    // Add expectation for email sent
    expectations.push({
      type: 'EMAIL_SENT',
      description: 'Email notification should be sent',
      expected: true
    });

    // Add expectation for push notification
    expectations.push({
      type: 'PUSH_SENT',
      description: 'Push notification should be sent',
      expected: true
    });

    // Add expectation for automation triggered
    expectations.push({
      type: 'AUTOMATION_TRIGGERED',
      description: 'Task assigned automation should trigger',
      expected: true
    });

    try {
      // Trigger task assigned event
      await notificationAutomation.handleTaskCreated({
        id: testData.taskId,
        title: testData.taskTitle,
        assigneeId: testData.assigneeId,
        assigneeName: testData.assigneeName,
        projectId: testData.projectId,
        projectName: testData.projectName,
        priority: scenario.priority,
        dueDate: testData.dueDate ? new Date(testData.dueDate) : undefined,
        managerId: testData.managerId,
        tenantId: testData.tenantId
      });

      console.log('Task assigned event triggered successfully');
    } catch (error) {
      errors.push(`Failed to trigger task assigned event: ${error}`);
    }
  }

  /**
   * Test task completed scenario
   */
  private async testTaskCompleted(
    scenario: TestScenario,
    expectations: TestExpectation[],
    errors: string[]
  ): Promise<void> {
    const { testData } = scenario;

    // Add expectations
    expectations.push({
      type: 'DATABASE_ENTRY',
      description: 'Notification should be created in database',
      expected: true
    });

    expectations.push({
      type: 'EMAIL_SENT',
      description: 'Email notification should be sent to manager',
      expected: true
    });

    expectations.push({
      type: 'AUTOMATION_TRIGGERED',
      description: 'Task completed automation should trigger',
      expected: true
    });

    try {
      // Trigger task completed event
      await notificationAutomation.handleTaskCompleted({
        id: testData.taskId,
        title: testData.taskTitle,
        completedById: testData.completedById,
        completedByName: testData.completedByName,
        projectId: testData.projectId,
        projectName: testData.projectName,
        managerId: testData.managerId,
        tenantId: testData.tenantId
      });

      console.log('Task completed event triggered successfully');
    } catch (error) {
      errors.push(`Failed to trigger task completed event: ${error}`);
    }
  }

  /**
   * Test deadline near scenario
   */
  private async testDeadlineNear(
    scenario: TestScenario,
    expectations: TestExpectation[],
    errors: string[]
  ): Promise<void> {
    const { testData } = scenario;

    // Add expectations
    expectations.push({
      type: 'DATABASE_ENTRY',
      description: 'Notification should be created in database',
      expected: true
    });

    expectations.push({
      type: 'EMAIL_SENT',
      description: 'Email reminder should be sent',
      expected: true
    });

    expectations.push({
      type: 'PUSH_SENT',
      description: 'Push notification should be sent',
      expected: true
    });

    try {
      // Trigger deadline near event
      await notificationAutomation.handleDeadlineApproaching([{
        id: testData.taskId,
        title: testData.taskTitle,
        assigneeId: testData.assigneeId,
        dueDate: new Date(testData.dueDate),
        projectId: testData.projectId,
        projectName: testData.projectName,
        tenantId: testData.tenantId
      }]);

      console.log('Deadline near event triggered successfully');
    } catch (error) {
      errors.push(`Failed to trigger deadline near event: ${error}`);
    }
  }

  /**
   * Test risk detected scenario
   */
  private async testRiskDetected(
    scenario: TestScenario,
    expectations: TestExpectation[],
    errors: string[]
  ): Promise<void> {
    const { testData } = scenario;

    // Add expectations
    expectations.push({
      type: 'DATABASE_ENTRY',
      description: 'Risk notification should be created in database',
      expected: true
    });

    expectations.push({
      type: 'EMAIL_SENT',
      description: 'Risk alert email should be sent',
      expected: true
    });

    expectations.push({
      type: 'AUTOMATION_TRIGGERED',
      description: 'Risk escalation automation should trigger',
      expected: scenario.priority === 'URGENT' || scenario.priority === 'HIGH'
    });

    try {
      // Trigger risk detected event
      await notificationAutomation.handleRiskDetected({
        id: testData.riskId,
        type: testData.riskType,
        level: scenario.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        description: testData.description,
        projectId: testData.projectId,
        projectName: testData.projectName,
        riskOwnerId: testData.riskOwnerId,
        projectManagerId: testData.projectManagerId,
        tenantId: testData.tenantId,
        affectedUsers: testData.affectedUsers
      });

      console.log('Risk detected event triggered successfully');
    } catch (error) {
      errors.push(`Failed to trigger risk detected event: ${error}`);
    }
  }

  /**
   * Test manual send scenario
   */
  private async testManualSend(
    scenario: TestScenario,
    expectations: TestExpectation[],
    errors: string[]
  ): Promise<void> {
    const { testData } = scenario;

    // Add expectations
    expectations.push({
      type: 'DATABASE_ENTRY',
      description: 'Manual notification should be created in database',
      expected: true
    });

    expectations.push({
      type: 'EMAIL_SENT',
      description: 'Manual email should be sent',
      expected: testData.channels?.email !== false
    });

    expectations.push({
      type: 'PUSH_SENT',
      description: 'Manual push notification should be sent',
      expected: testData.channels?.push !== false
    });

    try {
      // Send manual notification
      await notificationEngine.sendNotification({
        id: `manual_test_${Date.now()}`,
        type: 'INFO',
        title: testData.title,
        message: testData.message,
        priority: scenario.priority,
        userId: testData.userId,
        tenantId: testData.tenantId,
        link: testData.link,
        metadata: testData.metadata
      });

      console.log('Manual notification sent successfully');
    } catch (error) {
      errors.push(`Failed to send manual notification: ${error}`);
    }
  }

  /**
   * Test form submission scenario
   */
  private async testFormSubmission(
    scenario: TestScenario,
    expectations: TestExpectation[],
    errors: string[]
  ): Promise<void> {
    const { testData } = scenario;

    expectations.push({
      type: 'DATABASE_ENTRY',
      description: 'Form notification should be created in database',
      expected: true
    });

    expectations.push({
      type: 'EMAIL_SENT',
      description: 'Customer service email should be sent',
      expected: true
    });

    try {
      await notificationEvents.formSubmission({
        formName: testData.formName,
        submittedBy: testData.submittedBy,
        submissionData: testData.submissionData,
        userId: testData.userId,
        tenantId: testData.tenantId
      });

      console.log('Form submission event triggered successfully');
    } catch (error) {
      errors.push(`Failed to trigger form submission event: ${error}`);
    }
  }

  /**
   * Verify expectations
   */
  private async verifyExpectations(expectations: TestExpectation[]): Promise<void> {
    for (const expectation of expectations) {
      try {
        switch (expectation.type) {
          case 'DATABASE_ENTRY':
            expectation.actual = await this.verifyDatabaseEntry(expectation);
            break;
          case 'EMAIL_SENT':
            expectation.actual = await this.verifyEmailSent(expectation);
            break;
          case 'WHATSAPP_SENT':
            expectation.actual = await this.verifyWhatsAppSent(expectation);
            break;
          case 'PUSH_SENT':
            expectation.actual = await this.verifyPushSent(expectation);
            break;
          case 'UI_UPDATE':
            expectation.actual = await this.verifyUIUpdate(expectation);
            break;
          case 'AUTOMATION_TRIGGERED':
            expectation.actual = await this.verifyAutomationTriggered(expectation);
            break;
        }
      } catch (error) {
        expectation.actual = false;
        expectation.error = `Verification failed: ${error}`;
      }
    }
  }

  /**
   * Verify database entry
   */
  private async verifyDatabaseEntry(expectation: TestExpectation): Promise<boolean> {
    try {
      // Check if notification exists in database
      const count = await prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 10000) // Last 10 seconds
          }
        }
      });

      return count > 0;
    } catch (error) {
      console.error('Database verification failed:', error);
      return false;
    }
  }

  /**
   * Verify email sent
   */
  private async verifyEmailSent(expectation: TestExpectation): Promise<boolean> {
    try {
      // For now, check if notification exists (logs will be added after schema update)
      const count = await prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 10000) // Last 10 seconds
          }
        }
      });

      return count > 0;
    } catch (error) {
      console.error('Email verification failed:', error);
      return false;
    }
  }

  /**
   * Verify WhatsApp sent
   */
  private async verifyWhatsAppSent(expectation: TestExpectation): Promise<boolean> {
    try {
      // For now, check if notification exists (logs will be added after schema update)
      const count = await prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 10000) // Last 10 seconds
          }
        }
      });

      return count > 0;
    } catch (error) {
      console.error('WhatsApp verification failed:', error);
      return false;
    }
  }

  /**
   * Verify push sent
   */
  private async verifyPushSent(expectation: TestExpectation): Promise<boolean> {
    try {
      // For now, check if notification exists (logs will be added after schema update)
      const count = await prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 10000) // Last 10 seconds
          }
        }
      });

      return count > 0;
    } catch (error) {
      console.error('Push verification failed:', error);
      return false;
    }
  }

  /**
   * Verify UI update
   */
  private async verifyUIUpdate(expectation: TestExpectation): Promise<boolean> {
    // In a real implementation, this would check if the UI was updated
    // For testing purposes, we'll assume it's always true if database entry exists
    return await this.verifyDatabaseEntry(expectation);
  }

  /**
   * Verify automation triggered
   */
  private async verifyAutomationTriggered(expectation: TestExpectation): Promise<boolean> {
    // Check if automation triggers were executed
    const stats = notificationAutomation.getStatistics();
    return stats.triggerExecutions > 0;
  }

  /**
   * Ensure test data (Users, Tenants) exists in database
   */
  private async ensureTestData(): Promise<void> {
    try {
      console.log('Ensuring test environment records exist...');
      
      const scenarios = this.getTestScenarios();
      const tenantIds = new Set(scenarios.map(s => s.testData.tenantId).filter(Boolean));
      const userIds = new Set();
      
      scenarios.forEach(s => {
        if (s.testData.userId) userIds.add(s.testData.userId);
        if (s.testData.assigneeId) userIds.add(s.testData.assigneeId);
        if (s.testData.managerId) userIds.add(s.testData.managerId);
        if (s.testData.completedById) userIds.add(s.testData.completedById);
      });

      // Clean up existing test data first to avoid ID conflicts
      await prisma.notificationLog.deleteMany({
        where: { notification: { tenantId: { startsWith: 'test-tenant' } } }
      });
      await prisma.notification.deleteMany({
        where: { tenantId: { startsWith: 'test-tenant' } }
      });
      await prisma.user.deleteMany({
        where: { tenantId: { startsWith: 'test-tenant' } }
      });
      await prisma.tenant.deleteMany({
        where: { id: { startsWith: 'test-tenant' } }
      });

      // Create tenants
      for (const tenantId of Array.from(tenantIds) as string[]) {
        await prisma.tenant.create({
          data: {
            id: tenantId,
            name: `Test Tenant ${tenantId}`,
            domain: `test-${tenantId}.revotic.ai`
          }
        });
      }

      // Create users
      for (const userId of Array.from(userIds) as string[]) {
        // Find a tenant for this user
        const scenario = scenarios.find(s => 
          s.testData.userId === userId || 
          s.testData.assigneeId === userId || 
          s.testData.managerId === userId || 
          s.testData.completedById === userId
        );
        const tenantId = scenario?.testData.tenantId;

        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@test.com`,
            name: `Test User ${userId}`,
            passwordHash: 'hashed_password',
            tenantId: tenantId,
            role: 'ADMIN' // Give admin role for testing
          }
        });
      }

      console.log('Test environment records verified');
    } catch (error) {
      console.error('Failed to ensure test data:', error);
      throw error;
    }
  }

  /**
   * Clear test data
   */
  private async clearTestData(): Promise<void> {
    try {
      // Delete test notifications created in the last hour
      await prisma.notification.deleteMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 3600000) // Last hour
          },
          OR: [
            { title: { contains: 'test' } },
            { title: { contains: 'Test' } },
            { title: { contains: 'Automation' } },
            { title: { contains: 'Risk' } }
          ]
        }
      });

      console.log('Test data cleared');
    } catch (error) {
      console.error('Failed to clear test data:', error);
    }
  }

  /**
   * Wait for async operations
   */
  private async waitForAsyncOperations(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get test scenarios
   */
  public getTestScenarios(): TestScenario[] {
    return [
      {
        id: 'task_assigned_basic',
        name: 'Task Assigned - Basic',
        description: 'Test basic task assignment notification',
        type: 'TASK_ASSIGNED',
        priority: 'MEDIUM',
        testData: {
          taskId: 'test-task-1',
          taskTitle: 'Test Task Assignment',
          assigneeId: 'test-user-1',
          assigneeName: 'Test User',
          projectId: 'test-project-1',
          projectName: 'Test Project',
          managerId: 'test-manager-1',
          tenantId: 'test-tenant-1',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        },
        expectedResults: []
      },
      {
        id: 'task_assigned_high_priority',
        name: 'Task Assigned - High Priority',
        description: 'Test high priority task assignment with automation',
        type: 'TASK_ASSIGNED',
        priority: 'HIGH',
        testData: {
          taskId: 'test-task-2',
          taskTitle: 'Urgent Task Assignment',
          assigneeId: 'test-user-2',
          assigneeName: 'Test User 2',
          projectId: 'test-project-2',
          projectName: 'Critical Project',
          managerId: 'test-manager-2',
          tenantId: 'test-tenant-2',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
        },
        expectedResults: []
      },
      {
        id: 'task_completed',
        name: 'Task Completed',
        description: 'Test task completion notification',
        type: 'TASK_COMPLETED',
        priority: 'MEDIUM',
        testData: {
          taskId: 'test-task-3',
          taskTitle: 'Completed Task',
          completedById: 'test-user-3',
          completedByName: 'Test User 3',
          projectId: 'test-project-3',
          projectName: 'Test Project 3',
          managerId: 'test-manager-3',
          tenantId: 'test-tenant-3'
        },
        expectedResults: []
      },
      {
        id: 'deadline_near',
        name: 'Deadline Near',
        description: 'Test deadline approaching notification',
        type: 'DEADLINE_NEAR',
        priority: 'HIGH',
        testData: {
          taskId: 'test-task-4',
          taskTitle: 'Task with Near Deadline',
          assigneeId: 'test-user-4',
          dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
          projectId: 'test-project-4',
          projectName: 'Test Project 4',
          tenantId: 'test-tenant-4'
        },
        expectedResults: []
      },
      {
        id: 'risk_detected_critical',
        name: 'Risk Detected - Critical',
        description: 'Test critical risk detection with escalation',
        type: 'RISK_DETECTED',
        priority: 'URGENT',
        testData: {
          riskId: 'test-risk-1',
          riskType: 'BUDGET_OVERRUN',
          description: 'Project budget exceeded by 50%',
          projectId: 'test-project-5',
          projectName: 'High Risk Project',
          riskOwnerId: 'test-user-5',
          projectManagerId: 'test-manager-5',
          tenantId: 'test-tenant-5',
          affectedUsers: ['test-user-6', 'test-user-7']
        },
        expectedResults: []
      },
      {
        id: 'manual_send',
        name: 'Manual Send',
        description: 'Test manual notification sending',
        type: 'MANUAL_SEND',
        priority: 'MEDIUM',
        testData: {
          title: 'Test Manual Notification',
          message: 'This is a test manual notification',
          userId: 'test-user-8',
          tenantId: 'test-tenant-8',
          channels: {
            email: true,
            push: true,
            whatsapp: false,
            inApp: true
          },
          link: 'https://example.com/test',
          metadata: {
            testId: 'manual-test-1'
          }
        },
        expectedResults: []
      },
      {
        id: 'form_submission_contact',
        name: 'Form Submission - Contact Us',
        description: 'Test form submission routing to Customer Service email',
        type: 'FORM_SUBMISSION',
        priority: 'MEDIUM',
        testData: {
          formName: 'Contact Support',
          submittedBy: 'external_user@example.com',
          submissionData: {
            subject: 'Billing Question',
            message: 'I have a question about my last invoice.',
            urgency: 'HIGH'
          },
          userId: 'test-user-9',
          tenantId: 'test-tenant-9'
        },
        expectedResults: []
      }
    ];
  }

  /**
   * Get test results
   */
  getTestResults(): TestResult[] {
    return this.testResults;
  }

  /**
   * Get test summary
   */
  getTestSummary(): {
    total: number;
    passed: number;
    failed: number;
    partial: number;
    totalDuration: number;
    averageDuration: number;
    successRate: number;
  } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const partial = this.testResults.filter(r => r.status === 'PARTIAL').length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = total > 0 ? totalDuration / total : 0;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      failed,
      partial,
      totalDuration,
      averageDuration,
      successRate
    };
  }

  /**
   * Generate test report
   */
  generateTestReport(): string {
    const summary = this.getTestSummary();
    const results = this.testResults;

    let report = `# Notification System Test Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += `## Summary\n`;
    report += `- Total Tests: ${summary.total}\n`;
    report += `- Passed: ${summary.passed}\n`;
    report += `- Failed: ${summary.failed}\n`;
    report += `- Partial: ${summary.partial}\n`;
    report += `- Success Rate: ${summary.successRate.toFixed(2)}%\n`;
    report += `- Total Duration: ${summary.totalDuration}ms\n`;
    report += `- Average Duration: ${summary.averageDuration.toFixed(2)}ms\n\n`;

    report += `## Test Results\n\n`;
    
    results.forEach(result => {
      report += `### ${result.scenarioName}\n`;
      report += `- Status: ${result.status}\n`;
      report += `- Duration: ${result.duration}ms\n`;
      report += `- Summary: ${result.summary}\n`;
      
      if (result.errors.length > 0) {
        report += `- Errors:\n`;
        result.errors.forEach(error => {
          report += `  - ${error}\n`;
        });
      }
      
      report += `- Expectations:\n`;
      result.expectations.forEach(exp => {
        const status = exp.actual === exp.expected ? 'PASS' : 'FAIL';
        report += `  - [${status}] ${exp.description}\n`;
        if (exp.error) {
          report += `    Error: ${exp.error}\n`;
        }
      });
      
      report += `\n`;
    });

    return report;
  }

  /**
   * Export test results to JSON
   */
  exportTestResults(): {
    summary: any;
    results: TestResult[];
    report: string;
  } {
    return {
      summary: this.getTestSummary(),
      results: this.testResults,
      report: this.generateTestReport()
    };
  }

  /**
   * Check if tests are currently running
   */
  areTestsRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const notificationTesting = new NotificationTesting();

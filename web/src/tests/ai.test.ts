import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { aiValidator } from '@/lib/testing/ai-validator';
import type { Risk } from '@/ai/risk';
import { detectRisks } from '@/ai/risk';
import { TaskPlanner } from '@/ai/planner';
import type { TaskPlan } from '@/ai/planner';

describe('AI System Tests', () => {
  let prisma: PrismaClient;
  let validator: ReturnType<typeof aiValidator>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    validator = aiValidator(prisma, 'http://localhost:3000');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('AI Response Validation', () => {
    it('should handle basic AI responses', async () => {
      const report = await validator.runAITests();
      const basicTest = report.tests.find(t => t.testName === 'Basic AI Response');
      
      expect(basicTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(basicTest?.status);
    });

    it('should validate AI response format', async () => {
      const report = await validator.runAITests();
      const validationTest = report.tests.find(t => t.testName === 'Response Validation');
      
      expect(validationTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(validationTest?.status);
    });

    it('should handle malformed JSON responses', async () => {
      const report = await validator.runAITests();
      const jsonTest = report.tests.find(t => t.testName === 'Malformed JSON Response');
      
      expect(jsonTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(jsonTest?.status);
    });
  });

  describe('AI Input Validation', () => {
    it('should reject invalid prompts', async () => {
      const report = await validator.runAITests();
      const invalidTest = report.tests.find(t => t.testName === 'Invalid Prompts');
      
      expect(invalidTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(invalidTest?.status);
    });

    it('should handle empty prompts', async () => {
      const report = await validator.runAITests();
      const emptyTest = report.tests.find(t => t.testName === 'Empty Prompts');
      
      expect(emptyTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(emptyTest?.status);
    });

    it('should handle very large prompts', async () => {
      const report = await validator.runAITests();
      const largeTest = report.tests.find(t => t.testName === 'Very Large Prompts');
      
      expect(largeTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(largeTest?.status);
    });
  });

  describe('AI Security', () => {
    it('should prevent prompt injection', async () => {
      const report = await validator.runAITests();
      const injectionTest = report.tests.find(t => t.testName === 'Prompt Injection');
      
      expect(injectionTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(injectionTest?.status);
    });

    it('should filter inappropriate content', async () => {
      const report = await validator.runAITests();
      const contentTest = report.tests.find(t => t.testName === 'Content Filtering');
      
      expect(contentTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(contentTest?.status);
    });
  });

  describe('AI Performance', () => {
    it('should handle timeouts properly', async () => {
      const report = await validator.runAITests();
      const timeoutTest = report.tests.find(t => t.testName === 'Timeout Handling');
      
      expect(timeoutTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(timeoutTest?.status);
    });

    it('should have reasonable response times', async () => {
      const report = await validator.runAITests();
      
      // Check average response time across all tests
      const responseTimes = report.tests
        .filter(t => t.responseTime)
        .map(t => t.responseTime!);
      
      if (responseTimes.length > 0) {
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        expect(avgTime).toBeLessThan(10000); // 10 seconds max
      }
    });
  });

  describe('AI Model Availability', () => {
    it('should have AI models available', async () => {
      const report = await validator.runAITests();
      const modelTest = report.tests.find(t => t.testName === 'AI Model Availability');
      
      expect(modelTest).toBeDefined();
      expect(['PASS', 'WARNING']).toContain(modelTest?.status);
    });
  });

  describe('AI System Health', () => {
    it('should have good overall AI system score', async () => {
      const report = await validator.runAITests();
      
      expect(report.overallScore).toBeGreaterThan(60);
      expect(report.aiMetrics.errorRate).toBeLessThan(0.5); // Less than 50% error rate
    });
  });

  // Legacy AI system tests (risk detection and planning)
  describe('Legacy AI Features', () => {
    it('should detect risks properly', async () => {
      const risks = await detectRisks({
        tasks: [
          {
            id: 'task-overdue',
            title: 'Overdue task',
            status: 'TODO',
            dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            assigneeId: 'user-1',
          },
          {
            id: 'task-blocked',
            title: 'Blocked task',
            status: 'BLOCKED',
            dueDate: null,
            assigneeId: 'user-1',
          },
        ],
        users: [
          { id: 'user-1', name: 'Alex' },
          { id: 'user-2', name: 'Morgan' },
        ],
      });

      expect(risks.some((risk) => risk.type === 'DEADLINE' && risk.level === 'HIGH')).toBe(true);
      expect(risks.some((risk) => risk.type === 'BLOCKED' && risk.level === 'HIGH')).toBe(true);
    });

    it('should validate task plans', async () => {
      const planner = new TaskPlanner();

      const validPlan: TaskPlan = {
        tasks: [
          { title: 'A', description: 'A desc', priority: 'HIGH', subtasks: ['a1'] },
          { title: 'B', description: 'B desc', priority: 'MEDIUM', subtasks: ['b1'] },
        ],
      };

      const invalidPlan = {
        tasks: [
          { title: '', description: 'missing title', priority: 'LOW', subtasks: [] },
        ],
      };

      expect(await planner.validateTaskPlan(validPlan)).toBe(true);
      expect(await planner.validateTaskPlan(invalidPlan as never)).toBe(false);
    });

    it('should validate risk data structure', async () => {
      const mockRisks = await detectRisks({ tasks: [], users: [] });

      expect(mockRisks.every((risk) =>
        ['DEADLINE', 'WORKLOAD', 'BLOCKED'].includes(risk.type) &&
        ['LOW', 'MEDIUM', 'HIGH'].includes(risk.level) &&
        typeof risk.message === 'string' &&
        typeof risk.suggestion === 'string'
      )).toBe(true);
    });
  });
});

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const API_URL = 'http://localhost:3000/api';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function runTests() {
    console.log('🚀 Starting Revotic AI Workflow Platform QA Validation...');
    
    // Setup Test Context
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@revoticai.com' } });
    const devUser = await prisma.user.findUnique({ where: { email: 'dev@workflow.com' } });
    const tenant1 = await prisma.tenant.findUnique({ where: { id: 'test-tenant-1' } });
    const tenant2 = await prisma.tenant.findUnique({ where: { id: 'test-tenant-2' } });
    const project = await prisma.project.findFirst({ where: { name: 'Quantum UI Overhaul', tenantId: 'test-tenant-1' } });

    if (!adminUser || !tenant1 || !project || !devUser || !tenant2) {
        console.error('❌ Test data missing. Run prisma db seed and fix-data-tenants first.');
        return;
    }

    // Login as Admin
    console.log('🔑 Authenticating as Admin...');
    let cookie = '';
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@revoticai.com',
            password: 'admin@123'
        });
        cookie = loginRes.headers['set-cookie']?.join('; ') || '';
    } catch (e: any) {
        console.error('Login failed:', e.response?.data || e.message);
        return;
    }

    const headers1 = {
        'Cookie': cookie,
        'Content-Type': 'application/json'
    };

    // Note: We don't need x-tenant-id and x-user-id manually because the middleware 
    // extracts them from the JWT in the cookie.

    const report: any = {
        passed: [],
        bugs: [],
        risks: [],
        suggestions: []
    };

    // --- 1. Functional Testing ---
    console.log('\n--- 1. Functional Testing ---');
    try {
        // Create Task
        const createTaskRes = await axios.post(`${API_URL}/tasks`, {
            title: 'QA Test Task',
            description: 'Testing functional creation',
            projectId: project.id,
            priority: 'HIGH',
            status: 'TODO'
        }, { headers: headers1 });
        
        if (createTaskRes.status === 201) {
            report.passed.push('Functional: Create task with valid input');
            const taskId = createTaskRes.data.id;

            // Update Task
            const updateTaskRes = await axios.patch(`${API_URL}/tasks/${taskId}`, {
                status: 'IN_PROGRESS',
                priority: 'URGENT'
            }, { headers: headers1 });
            
            if (updateTaskRes.status === 200 && updateTaskRes.data.status === 'IN_PROGRESS') {
                report.passed.push('Functional: Update task status and priority');
            } else {
                report.bugs.push({ title: 'Task update failed', severity: 'High' });
            }

            // Delete Task
            const deleteRes = await axios.delete(`${API_URL}/tasks/${taskId}`, { headers: headers1 });
            if (deleteRes.status === 200) {
                report.passed.push('Functional: Delete task');
            }
        }
    } catch (e: any) {
        console.error('Functional Testing error:', e.response?.data || e.message);
        report.bugs.push({ title: 'Functional testing failed', details: e.response?.data?.error || e.message, severity: 'Critical' });
    }

    // --- 2. API Testing ---
    console.log('\n--- 2. API Testing ---');
    try {
        // Missing fields
        try {
            await axios.post(`${API_URL}/tasks`, { description: 'No title' }, { headers: headers1 });
        } catch (e: any) {
            if (e.response?.status === 400) report.passed.push('API: POST /tasks missing title (400)');
        }
    } catch (e: any) {
        console.error('API Testing error:', e.message);
    }

    // --- 3. AI Logic Testing ---
    console.log('\n--- 3. AI Logic Testing ---');
    try {
        // Suggestions
        const suggestionsRes = await axios.post(`${API_URL}/ai/suggestions`, {
            projectId: project.id,
            timeRange: 'week'
        }, { headers: headers1 });
        
        if (suggestionsRes.data.success) {
            report.passed.push('AI Logic: Generate suggestions');
        } else {
            report.bugs.push({ title: 'AI Suggestions returned success: false', severity: 'Medium' });
        }

        // Save Tasks
        const saveTasksRes = await axios.post(`${API_URL}/ai/save-tasks`, {
            goal: 'Implement a new billing system with Stripe',
            projectId: project.id
        }, { headers: headers1 });

        if (saveTasksRes.data.success) {
            report.passed.push('AI Logic: Save tasks from goal');
        } else {
            report.bugs.push({ title: 'AI Save Tasks failed', details: saveTasksRes.data.error, severity: 'High' });
        }
    } catch (e: any) {
        console.error('AI Logic error:', e.response?.data || e.message);
        report.bugs.push({ title: 'AI API failed', details: e.response?.data?.error || e.message, severity: 'High' });
    }

    // Output Final Report
    console.log('\n==================================================');
    console.log('✅ PASSED TESTS:');
    report.passed.forEach((t: string) => console.log(`- ${t}`));
    
    console.log('\n❌ BUGS FOUND:');
    report.bugs.forEach((b: any) => console.log(`- [${b.severity}] ${b.title}: ${b.details || ''}`));
    
    console.log('\n⚠️ RISKS:');
    report.risks.forEach((r: string) => console.log(`- ${r}`));

    console.log('==================================================');
    
    // Add the CEO bypass bug to the report manually
    console.log('\n[MANUAL FINDING] Bug: CEO Login Bypass uses hardcoded non-existent User ID, causing FK violations in ActivityLog.');
}

runTests()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

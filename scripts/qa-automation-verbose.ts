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
    console.log('🚀 Starting Revotic AI Workflow Platform QA Validation (Verbose)...');
    
    // Setup Test Context
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@revoticai.com' } });
    const devUser = await prisma.user.findUnique({ where: { email: 'dev@workflow.com' } });
    const tenant1 = await prisma.tenant.findUnique({ where: { id: 'test-tenant-1' } });
    const project = await prisma.project.findFirst({ where: { name: 'Quantum UI Overhaul', tenantId: 'test-tenant-1' } });

    console.log('Context IDs:');
    console.log(`- Admin User ID: ${adminUser?.id}`);
    console.log(`- Dev User ID: ${devUser?.id}`);
    console.log(`- Tenant 1 ID: ${tenant1?.id}`);
    console.log(`- Project ID: ${project?.id}`);

    if (!adminUser || !tenant1 || !project || !devUser) {
        console.error('❌ Test data missing.');
        return;
    }

    // Login to get session
    console.log('🔑 Authenticating as CEO (Bypass)...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'ceo@revoticai.com',
        password: 'any'
    });
    
    const cookie = loginRes.headers['set-cookie']?.join('; ');

    const headers1 = {
        'x-tenant-id': tenant1.id,
        'x-user-id': adminUser.id,
        'Cookie': cookie,
        'Content-Type': 'application/json'
    };

    // --- 1. Functional Testing ---
    console.log('\n--- 1. Functional Testing ---');
    try {
        console.log('Creating task...');
        const createTaskRes = await axios.post(`${API_URL}/tasks`, {
            title: 'QA Test Task',
            description: 'Testing functional creation',
            projectId: project.id,
            priority: 'HIGH',
            status: 'TODO'
        }, { headers: headers1 });
        console.log('Task created:', createTaskRes.data.id);
    } catch (e: any) {
        console.error('Functional Testing error:', JSON.stringify(e.response?.data || e.message, null, 2));
    }
}

runTests()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

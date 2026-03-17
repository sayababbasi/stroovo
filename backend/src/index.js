require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ========== USERS API ==========
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        tasks: true,
                        managedProjects: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await prisma.user.create({
            data: { name, email, password, role }
        });
        res.json(user);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ========== TASKS API ==========
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } },
                subTasks: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, status, priority, type, projectId, assigneeId, dueDate } = req.body;
        const task = await prisma.task.create({
            data: { title, description, status, priority, type, projectId, assigneeId, dueDate }
        });
        res.json(task);
    } catch (error) {
        console.error('Failed to create task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ========== PROJECTS API ==========
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                manager: { select: { id: true, name: true, email: true } },
                _count: { select: { tasks: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, managerId, status, startDate, endDate } = req.body;
        const project = await prisma.project.create({
            data: { name, description, managerId, status, startDate, endDate }
        });
        res.json(project);
    } catch (error) {
        console.error('Failed to create project:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ========== GOALS API ==========
app.get('/api/goals', async (req, res) => {
    try {
        const goals = await prisma.goal.findMany({
            include: {
                owner: { select: { name: true, email: true } },
                projects: { select: { id: true, name: true, status: true } }
            },
            orderBy: { targetDate: 'asc' }
        });
        res.json(goals);
    } catch (error) {
        console.error('Failed to fetch goals:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import teamRoutes from './routes/teams';
import { setupWebSockets } from './sockets';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Stroovo Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);

// WebSocket Setup
setupWebSockets(io);

// Handle Render Sleep (Graceful Shutdown)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Stroovo Backend running on port ${PORT}`);
});

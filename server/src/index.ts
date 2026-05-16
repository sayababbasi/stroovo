import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import teamRoutes from './routes/teams.js';
import { setupWebSockets } from './sockets/index.js';

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
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
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

// Self-Ping mechanism to keep Render free tier awake
const KEEP_ALIVE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes

setInterval(() => {
  console.log(`[Keep-Alive] Pinging ${KEEP_ALIVE_URL}...`);
  fetch(KEEP_ALIVE_URL)
    .then(res => console.log(`[Keep-Alive] Status: ${res.status}`))
    .catch(err => console.error(`[Keep-Alive] Error:`, err.message));
}, KEEP_ALIVE_INTERVAL);

server.listen(PORT, () => {
  console.log(`🚀 Stroovo Backend running on port ${PORT}`);
});

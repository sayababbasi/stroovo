import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import teamRoutes from './routes/teams';
import { setupWebSockets } from './sockets/index';

const allowedOrigins = [
  'http://localhost:3000',
  'https://stroovo.revoticai.com',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || '*');
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};


const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
  }
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Attach io to app for access in routes
app.set('io', io);

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

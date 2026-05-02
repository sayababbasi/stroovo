import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

// ──────────────────────────────────────
// Real-time WebSocket Engine
// ──────────────────────────────────────

let io: SocketIOServer | null = null;

export const initSocketServer = (server: HttpServer) => {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket',
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Allow clients to join rooms (e.g., team-id or tenant-id)
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket] ${socket.id} joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  return io;
};

/**
 * Broadcast an event to a specific room or everyone.
 */
export const broadcast = (event: string, data: any, roomId?: string) => {
  if (!io) {
    console.warn('[Socket] Attempted to broadcast but server not initialized');
    return;
  }

  if (roomId) {
    io.to(roomId).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

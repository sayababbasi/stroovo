import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('[Socket.io] Server already running');
    res.end();
    return;
  }

  console.log('[Socket.io] Initializing server...');
  const httpServer: NetServer = res.socket.server as any;
  const io = new ServerIO(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Simple authentication or user tracking
  io.on('connection', (socket: any) => {
    console.log(`[Socket.io] New connection: ${socket.id}`);

    socket.on('join-team', (teamId: string) => {
      socket.join(`team-${teamId}`);
      console.log(`[Socket.io] ${socket.id} joined team: ${teamId}`);
    });

    socket.on('leave-team', (teamId: string) => {
      socket.leave(`team-${teamId}`);
      console.log(`[Socket.io] ${socket.id} left team: ${teamId}`);
    });

    // Handle other events...
    socket.on('message-sent', (data: any) => {
      if (data.teamId) {
        socket.to(`team-${data.teamId}`).emit('MESSAGE_SENT', data);
      }
    });

    socket.on('task-updated', (data: any) => {
      if (data.teamId) {
        socket.to(`team-${data.teamId}`).emit('TASK_UPDATED', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Connection closed: ${socket.id}`);
    });
  });

  res.socket.server.io = io;
  res.end();
};

export default SocketHandler;

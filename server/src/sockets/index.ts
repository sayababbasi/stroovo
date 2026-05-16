import { Server as SocketIOServer } from 'socket.io';

export const setupWebSockets = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join team/tenant room (supporting both naming conventions)
    socket.on('join-tenant', (tenantId: string) => {
      socket.join(tenantId);
      socket.join(`tenant-${tenantId}`);
      console.log(`Socket ${socket.id} joined tenant ${tenantId}`);
    });

    socket.on('join-team', (teamId: string) => {
      socket.join(teamId);
      socket.join(`tenant-${teamId}`);
      console.log(`Socket ${socket.id} joined team ${teamId}`);
    });

    // Task Events (Matching frontend SocketEvents interface)
    socket.on('task-update', (data: any) => {
      const room = data.teamId || data.tenantId;
      if (room) {
        socket.to(room).to(`tenant-${room}`).emit('TASK_UPDATED', data);
      }
    });

    socket.on('TASK_UPDATED', (data: any) => {
      const room = data.teamId || data.tenantId;
      if (room) {
        socket.to(room).to(`tenant-${room}`).emit('TASK_UPDATED', data);
      }
    });

    // Presence
    socket.on('typing', (data: any) => {
      const room = data.teamId || data.tenantId;
      if (room) {
        socket.to(room).to(`tenant-${room}`).emit('USER_TYPING', data);
      }
    });

    // Chat
    socket.on('message-sent', (data: any) => {
      const room = data.teamId || data.tenantId;
      if (room) {
        socket.to(room).to(`tenant-${room}`).emit('MESSAGE_SENT', data);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

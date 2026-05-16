import { Server as SocketIOServer } from 'socket.io';

export const setupWebSockets = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join tenant-specific room
    socket.on('join-tenant', (tenantId: string) => {
      socket.join(`tenant-${tenantId}`);
      console.log(`Socket ${socket.id} joined room tenant-${tenantId}`);
    });

    // Task Updates
    socket.on('task-update', (data: { tenantId: string, taskId: string, type: string }) => {
      io.to(`tenant-${data.tenantId}`).emit('task-updated', data);
    });

    // Notifications
    socket.on('send-notification', (data: { tenantId: string, userId: string, message: string }) => {
      io.to(`tenant-${data.tenantId}`).emit('new-notification', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

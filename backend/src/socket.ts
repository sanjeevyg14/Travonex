import { Server } from 'socket.io';

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', socket => {
    const userId = socket.handshake.query.userId as string | undefined;
    if (userId) {
      socket.join(userId);
    }
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

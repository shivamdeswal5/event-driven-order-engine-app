import { io, Socket } from 'socket.io-client';

const socketURL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/notifications';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(socketURL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket'], // Force WebSocket protocol
    });
  }
  return socket;
};

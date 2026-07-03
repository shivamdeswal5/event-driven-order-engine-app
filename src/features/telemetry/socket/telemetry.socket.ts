import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getTelemetrySocket(): Socket {
  if (socket?.connected) return socket;

  const url = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8080";
  socket = io(`${url}/notifications`, {
    transports: ["websocket"],
    autoConnect: false,
  });

  return socket;
}

export function closeTelemetrySocket(): void {
  socket?.disconnect();
  socket = null;
}

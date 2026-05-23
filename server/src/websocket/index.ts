import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config/env';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initWebSocket(): void {
  wss = new WebSocketServer({ port: config.wsPort });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to VedaAI' }));
  });

  console.log(`✅ WebSocket server running on port ${config.wsPort}`);
}

export function broadcastToClients(data: object): void {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

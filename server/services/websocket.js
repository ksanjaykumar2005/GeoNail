/**
 * GeoNail Real-Time WebSocket Gateway
 * Handles live bi-directional communication between backend and React command center.
 */

import { WebSocketServer, WebSocket } from 'ws';

class WebSocketGateway {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}. Active clients: ${this.clients.size}`);

      // Send initial connection handshake
      ws.send(JSON.stringify({
        type: 'CONNECTION_ACK',
        timestamp: new Date().toISOString(),
        gateway_id: 'GW-01',
        protocol: 'GEONAIL-WS-V1'
      }));

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (err) {
          console.warn('[WebSocket] Invalid client message:', err.message);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[WebSocket] Client error:', err.message);
        this.clients.delete(ws);
      });
    });
  }

  handleClientMessage(ws, data) {
    if (data.type === 'PING') {
      ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
    }
  }

  broadcast(type, payload) {
    if (!this.wss || this.clients.size === 0) return;

    const message = JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  broadcastTelemetry(telemetryRecord) {
    this.broadcast('TELEMETRY_UPDATE', telemetryRecord);
  }

  broadcastAlert(alertRecord) {
    this.broadcast('ALERT_DISPATCHED', alertRecord);
  }

  broadcastSimulationState(simState) {
    this.broadcast('SIMULATION_STATE', simState);
  }
}

export const wsGateway = new WebSocketGateway();

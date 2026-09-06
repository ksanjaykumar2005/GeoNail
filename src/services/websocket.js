/**
 * GeoNail Client WebSocket Service
 * Provides auto-reconnecting real-time telemetry stream listener.
 */

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.reconnectTimeout = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    // Connect to backend ws on port 3001 in dev or current port if proxied
    const wsUrl = `${protocol}//${host}:3001/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[WebSocket Client] Connected to GeoNail stream');
        this.notifySubscribers({ type: 'STATUS_CHANGE', isConnected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (err) {
          console.warn('[WebSocket Client] Failed to parse message:', err.message);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('[WebSocket Client] Connection closed. Retrying in 3s...');
        this.notifySubscribers({ type: 'STATUS_CHANGE', isConnected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket Client] Connection error:', err);
        if (this.ws) this.ws.close();
      };
    } catch (err) {
      console.warn('[WebSocket Client] Connection failed to initialize:', err.message);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  notifySubscribers(data) {
    for (const callback of this.subscribers) {
      try {
        callback(data);
      } catch (err) {
        console.error('[WebSocket Client] Error in subscriber callback:', err);
      }
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}

export const wsClient = new WebSocketClient();

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

  getWsUrl() {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }

    if (import.meta.env.VITE_API_URL) {
      const apiUrl = import.meta.env.VITE_API_URL.trim();
      const wsProto = apiUrl.startsWith('https:') ? 'wss:' : 'ws:';
      const cleanHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '').replace(/\/$/, '');
      return `${wsProto}//${cleanHost}/ws`;
    }

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const protocol = isHttps ? 'wss:' : 'ws:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001/ws`;
    }

    return `${protocol}//${window.location.host}/ws`;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = this.getWsUrl();

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

/**
 * GeoNail REST API Client
 * Abstraction layer connecting the React UI to backend REST endpoints.
 */

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`)
  : '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Health fetch failed:', err.message);
    return { status: 'OFFLINE', gateway_id: 'GW-01', active_nodes: 8, lora_connected: false };
  }
}

export async function fetchNodes() {
  try {
    const res = await fetch(`${API_BASE}/nodes`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.nodes || [];
  } catch (err) {
    console.warn('[API] Nodes fetch fallback:', err.message);
    return [];
  }
}

export async function fetchLatestTelemetry(nodeId = null) {
  try {
    const url = nodeId ? `${API_BASE}/telemetry/latest?node_id=${nodeId}` : `${API_BASE}/telemetry/latest`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Latest telemetry fetch failed:', err.message);
    return null;
  }
}

export async function fetchTelemetryHistory(nodeId = null, start = null, end = null, limit = 200) {
  try {
    const params = new URLSearchParams();
    if (nodeId) params.append('node_id', nodeId);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (limit) params.append('limit', limit);

    const res = await fetch(`${API_BASE}/telemetry/history?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.history || [];
  } catch (err) {
    console.warn('[API] History fetch failed:', err.message);
    return [];
  }
}

export async function postHardwareTelemetry(telemetryData) {
  try {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetryData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] Ingestion failed:', err.message);
    throw err;
  }
}

export async function fetchAlerts(params = {}) {
  try {
    const searchParams = new URLSearchParams();
    if (params.start) searchParams.append('start', params.start);
    if (params.end) searchParams.append('end', params.end);
    if (params.state) searchParams.append('state', params.state);
    if (params.node_id) searchParams.append('node_id', params.node_id);

    const res = await fetch(`${API_BASE}/alerts?${searchParams.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.alerts || [];
  } catch (err) {
    console.warn('[API] Alerts fetch fallback:', err.message);
    return [];
  }
}

export async function triggerDemoAlertApi(payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/alerts/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] Trigger demo alert failed:', err.message);
    throw err;
  }
}

export const dispatchAlert = triggerDemoAlertApi;


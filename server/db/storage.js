/**
 * GeoNail Time-Series & Relational Storage Engine
 * Clean separation between live hardware telemetry and simulated demo dataset.
 * SIH 2026 Problem Statement: PS 26025
 */

class TimescaleStorageEngine {
  constructor() {
    this.nodes = new Map();
    this.hardwareTelemetryStore = []; // Ingested ONLY from real hardware POST /api/telemetry
    this.demoTelemetryStore = [];     // Populated for demo baseline
    this.alertsStore = [];
    
    this.gatewayStatus = {
      gateway_id: 'GW-01',
      zone_name: 'Extraction Zone',
      is_hardware_connected: false, // True ONLY when actual hardware packets arrive
      last_hardware_packet_time: null,
      total_hardware_packets: 0
    };

    this.initDefaultNodes();
    this.seedDemoData();
  }

  initDefaultNodes() {
    const defaultNodes = [
      { node_id: 'N01', lat: 23.74812, lon: 86.41508, surface_x: -60.0, surface_y: -40.0, elevation_z: 186.2, status: 'NORMAL' },
      { node_id: 'N02', lat: 23.74850, lon: 86.41570, surface_x: -20.0, surface_y: -40.0, elevation_z: 185.9, status: 'NORMAL' },
      { node_id: 'N03', lat: 23.74890, lon: 86.41630, surface_x:  20.0, surface_y: -40.0, elevation_z: 185.5, status: 'NORMAL' },
      { node_id: 'N04', lat: 23.74830, lon: 86.41530, surface_x: -40.0, surface_y:   0.0, elevation_z: 185.8, status: 'NORMAL' },
      { node_id: 'N05', lat: 23.74870, lon: 86.41590, surface_x:   0.0, surface_y:   0.0, elevation_z: 185.2, status: 'NORMAL' },
      { node_id: 'N06', lat: 23.74910, lon: 86.41650, surface_x:  40.0, surface_y:   0.0, elevation_z: 184.8, status: 'NORMAL' },
      { node_id: 'N07', lat: 23.74850, lon: 86.41550, surface_x: -20.0, surface_y:  40.0, elevation_z: 185.4, status: 'NORMAL' },
      { node_id: 'N08', lat: 23.74890, lon: 86.41610, surface_x:  20.0, surface_y:  40.0, elevation_z: 185.1, status: 'NORMAL' }
    ];

    defaultNodes.forEach(n => this.nodes.set(n.node_id, n));
  }

  seedDemoData() {
    const now = Date.now();
    const intervalMs = 2 * 60 * 1000;
    const points = 180;

    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now - i * intervalMs).toISOString();
      const progress = 1 - (i / points);

      for (const [nodeId, node] of this.nodes.entries()) {
        let disp = 0.15;
        let dispRate = 0.02;
        let tiltX = 0.04;
        let tiltY = 0.02;
        let vibRms = 0.03;
        let crackWidth = 0.05;
        let neighborCorr = 0.12;
        let riskScore = 0.15;
        let hazardState = 0;

        if (nodeId === 'N06') {
          disp = 0.35 + (progress * 4.86);
          dispRate = 0.05 + (progress * 1.35);
          tiltX = 0.06 + (progress * 0.56);
          tiltY = 0.03 + (progress * 0.28);
          vibRms = 0.04 + (progress * 0.70);
          crackWidth = 0.10 + (progress * 1.70);
          neighborCorr = 0.20 + (progress * 0.68);
          riskScore = 0.18 + (progress * 0.73);
          hazardState = riskScore >= 0.80 ? 3 : (riskScore >= 0.55 ? 2 : (riskScore >= 0.30 ? 1 : 0));
        } else if (nodeId === 'N07') {
          disp = 0.25 + (progress * 2.85);
          dispRate = 0.04 + (progress * 0.76);
          tiltX = 0.05 + (progress * 0.35);
          tiltY = 0.02 + (progress * 0.18);
          vibRms = 0.03 + (progress * 0.39);
          crackWidth = 0.08 + (progress * 0.87);
          neighborCorr = 0.18 + (progress * 0.57);
          riskScore = 0.16 + (progress * 0.42);
          hazardState = riskScore >= 0.80 ? 3 : (riskScore >= 0.55 ? 2 : (riskScore >= 0.30 ? 1 : 0));
        }

        this.demoTelemetryStore.push({
          id: this.demoTelemetryStore.length + 1,
          timestamp,
          node_id: nodeId,
          tilt_x: Number(tiltX.toFixed(3)),
          tilt_y: Number(tiltY.toFixed(3)),
          displacement: Number(disp.toFixed(3)),
          disp_rate: Number(dispRate.toFixed(3)),
          vibration_rms: Number(vibRms.toFixed(3)),
          dom_frequency: 14.2,
          crack_width: Number(crackWidth.toFixed(2)),
          soil_moisture: 24.2,
          temperature: 28.4,
          neighbor_corr: Number(neighborCorr.toFixed(3)),
          risk_score: Number(riskScore.toFixed(3)),
          hazard_state: hazardState,
          battery_mv: 4120 - Math.floor(progress * 160),
          rssi: -85,
          snr: 9.2
        });
      }
    }
  }

  getNodes() {
    return Array.from(this.nodes.values());
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  // HARDWARE TELEMETRY METHODS (Real data only)
  getLatestHardwareTelemetry(nodeId = null) {
    if (this.hardwareTelemetryStore.length === 0) {
      return null;
    }

    if (nodeId) {
      for (let i = this.hardwareTelemetryStore.length - 1; i >= 0; i--) {
        if (this.hardwareTelemetryStore[i].node_id === nodeId) {
          return this.hardwareTelemetryStore[i];
        }
      }
      return null;
    }

    const latestMap = {};
    for (let i = this.hardwareTelemetryStore.length - 1; i >= 0; i--) {
      const rec = this.hardwareTelemetryStore[i];
      if (!latestMap[rec.node_id]) {
        latestMap[rec.node_id] = rec;
      }
    }
    return Object.values(latestMap);
  }

  getHardwareHistory(nodeId = null, startTime = null, endTime = null, limit = 200) {
    let filtered = this.hardwareTelemetryStore;
    if (filtered.length === 0) return [];

    if (nodeId) {
      filtered = filtered.filter(r => r.node_id === nodeId);
    }
    if (startTime) {
      const startMs = startTime.length === 10 ? new Date(startTime + 'T00:00:00.000Z').getTime() : new Date(startTime).getTime();
      filtered = filtered.filter(r => new Date(r.timestamp).getTime() >= startMs);
    }
    if (endTime) {
      const endMs = endTime.length === 10 ? new Date(endTime + 'T23:59:59.999Z').getTime() : new Date(endTime).getTime();
      filtered = filtered.filter(r => new Date(r.timestamp).getTime() <= endMs);
    }

    return filtered.slice(-limit);
  }

  insertHardwareTelemetry(record) {
    const validated = {
      id: this.hardwareTelemetryStore.length + 1,
      timestamp: record.timestamp || new Date().toISOString(),
      node_id: record.node_id,
      tilt_x: record.tilt_x !== undefined ? Number(record.tilt_x) : null,
      tilt_y: record.tilt_y !== undefined ? Number(record.tilt_y) : null,
      displacement: record.displacement !== undefined ? Number(record.displacement) : null,
      disp_rate: record.disp_rate !== undefined ? Number(record.disp_rate) : null,
      vibration_rms: record.vibration_rms !== undefined ? Number(record.vibration_rms) : null,
      dom_frequency: record.dom_frequency !== undefined ? Number(record.dom_frequency) : null,
      crack_width: record.crack_width !== undefined ? Number(record.crack_width) : null,
      soil_moisture: record.soil_moisture !== undefined ? Number(record.soil_moisture) : null,
      temperature: record.temperature !== undefined ? Number(record.temperature) : null,
      neighbor_corr: record.neighbor_corr !== undefined ? Number(record.neighbor_corr) : null,
      risk_score: record.risk_score !== undefined ? Number(record.risk_score) : null,
      hazard_state: record.hazard_state !== undefined ? Number(record.hazard_state) : 0,
      battery_mv: record.battery_mv !== undefined ? Number(record.battery_mv) : null,
      rssi: record.rssi !== undefined ? Number(record.rssi) : null,
      snr: record.snr !== undefined ? Number(record.snr) : null
    };

    this.hardwareTelemetryStore.push(validated);
    this.gatewayStatus.is_hardware_connected = true;
    this.gatewayStatus.last_hardware_packet_time = validated.timestamp;
    this.gatewayStatus.total_hardware_packets += 1;

    // Update node status
    const statusMap = ['NORMAL', 'WATCH', 'WARNING', 'CRITICAL'];
    const statusText = statusMap[validated.hazard_state] || 'NORMAL';
    const node = this.nodes.get(validated.node_id);
    if (node) {
      node.status = statusText;
      node.last_seen = validated.timestamp;
    }

    return validated;
  }

  // ALERTS MANAGEMENT
  getAlerts(startTime = null, endTime = null, hazardState = null, nodeId = null) {
    let list = [...this.alertsStore];

    if (startTime) {
      const startMs = startTime.length === 10 ? new Date(startTime + 'T00:00:00.000Z').getTime() : new Date(startTime).getTime();
      list = list.filter(a => new Date(a.timestamp).getTime() >= startMs);
    }
    if (endTime) {
      const endMs = endTime.length === 10 ? new Date(endTime + 'T23:59:59.999Z').getTime() : new Date(endTime).getTime();
      list = list.filter(a => new Date(a.timestamp).getTime() <= endMs);
    }
    if (hazardState && hazardState !== 'ALL') {
      list = list.filter(a => a.hazard_state.toUpperCase() === hazardState.toUpperCase());
    }
    if (nodeId && nodeId !== 'ALL') {
      list = list.filter(a => a.node_id === nodeId);
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  insertAlert(alertData) {
    const newAlert = {
      id: this.alertsStore.length + 1,
      timestamp: alertData.timestamp || new Date().toISOString(),
      node_id: alertData.node_id,
      zone: alertData.zone || 'Extraction Zone',
      risk_score: Number(alertData.risk_score || 0.9),
      hazard_state: alertData.state || alertData.hazard_state || 'CRITICAL',
      trigger_reason: alertData.trigger_reason || alertData.message || 'Geotechnical deformation threshold exceeded',
      tilt_deg: alertData.tilt_deg !== undefined ? Number(alertData.tilt_deg) : null,
      displacement_mm: alertData.displacement_mm !== undefined ? Number(alertData.displacement_mm) : null,
      disp_rate_mm_hr: alertData.disp_rate_mm_hr !== undefined ? Number(alertData.disp_rate_mm_hr) : null,
      vibration_rms_g: alertData.vibration_rms_g !== undefined ? Number(alertData.vibration_rms_g) : null,
      crack_width_mm: alertData.crack_width_mm !== undefined ? Number(alertData.crack_width_mm) : null,
      neighbor_corr: alertData.neighbor_corr !== undefined ? Number(alertData.neighbor_corr) : null,
      email_status: alertData.email_status || 'NOT CONFIGURED',
      sms_status: alertData.sms_status || 'NOT CONFIGURED',
      siren_status: alertData.siren_status || 'TRIGGERED',
      message: alertData.message || 'Critical Subsidence Alert',
      acknowledged: false
    };

    this.alertsStore.unshift(newAlert);
    return newAlert;
  }

  getGatewayHealth(heartbeatTimeoutMs = 45000) {
    const now = Date.now();
    const lastTimeMs = this.gatewayStatus.last_hardware_packet_time
      ? new Date(this.gatewayStatus.last_hardware_packet_time).getTime()
      : null;
    const isLive = Boolean(lastTimeMs !== null && (now - lastTimeMs) < heartbeatTimeoutMs);

    // Count nodes that received telemetry within the heartbeat window
    const activeHardwareNodes = new Set();
    if (isLive) {
      for (let i = this.hardwareTelemetryStore.length - 1; i >= 0; i--) {
        const p = this.hardwareTelemetryStore[i];
        if (now - new Date(p.timestamp).getTime() < heartbeatTimeoutMs) {
          activeHardwareNodes.add(p.node_id);
        } else {
          break;
        }
      }
    }

    return {
      ...this.gatewayStatus,
      is_hardware_connected: isLive,
      active_hardware_nodes_count: activeHardwareNodes.size,
      active_nodes: isLive ? activeHardwareNodes.size : 0,
      current_time: new Date().toISOString()
    };
  }
}

export const db = new TimescaleStorageEngine();

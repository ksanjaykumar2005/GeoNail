/**
 * GeoNail REST API Routes
 * Implements clean REST contract for hardware telemetry ingestion, alert management, and data export.
 */

import express from 'express';
import { db } from '../db/storage.js';
import { alertService } from '../services/alertService.js';
import { wsGateway } from '../services/websocket.js';
import Papa from 'papaparse';

const router = express.Router();

// 1. Health check & Gateway diagnostics
router.get('/health', (req, res) => {
  const health = db.getGatewayHealth();
  res.json({
    status: health.is_hardware_connected ? 'ONLINE' : 'STANDBY',
    zone: 'Extraction Zone',
    ...health
  });
});

// 2. Monitored nodes
router.get('/nodes', (req, res) => {
  const nodes = db.getNodes();
  res.json({
    count: nodes.length,
    zone: 'Extraction Zone',
    nodes
  });
});

router.get('/nodes/:id', (req, res) => {
  const node = db.getNode(req.params.id.toUpperCase());
  if (!node) {
    return res.status(404).json({ error: `Node ${req.params.id} not found` });
  }
  const latest = db.getLatestHardwareTelemetry(node.node_id);
  res.json({
    ...node,
    latest_telemetry: latest
  });
});

// 3. Telemetry endpoints (Hardware Mode)
router.get('/telemetry/latest', (req, res) => {
  const { node_id } = req.query;
  const latest = db.getLatestHardwareTelemetry(node_id ? node_id.toUpperCase() : null);
  res.json(latest || null);
});

router.get('/telemetry/history', (req, res) => {
  const { node_id, start, end, limit = 200 } = req.query;
  const history = db.getHardwareHistory(node_id ? node_id.toUpperCase() : null, start, end, Number(limit));
  res.json({
    count: history.length,
    node_id: node_id || 'ALL',
    history
  });
});

// 4. Ingest Hardware Telemetry
router.post('/telemetry', (req, res) => {
  const payload = req.body;
  if (!payload || !payload.node_id) {
    return res.status(400).json({ error: 'Missing required field: node_id' });
  }

  const record = db.insertHardwareTelemetry(payload);

  // Broadcast to all WebSocket listeners in real-time
  wsGateway.broadcastTelemetry(record);

  // Check if critical threshold exceeded (Risk >= 0.80 or Hazard State == 3)
  if (record.risk_score >= 0.80 || record.hazard_state === 3) {
    const alertData = {
      node_id: record.node_id,
      zone: 'Extraction Zone',
      risk_score: record.risk_score,
      state: 'CRITICAL',
      trigger_reason: `Hardware Alert: Disp Rate ${record.disp_rate} mm/hr, Displacement ${record.displacement} mm`,
      tilt_deg: record.tilt_x != null && record.tilt_y != null ? Math.sqrt(Math.pow(record.tilt_x, 2) + Math.pow(record.tilt_y, 2)) : null,
      displacement_mm: record.displacement,
      disp_rate_mm_hr: record.disp_rate,
      vibration_rms_g: record.vibration_rms,
      crack_width_mm: record.crack_width,
      neighbor_corr: record.neighbor_corr,
      message: `Critical surface subsidence detected at node ${record.node_id}`
    };

    alertService.dispatchEmergencyAlert(alertData).then(dispatchResult => {
      const storedAlert = db.insertAlert({
        ...alertData,
        email_status: dispatchResult.email,
        sms_status: dispatchResult.sms,
        siren_status: 'TRIGGERED'
      });
      wsGateway.broadcastAlert(storedAlert);
    });
  }

  res.status(201).json({
    status: 'INGESTED',
    record_id: record.id,
    timestamp: record.timestamp,
    node_id: record.node_id
  });
});

// 5. Alerts & Incident Management
router.get('/alerts', (req, res) => {
  const { start, end, state, node_id } = req.query;
  const alerts = db.getAlerts(start, end, state, node_id);
  res.json({
    count: alerts.length,
    alerts
  });
});

router.post('/alerts', async (req, res) => {
  const alertPayload = req.body;
  if (!alertPayload || !alertPayload.node_id) {
    return res.status(400).json({ error: 'Missing required field: node_id' });
  }

  // Dispatch Email + SMS
  const dispatchResult = await alertService.dispatchEmergencyAlert(alertPayload);

  // Store in database
  const alertRecord = db.insertAlert({
    ...alertPayload,
    email_status: dispatchResult.email,
    sms_status: dispatchResult.sms,
    siren_status: 'TRIGGERED'
  });

  // Broadcast to UI
  wsGateway.broadcastAlert(alertRecord);

  res.status(201).json({
    status: 'DISPATCHED',
    alert_id: alertRecord.id,
    ...dispatchResult
  });
});

// 5b. Dedicated Demo Alert Endpoint
router.post('/alerts/demo', async (req, res) => {
  const demoPayload = {
    node_id: req.body.node_id || 'N06',
    zone: 'Surface Monitoring Zone',
    risk_score: req.body.risk_score || 0.91,
    state: 'CRITICAL',
    hazard_state: 'CRITICAL',
    trigger_reason: 'DEMONSTRATION ALERT: Rapid surface ground displacement detected at extraction perimeter',
    tilt_deg: 0.62,
    displacement_mm: 5.21,
    disp_rate_mm_hr: 1.40,
    vibration_rms_g: 0.74,
    crack_width_mm: 1.80,
    neighbor_corr: 0.88,
    message: 'GeoNail Critical Subsidence Alert - Node N06',
    is_demo: true
  };

  const dispatchResult = await alertService.dispatchEmergencyAlert(demoPayload);

  const storedAlert = db.insertAlert({
    ...demoPayload,
    email_status: dispatchResult.email,
    sms_status: dispatchResult.sms,
    siren_status: 'TRIGGERED'
  });

  wsGateway.broadcastAlert(storedAlert);

  res.status(201).json({
    status: 'DISPATCHED',
    alert: storedAlert,
    email: dispatchResult.email,
    sms: dispatchResult.sms,
    email_details: dispatchResult.email_details,
    sms_details: dispatchResult.sms_details
  });
});

// 6. CSV Data Export Endpoints
router.get('/export/telemetry', (req, res) => {
  const { node_id, start, end } = req.query;
  const history = db.getHardwareHistory(node_id ? node_id.toUpperCase() : null, start, end, 1000);

  if (history.length === 0) {
    return res.status(200).send('No telemetry records found for the selected criteria.');
  }

  const formattedRows = history.map(r => ({
    timestamp: r.timestamp,
    node_id: r.node_id,
    displacement_mm: r.displacement != null ? r.displacement.toFixed(3) : '--',
    disp_rate_mm_hr: r.disp_rate != null ? r.disp_rate.toFixed(3) : '--',
    tilt_x_deg: r.tilt_x != null ? r.tilt_x.toFixed(3) : '--',
    tilt_y_deg: r.tilt_y != null ? r.tilt_y.toFixed(3) : '--',
    vibration_rms_g: r.vibration_rms != null ? r.vibration_rms.toFixed(3) : '--',
    dom_frequency_hz: r.dom_frequency != null ? r.dom_frequency.toFixed(1) : '--',
    crack_width_mm: r.crack_width != null ? r.crack_width.toFixed(2) : '--',
    soil_moisture_pct: r.soil_moisture != null ? r.soil_moisture.toFixed(1) : '--',
    temperature_c: r.temperature != null ? r.temperature.toFixed(1) : '--',
    neighbor_corr: r.neighbor_corr != null ? r.neighbor_corr.toFixed(3) : '--',
    risk_score: r.risk_score != null ? r.risk_score.toFixed(3) : '--',
    hazard_state: r.hazard_state
  }));

  const csvContent = Papa.unparse(formattedRows);
  const nodeStr = node_id || 'ALL';
  const filename = `geonail-telemetry-${nodeStr}-${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvContent);
});

router.get('/export/alerts', (req, res) => {
  const { start, end, node_id, state } = req.query;
  const alerts = db.getAlerts(start, end, state, node_id);

  if (alerts.length === 0) {
    return res.status(200).send('No alert records found for the selected criteria.');
  }

  const formattedRows = alerts.map(a => ({
    timestamp: a.timestamp,
    node_id: a.node_id,
    zone: a.zone || 'Extraction Zone',
    risk_score: a.risk_score != null ? a.risk_score.toFixed(3) : '--',
    hazard_state: a.hazard_state,
    tilt_deg: a.tilt_deg != null ? a.tilt_deg.toFixed(3) : '--',
    displacement_mm: a.displacement_mm != null ? a.displacement_mm.toFixed(3) : '--',
    disp_rate_mm_hr: a.disp_rate_mm_hr != null ? a.disp_rate_mm_hr.toFixed(3) : '--',
    vibration_rms_g: a.vibration_rms_g != null ? a.vibration_rms_g.toFixed(3) : '--',
    crack_width_mm: a.crack_width_mm != null ? a.crack_width_mm.toFixed(2) : '--',
    neighbor_corr: a.neighbor_corr != null ? a.neighbor_corr.toFixed(3) : '--',
    email_status: a.email_status,
    sms_status: a.sms_status,
    alert_action: a.siren_status || 'TRIGGERED',
    trigger_reason: a.trigger_reason
  }));

  const csvContent = Papa.unparse(formattedRows);

  const startDateStr = start || 'all';
  const endDateStr = end || new Date().toISOString().split('T')[0];
  const filename = `geonail-alerts-${startDateStr}-to-${endDateStr}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvContent);
});

export default router;

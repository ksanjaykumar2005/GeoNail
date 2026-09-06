/**
 * GeoNail Geotechnical CSV Export Utility
 * Generates standards-compliant regulatory export files for Mine Safety Audits.
 */

import Papa from 'papaparse';
import { format } from 'date-fns';

export function exportAlertsToCSV(alertsList, startDate = null, endDate = null, customFilename = null) {
  if (!alertsList || alertsList.length === 0) {
    alert('No alert records found for the selected criteria.');
    return;
  }

  const rows = alertsList.map(a => ({
    timestamp: a.timestamp,
    node_id: a.node_id,
    zone: a.zone || 'Extraction Zone',
    risk_score: Number(a.risk_score).toFixed(3),
    hazard_state: a.hazard_state,
    tilt_deg: a.tilt_deg !== undefined && a.tilt_deg !== null ? Number(a.tilt_deg).toFixed(3) : '--',
    displacement_mm: a.displacement_mm !== undefined && a.displacement_mm !== null ? Number(a.displacement_mm).toFixed(3) : '--',
    disp_rate_mm_hr: a.disp_rate_mm_hr !== undefined && a.disp_rate_mm_hr !== null ? Number(a.disp_rate_mm_hr).toFixed(3) : '--',
    vibration_rms_g: a.vibration_rms_g !== undefined && a.vibration_rms_g !== null ? Number(a.vibration_rms_g).toFixed(3) : '--',
    crack_width_mm: a.crack_width_mm !== undefined && a.crack_width_mm !== null ? Number(a.crack_width_mm).toFixed(2) : '--',
    neighbor_corr: a.neighbor_corr !== undefined && a.neighbor_corr !== null ? Number(a.neighbor_corr).toFixed(3) : '--',
    email_status: a.email_status || 'NOT CONFIGURED',
    sms_status: a.sms_status || 'NOT CONFIGURED',
    alert_action: a.siren_status || 'TRIGGERED',
    trigger_reason: a.trigger_reason || a.message || 'Geotechnical deformation threshold triggered'
  }));

  const csv = Papa.unparse(rows, {
    quotes: true,
    header: true
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const startStr = startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '2026-09-01';
  const endStr = endDate ? format(new Date(endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const filename = customFilename || `geonail-alerts-${startStr}-to-${endStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTelemetryToCSV(telemetryList, nodeId = 'ALL', filename = null) {
  if (!telemetryList || telemetryList.length === 0) {
    alert('No telemetry data available to export.');
    return;
  }

  const rows = telemetryList.map(t => ({
    timestamp: t.timestamp,
    node_id: t.node_id,
    tilt_x_deg: t.tilt_x != null ? Number(t.tilt_x).toFixed(3) : '--',
    tilt_y_deg: t.tilt_y != null ? Number(t.tilt_y).toFixed(3) : '--',
    displacement_mm: t.displacement != null ? Number(t.displacement).toFixed(3) : '--',
    disp_rate_mm_hr: t.disp_rate != null ? Number(t.disp_rate).toFixed(3) : '--',
    vibration_rms_g: t.vibration_rms != null ? Number(t.vibration_rms).toFixed(3) : '--',
    dom_frequency_hz: t.dom_frequency != null ? Number(t.dom_frequency).toFixed(2) : '--',
    crack_width_mm: t.crack_width != null ? Number(t.crack_width).toFixed(2) : '--',
    soil_moisture_pct: t.soil_moisture != null ? Number(t.soil_moisture).toFixed(2) : '--',
    temperature_c: t.temperature != null ? Number(t.temperature).toFixed(2) : '--',
    neighbor_corr: t.neighbor_corr != null ? Number(t.neighbor_corr).toFixed(3) : '--',
    risk_score: t.risk_score != null ? Number(t.risk_score).toFixed(3) : '--',
    hazard_state: t.hazard_state != null ? t.hazard_state : '--',
    battery_mv: t.battery_mv != null ? t.battery_mv : '--',
    rssi_dbm: t.rssi != null ? t.rssi : '--',
    snr_db: t.snr != null ? t.snr : '--'
  }));

  const csv = Papa.unparse(rows, { quotes: true, header: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const nowStr = format(new Date(), 'yyyy-MM-dd_HHmm');
  const finalName = filename || `geonail-telemetry-${nodeId}-${nowStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', finalName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

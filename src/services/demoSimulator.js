/**
 * GeoNail Geotechnical Demo Simulation Engine
 * Correlated multi-node subsidence progression for monitored mine extraction zone.
 * SIH 2026 Problem Statement: PS 26025
 */

import { dispatchAlert } from './api';

export const SIMULATION_STAGES = [
  { id: 0, label: 'T0: System Baseline Normal', description: 'All 8 monitoring stations report nominal baseline conditions (<0.20 mm displacement, <0.10° tilt).', durationSec: 7 },
  { id: 1, label: 'T1: N04 Enters WATCH', description: 'Initial tilt inflection (0.22°) detected at western boundary station N04.', durationSec: 7 },
  { id: 2, label: 'T2: N06 Displacement Rising', description: 'Primary central station N06 records rising displacement velocity (0.45 mm/hr).', durationSec: 7 },
  { id: 3, label: 'T3: N07 Coupled Movement', description: 'Southern boundary station N07 begins tracking synchronized downward displacement.', durationSec: 7 },
  { id: 4, label: 'T4: Spatial Correlation Escalation', description: 'Cross-node Pearson correlation between N04-N06-N07 exceeds 0.75.', durationSec: 7 },
  { id: 5, label: 'T5: Risk Transitions to WARNING', description: 'Multi-sensor risk fusion engine triggers WARNING state across extraction zone.', durationSec: 7 },
  { id: 6, label: 'T6: Regional Deformation Increases', description: 'Micro-seismic vibration bursts (0.45g) and surface tensile crack widening (0.90 mm).', durationSec: 7 },
  { id: 7, label: 'T7: N06 Accelerates to CRITICAL', description: 'N06 reaches 5.21 mm displacement, 1.40 mm/hr acceleration rate, 0.62° tilt.', durationSec: 7 },
  { id: 8, label: 'T8: Critical Emergency Alert Triggered', description: 'Automated early warning engine raises Risk 0.91 CRITICAL alarm.', durationSec: 7 },
  { id: 9, label: 'T9: Automated Email & SMS Dispatch', description: 'Emergency notifications attempted to safety officer (phoenix.team0091@gmail.com).', durationSec: 7 },
  { id: 10, label: 'T10: 3D Subsidence Bowl Deepens', description: 'Sub-surface void causes visible surface depression bowl over extraction center.', durationSec: 7 },
  { id: 11, label: 'T11: Risk Heatmap Expands', description: 'Regional subsidence contours encompass entire extraction perimeter.', durationSec: 7 }
];

export class DemoSimulator {
  constructor(onUpdateCallback, onAlertCallback) {
    this.onUpdate = onUpdateCallback;
    this.onAlert = onAlertCallback;
    this.isRunning = false;
    this.stage = 0;
    this.progressInStage = 0; // 0.0 to 1.0
    this.speed = 1.0;
    this.timerId = null;
    this.lastTickTime = Date.now();
    this.alertTriggeredForStage = new Set();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTickTime = Date.now();
    this.tick();
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  reset() {
    this.pause();
    this.stage = 0;
    this.progressInStage = 0;
    this.alertTriggeredForStage.clear();
    this.emitState();
  }

  setStage(stageIndex) {
    this.stage = Math.max(0, Math.min(SIMULATION_STAGES.length - 1, stageIndex));
    this.progressInStage = 0;
    this.emitState();
  }

  setSpeed(multiplier) {
    this.speed = Math.max(0.5, Math.min(10.0, multiplier));
  }

  stepForward() {
    this.stage = (this.stage + 1) % SIMULATION_STAGES.length;
    this.progressInStage = 0;
    this.emitState();
  }

  tick() {
    if (!this.isRunning) return;

    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;

    const currentStageDef = SIMULATION_STAGES[this.stage];
    const stageDuration = (currentStageDef?.durationSec || 7) / this.speed;

    this.progressInStage += dt / stageDuration;

    if (this.progressInStage >= 1.0) {
      this.progressInStage = 0;
      if (this.stage < SIMULATION_STAGES.length - 1) {
        this.stage += 1;
      } else {
        // Stay in final stage (Continuous critical monitoring)
        this.stage = SIMULATION_STAGES.length - 1;
        this.progressInStage = 1.0;
      }
    }

    this.emitState();

    this.timerId = setTimeout(() => this.tick(), 250);
  }

  getGlobalProgress() {
    const totalStages = SIMULATION_STAGES.length;
    return (this.stage + this.progressInStage) / totalStages;
  }

  generateCorrelatedTelemetry(nodeId, progress) {
    // Progress is 0.0 at T0 to 1.0 at T11
    const p = Math.min(1.0, Math.max(0.0, progress));
    const noise = (Math.sin(Date.now() / 1500 + nodeId.charCodeAt(1)) * 0.02);

    let disp = 0.15 + noise;
    let dispRate = 0.02;
    let tiltX = 0.04 + noise;
    let tiltY = 0.02 + noise;
    let vibRms = 0.03 + Math.abs(noise);
    let crackWidth = 0.05;
    let neighborCorr = 0.12;
    let riskScore = 0.15;
    let hazardState = 0; // NORMAL

    if (nodeId === 'N06') {
      // Primary subsidence epicentre
      if (p > 0.15) {
        const factor = (p - 0.15) / 0.85; // 0 to 1
        disp = 0.35 + (factor * 4.86) + noise; // Reaches 5.21 mm
        dispRate = 0.05 + (factor * 1.35); // Reaches 1.40 mm/hr
        tiltX = 0.06 + (factor * 0.56); // Reaches 0.62°
        tiltY = 0.03 + (factor * 0.28); // Reaches 0.31°
        vibRms = 0.04 + (factor * 0.70) + (factor > 0.6 ? Math.abs(Math.sin(Date.now() / 300) * 0.15) : 0); // Reaches 0.74 g
        crackWidth = 0.10 + (factor * 1.70); // Reaches 1.80 mm
        neighborCorr = 0.20 + (factor * 0.68); // Reaches 0.88
        riskScore = 0.18 + (factor * 0.73); // Reaches 0.91
        hazardState = riskScore >= 0.80 ? 3 : (riskScore >= 0.55 ? 2 : (riskScore >= 0.30 ? 1 : 0));
      }
    } else if (nodeId === 'N07') {
      // Secondary affected southern node
      if (p > 0.25) {
        const factor = (p - 0.25) / 0.75;
        disp = 0.25 + (factor * 2.85) + noise; // Reaches 3.10 mm
        dispRate = 0.04 + (factor * 0.76); // Reaches 0.80 mm/hr
        tiltX = 0.05 + (factor * 0.35); // Reaches 0.40°
        tiltY = 0.02 + (factor * 0.18);
        vibRms = 0.03 + (factor * 0.39); // Reaches 0.42 g
        crackWidth = 0.08 + (factor * 0.87); // Reaches 0.95 mm
        neighborCorr = 0.18 + (factor * 0.57); // Reaches 0.75
        riskScore = 0.16 + (factor * 0.42); // Reaches 0.58 (WARNING)
        hazardState = riskScore >= 0.80 ? 3 : (riskScore >= 0.55 ? 2 : (riskScore >= 0.30 ? 1 : 0));
      }
    } else if (nodeId === 'N04') {
      // Early indicator western edge node
      if (p > 0.08) {
        const factor = (p - 0.08) / 0.92;
        disp = 0.20 + (factor * 1.70) + noise; // Reaches 1.90 mm
        dispRate = 0.03 + (factor * 0.37); // Reaches 0.40 mm/hr
        tiltX = 0.04 + (factor * 0.23); // Reaches 0.27°
        tiltY = 0.02 + (factor * 0.11);
        vibRms = 0.02 + (factor * 0.19); // Reaches 0.21 g
        crackWidth = 0.05 + (factor * 0.45); // Reaches 0.50 mm
        neighborCorr = 0.15 + (factor * 0.45); // Reaches 0.60
        riskScore = 0.15 + (factor * 0.33); // Reaches 0.48 (WATCH)
        hazardState = riskScore >= 0.80 ? 3 : (riskScore >= 0.55 ? 2 : (riskScore >= 0.30 ? 1 : 0));
      }
    } else if (nodeId === 'N05') {
      // Mine center buffer
      if (p > 0.4) {
        const factor = (p - 0.4) / 0.6;
        disp = 0.18 + (factor * 0.95) + noise;
        dispRate = 0.03 + (factor * 0.22);
        tiltX = 0.04 + (factor * 0.14);
        vibRms = 0.03 + (factor * 0.12);
        riskScore = 0.15 + (factor * 0.18);
        hazardState = riskScore >= 0.30 ? 1 : 0;
      }
    }

    return {
      timestamp: new Date().toISOString(),
      node_id: nodeId,
      tilt_x: Number(tiltX.toFixed(3)),
      tilt_y: Number(tiltY.toFixed(3)),
      displacement: Number(Math.max(0, disp).toFixed(3)),
      disp_rate: Number(Math.max(0, dispRate).toFixed(3)),
      vibration_rms: Number(Math.max(0.01, vibRms).toFixed(3)),
      dom_frequency: Number((13.8 + Math.sin(Date.now() / 2000) * 1.5).toFixed(2)),
      crack_width: Number(Math.max(0, crackWidth).toFixed(2)),
      soil_moisture: Number((24.2 + (Math.sin(Date.now() / 5000) * 1.1)).toFixed(2)),
      temperature: Number((28.4 + (Math.cos(Date.now() / 8000) * 0.8)).toFixed(2)),
      neighbor_corr: Number(neighborCorr.toFixed(3)),
      risk_score: Number(riskScore.toFixed(3)),
      hazard_state: hazardState,
      battery_mv: 4120 - Math.floor(progress * 160),
      rssi: -84 - Math.floor(progress * 7),
      snr: Number((9.5 - (progress * 1.3)).toFixed(1))
    };
  }

  emitState() {
    const progress = this.getGlobalProgress();
    const nodeIds = ['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08'];
    const telemetryBatch = {};

    nodeIds.forEach(id => {
      telemetryBatch[id] = this.generateCorrelatedTelemetry(id, progress);
    });

    const currentStageDef = SIMULATION_STAGES[this.stage];

    // Trigger critical alert when reaching T8
    if (this.stage >= 8 && !this.alertTriggeredForStage.has(8)) {
      this.alertTriggeredForStage.add(8);

      const alertPayload = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        node_id: 'N06',
        zone: 'Extraction Zone',
        risk_score: 0.91,
        hazard_state: 'CRITICAL',
        trigger_reason: 'Multi-node deformation pattern detected (Cross-node strain >0.85 & Disp Rate >1.2 mm/hr)',
        tilt_deg: 0.62,
        displacement_mm: 5.21,
        disp_rate_mm_hr: 1.40,
        vibration_rms_g: 0.74,
        crack_width_mm: 1.80,
        neighbor_corr: 0.88,
        email_status: 'PENDING',
        sms_status: 'PENDING',
        siren_status: 'TRIGGERED',
        message: 'CRITICAL SUBSIDENCE: Rapid tensile strain acceleration over extraction center. Evacuate surface perimeter.'
      };

      // Call backend to attempt email delivery to phoenix.team0091@gmail.com
      dispatchAlert(alertPayload)
        .then(result => {
          const finalAlert = {
            ...alertPayload,
            email_status: result.email || 'NOT CONFIGURED',
            sms_status: result.sms || 'NOT CONFIGURED'
          };
          if (this.onAlert) this.onAlert(finalAlert);
        })
        .catch(() => {
          const finalAlert = {
            ...alertPayload,
            email_status: 'NOT CONFIGURED',
            sms_status: 'NOT CONFIGURED'
          };
          if (this.onAlert) this.onAlert(finalAlert);
        });
    }

    if (this.onUpdate) {
      this.onUpdate({
        isRunning: this.isRunning,
        stage: this.stage,
        stageDef: currentStageDef,
        progressInStage: this.progressInStage,
        globalProgress: progress,
        speed: this.speed,
        telemetryBatch,
        subsidenceDepthA: Number((progress * 6.5).toFixed(2)) // 0 to 6.5 mm peak subsidence bowl amplitude
      });
    }
  }
}

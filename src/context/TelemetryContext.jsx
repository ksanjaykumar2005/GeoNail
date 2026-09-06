/**
 * GeoNail Telemetry & Operations Context
 * Strict separation between live hardware telemetry and simulated demo dataset.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fetchNodes, fetchLatestTelemetry, fetchTelemetryHistory, fetchAlerts, dispatchAlert, postHardwareTelemetry, fetchHealth } from '../services/api';
import { wsClient } from '../services/websocket';
import { DemoSimulator, SIMULATION_STAGES } from '../services/demoSimulator';

const TelemetryContext = createContext(null);

const DEFAULT_NODES = [
  { node_id: 'N01', lat: 23.74812, lon: 86.41508, surface_x: -60.0, surface_y: -40.0, elevation_z: 186.2 },
  { node_id: 'N02', lat: 23.74850, lon: 86.41570, surface_x: -20.0, surface_y: -40.0, elevation_z: 185.9 },
  { node_id: 'N03', lat: 23.74890, lon: 86.41630, surface_x:  20.0, surface_y: -40.0, elevation_z: 185.5 },
  { node_id: 'N04', lat: 23.74830, lon: 86.41530, surface_x: -40.0, surface_y:   0.0, elevation_z: 185.8 },
  { node_id: 'N05', lat: 23.74870, lon: 86.41590, surface_x:   0.0, surface_y:   0.0, elevation_z: 185.2 },
  { node_id: 'N06', lat: 23.74910, lon: 86.41650, surface_x:  40.0, surface_y:   0.0, elevation_z: 184.8 },
  { node_id: 'N07', lat: 23.74850, lon: 86.41550, surface_x: -20.0, surface_y:  40.0, elevation_z: 185.4 },
  { node_id: 'N08', lat: 23.74890, lon: 86.41610, surface_x:  20.0, surface_y:  40.0, elevation_z: 185.1 }
];

export function TelemetryProvider({ children }) {
  // 1. Data Source Mode: ONLY 'HARDWARE' | 'DEMO'
  const [dataSource, setDataSource] = useState('DEMO');

  // 2. Monitored Node Network & Selection
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState('N06');

  // 3. Hardware State (Real Data ONLY)
  const [hardwareTelemetryMap, setHardwareTelemetryMap] = useState({});
  const [hardwareHistoryMap, setHardwareHistoryMap] = useState({});
  const [hardwareGatewayStatus, setHardwareGatewayStatus] = useState({
    gateway_id: 'GW-01',
    is_connected: false,
    last_packet_time: null,
    total_packets: 0
  });

  // 4. Demo Simulation State (Demo Mode ONLY)
  const [demoTelemetryMap, setDemoTelemetryMap] = useState({});
  const [demoHistoryMap, setDemoHistoryMap] = useState({});
  const [simState, setSimState] = useState({
    isRunning: false,
    stage: 0,
    stageDef: SIMULATION_STAGES[0],
    progressInStage: 0,
    globalProgress: 0,
    speed: 1.0,
    subsidenceDepthA: 0.0
  });

  // 5. Emergency Alerts State
  const [alerts, setAlerts] = useState([]);
  const [activeCriticalAlert, setActiveCriticalAlert] = useState(null);

  // 6. Time Playback State (for Demo Mode)
  const [playbackTime, setPlaybackTime] = useState(100); // 0 to 100%

  // Demo simulator instance
  const simulatorRef = useRef(null);

  const handleSimUpdate = useCallback((update) => {
    setSimState({
      isRunning: update.isRunning,
      stage: update.stage,
      stageDef: update.stageDef,
      progressInStage: update.progressInStage,
      globalProgress: update.globalProgress,
      speed: update.speed,
      subsidenceDepthA: update.subsidenceDepthA
    });

    if (update.telemetryBatch) {
      setDemoTelemetryMap(update.telemetryBatch);

      setDemoHistoryMap(prev => {
        const next = { ...prev };
        Object.entries(update.telemetryBatch).forEach(([nodeId, rec]) => {
          const list = next[nodeId] ? [...next[nodeId]] : [];
          list.push(rec);
          if (list.length > 60) list.shift();
          next[nodeId] = list;
        });
        return next;
      });
    }
  }, []);

  const handleSimAlert = useCallback((alertData) => {
    setActiveCriticalAlert(alertData);
    setAlerts(prev => [alertData, ...prev]);
  }, []);

  // Initialize Demo Simulator
  useEffect(() => {
    simulatorRef.current = new DemoSimulator(handleSimUpdate, handleSimAlert);
    simulatorRef.current.emitState();

    return () => {
      if (simulatorRef.current) simulatorRef.current.pause();
    };
  }, [handleSimUpdate, handleSimAlert]);

  // Query Hardware State from Backend API & WebSocket
  const refreshHardwareState = useCallback(async () => {
    try {
      const health = await fetchHealth();
      setHardwareGatewayStatus({
        gateway_id: health?.gateway_id || 'GW-01',
        is_connected: Boolean(health?.is_hardware_connected),
        last_packet_time: health?.last_hardware_packet_time || null,
        total_packets: health?.total_hardware_packets || 0
      });

      const latest = await fetchLatestTelemetry();
      if (latest && Array.isArray(latest) && latest.length > 0) {
        const map = {};
        latest.forEach(r => { map[r.node_id] = r; });
        setHardwareTelemetryMap(map);
      } else if (latest && latest.node_id) {
        setHardwareTelemetryMap({ [latest.node_id]: latest });
      } else {
        setHardwareTelemetryMap({});
      }

      const alertList = await fetchAlerts();
      if (alertList && Array.isArray(alertList)) {
        setAlerts(alertList);
      }
    } catch (err) {
      console.warn('[TelemetryContext] Hardware refresh error:', err);
    }
  }, []);

  useEffect(() => {
    refreshHardwareState();

    // Connect WebSocket
    wsClient.connect();
    const unsubscribe = wsClient.subscribe((data) => {
      if (data.type === 'TELEMETRY_UPDATE') {
        const record = data.payload;
        if (record && record.node_id) {
          setHardwareTelemetryMap(prev => ({ ...prev, [record.node_id]: record }));
          setHardwareHistoryMap(prev => {
            const list = prev[record.node_id] ? [...prev[record.node_id]] : [];
            list.push(record);
            if (list.length > 60) list.shift();
            return { ...prev, [record.node_id]: list };
          });
          setHardwareGatewayStatus(prev => ({
            ...prev,
            is_connected: true,
            last_packet_time: record.timestamp,
            total_packets: prev.total_packets + 1
          }));
        }
      } else if (data.type === 'ALERT_DISPATCHED') {
        setActiveCriticalAlert(data.payload);
        setAlerts(prev => [data.payload, ...prev]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshHardwareState]);

  // Demo simulator controls
  const startDemo = useCallback(() => {
    if (simulatorRef.current) simulatorRef.current.start();
  }, []);

  const pauseDemo = useCallback(() => {
    if (simulatorRef.current) simulatorRef.current.pause();
  }, []);

  const resetDemo = useCallback(() => {
    if (simulatorRef.current) simulatorRef.current.reset();
    setActiveCriticalAlert(null);
  }, []);

  const setDemoStage = useCallback((stageIndex) => {
    if (simulatorRef.current) simulatorRef.current.setStage(stageIndex);
  }, []);

  // Hardware injection function (for testing)
  const injectHardwareTelemetry = useCallback(async (packet) => {
    try {
      const res = await postHardwareTelemetry(packet);
      await refreshHardwareState();
      return res;
    } catch (err) {
      console.error('Failed to inject hardware packet:', err);
      throw err;
    }
  }, [refreshHardwareState]);

  // Unified telemetry view based strictly on active data source
  const isHardware = dataSource === 'HARDWARE';
  const activeTelemetryMap = isHardware ? hardwareTelemetryMap : demoTelemetryMap;
  const activeHistoryMap = isHardware ? hardwareHistoryMap : demoHistoryMap;

  // Manual Demo Alert trigger
  const triggerDemoAlert = useCallback(async () => {
    try {
      // Set to DEMO mode if in hardware mode
      if (dataSource !== 'DEMO') {
        setDataSource('DEMO');
      }

      // Fast forward demo simulation to Stage 8 (Critical Failure)
      if (simulatorRef.current) {
        simulatorRef.current.setStage(8);
      }

      // Call backend demo alert dispatch endpoint
      const result = await triggerDemoAlertApi({
        node_id: 'N06',
        risk_score: 0.91,
        hazard_state: 'CRITICAL'
      });

      const alertRecord = result.alert || {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        node_id: 'N06',
        zone: 'Surface Monitoring Zone',
        risk_score: 0.91,
        hazard_state: 'CRITICAL',
        trigger_reason: 'DEMONSTRATION ALERT: Rapid ground displacement detected at extraction perimeter',
        tilt_deg: 0.62,
        displacement_mm: 5.21,
        disp_rate_mm_hr: 1.40,
        vibration_rms_g: 0.74,
        crack_width_mm: 1.80,
        neighbor_corr: 0.88,
        email_status: result.email || 'NOT CONFIGURED',
        sms_status: result.sms || 'NOT CONFIGURED',
        siren_status: 'TRIGGERED',
        is_demo: true
      };

      setActiveCriticalAlert(alertRecord);
      setAlerts(prev => [alertRecord, ...prev]);
      return alertRecord;
    } catch (err) {
      console.error('[TelemetryContext] triggerDemoAlert failed:', err);
      // Create local fallback alert object with truthful offline status
      const fallbackAlert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        node_id: 'N06',
        zone: 'Surface Monitoring Zone',
        risk_score: 0.91,
        hazard_state: 'CRITICAL',
        trigger_reason: 'DEMONSTRATION ALERT: Rapid ground displacement detected',
        tilt_deg: 0.62,
        displacement_mm: 5.21,
        disp_rate_mm_hr: 1.40,
        vibration_rms_g: 0.74,
        crack_width_mm: 1.80,
        neighbor_corr: 0.88,
        email_status: 'NOT CONFIGURED',
        sms_status: 'NOT CONFIGURED',
        siren_status: 'TRIGGERED',
        is_demo: true
      };
      setActiveCriticalAlert(fallbackAlert);
      setAlerts(prev => [fallbackAlert, ...prev]);
      return fallbackAlert;
    }
  }, [dataSource]);

  // Selected node telemetry object
  const rawSelectedTelemetry = activeTelemetryMap[selectedNodeId];
  const selectedNodeTelemetry = rawSelectedTelemetry || {
    node_id: selectedNodeId,
    timestamp: null,
    tilt_x: null,
    tilt_y: null,
    displacement: null,
    disp_rate: null,
    vibration_rms: null,
    dom_frequency: null,
    crack_width: null,
    soil_moisture: null,
    temperature: null,
    neighbor_corr: null,
    risk_score: null,
    hazard_state: null,
    battery_mv: null,
    rssi: null,
    snr: null
  };

  // Node status mapping
  const statusMap = ['NORMAL', 'WATCH', 'WARNING', 'CRITICAL'];
  const nodesWithStatus = nodes.map(n => {
    const t = activeTelemetryMap[n.node_id];
    if (!t || t.displacement == null) {
      return { ...n, status: isHardware ? 'NO DATA' : 'NORMAL', telemetry: null };
    }
    return {
      ...n,
      status: statusMap[t.hazard_state] || 'NORMAL',
      telemetry: t
    };
  });

  const onlineHardwareNodesCount = isHardware
    ? nodesWithStatus.filter(n => n.status !== 'NO DATA').length
    : 8;

  const value = {
    dataSource,
    setDataSource,
    nodes: nodesWithStatus,
    selectedNodeId,
    setSelectedNodeId,
    selectedNodeTelemetry,
    activeTelemetryMap,
    activeHistoryMap,
    isHardware,
    hardwareGatewayStatus,
    onlineHardwareNodesCount,
    alerts,
    activeCriticalAlert,
    setActiveCriticalAlert,
    simState,
    startDemo,
    pauseDemo,
    resetDemo,
    setDemoStage,
    triggerDemoAlert,
    playbackTime,
    setPlaybackTime,
    injectHardwareTelemetry
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}


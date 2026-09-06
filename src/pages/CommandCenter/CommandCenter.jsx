/**
 * Main Surface Subsidence Dashboard (Home)
 * Answers "What is happening at the mine right now?" with clear, natural geotechnical metrics.
 * GeoNail - Mine Safety Monitoring System | SIH PS 26025
 */

import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { MetricCard } from '../../components/MetricCard/MetricCard';
import { NodeNetworkPanel } from '../../components/NodeList/NodeNetworkPanel';
import { GISMap } from '../../components/GISMap/GISMap';
import { RiskEnginePanel } from '../../components/RiskPanel/RiskEnginePanel';
import { MineScene } from '../../three/MineScene';
import { formatDecimal } from '../../utils/formatters';
import { Play, Pause, RotateCcw, Map, Box, Radio } from 'lucide-react';

export function CommandCenter({ onViewChange }) {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    selectedNodeTelemetry,
    activeTelemetryMap,
    simState,
    startDemo,
    pauseDemo,
    resetDemo,
    triggerDemoAlert,
    dataSource,
    isHardware,
    hardwareGatewayStatus
  } = useTelemetry();

  const [activeCenterTab, setActiveCenterTab] = useState('GIS'); // 'GIS' or '3D'
  const [isTriggeringAlert, setIsTriggeringAlert] = useState(false);

  const hasData = selectedNodeTelemetry.displacement !== null && selectedNodeTelemetry.displacement !== undefined;

  const tiltTotal = hasData
    ? Math.sqrt(Math.pow(selectedNodeTelemetry.tilt_x || 0, 2) + Math.pow(selectedNodeTelemetry.tilt_y || 0, 2))
    : null;

  const status = nodes.find(n => n.node_id === selectedNodeId)?.status || (isHardware ? 'NO DATA' : 'NORMAL');

  const handleDemoAlert = async () => {
    setIsTriggeringAlert(true);
    try {
      await triggerDemoAlert();
    } finally {
      setIsTriggeringAlert(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto max-w-[1920px] mx-auto w-full select-none bg-[#F5F7FA]">
      {/* Simulation Controls (Visible in Demo mode) */}
      {dataSource === 'DEMO' && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">
              Demo Simulation:
            </span>
            <span className="font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 font-semibold">
              {simState.stageDef?.label || 'Normal Baseline'}
            </span>
            <span className="text-slate-500 text-xs hidden md:inline">
              ({simState.stageDef?.description})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simState.isRunning ? pauseDemo : startDemo}
              className={`px-3.5 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm ${
                simState.isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {simState.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{simState.isRunning ? 'PAUSE' : 'START SIMULATION'}</span>
            </button>

            <button
              onClick={handleDemoAlert}
              disabled={isTriggeringAlert}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm text-xs"
              title="Instantly test SIH Critical Subsidence Alert flow"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{isTriggeringAlert ? 'DISPATCHING...' : 'DEMO ALERT'}</span>
            </button>

            <button
              onClick={resetDemo}
              className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm"
              title="Reset simulation to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hardware Connection Banner (Visible in Hardware mode) */}
      {dataSource === 'HARDWARE' && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800">
              HARDWARE TELEMETRY STREAM
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">
              Gateway: <strong className="font-mono">{hardwareGatewayStatus.gateway_id}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Last Packet: <strong className="text-slate-700 font-mono">{hardwareGatewayStatus.last_packet_time || '--'}</strong>
            </span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${hardwareGatewayStatus.is_connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={`font-semibold ${hardwareGatewayStatus.is_connected ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hardwareGatewayStatus.is_connected ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Four Primary Monitoring Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="TILT ANGLE"
          value={tiltTotal}
          unit="°"
          status={status}
          selectedNodeId={selectedNodeId}
          secondaryLabel="Pitch X / Roll Y"
          secondaryValue={hasData ? `${formatDecimal(selectedNodeTelemetry.tilt_x, 2)}° / ${formatDecimal(selectedNodeTelemetry.tilt_y, 2)}°` : '--'}
        />

        <MetricCard
          title="DISPLACEMENT"
          value={selectedNodeTelemetry.displacement}
          unit="mm"
          status={status}
          selectedNodeId={selectedNodeId}
          secondaryLabel="Displacement Rate"
          secondaryValue={hasData ? `${formatDecimal(selectedNodeTelemetry.disp_rate, 2)} mm/hr` : '--'}
        />

        <MetricCard
          title="VIBRATION RMS"
          value={selectedNodeTelemetry.vibration_rms}
          unit="g"
          status={status}
          selectedNodeId={selectedNodeId}
          secondaryLabel="Dominant Frequency"
          secondaryValue={hasData ? `${formatDecimal(selectedNodeTelemetry.dom_frequency || 14.2, 1)} Hz` : '--'}
        />

        <MetricCard
          title="CRACK WIDTH"
          value={selectedNodeTelemetry.crack_width}
          unit="mm"
          status={status}
          selectedNodeId={selectedNodeId}
          secondaryLabel="Soil Moisture"
          secondaryValue={hasData ? `${formatDecimal(selectedNodeTelemetry.soil_moisture, 1)} %` : '--'}
        />
      </div>

      {/* 2. Main Center Work Area (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[520px] flex-1">
        {/* Left Column: Sensor Nodes List (3 cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <NodeNetworkPanel
            nodes={nodes}
            activeTelemetryMap={activeTelemetryMap}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            isHardware={isHardware}
          />
        </div>

        {/* Center Column: GIS Map / 3D Digital Twin (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCenterTab('GIS')}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  activeCenterTab === 'GIS'
                    ? 'bg-white text-blue-700 font-bold border border-slate-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>2D Surface GIS</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('3D')}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  activeCenterTab === '3D'
                    ? 'bg-white text-blue-700 font-bold border border-slate-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Digital Twin</span>
              </button>
            </div>

            <button
              onClick={() => onViewChange('digital-twin')}
              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
            >
              Full Digital Twin View →
            </button>
          </div>

          <div className="flex-1 relative min-h-[460px]">
            {activeCenterTab === 'GIS' ? (
              <GISMap
                nodes={nodes}
                activeTelemetryMap={activeTelemetryMap}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                subsidenceSeverity={simState.subsidenceDepthA}
                isHardware={isHardware}
              />
            ) : (
              <MineScene
                nodes={nodes}
                activeTelemetryMap={activeTelemetryMap}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                subsidenceSeverity={simState.subsidenceDepthA}
                cameraView="ISOMETRIC"
                isHardware={isHardware}
              />
            )}
          </div>
        </div>

        {/* Right Column: Risk Analysis Factor Attribution (3 cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <RiskEnginePanel
            selectedNodeTelemetry={selectedNodeTelemetry}
            selectedNodeId={selectedNodeId}
          />
        </div>
      </div>
    </div>
  );
}


/**
 * 3D Digital Twin Dedicated Page
 * Full-screen Three.js WebGL geotechnical scene with camera presets and timeline evolution.
 * GeoNail - Mine Safety Monitoring System | SIH PS 26025
 */

import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { MineScene } from '../../three/MineScene';
import { getStatusColor, formatDecimal } from '../../utils/formatters';
import { calculateRiskInference } from '../../utils/risk';
import { Box, Camera, Clock } from 'lucide-react';

export function DigitalTwinPage() {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    selectedNodeTelemetry,
    activeTelemetryMap,
    simState,
    playbackTime,
    setPlaybackTime,
    isHardware
  } = useTelemetry();

  const [cameraView, setCameraView] = useState('ISOMETRIC'); // 'TOP', 'ISOMETRIC', 'CROSS_SECTION'
  const [showLabels, setShowLabels] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const activeNode = nodes.find(n => n.node_id === selectedNodeId) || nodes[0];
  const hasData = selectedNodeTelemetry.displacement !== null && selectedNodeTelemetry.displacement !== undefined;
  const status = hasData ? activeNode.status : (isHardware ? 'NO DATA' : 'NORMAL');
  const colorInfo = getStatusColor(status);
  const inference = calculateRiskInference(selectedNodeTelemetry);

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden select-none max-w-[1920px] mx-auto w-full h-full bg-[#F5F7FA]">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 tracking-wide uppercase">
            3D Mine Digital Twin
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">
            Surface Monitoring Zone (Extraction Depth: -120m)
          </span>
        </div>

        {/* Camera View Presets */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <Camera className="w-3.5 h-3.5" /> Camera:
          </span>
          {[
            { id: 'TOP', label: 'Top View' },
            { id: 'ISOMETRIC', label: 'Isometric' },
            { id: 'CROSS_SECTION', label: 'Cross Section' }
          ].map(cam => (
            <button
              key={cam.id}
              onClick={() => setCameraView(cam.id)}
              className={`px-3 py-1 rounded-md transition-colors text-xs font-semibold border ${
                cameraView === cam.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Center Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left/Center: 3D Scene Viewport (9 cols) */}
        <div className="lg:col-span-9 flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden relative min-h-[480px] shadow-sm">
          <MineScene
            nodes={nodes}
            activeTelemetryMap={activeTelemetryMap}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            subsidenceSeverity={simState.subsidenceDepthA}
            showLabels={showLabels}
            showHeatmap={showHeatmap}
            cameraView={cameraView}
            isHardware={isHardware}
          />

          {/* Quick Overlay Toggles on 3D viewport */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200 p-2 rounded-md flex items-center gap-3 text-xs text-slate-700 shadow-md">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={e => setShowHeatmap(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>Heatmap</span>
            </label>
            <span className="text-slate-300">|</span>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={e => setShowLabels(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>Labels</span>
            </label>
          </div>
        </div>

        {/* Right: Station Telemetry & Risk Details (3 cols) */}
        <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-lg p-4 space-y-3.5 overflow-y-auto select-none shadow-sm">
          {/* Node Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorInfo.hex }} />
              <span className="font-mono font-bold text-sm text-slate-800">
                Station {activeNode.node_id}
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${colorInfo.badge}`}>
              {status}
            </span>
          </div>

          {/* Key Channel Readouts */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">DISPLACEMENT</span>
              <span className="text-slate-800 font-bold text-sm">
                {hasData ? `${formatDecimal(selectedNodeTelemetry.displacement, 2)} mm` : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">DISP RATE</span>
              <span className="text-slate-800 font-bold text-sm">
                {hasData ? `${formatDecimal(selectedNodeTelemetry.disp_rate, 2)} mm/hr` : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">TILT VECTOR</span>
              <span className="text-slate-800 font-bold text-sm">
                {hasData ? `${formatDecimal(Math.sqrt(Math.pow(selectedNodeTelemetry.tilt_x || 0, 2) + Math.pow(selectedNodeTelemetry.tilt_y || 0, 2)), 2)}°` : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-medium">VIBRATION RMS</span>
              <span className="text-slate-800 font-bold text-sm">
                {hasData ? `${formatDecimal(selectedNodeTelemetry.vibration_rms, 2)} g` : '--'}
              </span>
            </div>
          </div>

          {/* Risk Model Breakdown */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Risk Score</span>
              <span className="font-mono font-bold" style={{ color: colorInfo.hex }}>
                {hasData && inference.riskScore != null ? `${formatDecimal(inference.riskScore, 2)} / 1.00` : '--'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed pt-1.5 border-t border-slate-200">
              {inference.explanation}
            </p>
          </div>

          {/* Spatial Station Coordinates */}
          <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500 space-y-1.5">
            <div className="flex justify-between">
              <span>Mine Grid:</span>
              <span className="text-slate-700 font-semibold">X: {activeNode.surface_x}m, Y: {activeNode.surface_y}m</span>
            </div>
            <div className="flex justify-between">
              <span>GPS Coords:</span>
              <span className="text-slate-700 font-semibold">{activeNode.lat}° N, {activeNode.lon}° E</span>
            </div>
            <div className="flex justify-between">
              <span>Depth to Extraction:</span>
              <span className="text-slate-700 font-semibold">120 m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Timeline Evolution Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 px-4 flex items-center justify-between gap-4 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2 text-slate-600 font-semibold whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Timeline: -24h</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={playbackTime}
          onChange={e => setPlaybackTime(Number(e.target.value))}
          className="flex-1 h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
        />

        <div className="text-slate-700 font-bold whitespace-nowrap">
          {playbackTime === 100 ? 'Live (Now)' : `Scrub: -${((100 - playbackTime) * 0.24).toFixed(1)}h`}
        </div>
      </div>
    </div>
  );
}


/**
 * Live Telemetry & Historical Trends Page
 * Clean Recharts time-series graphs for displacement, tilt, vibration, and risk.
 * GeoNail - Mine Safety Monitoring System | SIH PS 26025
 */

import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { formatTimeOnly, getStatusColor, formatDecimal } from '../../utils/formatters';
import { exportTelemetryToCSV } from '../../utils/exportCsv';
import { Activity, Download } from 'lucide-react';

export function TelemetryPage() {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    selectedNodeTelemetry,
    activeHistoryMap,
    isHardware
  } = useTelemetry();

  const activeNodeHistory = activeHistoryMap[selectedNodeId] || [];
  const hasData = selectedNodeTelemetry.displacement !== null && selectedNodeTelemetry.displacement !== undefined;
  const status = hasData ? (nodes.find(n => n.node_id === selectedNodeId)?.status || 'NORMAL') : (isHardware ? 'NO DATA' : 'NORMAL');
  const colorInfo = getStatusColor(status);

  const chartData = activeNodeHistory.map(r => ({
    time: formatTimeOnly(r.timestamp),
    displacement: r.displacement,
    disp_rate: r.disp_rate,
    tilt_x: r.tilt_x,
    tilt_y: r.tilt_y,
    vibration_rms: r.vibration_rms,
    risk_score: r.risk_score
  }));

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto max-w-[1920px] mx-auto w-full select-none bg-[#F5F7FA]">
      {/* Station Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-800 uppercase tracking-wide">
            Live Telemetry Channels
          </h2>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">
            Node {selectedNodeId}
          </span>
        </div>

        {/* Node Tabs */}
        <div className="flex items-center gap-1 font-mono">
          {nodes.map(n => {
            const isSel = n.node_id === selectedNodeId;
            return (
              <button
                key={n.node_id}
                onClick={() => setSelectedNodeId(n.node_id)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors border text-xs ${
                  isSel
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {n.node_id}
              </button>
            );
          })}
        </div>

        {/* Export CSV */}
        <button
          onClick={() => exportTelemetryToCSV(activeNodeHistory, selectedNodeId)}
          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {selectedNodeId} CSV</span>
        </button>
      </div>

      {/* Real-Time Values Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-slate-500 text-[11px] block font-sans font-medium">Displacement</span>
          <span className="text-slate-800 font-bold text-lg block mt-0.5">
            {hasData ? `${formatDecimal(selectedNodeTelemetry.displacement, 2)} mm` : '--'}
          </span>
          <span className="text-slate-400 text-[11px]">
            Rate: {hasData ? `${formatDecimal(selectedNodeTelemetry.disp_rate, 2)} mm/hr` : '--'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-slate-500 text-[11px] block font-sans font-medium">Tilt Angle</span>
          <span className="text-slate-800 font-bold text-lg block mt-0.5">
            {hasData ? `${formatDecimal(Math.sqrt(Math.pow(selectedNodeTelemetry.tilt_x || 0, 2) + Math.pow(selectedNodeTelemetry.tilt_y || 0, 2)), 2)}°` : '--'}
          </span>
          <span className="text-slate-400 text-[11px]">
            X: {hasData ? selectedNodeTelemetry.tilt_x : '--'}° | Y: {hasData ? selectedNodeTelemetry.tilt_y : '--'}°
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-slate-500 text-[11px] block font-sans font-medium">Vibration RMS</span>
          <span className="text-slate-800 font-bold text-lg block mt-0.5">
            {hasData ? `${formatDecimal(selectedNodeTelemetry.vibration_rms, 2)} g` : '--'}
          </span>
          <span className="text-slate-400 text-[11px]">
            Frequency: {hasData ? `${formatDecimal(selectedNodeTelemetry.dom_frequency || 14.2, 1)} Hz` : '--'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-slate-500 text-[11px] block font-sans font-medium">Crack Width</span>
          <span className="text-slate-800 font-bold text-lg block mt-0.5">
            {hasData ? `${formatDecimal(selectedNodeTelemetry.crack_width, 2)} mm` : '--'}
          </span>
          <span className="text-slate-400 text-[11px]">
            Moisture: {hasData ? `${formatDecimal(selectedNodeTelemetry.soil_moisture, 1)} %` : '--'}
          </span>
        </div>
      </div>

      {/* Synchronized Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-[480px]">
        {/* Chart 1: Displacement */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
            <span className="font-bold text-slate-800">Surface Displacement (mm)</span>
            <span className="font-mono text-slate-500 text-[11px]">Node {selectedNodeId}</span>
          </div>
          <div className="flex-1 min-h-[220px] pt-3">
            {hasData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: 11, fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="displacement" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} name="Displacement (mm)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No telemetry stream available for this station.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Tilt Vector */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
            <span className="font-bold text-slate-800">Biaxial Tilt Angle (°)</span>
            <span className="font-mono text-slate-500 text-[11px]">Pitch & Roll</span>
          </div>
          <div className="flex-1 min-h-[220px] pt-3">
            {hasData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: 11, fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="tilt_x" stroke="#0284C7" strokeWidth={2} dot={false} name="Pitch X (°)" />
                  <Line type="monotone" dataKey="tilt_y" stroke="#6366F1" strokeWidth={2} dot={false} name="Roll Y (°)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No telemetry stream available for this station.
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Vibration RMS */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
            <span className="font-bold text-slate-800">Vibration RMS (g)</span>
            <span className="font-mono text-slate-500 text-[11px]">Acceleration in g</span>
          </div>
          <div className="flex-1 min-h-[220px] pt-3">
            {hasData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: 11, fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="vibration_rms" stroke="#D97706" strokeWidth={2} dot={false} name="Vibration RMS (g)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No telemetry stream available for this station.
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Risk Score Trajectory */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
            <span className="font-bold text-slate-800">Risk Score Trajectory</span>
            <span className="font-mono text-slate-500 text-[11px]">0.00 - 1.00</span>
          </div>
          <div className="flex-1 min-h-[220px] pt-3">
            {hasData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 1.0]} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: 11, fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="risk_score" stroke="#DC2626" fill="#EF4444" fillOpacity={0.15} strokeWidth={2} name="Risk Score" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No telemetry stream available for this station.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


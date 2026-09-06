/**
 * 2D Technical Geotechnical GIS Surface Monitoring Map (Light Theme)
 * Professional GIS layout with smooth risk heatmap interpolation and clear hardware status.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useState, useMemo } from 'react';
import { getStatusColor, formatDecimal } from '../../utils/formatters';

export function GISMap({
  nodes = [],
  activeTelemetryMap = {},
  selectedNodeId = 'N06',
  onSelectNode = () => {},
  subsidenceSeverity = 0.0,
  isHardware = false
}) {
  const [layers, setLayers] = useState({
    panel: true,
    heatmap: true,
    roads: true,
    nodes: true
  });

  const [hoveredNode, setHoveredNode] = useState(null);

  const mapWidth = 800;
  const mapHeight = 600;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;
  const scale = 4.2;

  const toSvgX = (x) => centerX + x * scale;
  const toSvgY = (y) => centerY + y * scale;

  const hasData = Object.keys(activeTelemetryMap).length > 0 &&
    Object.values(activeTelemetryMap).some(t => t && t.displacement != null);

  // Generate dynamic heatmap gradient circles based on node risk scores
  const heatmapBlobs = useMemo(() => {
    if (!hasData) return [];

    return nodes.map(node => {
      const t = activeTelemetryMap[node.node_id];
      const risk = t && t.risk_score != null ? t.risk_score : 0.1;
      const x = toSvgX(node.surface_x * 0.5);
      const y = toSvgY(node.surface_y * 0.5);

      // Higher risk = wider, more intense spread
      const radius = 28 + risk * 50;
      let color = 'rgba(22, 163, 74, 0.25)'; // Green
      if (risk >= 0.80) color = 'rgba(220, 38, 38, 0.55)'; // Red
      else if (risk >= 0.55) color = 'rgba(249, 115, 22, 0.45)'; // Orange
      else if (risk >= 0.30) color = 'rgba(234, 179, 8, 0.35)'; // Yellow

      return { id: node.node_id, x, y, radius, color, risk };
    });
  }, [nodes, activeTelemetryMap, hasData]);

  return (
    <div className="w-full h-full relative bg-white border border-slate-200 rounded-lg flex flex-col select-none overflow-hidden shadow-xs">
      {/* Top Map Toolbar */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">
            GIS Surface Deformation Map
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono text-[11px]">
            Surface Grid (WGS84 / Local Mine Datum)
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            onClick={() => setLayers(p => ({ ...p, heatmap: !p.heatmap }))}
            className={`px-2.5 py-1 rounded border transition-all ${
              layers.heatmap ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium shadow-xs' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            Risk Heatmap
          </button>
          <button
            onClick={() => setLayers(p => ({ ...p, panel: !p.panel }))}
            className={`px-2.5 py-1 rounded border transition-all ${
              layers.panel ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium shadow-xs' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            Extraction Zone
          </button>
          <button
            onClick={() => setLayers(p => ({ ...p, roads: !p.roads }))}
            className={`px-2.5 py-1 rounded border transition-all ${
              layers.roads ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium shadow-xs' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            Haul Routes
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#F8FAFC]">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="gridPatternLight" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Coordinate Grid Background */}
          <rect width={mapWidth} height={mapHeight} fill="url(#gridPatternLight)" />

          {/* Mine Lease Boundary */}
          <polygon
            points="80,70 720,80 700,520 90,500"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="6,4"
          />

          {/* Haul Routes */}
          {layers.roads && (
            <g stroke="#CBD5E1" strokeWidth="3.5" fill="none" strokeLinecap="round">
              <path d="M 90,470 C 260,450 520,480 700,460" />
              <path d="M 390,90 C 410,280 400,380 420,510" stroke="#94A3B8" strokeDasharray="5,3" strokeWidth="2" />
            </g>
          )}

          {/* Underground Extraction Area Outline */}
          {layers.panel && (
            <g>
              <rect
                x={toSvgX(-55)}
                y={toSvgY(-35)}
                width={110 * scale}
                height={70 * scale}
                fill="#EFF6FF"
                fillOpacity="0.75"
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                rx="4"
              />
              <text
                x={toSvgX(-50)}
                y={toSvgY(-28)}
                fill="#1D4ED8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="600"
              >
                EXTRACTION ZONE (TARGET SEAM -120M)
              </text>
            </g>
          )}

          {/* Visual Risk Heatmap (Smooth Spatial Interpolation) */}
          {layers.heatmap && hasData && (
            <g>
              {heatmapBlobs.map(blob => (
                <circle
                  key={blob.id}
                  cx={blob.x}
                  cy={blob.y}
                  r={blob.radius}
                  fill={blob.color}
                  style={{ filter: 'blur(16px)' }}
                />
              ))}
            </g>
          )}

          {/* Sensor Node Markers */}
          {layers.nodes && nodes.map((node) => {
            const t = activeTelemetryMap[node.node_id];
            const hasNodeData = t && t.displacement != null;
            const status = hasNodeData ? node.status : (isHardware ? 'NO DATA' : 'NORMAL');
            const colorInfo = getStatusColor(status);
            const isSelected = node.node_id === selectedNodeId;

            const sx = toSvgX(node.surface_x * 0.5);
            const sy = toSvgY(node.surface_y * 0.5);

            return (
              <g
                key={node.node_id}
                className="cursor-pointer"
                onClick={() => onSelectNode(node.node_id)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Selection Ring */}
                {isSelected && (
                  <circle
                    cx={sx}
                    cy={sy}
                    r={15}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeDasharray="3,2"
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={7.5}
                  fill="#FFFFFF"
                  stroke={colorInfo.hex}
                  strokeWidth={2.5}
                />

                {/* Node Core */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={3}
                  fill={colorInfo.hex}
                />

                {/* Label Tag */}
                <text
                  x={sx + 11}
                  y={sy + 4}
                  fill={isSelected ? '#1D4ED8' : '#334155'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {node.node_id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* If in Hardware Mode and No Data is Present */}
        {isHardware && !hasData && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/15 backdrop-blur-[1px] pointer-events-none">
            <div className="p-4 bg-white border border-slate-300 rounded-lg shadow-lg text-center max-w-sm">
              <span className="font-bold text-slate-800 text-xs block mb-1">NO LIVE SENSOR DATA</span>
              <p className="text-[11px] text-slate-600">
                Hardware telemetry stream is disconnected. Connect field monitoring nodes or switch to Demo Simulation mode.
              </p>
            </div>
          </div>
        )}

        {/* Node Hover/Selection Tooltip */}
        {(hoveredNode || selectedNodeId) && (
          <div className="absolute top-3 left-3 bg-white/95 border border-slate-300 p-3 rounded-lg shadow-md text-xs font-mono min-w-[200px] pointer-events-none">
            {(() => {
              const n = hoveredNode || nodes.find(x => x.node_id === selectedNodeId) || nodes[0];
              const t = activeTelemetryMap[n.node_id];
              const hasT = t && t.displacement != null;
              const status = hasT ? n.status : (isHardware ? 'NO DATA' : 'NORMAL');
              const colorInfo = getStatusColor(status);

              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-slate-900">Station {n.node_id}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${colorInfo.badge}`}>
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 text-[11px] text-slate-600 pt-1">
                    <span>Displacement:</span>
                    <span className="text-right text-slate-900 font-bold">
                      {hasT ? `${formatDecimal(t.displacement, 2)} mm` : '--'}
                    </span>

                    <span>Disp Rate:</span>
                    <span className="text-right text-slate-800 font-medium">
                      {hasT ? `${formatDecimal(t.disp_rate, 2)} mm/hr` : '--'}
                    </span>

                    <span>Tilt Angle:</span>
                    <span className="text-right text-slate-800 font-medium">
                      {hasT ? `${formatDecimal(Math.sqrt(Math.pow(t.tilt_x || 0, 2) + Math.pow(t.tilt_y || 0, 2)), 2)}°` : '--'}
                    </span>

                    <span>Risk Score:</span>
                    <span className="text-right font-bold" style={{ color: colorInfo.hex }}>
                      {hasT ? formatDecimal(t.risk_score, 2) : '--'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-white/95 border border-slate-300 p-2.5 rounded-lg shadow-xs text-[10px] space-y-1">
          <div className="text-slate-700 font-bold mb-1 uppercase tracking-wider">HAZARD STATUS</div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Normal (&lt; 0.30)
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Watch (0.30 - 0.54)
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Warning (0.55 - 0.79)
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical (≥ 0.80)
          </div>
        </div>
      </div>
    </div>
  );
}

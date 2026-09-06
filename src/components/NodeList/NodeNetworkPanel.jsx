/**
 * Sensor Node Network List Panel (Light Theme)
 * Clean status overview of distributed surface monitoring stations.
 */

import React from 'react';
import { getStatusColor, formatDecimal } from '../../utils/formatters';

export function NodeNetworkPanel({
  nodes = [],
  activeTelemetryMap = {},
  selectedNodeId = 'N06',
  onSelectNode = () => {},
  isHardware = false
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col h-full select-none shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Sensor Nodes
        </span>
        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
          {isHardware && Object.keys(activeTelemetryMap).length === 0 ? '0 / 8 Active' : '8 / 8 Active'}
        </span>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1">
        {nodes.map((node) => {
          const t = activeTelemetryMap[node.node_id];
          const hasData = t && t.displacement !== null && t.displacement !== undefined;
          const status = hasData ? node.status : (isHardware ? 'NO DATA' : 'NORMAL');
          const colorInfo = getStatusColor(status);
          const isSelected = node.node_id === selectedNodeId;

          const dispVal = hasData ? `${formatDecimal(t.displacement, 2)} mm` : '--';
          const riskVal = hasData ? formatDecimal(t.risk_score, 2) : '--';

          return (
            <div
              key={node.node_id}
              onClick={() => onSelectNode(node.node_id)}
              className={`p-2 rounded-md cursor-pointer transition-all flex items-center justify-between border text-xs ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-500/20'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {/* Node ID & Status */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: colorInfo.hex }} />
                <span className={`font-mono font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                  {node.node_id}
                </span>
                <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${colorInfo.badge}`}>
                  {status}
                </span>
              </div>

              {/* Numerical Metrics */}
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <div className="text-right">
                  <span className="text-slate-600 font-medium">{dispVal}</span>
                </div>
                <div className="text-right min-w-[34px]">
                  <span className={`font-bold ${hasData ? colorInfo.text : 'text-slate-400'}`}>
                    {riskVal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>RF: 865.2 MHz</span>
        <span>Monitoring Area</span>
      </div>
    </div>
  );
}

/**
 * Geotechnical Telemetry Channel Card (Light Theme)
 * Clean, standard industrial sensor metric card.
 */

import React from 'react';
import { getStatusColor, formatDecimal } from '../../utils/formatters';

export function MetricCard({
  title,
  value,
  unit,
  status = 'NORMAL',
  selectedNodeId = 'N06',
  secondaryLabel,
  secondaryValue
}) {
  const colorInfo = getStatusColor(status);
  const formattedVal = value != null ? formatDecimal(value, 2) : '--';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between select-none shadow-sm hover:border-slate-300 transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
            {selectedNodeId}
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${colorInfo.badge}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Main Value Display */}
      <div className="my-3 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-tight">
          {formattedVal}
        </span>
        <span className="text-sm font-mono text-slate-500 font-normal">
          {unit}
        </span>
      </div>

      {/* Secondary Metric / Parameter */}
      {secondaryLabel && (
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{secondaryLabel}</span>
          <span className="font-mono text-slate-700 font-medium">{secondaryValue || '--'}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Risk Factor Attribution Panel (Dashboard Mini Component - Light Theme)
 * Clean, natural risk decomposition for the selected station node.
 */

import React from 'react';
import { calculateRiskInference } from '../../utils/risk';
import { getRiskLevelFromScore, formatDecimal } from '../../utils/formatters';
import { Cpu } from 'lucide-react';

export function RiskEnginePanel({ selectedNodeTelemetry, selectedNodeId = 'N06' }) {
  const hasData = selectedNodeTelemetry.displacement !== null && selectedNodeTelemetry.displacement !== undefined;
  const inference = calculateRiskInference(selectedNodeTelemetry);
  const riskMeta = getRiskLevelFromScore(inference.riskScore);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col h-full select-none shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Risk Analysis
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
          {selectedNodeId}
        </span>
      </div>

      {/* Main Score Readout */}
      <div className="my-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Synthesized Risk
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-mono font-bold" style={{ color: hasData ? riskMeta.hex : '#94A3B8' }}>
              {hasData && inference.riskScore != null ? formatDecimal(inference.riskScore, 2) : '--'}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 1.00</span>
          </div>
        </div>

        <div>
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${hasData ? riskMeta.badge : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
            {hasData ? riskMeta.label : '--'}
          </span>
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="flex-1 space-y-2.5 my-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Contributing Factors
        </span>

        {inference.factorBreakdown.map((factor) => (
          <div key={factor.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-sans text-[11px]">{factor.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 font-semibold text-[11px]">{hasData ? factor.raw : '--'}</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: hasData ? `${factor.score}%` : '0%',
                  backgroundColor: factor.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Observation text */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-mono text-slate-600 leading-relaxed">
        {inference.explanation}
      </div>
    </div>
  );
}

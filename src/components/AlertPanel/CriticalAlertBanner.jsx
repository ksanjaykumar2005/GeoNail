/**
 * Critical Subsidence Emergency Alert Banner (Light Theme)
 * Clean, restrained notification bar with honest email & SMS status reporting.
 * SIH 2026 Problem Statement: PS 26025
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatDecimal, formatTimeOnly } from '../../utils/formatters';

export function CriticalAlertBanner({ alert, onDismiss }) {
  if (!alert) return null;

  return (
    <div className="w-full bg-red-50 border-y border-red-300 px-5 py-2.5 shadow-sm relative select-none z-30 animate-fadeIn">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Warning Details */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-red-100 border border-red-300 rounded text-red-700">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-700 uppercase tracking-wide">
                CRITICAL SUBSIDENCE ALERT
              </span>
              <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                RISK {formatDecimal(alert.risk_score, 2)}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                [{formatTimeOnly(alert.timestamp)}]
              </span>
            </div>
            <p className="text-slate-700 font-mono text-[11px] mt-0.5">
              Node: <strong className="text-slate-900">{alert.node_id}</strong> • Zone: <strong className="text-slate-900">{alert.zone || 'Extraction Zone'}</strong> • {alert.trigger_reason || alert.message}
            </p>
          </div>
        </div>

        {/* Dispatch Status */}
        <div className="flex items-center gap-3 text-xs font-mono bg-white px-3 py-1 rounded border border-red-200 shadow-xs">
          <span className="text-slate-600">Email: <strong className={alert.email_status === 'SENT' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>{alert.email_status || 'NOT CONFIGURED'}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">SMS: <strong className={alert.sms_status === 'SENT' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>{alert.sms_status || 'NOT CONFIGURED'}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">Siren: <strong className="text-red-700">{alert.siren_status || 'TRIGGERED'}</strong></span>
        </div>

        {/* Close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-red-100 transition-colors"
            title="Dismiss alert banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

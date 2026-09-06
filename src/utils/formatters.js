/**
 * Industrial SCADA Formatting Utilities (Light Theme)
 * Safely renders '--' for missing or unmeasured telemetry channels.
 */

import { format, parseISO } from 'date-fns';

export function formatTimestamp(isoString) {
  if (!isoString) return '--';
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return '--';
  }
}

export function formatTimeOnly(isoString) {
  if (!isoString) return '--';
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    return format(date, 'HH:mm:ss');
  } catch {
    return '--';
  }
}

export function formatDecimal(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '--';
  return Number(val).toFixed(decimals);
}

export function getStatusColor(status) {
  switch (String(status).toUpperCase()) {
    case 'CRITICAL':
    case '3':
      return {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-50 text-red-700 border border-red-300 font-semibold',
        hex: '#DC2626',
        name: 'CRITICAL'
      };
    case 'WARNING':
    case '2':
      return {
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        badge: 'bg-orange-50 text-orange-700 border border-orange-300 font-semibold',
        hex: '#F97316',
        name: 'WARNING'
      };
    case 'WATCH':
    case '1':
      return {
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-700 border border-amber-300 font-semibold',
        hex: '#EAB308',
        name: 'WATCH'
      };
    case 'NORMAL':
    case '0':
      return {
        text: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold',
        hex: '#16A34A',
        name: 'NORMAL'
      };
    case 'NO DATA':
    default:
      return {
        text: 'text-slate-500',
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-600 border border-slate-300',
        hex: '#64748B',
        name: 'NO DATA'
      };
  }
}

export function getRiskLevelFromScore(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return { label: '--', state: -1, ...getStatusColor('NO DATA') };
  }
  if (score >= 0.80) return { label: 'CRITICAL', state: 3, ...getStatusColor('CRITICAL') };
  if (score >= 0.55) return { label: 'WARNING', state: 2, ...getStatusColor('WARNING') };
  if (score >= 0.30) return { label: 'WATCH', state: 1, ...getStatusColor('WATCH') };
  return { label: 'NORMAL', state: 0, ...getStatusColor('NORMAL') };
}

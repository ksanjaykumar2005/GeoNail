/**
 * Industrial SCADA Navigation Sidebar (Light Theme)
 * Clean, standard navigation panel without artificial location cards.
 */

import React from 'react';
import {
  LayoutDashboard,
  Box,
  Activity,
  Cpu,
  BellRing,
  Download,
  HeartPulse,
  Radio,
  Server
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export function Sidebar({ currentView, onViewChange }) {
  const { dataSource, isHardware, hardwareGatewayStatus, onlineHardwareNodesCount, alerts } = useTelemetry();

  const isConnected = isHardware ? hardwareGatewayStatus.is_connected : true;
  const criticalCount = alerts.filter(a => a.hazard_state === 'CRITICAL' && !a.acknowledged).length;

  const navItems = [
    { id: 'command-center', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'digital-twin', label: 'Digital Twin', icon: Box },
    { id: 'telemetry', label: 'Live Telemetry', icon: Activity },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: Cpu },
    { id: 'alerts', label: 'Alerts & Events', icon: BellRing, count: criticalCount },
    { id: 'export', label: 'Data Export', icon: Download },
    { id: 'system-health', label: 'System Health', icon: HeartPulse }
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between select-none h-full z-20 flex-shrink-0 shadow-sm">
      {/* Top Navigation Links */}
      <div>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              GN
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 tracking-tight">
                GeoNail
              </div>
              <div className="text-[11px] text-slate-500 font-normal">
                Mine Safety System
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full px-3 py-2.5 rounded-md text-xs flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-600 text-white shadow-sm">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Infrastructure Status */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span className="font-medium">Gateway</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-slate-800 font-bold">GW-01</span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={isConnected ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span className="font-medium">Nodes</span>
          <span className="text-slate-800 font-mono font-bold text-[11px]">
            {isHardware ? `${onlineHardwareNodesCount} / 8` : '8 / 8'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
          <span className="text-slate-500 font-medium">Data Source</span>
          <span className="text-blue-700 font-bold">
            {dataSource === 'HARDWARE' ? 'HARDWARE' : 'DEMO SIMULATION'}
          </span>
        </div>
      </div>
    </aside>
  );
}

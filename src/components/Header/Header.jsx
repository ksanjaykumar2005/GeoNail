/**
 * Industrial SCADA Operations Header (Light Theme)
 * Professional top bar with GeoNail branding, dual operating mode selector, and live hardware connection status.
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTelemetry } from '../../context/TelemetryContext';
import { Radio } from 'lucide-react';

export function Header() {
  const {
    dataSource,
    setDataSource,
    isHardware,
    hardwareGatewayStatus
  } = useTelemetry();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = isHardware ? hardwareGatewayStatus.is_connected : true;

  return (
    <header className="w-full bg-white border-b border-slate-200 px-5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none shadow-sm z-20">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
          GN
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              GeoNail
            </h1>
            <span className="text-xs text-slate-500 font-normal">
              | Mine Safety Monitoring System
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Real-Time Geotechnical & Surface Deformation Monitoring
          </p>
        </div>
      </div>

      {/* Right: Primary Data Source Switch & Gateway Status */}
      <div className="flex items-center gap-3 text-xs">
        {/* Data Source Buttons (EXACTLY TWO MODES) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
          <button
            onClick={() => setDataSource('HARDWARE')}
            className={`px-3 py-1.5 rounded font-medium transition-all text-xs flex items-center gap-1.5 ${
              dataSource === 'HARDWARE'
                ? 'bg-white text-blue-700 font-bold border border-blue-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              dataSource === 'HARDWARE' 
                ? (isConnected ? 'bg-emerald-500' : 'bg-slate-400') 
                : 'bg-slate-400'
            }`} />
            <span>HARDWARE</span>
          </button>

          <button
            onClick={() => setDataSource('DEMO')}
            className={`px-3 py-1.5 rounded font-medium transition-all text-xs flex items-center gap-1.5 ${
              dataSource === 'DEMO'
                ? 'bg-white text-blue-700 font-bold border border-blue-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              dataSource === 'DEMO' ? 'bg-emerald-500' : 'bg-slate-400'
            }`} />
            <span>DEMO SIMULATION</span>
          </button>
        </div>

        {/* Gateway Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span className="text-slate-500">Gateway:</span>
          <span className={`font-semibold ${isConnected ? 'text-emerald-700' : 'text-slate-500'}`}>
            {isConnected ? 'GW-01 CONNECTED' : 'NOT CONNECTED'}
          </span>
        </div>

        {/* Live Clock */}
        <div className="text-right font-mono text-xs hidden md:block pl-2 border-l border-slate-200">
          <div className="text-slate-800 font-semibold">
            {format(time, 'HH:mm:ss')}
          </div>
          <div className="text-[11px] text-slate-500">
            {format(time, 'yyyy-MM-dd')}
          </div>
        </div>
      </div>
    </header>
  );
}

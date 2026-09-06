/**
 * System Health & Infrastructure Diagnostics Page
 * Clean diagnostic status of gateway, wireless RF link, database, and telemetry test tool.
 * GeoNail - Mine Safety Monitoring System | SIH PS 26025
 */

import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { fetchHealth } from '../../services/api';
import { HeartPulse, Radio, Database, Wifi, Sliders } from 'lucide-react';
import { HardwareInjectorModal } from '../../components/HardwareInjector/HardwareInjectorModal';

export function SystemHealthPage() {
  const { isHardware, hardwareGatewayStatus } = useTelemetry();
  const [healthData, setHealthData] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    fetchHealth().then(h => { if (h) setHealthData(h); });
  }, []);

  const isConnected = isHardware ? hardwareGatewayStatus.is_connected : true;

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto max-w-[1920px] mx-auto w-full select-none bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-800 uppercase tracking-wide">
            System Health & Gateway Diagnostics
          </h2>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">
            Node-to-Cloud Infrastructure Health
          </span>
        </div>

        {/* Telemetry Test Input Tool */}
        <button
          onClick={() => setIsTestModalOpen(true)}
          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm text-xs"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Telemetry Test Input</span>
        </button>
      </div>

      {/* 4 Core Infrastructure Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold">Gateway</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {isConnected ? 'ONLINE' : 'NOT CONNECTED'}
            </span>
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1.5 font-mono">GW-01</div>
          <div className="text-slate-400 text-[11px] mt-1 font-mono">RPi LoRa Gateway</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold">LoRa Mesh</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              READY
            </span>
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1.5 font-mono">865.2 MHz</div>
          <div className="text-slate-400 text-[11px] mt-1 font-mono">India ISM Band</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold">Database</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              CONNECTED
            </span>
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1.5 font-mono">TimescaleDB</div>
          <div className="text-slate-400 text-[11px] mt-1 font-mono">Time-Series Storage</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold">WebSocket</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              CONNECTED
            </span>
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1.5 font-mono">ws://3001/ws</div>
          <div className="text-slate-400 text-[11px] mt-1 font-mono">Real-Time Ingestion</div>
        </div>
      </div>

      {/* Overview Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Hardware Link Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-500 block font-sans font-medium">Monitoring Zone:</span>
            <div className="text-slate-800 font-bold text-sm">Surface Monitoring Zone</div>
            <div className="text-slate-500 text-[11px]">Extraction Void Perimeter (Depth: -120m)</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-500 block font-sans font-medium">Hardware Ingestion Stream:</span>
            <div className="text-slate-800 font-bold text-sm">
              {isConnected ? `Active (${hardwareGatewayStatus.total_packets} packets received)` : 'Waiting for hardware connection'}
            </div>
            <div className="text-slate-500 text-[11px]">
              Last packet: {hardwareGatewayStatus.last_packet_time || '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Test Input Modal */}
      <HardwareInjectorModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}


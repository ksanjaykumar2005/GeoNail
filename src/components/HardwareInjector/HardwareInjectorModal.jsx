/**
 * Telemetry Test Input Tool (Modal - Light Theme)
 * Allows engineers and judges to send test hardware telemetry to the /api/telemetry backend endpoint.
 */

import React, { useState } from 'react';
import { X, Send, Sliders } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export function HardwareInjectorModal({ isOpen, onClose }) {
  const { injectHardwareTelemetry, setDataSource } = useTelemetry();

  const [nodeId, setNodeId] = useState('N06');
  const [disp, setDisp] = useState(5.21);
  const [dispRate, setDispRate] = useState(1.40);
  const [tiltX, setTiltX] = useState(0.62);
  const [tiltY, setTiltY] = useState(0.31);
  const [vibrationRms, setVibrationRms] = useState(0.74);
  const [crackWidth, setCrackWidth] = useState(1.80);
  const [neighborCorr, setNeighborCorr] = useState(0.88);
  const [riskScore, setRiskScore] = useState(0.91);
  const [hazardState, setHazardState] = useState(3);
  const [batteryMv, setBatteryMv] = useState(3860);

  const [statusMsg, setStatusMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    const packet = {
      node_id: nodeId,
      timestamp: new Date().toISOString(),
      tilt_x: Number(tiltX),
      tilt_y: Number(tiltY),
      displacement: Number(disp),
      disp_rate: Number(dispRate),
      vibration_rms: Number(vibrationRms),
      crack_width: Number(crackWidth),
      neighbor_corr: Number(neighborCorr),
      risk_score: Number(riskScore),
      hazard_state: Number(hazardState),
      battery_mv: Number(batteryMv),
      rssi: -86,
      snr: 9.2
    };

    try {
      const res = await injectHardwareTelemetry(packet);
      setDataSource('HARDWARE');
      setStatusMsg({ type: 'success', text: `Telemetry Ingested (ID: ${res.record_id || 'OK'}). Switched to HARDWARE mode.` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Ingestion failed: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPreset = (presetName) => {
    if (presetName === 'CRITICAL') {
      setNodeId('N06');
      setDisp(5.21);
      setDispRate(1.40);
      setTiltX(0.62);
      setTiltY(0.31);
      setVibrationRms(0.74);
      setCrackWidth(1.80);
      setNeighborCorr(0.88);
      setRiskScore(0.91);
      setHazardState(3);
    } else if (presetName === 'NORMAL') {
      setNodeId('N01');
      setDisp(0.18);
      setDispRate(0.02);
      setTiltX(0.04);
      setTiltY(0.02);
      setVibrationRms(0.03);
      setCrackWidth(0.05);
      setNeighborCorr(0.12);
      setRiskScore(0.15);
      setHazardState(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Hardware Telemetry Test Tool
              </h3>
              <p className="text-[11px] text-slate-500">
                Transmits custom sensor readings to the backend API (<code className="text-blue-600 bg-slate-100 px-1 py-0.2 rounded font-mono">POST /api/telemetry</code>)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-600 font-sans font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('CRITICAL')}
            className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold hover:bg-red-100 transition-colors"
          >
            Critical Alert (N06)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('NORMAL')}
            className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold hover:bg-emerald-100 transition-colors"
          >
            Normal Baseline (N01)
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleInject} className="space-y-3 font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Station Node</label>
              <select
                value={nodeId}
                onChange={e => setNodeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              >
                {['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08'].map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Displacement (mm)</label>
              <input
                type="number"
                step="0.01"
                value={disp}
                onChange={e => setDisp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Disp Rate (mm/hr)</label>
              <input
                type="number"
                step="0.01"
                value={dispRate}
                onChange={e => setDispRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Tilt Pitch X (°)</label>
              <input
                type="number"
                step="0.01"
                value={tiltX}
                onChange={e => setTiltX(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Tilt Roll Y (°)</label>
              <input
                type="number"
                step="0.01"
                value={tiltY}
                onChange={e => setTiltY(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Vibration RMS (g)</label>
              <input
                type="number"
                step="0.01"
                value={vibrationRms}
                onChange={e => setVibrationRms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Crack Width (mm)</label>
              <input
                type="number"
                step="0.01"
                value={crackWidth}
                onChange={e => setCrackWidth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Neighbor Corr</label>
              <input
                type="number"
                step="0.01"
                value={neighborCorr}
                onChange={e => setNeighborCorr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-sans font-medium">Risk Score (0-1)</label>
              <input
                type="number"
                step="0.01"
                value={riskScore}
                onChange={e => setRiskScore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {statusMsg && (
            <div className={`p-2.5 rounded-md text-xs ${
              statusMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'bg-red-50 border border-red-300 text-red-800'
            }`}>
              {statusMsg.text}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-sans font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md font-sans flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting...' : 'Send Hardware Packet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

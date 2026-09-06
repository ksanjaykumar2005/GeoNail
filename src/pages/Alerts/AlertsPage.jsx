/**
 * Alerts & Incident Events Log Page
 * Clean operational log of geotechnical early warning triggers and dispatch statuses.
 * GeoNail - Mine Safety Monitoring System | SIH PS 26025
 */

import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { formatTimestamp, getStatusColor, formatDecimal } from '../../utils/formatters';
import { exportAlertsToCSV } from '../../utils/exportCsv';
import { BellRing, Download, Filter, X, ChevronRight } from 'lucide-react';

export function AlertsPage() {
  const { alerts, triggerDemoAlert } = useTelemetry();

  const [filterState, setFilterState] = useState('ALL');
  const [filterNode, setFilterNode] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const filteredAlerts = alerts.filter(a => {
    if (filterState !== 'ALL' && a.hazard_state !== filterState) return false;
    if (filterNode !== 'ALL' && a.node_id !== filterNode) return false;
    return true;
  });

  const handleTriggerDemoAlert = async () => {
    setIsTriggering(true);
    try {
      await triggerDemoAlert();
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden max-w-[1920px] mx-auto w-full select-none bg-[#F5F7FA]">
      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-800 uppercase tracking-wide">
            Alerts & Events Log
          </h2>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-mono font-medium">
            {filteredAlerts.length} Records Logged
          </span>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              className="bg-transparent text-slate-700 outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
              <option value="WATCH">WATCH</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
            <select
              value={filterNode}
              onChange={e => setFilterNode(e.target.value)}
              className="bg-transparent text-slate-700 outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Stations</option>
              {['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08'].map(id => (
                <option key={id} value={id}>Node {id}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTriggerDemoAlert}
            disabled={isTriggering}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm text-xs"
            title="Trigger a live SIH demonstration critical subsidence alert for N06"
          >
            <BellRing className="w-3.5 h-3.5 animate-pulse" />
            <span>{isTriggering ? 'DISPATCHING...' : 'DEMO ALERT'}</span>
          </button>

          <button
            onClick={() => exportAlertsToCSV(filteredAlerts)}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
        <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden shadow-sm">
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 z-10 font-sans font-semibold">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Node</th>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Risk</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Trigger Reason</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">SMS</th>
                  <th className="p-3">Action</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-sans text-xs">
                      No incident events recorded.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert, idx) => {
                    const colorInfo = getStatusColor(alert.hazard_state);
                    const isSelected = selectedAlert?.id === alert.id;

                    return (
                      <tr
                        key={alert.id || idx}
                        onClick={() => setSelectedAlert(alert)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3 whitespace-nowrap text-slate-600">
                          {formatTimestamp(alert.timestamp)}
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {alert.node_id}
                        </td>
                        <td className="p-3 text-slate-500 font-sans">
                          {alert.zone || 'Surface Zone'}
                        </td>
                        <td className="p-3 font-bold" style={{ color: colorInfo.hex }}>
                          {formatDecimal(alert.risk_score, 2)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colorInfo.badge}`}>
                            {alert.hazard_state}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs truncate font-sans">
                          {alert.trigger_reason || alert.message}
                        </td>
                        <td className="p-3">
                          <span className={alert.email_status === 'SENT' ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' : 'text-slate-400 font-medium'}>
                            {alert.email_status || 'NOT CONFIGURED'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={alert.sms_status === 'SENT' ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' : 'text-slate-400 font-medium'}>
                            {alert.sms_status || 'NOT CONFIGURED'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[10px]">
                            {alert.siren_status || 'ALERT'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 inline-block" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Forensic Drawer */}
        {selectedAlert && (
          <div className="w-80 bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between overflow-y-auto z-20 shadow-lg">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Incident Forensics
                </span>
                <button onClick={() => setSelectedAlert(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
                <div className="text-slate-400 text-[10px] font-sans font-medium">TRIGGER TIME</div>
                <div className="text-slate-800 font-semibold">{formatTimestamp(selectedAlert.timestamp)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans font-medium">STATION</span>
                  <span className="text-slate-800 font-bold text-sm">{selectedAlert.node_id}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans font-medium">RISK INDEX</span>
                  <span className="text-red-600 font-bold text-sm">{formatDecimal(selectedAlert.risk_score, 2)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="text-slate-600 font-semibold block text-xs">Trigger Reason:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed font-sans">
                  {selectedAlert.trigger_reason || selectedAlert.message}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Email Dispatch:</span>
                  <span className={selectedAlert.email_status === 'SENT' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {selectedAlert.email_status || 'NOT CONFIGURED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">SMS Dispatch:</span>
                  <span className={selectedAlert.sms_status === 'SENT' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {selectedAlert.sms_status || 'NOT CONFIGURED'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => exportAlertsToCSV([selectedAlert])}
              className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
              Export Record CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


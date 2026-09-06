/**
 * Date-Range Geotechnical CSV Data Export Page
 * Generates official regulatory CSV archives for mine subsidence telemetry and incident logs.
 * GeoNail - Mine Safety Monitoring System | SIH PS 26025
 */

import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { exportAlertsToCSV, exportTelemetryToCSV } from '../../utils/exportCsv';
import { format } from 'date-fns';
import { Download, Calendar, Filter } from 'lucide-react';

export function ExportPage() {
  const { alerts, activeHistoryMap, isHardware } = useTelemetry();

  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exportType, setExportType] = useState('ALERTS'); // 'ALERTS' or 'TELEMETRY'
  const [selectedStation, setSelectedStation] = useState('ALL');

  const filteredAlerts = alerts.filter(a => {
    try {
      const aDate = format(new Date(a.timestamp), 'yyyy-MM-dd');
      if (startDate && aDate < startDate) return false;
      if (endDate && aDate > endDate) return false;
      if (selectedStation !== 'ALL' && a.node_id !== selectedStation) return false;
      return true;
    } catch {
      return true;
    }
  });

  const handleDownloadAlerts = () => {
    if (filteredAlerts.length === 0) {
      alert('No records available for selected period.');
      return;
    }
    const filename = `geonail-alerts-${startDate}-to-${endDate}.csv`;
    exportAlertsToCSV(filteredAlerts, startDate, endDate, filename);
  };

  const handleDownloadTelemetry = () => {
    let allTelemetry = [];
    if (selectedStation === 'ALL') {
      Object.values(activeHistoryMap).forEach(list => {
        allTelemetry = allTelemetry.concat(list);
      });
    } else {
      allTelemetry = activeHistoryMap[selectedStation] || [];
    }

    if (allTelemetry.length === 0) {
      alert('No telemetry records available for selected station.');
      return;
    }

    exportTelemetryToCSV(allTelemetry, selectedStation);
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto max-w-[1920px] mx-auto w-full select-none bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-800 uppercase tracking-wide">
            Data Export Engine
          </h2>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">
            DGMS Statutory Compliance Form 26
          </span>
        </div>
      </div>

      {/* Export Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase">
              EXPORT DATASET ARCHIVE
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Select date interval and target monitoring stations to generate official CSV files.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setExportType('TELEMETRY')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                exportType === 'TELEMETRY' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Telemetry
            </button>
            <button
              onClick={() => setExportType('ALERTS')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                exportType === 'ALERTS' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alerts & Incidents
            </button>
            <button
              onClick={() => setExportType('COMBINED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                exportType === 'COMBINED' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Combined Dataset
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-600 block mb-1.5 font-sans font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Start Date:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1.5 font-sans font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>End Date:</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1.5 font-sans font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Station:</span>
            </label>
            <select
              value={selectedStation}
              onChange={e => setSelectedStation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Stations (N01 - N08)</option>
              {['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08'].map(id => (
                <option key={id} value={id}>Station {id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono font-medium">
            {exportType === 'ALERTS'
              ? `${filteredAlerts.length} alert records ready`
              : (exportType === 'COMBINED' ? 'Combined regulatory archive ready' : 'Time-series telemetry ready')}
          </span>

          <button
            onClick={() => {
              if (exportType === 'ALERTS') {
                handleDownloadAlerts();
              } else if (exportType === 'TELEMETRY') {
                handleDownloadTelemetry();
              } else {
                handleDownloadAlerts();
                setTimeout(() => handleDownloadTelemetry(), 300);
              }
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors flex items-center gap-2 shadow-sm text-xs"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}


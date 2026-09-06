/**
 * Main Application Layout Shell (Light Theme)
 * Professional geotechnical SCADA frame coordinating navigation and pages.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useState } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { CriticalAlertBanner } from '../AlertPanel/CriticalAlertBanner';
import { useTelemetry } from '../../context/TelemetryContext';

import { CommandCenter } from '../../pages/CommandCenter/CommandCenter';
import { DigitalTwinPage } from '../../pages/DigitalTwin/DigitalTwinPage';
import { TelemetryPage } from '../../pages/Telemetry/TelemetryPage';
import { RiskAnalysisPage } from '../../pages/RiskAnalysis/RiskAnalysisPage';
import { AlertsPage } from '../../pages/Alerts/AlertsPage';
import { ExportPage } from '../../pages/Export/ExportPage';
import { SystemHealthPage } from '../../pages/SystemHealth/SystemHealthPage';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

export function AppLayout() {
  const {
    activeCriticalAlert,
    setActiveCriticalAlert
  } = useTelemetry();

  const [currentView, setCurrentView] = useState('command-center');

  return (
    <div className="flex h-screen w-screen bg-[#F5F7FA] text-[#1F2937] overflow-hidden select-none font-sans">
      {/* Navigation Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Operations Stage */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F5F7FA]">
        {/* Operations Header */}
        <Header />

        {/* Emergency Alert Banner */}
        {activeCriticalAlert && (
          <CriticalAlertBanner
            alert={activeCriticalAlert}
            onDismiss={() => setActiveCriticalAlert(null)}
          />
        )}

        {/* Active Page View Protected by ErrorBoundary */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <ErrorBoundary key={currentView}>
            {currentView === 'command-center' && <CommandCenter onViewChange={setCurrentView} />}
            {currentView === 'digital-twin' && <DigitalTwinPage />}
            {currentView === 'telemetry' && <TelemetryPage />}
            {currentView === 'risk-analysis' && <RiskAnalysisPage />}
            {currentView === 'alerts' && <AlertsPage />}
            {currentView === 'export' && <ExportPage />}
            {currentView === 'system-health' && <SystemHealthPage />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

import React from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import { AppLayout } from './components/Layout/AppLayout';

export default function App() {
  return (
    <TelemetryProvider>
      <AppLayout />
    </TelemetryProvider>
  );
}

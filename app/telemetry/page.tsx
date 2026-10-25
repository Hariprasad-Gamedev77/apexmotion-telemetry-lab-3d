'use client';

// APEX TELEMETRY 3D — Full Vehicle Telemetry Dashboard
// Light Theme with Reeve styling, vibrant driver badges, and live traces

import React, { useState } from 'react';
import { LiveDashboardHUD } from '@/components/telemetry/LiveDashboardHUD';
import { SplitTelemetryWorkbench } from '@/components/charts/SplitTelemetryWorkbench';
import { SynchronizedTelemetryChart } from '@/components/charts/SynchronizedTelemetryChart';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { Activity } from 'lucide-react';
import { useApexStore } from '@/lib/store';

export default function VehicleTelemetryPage() {
  const { drivers, selectedDriverNumber } = useApexStore();
  const driver = drivers.find((d) => d.driverNumber === selectedDriverNumber);
  const [chartMode, setChartMode] = useState<'split' | 'overlay'>('split');

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] select-none bg-slate-50">
      <div className="p-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono text-slate-900">
                VEHICLE TELEMETRY COCKPIT
              </h1>
              <p className="text-xs font-mono font-medium text-slate-500 mt-0.5">
                Driver: {driver?.name} (#{driver?.driverNumber}) • Live HUD & Traces
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setChartMode('split')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                chartMode === 'split'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Split Panes
            </button>
            <button
              onClick={() => setChartMode('overlay')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                chartMode === 'overlay'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Overlay Single
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <LiveDashboardHUD />
          </div>
          <div className="md:col-span-2">
            {chartMode === 'split' ? (
              <SplitTelemetryWorkbench />
            ) : (
              <SynchronizedTelemetryChart height={340} />
            )}
          </div>
        </div>
      </div>

      <ReplayControls />
    </div>
  );
}

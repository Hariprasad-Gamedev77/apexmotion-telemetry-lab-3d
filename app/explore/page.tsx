'use client';

// APEX TELEMETRY 3D — Full Telemetry Explorer Workbench
// Light Theme with Reeve styling, Formula Telemetry tabs, and synchronized traces

import React, { useState } from 'react';
import { SplitTelemetryWorkbench } from '@/components/charts/SplitTelemetryWorkbench';
import { SynchronizedTelemetryChart } from '@/components/charts/SynchronizedTelemetryChart';
import { FormulaTelemetrySuite, type FormulaTelemetryTab } from '@/components/charts/FormulaTelemetrySuite';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { LineChart } from 'lucide-react';

export default function TelemetryExplorerPage() {
  const [activeTab, setActiveTab] = useState<FormulaTelemetryTab>('telemetry');
  const [viewMode, setViewMode] = useState<'split' | 'overlay'>('split');

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] select-none bg-slate-50">
      <div className="p-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <LineChart size={20} />
              </div>
              <h1 className="text-2xl font-bold font-mono text-slate-900">
                TELEMETRY EXPLORER WORKBENCH
              </h1>
            </div>
            <p className="text-xs font-mono font-medium text-slate-500 mt-1">
              Multi-channel signal inspection • Speed, Throttle, Brake, Gear, RPM, & G-Forces
            </p>
          </div>
        </div>

        {/* Formula Telemetry Navigation Tabs */}
        <FormulaTelemetrySuite activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Telemetry Display when Telemetry Tab is Active */}
        {activeTab === 'telemetry' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                    viewMode === 'split'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Split Panes
                </button>
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                    viewMode === 'overlay'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Overlay Single
                </button>
              </div>
            </div>

            {viewMode === 'split' ? (
              <SplitTelemetryWorkbench />
            ) : (
              <SynchronizedTelemetryChart height={340} />
            )}
          </div>
        )}
      </div>

      <ReplayControls />
    </div>
  );
}

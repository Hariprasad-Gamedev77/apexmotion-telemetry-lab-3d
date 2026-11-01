'use client';

// APEX TELEMETRY 3D — System Diagnostics & Performance Monitor
// Light Theme with Reeve styling and vibrant metrics

import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { useApexStore } from '@/lib/store';

export default function DiagnosticsPage() {
  const { diagnostics, dataMode, wsConnected, telemetryHistory } = useApexStore();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
          <Cpu size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-mono text-slate-900">
            SYSTEM DIAGNOSTICS & TELEMETRY HEALTH
          </h1>
          <p className="text-xs font-mono font-medium text-slate-500 mt-0.5">
            Collector metrics are shown only when reported; rendering performance is not instrumented
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>RENDER WORKER</span>
            <Activity size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">Not measured</div>
          <div className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
            <CheckCircle2 size={13} /> {dataMode === 'synthetic' ? 'Synthetic mode selected' : 'GPU capability unverified'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>PHYSICS INTEGRATION</span>
            <Cpu size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">{diagnostics.packetsReceived} packets received</div>
          <div className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
            <CheckCircle2 size={13} /> {wsConnected ? 'WebSocket open' : 'WebSocket disconnected'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>MEMORY BUFFER</span>
            <ShieldCheck size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">{telemetryHistory.length} samples in view</div>
          <div className="text-xs font-mono font-semibold text-purple-700 flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 w-fit">
            <CheckCircle2 size={13} /> Collector packet rate: {diagnostics.estimatedPacketRateHz.toFixed(1)} Hz
          </div>
        </div>
      </div>
    </div>
  );
}

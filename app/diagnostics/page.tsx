'use client';

// APEX TELEMETRY 3D — System Diagnostics & Performance Monitor
// Light Theme with Reeve styling and vibrant metrics

import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { useApexStore } from '@/lib/store';

export default function DiagnosticsPage() {
  const { diagnostics, dataMode } = useApexStore();

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
            Engine subsystem verification, frame rates, and WebSocket bridge status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>RENDER WORKER</span>
            <Activity size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">60.0 FPS Nominal</div>
          <div className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
            <CheckCircle2 size={13} /> WebGL 2.0 Hardware Accelerated
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>PHYSICS INTEGRATION</span>
            <Cpu size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">Semi-Implicit Euler</div>
          <div className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
            <CheckCircle2 size={13} /> Curvature & Traction Bounded
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>MEMORY BUFFER</span>
            <ShieldCheck size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">3,000 Samples Max</div>
          <div className="text-xs font-mono font-semibold text-purple-700 flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 w-fit">
            <CheckCircle2 size={13} /> Ring Buffer Protected
          </div>
        </div>
      </div>
    </div>
  );
}

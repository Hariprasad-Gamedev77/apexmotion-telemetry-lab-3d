'use client';

// APEX TELEMETRY 3D — Tyre Strategy & Stint Degradation Analysis
// Light Theme with high-contrast typography, vibrant compound badges, and Reeve styling

import React from 'react';
import { useApexStore } from '@/lib/store';
import { CircleDot, ShieldAlert } from 'lucide-react';

export default function TyresPage() {
  const { drivers } = useApexStore();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <CircleDot size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              TYRE STRATEGY & STINT ANALYSIS
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            Compound allocation, stint durations & pace degradation models
          </p>
        </div>

        {/* Engineering Integrity Notice */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full shadow-xs">
          <ShieldAlert size={14} className="text-amber-600" />
          <span>Observed lap pace analysis • Inferred degradation estimates</span>
        </div>
      </div>

      {/* Stint Overview Timeline */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
        <span className="font-mono font-bold text-xs uppercase text-slate-800 tracking-wider">
          DRIVER STINT PROGRESSION (CURRENT RACE DISTANCE)
        </span>

        <div className="space-y-4">
          {drivers.map((drv) => (
            <div key={drv.driverNumber} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-900">
                  #{drv.driverNumber} {drv.code} ({drv.name})
                </span>
                <span className="text-slate-500 font-semibold">
                  Stint 1: <strong className="text-amber-700">{drv.tyreCompound}</strong> ({drv.stintLaps} laps)
                </span>
              </div>

              {/* Stint Visual Bar */}
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-[10px] font-mono font-bold text-amber-950 rounded-full shadow-xs"
                  style={{ width: `${(drv.stintLaps / 52) * 100}%` }}
                >
                  {drv.stintLaps} Laps
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compound Characteristics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-rose-600">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            <h3 className="font-mono font-bold text-sm tracking-wider">SOFT (C4 / C5)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Peak mechanical grip, rapid warm-up window. High thermal degradation (~0.12s per lap falloff). Optimal for qualifying and sprint stints.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-amber-600">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <h3 className="font-mono font-bold text-sm tracking-wider">MEDIUM (C3)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Balanced endurance and lateral grip. Nominal stint window: 22-28 laps. Linear degradation profile (~0.06s per lap).
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-slate-800">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-300 ring-2 ring-slate-400" />
            <h3 className="font-mono font-bold text-sm tracking-wider">HARD (C1 / C2)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Maximum carcass longevity. Resists thermal blistering on high-energy circuits. Low degradation (~0.03s per lap).
          </p>
        </div>
      </div>
    </div>
  );
}

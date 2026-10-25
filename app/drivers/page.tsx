'use client';

// APEX TELEMETRY 3D — Multi-Driver Telemetry & Head-to-Head Comparison
// Light Theme with vibrant team colors, clean cards, and Reeve-inspired styling

import React, { useState } from 'react';
import { useApexStore } from '@/lib/store';
import { Users } from 'lucide-react';
import { formatLapTime, formatSpeed } from '@/lib/utils';

export default function DriverComparisonPage() {
  const { drivers, circuit } = useApexStore();
  const [driver1Num, setDriver1Num] = useState<number>(1); // VER
  const [driver2Num, setDriver2Num] = useState<number>(4); // NOR

  const d1 = drivers.find((d) => d.driverNumber === driver1Num) || drivers[0];
  const d2 = drivers.find((d) => d.driverNumber === driver2Num) || drivers[1];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Users size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              HEAD-TO-HEAD DRIVER COMPARISON
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            Telemetry overlays & pace differential • {circuit.name}
          </p>
        </div>

        {/* Driver Selection Controls */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Driver A:</span>
            <select
              value={driver1Num}
              onChange={(e) => setDriver1Num(parseInt(e.target.value))}
              aria-label="Select Driver A for comparison"
              className="bg-slate-50 text-xs font-mono font-semibold text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {drivers.map((d) => (
                <option key={d.driverNumber} value={d.driverNumber}>
                  #{d.driverNumber} {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-400 font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded-md">VS</span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Driver B:</span>
            <select
              value={driver2Num}
              onChange={(e) => setDriver2Num(parseInt(e.target.value))}
              aria-label="Select Driver B for comparison"
              className="bg-slate-50 text-xs font-mono font-semibold text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {drivers.map((d) => (
                <option key={d.driverNumber} value={d.driverNumber}>
                  #{d.driverNumber} {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Driver Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver 1 Card */}
        <div
          className="bg-white border-2 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden shadow-sm"
          style={{ borderColor: d1.color }}
        >
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-2xl pointer-events-none"
            style={{ backgroundColor: d1.color }}
          />
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full ring-2 ring-white shadow-xs" style={{ backgroundColor: d1.color }} />
              <div>
                <h2 className="text-xl font-bold font-mono text-slate-900">{d1.name}</h2>
                <div className="text-xs font-mono font-semibold text-slate-500">{d1.team}</div>
              </div>
            </div>
            <span className="text-3xl font-black font-mono" style={{ color: d1.color }}>
              #{d1.driverNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">BEST LAP</span>
              <div className="text-xl font-black font-tabular text-sky-700 mt-1">
                {formatLapTime(d1.bestLapTime)}
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">GAP TO LEADER</span>
              <div className="text-xl font-bold font-tabular text-slate-800 mt-1">
                {d1.gapToLeader}
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">TOP VELOCITY</span>
              <div className="text-xl font-bold font-tabular text-slate-800 mt-1">
                {formatSpeed(d1.telemetry.speedKph)} KM/H
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">TYRE STINT</span>
              <div className="text-xl font-bold font-tabular text-amber-600 mt-1">
                {d1.tyreCompound} ({d1.stintLaps} Laps)
              </div>
            </div>
          </div>
        </div>

        {/* Driver 2 Card */}
        <div
          className="bg-white border-2 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden shadow-sm"
          style={{ borderColor: d2.color }}
        >
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-2xl pointer-events-none"
            style={{ backgroundColor: d2.color }}
          />
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full ring-2 ring-white shadow-xs" style={{ backgroundColor: d2.color }} />
              <div>
                <h2 className="text-xl font-bold font-mono text-slate-900">{d2.name}</h2>
                <div className="text-xs font-mono font-semibold text-slate-500">{d2.team}</div>
              </div>
            </div>
            <span className="text-3xl font-black font-mono" style={{ color: d2.color }}>
              #{d2.driverNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">BEST LAP</span>
              <div className="text-xl font-black font-tabular text-sky-700 mt-1">
                {formatLapTime(d2.bestLapTime)}
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">GAP TO LEADER</span>
              <div className="text-xl font-bold font-tabular text-slate-800 mt-1">
                {d2.gapToLeader}
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">TOP VELOCITY</span>
              <div className="text-xl font-bold font-tabular text-slate-800 mt-1">
                {formatSpeed(d2.telemetry.speedKph)} KM/H
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">TYRE STINT</span>
              <div className="text-xl font-bold font-tabular text-amber-600 mt-1">
                {d2.tyreCompound} ({d2.stintLaps} Laps)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

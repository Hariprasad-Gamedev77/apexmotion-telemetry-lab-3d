'use client';

// APEX TELEMETRY 3D — Live Timing Tower & Race Progression
// Light Theme with high-contrast typography, vibrant driver badges, and Reeve styling

import React from 'react';
import { useApexStore } from '@/lib/store';
import { Timer } from 'lucide-react';
import { formatLapTime } from '@/lib/utils';

export default function LiveTimingPage() {
  const { drivers, activeSession, dataMode } = useApexStore();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Timer size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              LIVE TIMING & RACE PROGRESSION
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            {dataMode === 'synthetic' ? 'SYNTHETIC GRID DEMO' : 'NO LIVE TIMING DATA'} • {activeSession.meetingName}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{dataMode === 'synthetic' ? 'SIMULATION MODE' : 'DISCONNECTED'}</span>
        </div>
      </div>

      {/* Main Timing Tower Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3.5 px-5">Pos</th>
                <th className="py-3.5 px-5">Driver</th>
                <th className="py-3.5 px-5">Constructor</th>
                <th className="py-3.5 px-5">Gap</th>
                <th className="py-3.5 px-5">Interval</th>
                <th className="py-3.5 px-5">Last Lap</th>
                <th className="py-3.5 px-5">Best Lap</th>
                <th className="py-3.5 px-5">Tyre</th>
                <th className="py-3.5 px-5">Laps</th>
                <th className="py-3.5 px-5 text-right">Pit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-500">
                    No timing records are loaded for this source.
                  </td>
                </tr>
              )}
              {drivers.map((drv, idx) => (
                <tr key={drv.driverNumber} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-black text-sm text-slate-900">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full ring-1 ring-white shadow-xs" style={{ backgroundColor: drv.color }} />
                      <span className="font-bold text-slate-900">{drv.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400">({drv.code})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-semibold">{drv.team}</td>
                  <td className="py-3.5 px-5 font-tabular font-bold text-slate-900">
                    {drv.gapToLeader}
                  </td>
                  <td className="py-3.5 px-5 font-tabular text-slate-500">
                    {drv.interval}
                  </td>
                  <td className="py-3.5 px-5 font-tabular font-bold text-sky-700">
                    {formatLapTime(drv.lastLapTime)}
                  </td>
                  <td className="py-3.5 px-5 font-tabular font-bold text-purple-700">
                    {formatLapTime(drv.bestLapTime)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 shadow-xs">
                      {drv.tyreCompound}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-tabular text-slate-700 font-semibold">{drv.stintLaps}</td>
                  <td className="py-3.5 px-5 text-right text-slate-400 font-semibold">0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

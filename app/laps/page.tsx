'use client';

// APEX TELEMETRY 3D — Lap & Sector Analysis Workbench
// Light Theme with vibrant color pills, clean white cards, and Reeve-inspired styling

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApexStore } from '@/lib/store';
import { formatLapTime, formatSectorTime } from '@/lib/utils';
import { ListOrdered, Play, Award, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LapAnalysisPage() {
  const router = useRouter();
  const { availableLaps, activeSession, drivers, selectedDriverNumber, setSelectedDriverNumber, setActiveLap } = useApexStore();
  const [selectedLapIndex, setSelectedLapIndex] = useState<number>(3);

  const selectedLap = availableLaps[selectedLapIndex] || availableLaps[0];
  const driver = drivers.find((d) => d.driverNumber === selectedDriverNumber);

  const handleOpenInReplay = (lapNum: number) => {
    setActiveLap(lapNum);
    router.push('/dashboard');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <ListOrdered size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              LAP & SECTOR ANALYSIS
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            Session: {activeSession.meetingName} • Circuit: {activeSession.circuitName} ({activeSession.year})
          </p>
        </div>

        {/* Driver Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          {drivers.map((drv) => (
            <button
              key={drv.driverNumber}
              onClick={() => setSelectedDriverNumber(drv.driverNumber)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                selectedDriverNumber === drv.driverNumber
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white" style={{ backgroundColor: drv.color }} />
              <span>{drv.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lap Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            BEST SESSION LAP
          </div>
          <div className="text-3xl font-black font-mono font-tabular text-purple-600 tracking-tight">
            1:21.942
          </div>
          <div className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-200">
            <Award size={12} /> VER • Lap 4
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            SECTOR 1 OPTIMAL
          </div>
          <div className="text-2xl font-bold font-mono font-tabular text-slate-800">
            26.711s
          </div>
          <div className="text-[11px] font-mono text-slate-500">Personal Best</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            SECTOR 2 OPTIMAL
          </div>
          <div className="text-2xl font-bold font-mono font-tabular text-slate-800">
            28.450s
          </div>
          <div className="text-[11px] font-mono text-slate-500">Personal Best</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            SECTOR 3 OPTIMAL
          </div>
          <div className="text-2xl font-bold font-mono font-tabular text-slate-800">
            26.781s
          </div>
          <div className="text-[11px] font-mono text-slate-500">Personal Best</div>
        </div>
      </div>

      {/* Lap Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-mono font-bold text-xs uppercase text-slate-800 tracking-wider">
            SESSION LAP TIME PROGRESSION
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Click row to inspect or launch 3D replay
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-5">Lap</th>
                <th className="py-3 px-5">Lap Time</th>
                <th className="py-3 px-5">Sector 1</th>
                <th className="py-3 px-5">Sector 2</th>
                <th className="py-3 px-5">Sector 3</th>
                <th className="py-3 px-5">Compound</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {availableLaps.map((lap, idx) => {
                const isSelected = idx === selectedLapIndex;
                return (
                  <tr
                    key={lap.lapNumber}
                    onClick={() => setSelectedLapIndex(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/70 text-slate-900 font-semibold'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      L{lap.lapNumber}
                    </td>
                    <td className="py-3.5 px-5 font-tabular font-bold text-sky-700">
                      {formatLapTime(lap.lapTimeSeconds)}
                    </td>
                    <td className="py-3.5 px-5 font-tabular text-slate-600">
                      {formatSectorTime(lap.sector1Seconds)}
                    </td>
                    <td className="py-3.5 px-5 font-tabular text-slate-600">
                      {formatSectorTime(lap.sector2Seconds)}
                    </td>
                    <td className="py-3.5 px-5 font-tabular text-slate-600">
                      {formatSectorTime(lap.sector3Seconds)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 shadow-xs">
                        {lap.tyreCompound}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {lap.isSessionBest ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 border border-purple-300 text-purple-700 shadow-xs">
                          PURPLE (BEST)
                        </span>
                      ) : lap.isPersonalBest ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 shadow-xs">
                          GREEN (PB)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-semibold">VALID</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInReplay(lap.lapNumber);
                        }}
                        className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition-all shadow-xs active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <Play size={10} fill="currentColor" /> Replay
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

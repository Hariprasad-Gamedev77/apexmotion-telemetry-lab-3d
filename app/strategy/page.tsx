'use client';

// APEX TELEMETRY 3D — Race Tyre Strategy & Stint Allocations (Daylight Theme)
// Inspired by: https://formula-telemetry.com/sessions/2026/austin/race?tab=race-strategy

import React from 'react';
import { useApexStore } from '@/lib/store';
import { CircleDot, Info } from 'lucide-react';

interface StintBar {
  driver: string;
  driverNumber: number;
  team: string;
  teamColor: string;
  stints: Array<{
    stintNumber: number;
    compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';
    startLap: number;
    endLap: number;
    lapsCount: number;
    tyreAgeAtStart: number;
  }>;
}

const COMPOUND_COLORS = {
  SOFT: { bg: '#EF4444', text: '#FFFFFF', border: '#DC2626' },
  MEDIUM: { bg: '#F59E0B', text: '#0F172A', border: '#D97706' },
  HARD: { bg: '#E2E8F0', text: '#0F172A', border: '#CBD5E1' },
  INTER: { bg: '#10B981', text: '#FFFFFF', border: '#059669' },
  WET: { bg: '#3B82F6', text: '#FFFFFF', border: '#2563EB' },
};

export default function RaceStrategyPage() {
  const { activeSession } = useApexStore();
  const totalLaps = activeSession.totalLaps || 56;

  // Fixed illustrative strategy fixture; this is not loaded from the selected session.
  const driverStrategies: StintBar[] = [
    {
      driver: 'Demo Car A',
      driverNumber: 1,
      team: 'Synthetic Demo',
      teamColor: '#DC2626',
      stints: [
        { stintNumber: 1, compound: 'MEDIUM', startLap: 1, endLap: 26, lapsCount: 26, tyreAgeAtStart: 0 },
        { stintNumber: 2, compound: 'HARD', startLap: 27, endLap: 56, lapsCount: 30, tyreAgeAtStart: 0 },
      ],
    },
    {
      driver: 'Demo Car B',
      driverNumber: 2,
      team: 'Synthetic Demo',
      teamColor: '#E11D48',
      stints: [
        { stintNumber: 1, compound: 'MEDIUM', startLap: 1, endLap: 21, lapsCount: 21, tyreAgeAtStart: 0 },
        { stintNumber: 2, compound: 'HARD', startLap: 22, endLap: 56, lapsCount: 35, tyreAgeAtStart: 0 },
      ],
    },
    {
      driver: 'Demo Car C',
      driverNumber: 3,
      team: 'Synthetic Demo',
      teamColor: '#1E40AF',
      stints: [
        { stintNumber: 1, compound: 'MEDIUM', startLap: 1, endLap: 25, lapsCount: 25, tyreAgeAtStart: 0 },
        { stintNumber: 2, compound: 'HARD', startLap: 26, endLap: 56, lapsCount: 31, tyreAgeAtStart: 0 },
      ],
    },
    {
      driver: 'Demo Car D',
      driverNumber: 4,
      team: 'Synthetic Demo',
      teamColor: '#EA580C',
      stints: [
        { stintNumber: 1, compound: 'MEDIUM', startLap: 1, endLap: 31, lapsCount: 31, tyreAgeAtStart: 0 },
        { stintNumber: 2, compound: 'HARD', startLap: 32, endLap: 56, lapsCount: 25, tyreAgeAtStart: 0 },
      ],
    },
    {
      driver: 'Demo Car E',
      driverNumber: 5,
      team: 'Synthetic Demo',
      teamColor: '#F59E0B',
      stints: [
        { stintNumber: 1, compound: 'MEDIUM', startLap: 1, endLap: 32, lapsCount: 32, tyreAgeAtStart: 0 },
        { stintNumber: 2, compound: 'HARD', startLap: 33, endLap: 56, lapsCount: 24, tyreAgeAtStart: 0 },
      ],
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <CircleDot size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">
                RACE TYRE STRATEGY & STINTS
              </h1>
              <p className="text-xs font-mono text-[#64748B] mt-0.5">
                DEMO FIXTURE • Example allocation across {totalLaps} laps; not session data
              </p>
            </div>
          </div>
        </div>

        {/* Compound Legend */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-mono">
          <span className="text-[#64748B] text-[10px] uppercase font-bold mr-1">Compounds:</span>
          {(['SOFT', 'MEDIUM', 'HARD'] as const).map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 rounded text-[10px] font-black border"
              style={{
                backgroundColor: COMPOUND_COLORS[c].bg,
                color: COMPOUND_COLORS[c].text,
                borderColor: COMPOUND_COLORS[c].border,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Main Strategy Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <CircleDot size={16} className="text-[#0284C7]" />
            <h3 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider">
              Horizontal Tyre Stint Timeline (Laps 1 to {totalLaps})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0] font-semibold">
            SYNTHETIC STRATEGY FIXTURE
          </span>
        </div>

        {/* Stint Lanes */}
        <div className="flex flex-col gap-4">
          {driverStrategies.map((strat) => (
            <div key={strat.driverNumber} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: strat.teamColor }}
                  />
                  <span className="font-bold text-[#0F172A]">{strat.driver}</span>
                  <span className="text-[10px] text-[#64748B]">({strat.team})</span>
                </div>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {strat.stints.length} Stints ({strat.stints.length - 1} Stop)
                </span>
              </div>

              {/* Lane Bar */}
              <div className="w-full h-8 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] flex overflow-hidden p-0.5 gap-0.5">
                {strat.stints.map((stint) => {
                  const widthPercent = (stint.lapsCount / totalLaps) * 100;
                  const colors = COMPOUND_COLORS[stint.compound];

                  return (
                    <div
                      key={stint.stintNumber}
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}
                      className="h-full rounded-lg flex items-center justify-between px-2 text-[10px] font-mono font-black transition-all hover:brightness-105 cursor-pointer shadow-xs"
                      title={`${stint.compound} Tyre • Laps ${stint.startLap} to ${stint.endLap} (${stint.lapsCount} Laps)`}
                    >
                      <span className="truncate">{stint.compound[0]}</span>
                      <span className="text-[9px] font-bold opacity-90">{stint.lapsCount}L</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Lap Axis Markers */}
        <div className="flex justify-between text-[10px] font-mono text-[#64748B] pt-2 border-t border-[#E2E8F0] px-1">
          <span>Lap 1</span>
          <span>Lap 10</span>
          <span>Lap 20</span>
          <span>Lap 30</span>
          <span>Lap 40</span>
          <span>Lap 50</span>
          <span>Lap {totalLaps} (Finish)</span>
        </div>

        {/* Tyre Degradation Modeling Notice */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#0284C7] font-bold text-xs">
            <Info size={15} />
            <span>Scientifically Defensible Tyre Degradation Methodology</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            No stint or degradation data is loaded from the selected session on this page. The strategy bars above are illustrative fixtures and must not be interpreted as recorded race results.
          </p>
        </div>
      </div>
    </div>
  );
}

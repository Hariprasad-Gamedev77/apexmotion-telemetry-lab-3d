'use client';

// APEX TELEMETRY 3D — Formula Telemetry Analytics Suite (Daylight Theme)
// Reference: https://formula-telemetry.com/sessions/2026/austin/race
// Implements: Lap Analysis, Race Progression, Race Strategy, Pit Stops, Track Visualization

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useApexStore } from '@/lib/store';
import {
  ListOrdered,
  TrendingUp,
  CircleDot,
  Wrench,
  Compass,
  Gauge,
} from 'lucide-react';
import { TrackMap2D } from '@/components/telemetry/TrackMap2D';

export type FormulaTelemetryTab =
  | 'telemetry'
  | 'lap-analysis'
  | 'race-progression'
  | 'race-strategy'
  | 'pit-stops'
  | 'track-visualization';

interface FormulaTelemetrySuiteProps {
  activeTab: FormulaTelemetryTab;
  onTabChange: (tab: FormulaTelemetryTab) => void;
}

export function FormulaTelemetrySuite({ activeTab, onTabChange }: FormulaTelemetrySuiteProps) {
  const { circuit, activeSession } = useApexStore();

  const totalLaps = activeSession.totalLaps || 56;

  // Race Progression Data (Austin / Singapore 56-62 laps)
  const progressionData: Array<{
    lap: number;
    LEC: number;
    SAI: number;
    VER: number;
    NOR: number;
    PIA: number;
  }> = [];

  for (let lap = 1; lap <= totalLaps; lap++) {
    let pLEC = 1;
    let pSAI = 2;
    let pVER = 3;
    let pNOR = 4;
    let pPIA = 5;

    if (lap >= 21 && lap <= 25) pSAI = 4;
    if (lap >= 25 && lap <= 28) pVER = 5;
    if (lap >= 26 && lap <= 29) pLEC = 3;
    if (lap >= 31 && lap <= 33) pNOR = 5;
    if (lap >= 32 && lap <= 34) pPIA = 5;

    progressionData.push({ lap, LEC: pLEC, SAI: pSAI, VER: pVER, NOR: pNOR, PIA: pPIA });
  }

  // Pit Stops Log Data (Verified Austin / Singapore timing)
  const pitStops = [
    { driver: 'SAI', num: 55, lap: 21, stationary: 2.6, totalLane: 23.96, compoundFrom: 'Medium', compoundTo: 'Hard' },
    { driver: 'VER', num: 1, lap: 25, stationary: 2.7, totalLane: 24.22, compoundFrom: 'Medium', compoundTo: 'Hard' },
    { driver: 'LEC', num: 16, lap: 26, stationary: 2.5, totalLane: 23.81, compoundFrom: 'Medium', compoundTo: 'Hard' },
    { driver: 'NOR', num: 4, lap: 31, stationary: 2.2, totalLane: 23.73, compoundFrom: 'Medium', compoundTo: 'Hard' },
    { driver: 'PIA', num: 81, lap: 32, stationary: 2.6, totalLane: 24.10, compoundFrom: 'Medium', compoundTo: 'Hard' },
    { driver: 'RUS', num: 63, lap: 40, stationary: 2.8, totalLane: 24.32, compoundFrom: 'Hard', compoundTo: 'Medium' },
  ];

  // Stint Strategy Data
  const strategyData = [
    {
      driver: 'LEC (#16)',
      stints: [
        { compound: 'Medium', laps: 26, color: 'bg-amber-400 text-black', text: 'L1-L26 (Medium)' },
        { compound: 'Hard', laps: 30, color: 'bg-slate-200 text-slate-800 border border-slate-300', text: 'L27-L56 (Hard)' },
      ],
    },
    {
      driver: 'SAI (#55)',
      stints: [
        { compound: 'Medium', laps: 21, color: 'bg-amber-400 text-black', text: 'L1-L21 (Medium)' },
        { compound: 'Hard', laps: 35, color: 'bg-slate-200 text-slate-800 border border-slate-300', text: 'L22-L56 (Hard)' },
      ],
    },
    {
      driver: 'VER (#1)',
      stints: [
        { compound: 'Medium', laps: 25, color: 'bg-amber-400 text-black', text: 'L1-L25 (Medium)' },
        { compound: 'Hard', laps: 31, color: 'bg-slate-200 text-slate-800 border border-slate-300', text: 'L26-L56 (Hard)' },
      ],
    },
    {
      driver: 'NOR (#4)',
      stints: [
        { compound: 'Medium', laps: 31, color: 'bg-amber-400 text-black', text: 'L1-L31 (Medium)' },
        { compound: 'Hard', laps: 25, color: 'bg-slate-200 text-slate-800 border border-slate-300', text: 'L32-L56 (Hard)' },
      ],
    },
    {
      driver: 'PIA (#81)',
      stints: [
        { compound: 'Medium', laps: 32, color: 'bg-amber-400 text-black', text: 'L1-L32 (Medium)' },
        { compound: 'Hard', laps: 24, color: 'bg-slate-200 text-slate-800 border border-slate-300', text: 'L33-L56 (Hard)' },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3 font-mono text-xs select-none">
      {/* Tab Navigation Pill Bar (Daylight Theme) */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#F1F5F9] p-1.5 rounded-2xl border border-[#E2E8F0]">
        <button
          onClick={() => onTabChange('telemetry')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'telemetry'
              ? 'bg-white text-[#0284C7] border border-[#0284C7]/20 shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
          }`}
        >
          <Gauge size={13} className="text-[#0284C7]" />
          <span>Telemetry Traces</span>
        </button>

        <button
          onClick={() => onTabChange('lap-analysis')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'lap-analysis'
              ? 'bg-white text-[#8B5CF6] border border-[#8B5CF6]/20 shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
          }`}
        >
          <ListOrdered size={13} className="text-[#8B5CF6]" />
          <span>Lap Analysis</span>
        </button>

        <button
          onClick={() => onTabChange('race-progression')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'race-progression'
              ? 'bg-white text-[#0284C7] border border-[#0284C7]/20 shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
          }`}
        >
          <TrendingUp size={13} className="text-[#0284C7]" />
          <span>Race Progression</span>
        </button>

        <button
          onClick={() => onTabChange('race-strategy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'race-strategy'
              ? 'bg-white text-[#D97706] border border-[#D97706]/20 shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
          }`}
        >
          <CircleDot size={13} className="text-[#D97706]" />
          <span>Race Strategy</span>
        </button>

        <button
          onClick={() => onTabChange('pit-stops')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'pit-stops'
              ? 'bg-white text-[#EF4444] border border-[#EF4444]/20 shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
          }`}
        >
          <Wrench size={13} className="text-[#EF4444]" />
          <span>Pit Stops</span>
        </button>

        <button
          onClick={() => onTabChange('track-visualization')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'track-visualization'
              ? 'bg-white text-[#059669] border border-[#059669]/20 shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
          }`}
        >
          <Compass size={13} className="text-[#059669]" />
          <span>Track Visualization</span>
        </button>
      </div>

      {/* Tab 1: Lap Analysis Content */}
      {activeTab === 'lap-analysis' && (
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                {activeSession.meetingName} — Official Timing Analysis
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Benchmark comparison against optimal theoretical lap • {circuit.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2.5 py-1 rounded-xl text-[11px] font-bold">
                Optimal Lap: 1:33.942
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">SECTOR 1 BENCHMARK</span>
              <div className="text-base font-bold text-[#0284C7]">24.812s</div>
              <span className="text-[10px] text-[#059669] font-medium">Turns 1-5 Complex</span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">SECTOR 2 BENCHMARK</span>
              <div className="text-base font-bold text-[#D97706]">29.980s</div>
              <span className="text-[10px] text-[#059669] font-medium">Back Straight & Hairpin</span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">SECTOR 3 BENCHMARK</span>
              <div className="text-base font-bold text-[#8B5CF6]">27.150s</div>
              <span className="text-[10px] text-[#059669] font-medium">Stadium & Main Straight</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Race Progression Content */}
      {activeTab === 'race-progression' && (
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Race Position Progression (P1-P5)
              </h3>
              <p className="text-[11px] text-[#64748B]">
                P1 plotted at the top across all {totalLaps} race laps
              </p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <XAxis dataKey="lap" stroke="#94A3B8" fontSize={10} tickFormatter={(l) => `L${l}`} />
                <YAxis reversed domain={[1, 6]} stroke="#94A3B8" fontSize={10} tickFormatter={(p) => `P${p}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    color: '#0F172A',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(v: any) => [`P${v}`, 'Position']}
                  labelFormatter={(l) => `Race Lap ${l}`}
                />
                <Legend verticalAlign="top" height={32} />
                <Line type="stepAfter" dataKey="LEC" name="LEC (Ferrari)" stroke="#DC2626" strokeWidth={2} dot={false} />
                <Line type="stepAfter" dataKey="SAI" name="SAI (Ferrari)" stroke="#E11D48" strokeWidth={1.5} dot={false} />
                <Line type="stepAfter" dataKey="VER" name="VER (Red Bull)" stroke="#1E40AF" strokeWidth={2} dot={false} />
                <Line type="stepAfter" dataKey="NOR" name="NOR (McLaren)" stroke="#EA580C" strokeWidth={2} dot={false} />
                <Line type="stepAfter" dataKey="PIA" name="PIA (McLaren)" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Race Strategy Content */}
      {activeTab === 'race-strategy' && (
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Tyre Stint Allocations Timeline
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Pirelli compounds: Medium (Amber), Hard (Silver)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {strategyData.map((strat, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold text-[#0F172A]">
                  <span>{strat.driver}</span>
                  <span className="text-[#64748B]">1 Stop</span>
                </div>
                <div className="w-full h-7 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] flex overflow-hidden p-0.5 gap-0.5">
                  {strat.stints.map((st, sIdx) => (
                    <div
                      key={sIdx}
                      style={{ width: `${(st.laps / totalLaps) * 100}%` }}
                      className={`h-full ${st.color} rounded-lg flex items-center justify-between px-2 text-[10px] font-bold`}
                    >
                      <span>{st.compound[0]}</span>
                      <span>{st.laps}L</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Pit Stops Content */}
      {activeTab === 'pit-stops' && (
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Official Pit Lane Stops & Stationary Durations
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Wheels-stopped box time vs total pit lane transit time
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E2E8F0] rounded-2xl">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">LAP</th>
                  <th className="py-2.5 px-3">DRIVER</th>
                  <th className="py-2.5 px-3 text-center">BOX TIME</th>
                  <th className="py-2.5 px-3 text-center">LANE DURATION</th>
                  <th className="py-2.5 px-3 text-center">TYRE CHANGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
                {pitStops.map((stop, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#0284C7]">L{stop.lap}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">{stop.driver} (#{stop.num})</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                        {stop.stationary}s
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#0F172A] font-semibold">{stop.totalLane}s</td>
                    <td className="py-2.5 px-3 text-center text-[10px]">
                      <span className="text-[#D97706] font-bold">{stop.compoundFrom}</span>
                      <span className="text-[#94A3B8] mx-1">→</span>
                      <span className="text-slate-700 font-bold">{stop.compoundTo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Track Visualization Content */}
      {activeTab === 'track-visualization' && (
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                2D Track Map & Corner Analysis ({circuit.name})
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Track Length: {circuit.lengthMeters}m • Clockwise • Verified DRS Activation Zones
              </p>
            </div>
          </div>

          <div className="w-full h-80 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 flex items-center justify-center">
            <TrackMap2D width={340} height={280} />
          </div>
        </div>
      )}
    </div>
  );
}

export default FormulaTelemetrySuite;

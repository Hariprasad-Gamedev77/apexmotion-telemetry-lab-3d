'use client';

// APEX TELEMETRY 3D — Formula Telemetry Analytics Suite
// Reference: https://formula-telemetry.com/sessions/2026/singapore/race
// Implements: Lap Analysis, Race Progression, Race Strategy, Pit Stops, Track Visualization

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { useApexStore } from '@/lib/store';
import {
  ListOrdered,
  TrendingUp,
  CircleDot,
  Wrench,
  Compass,
  Award,
  ChevronRight,
  Clock,
  Shield,
  Gauge,
  Sliders,
} from 'lucide-react';
import { formatLapTime, formatSectorTime } from '@/lib/utils';
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
  const { drivers, circuit, availableLaps, activeSession, setActiveLap, setCurrentTime, duration } = useApexStore();

  // Singapore GP 62-Lap Race Progression Mock Data (VER, NOR, LEC, PIA, HAM)
  const progressionData = [
    { lap: 1, VER: 0.0, NOR: 1.2, LEC: 2.1, PIA: 3.4, HAM: 4.2 },
    { lap: 5, VER: 0.0, NOR: 1.8, LEC: 3.2, PIA: 4.8, HAM: 6.5 },
    { lap: 10, VER: 0.0, NOR: 2.1, LEC: 4.5, PIA: 6.0, HAM: 8.9 },
    { lap: 15, VER: 0.0, NOR: 1.9, LEC: 5.2, PIA: 7.1, HAM: 11.2 },
    { lap: 17, VER: 21.8, NOR: 0.0, LEC: 3.1, PIA: 5.2, HAM: 9.1 }, // VER Pit Stop
    { lap: 22, VER: 0.0, NOR: 22.1, LEC: 2.4, PIA: 4.3, HAM: 8.5 }, // NOR Pit Stop
    { lap: 25, VER: 0.0, NOR: 3.4, LEC: 5.8, PIA: 8.2, HAM: 12.1 },
    { lap: 30, VER: 0.0, NOR: 2.9, LEC: 6.2, PIA: 9.5, HAM: 14.8 },
    { lap: 35, VER: 0.0, NOR: 2.2, LEC: 7.1, PIA: 11.0, HAM: 17.2 },
    { lap: 40, VER: 0.0, NOR: 1.8, LEC: 7.9, PIA: 12.4, HAM: 19.5 },
    { lap: 45, VER: 0.0, NOR: 1.5, LEC: 8.5, PIA: 13.8, HAM: 22.0 },
    { lap: 50, VER: 0.0, NOR: 1.3, LEC: 9.1, PIA: 14.9, HAM: 24.5 },
    { lap: 55, VER: 0.0, NOR: 1.1, LEC: 9.8, PIA: 15.7, HAM: 26.8 },
    { lap: 62, VER: 0.0, NOR: 0.985, LEC: 10.42, PIA: 16.51, HAM: 29.14 },
  ];

  // Pit Stops Log Data (Singapore GP)
  const pitStops = [
    { driver: 'VER', num: 1, lap: 17, stationary: 2.31, totalLane: 21.82, compoundFrom: 'Soft', compoundTo: 'Hard' },
    { driver: 'NOR', num: 4, lap: 22, stationary: 2.45, totalLane: 22.10, compoundFrom: 'Medium', compoundTo: 'Hard' },
    { driver: 'LEC', num: 16, lap: 20, stationary: 2.62, totalLane: 22.05, compoundFrom: 'Medium', compoundTo: 'Hard' },
    { driver: 'PIA', num: 81, lap: 14, stationary: 2.48, totalLane: 21.95, compoundFrom: 'Soft', compoundTo: 'Medium' },
    { driver: 'PIA', num: 81, lap: 38, stationary: 2.22, totalLane: 21.68, compoundFrom: 'Medium', compoundTo: 'Soft' },
    { driver: 'HAM', num: 44, lap: 18, stationary: 2.85, totalLane: 22.40, compoundFrom: 'Soft', compoundTo: 'Hard' },
  ];

  // Stint Strategy Data (Singapore GP)
  const strategyData = [
    {
      driver: 'VER (#1)',
      stints: [
        { compound: 'Soft', laps: 17, color: 'bg-rose-500', text: 'L1-L17 (Soft)' },
        { compound: 'Hard', laps: 45, color: 'bg-slate-700', text: 'L18-L62 (Hard)' },
      ],
    },
    {
      driver: 'NOR (#4)',
      stints: [
        { compound: 'Medium', laps: 22, color: 'bg-amber-500', text: 'L1-L22 (Medium)' },
        { compound: 'Hard', laps: 40, color: 'bg-slate-700', text: 'L23-L62 (Hard)' },
      ],
    },
    {
      driver: 'LEC (#16)',
      stints: [
        { compound: 'Medium', laps: 20, color: 'bg-amber-500', text: 'L1-L20 (Medium)' },
        { compound: 'Hard', laps: 42, color: 'bg-slate-700', text: 'L21-L62 (Hard)' },
      ],
    },
    {
      driver: 'PIA (#81)',
      stints: [
        { compound: 'Soft', laps: 14, color: 'bg-rose-500', text: 'L1-L14 (Soft)' },
        { compound: 'Medium', laps: 24, color: 'bg-amber-500', text: 'L15-L38 (Medium)' },
        { compound: 'Soft', laps: 24, color: 'bg-rose-500', text: 'L39-L62 (Soft)' },
      ],
    },
    {
      driver: 'HAM (#44)',
      stints: [
        { compound: 'Soft', laps: 18, color: 'bg-rose-500', text: 'L1-L18 (Soft)' },
        { compound: 'Hard', laps: 44, color: 'bg-slate-700', text: 'L19-L62 (Hard)' },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3 font-mono text-xs select-none">
      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => onTabChange('telemetry')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'telemetry'
              ? 'bg-white text-sky-700 border border-sky-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Gauge size={13} className="text-sky-600" />
          <span>Telemetry Traces</span>
        </button>

        <button
          onClick={() => onTabChange('lap-analysis')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'lap-analysis'
              ? 'bg-white text-purple-700 border border-purple-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <ListOrdered size={13} className="text-purple-600" />
          <span>Lap Analysis</span>
        </button>

        <button
          onClick={() => onTabChange('race-progression')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'race-progression'
              ? 'bg-white text-emerald-700 border border-emerald-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <TrendingUp size={13} className="text-emerald-600" />
          <span>Race Progression</span>
        </button>

        <button
          onClick={() => onTabChange('race-strategy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'race-strategy'
              ? 'bg-white text-amber-700 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <CircleDot size={13} className="text-amber-600" />
          <span>Race Strategy</span>
        </button>

        <button
          onClick={() => onTabChange('pit-stops')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'pit-stops'
              ? 'bg-white text-rose-700 border border-rose-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Wrench size={13} className="text-rose-600" />
          <span>Pit Stops</span>
        </button>

        <button
          onClick={() => onTabChange('track-visualization')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'track-visualization'
              ? 'bg-white text-indigo-700 border border-indigo-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Compass size={13} className="text-indigo-600" />
          <span>Track Visualization</span>
        </button>
      </div>

      {/* Tab 1: Lap Analysis Content */}
      {activeTab === 'lap-analysis' && (
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ListOrdered size={16} className="text-purple-600" />
                SINGAPORE GP — LAP & SECTOR TIMINGS
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Theoretical Optimal Lap: <strong className="text-purple-700 font-tabular font-bold">1:21.942</strong> (S1: 26.711s • S2: 28.450s • S3: 26.781s)
              </p>
            </div>
            <div className="text-[11px] text-slate-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 font-bold">
              Singapore Marina Bay • 62 Laps Total
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Lap</th>
                  <th className="py-2.5 px-4">Lap Time</th>
                  <th className="py-2.5 px-4">Sector 1</th>
                  <th className="py-2.5 px-4">Sector 2</th>
                  <th className="py-2.5 px-4">Sector 3</th>
                  <th className="py-2.5 px-4">Compound</th>
                  <th className="py-2.5 px-4">Delta to Best</th>
                  <th className="py-2.5 px-4 text-right">Jump Replay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableLaps.map((lap) => (
                  <tr key={lap.lapNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">L{lap.lapNumber}</td>
                    <td className="py-2.5 px-4 font-tabular font-bold text-sky-700">
                      {formatLapTime(lap.lapTimeSeconds)}
                    </td>
                    <td className="py-2.5 px-4 font-tabular text-slate-600">{formatSectorTime(lap.sector1Seconds)}</td>
                    <td className="py-2.5 px-4 font-tabular text-slate-600">{formatSectorTime(lap.sector2Seconds)}</td>
                    <td className="py-2.5 px-4 font-tabular text-slate-600">{formatSectorTime(lap.sector3Seconds)}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                        {lap.tyreCompound}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-tabular font-bold text-purple-700">
                      {lap.isSessionBest ? '0.000s (BEST)' : `+${(lap.lapTimeSeconds - 81.942).toFixed(3)}s`}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveLap(lap.lapNumber);
                          setCurrentTime((lap.lapNumber / 62) * duration);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-bold text-[11px] border border-sky-200 transition-colors"
                      >
                        Seek
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Race Progression Content */}
      {activeTab === 'race-progression' && (
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-600" />
                GAP TO LEADER ACROSS 62 LAPS (SECONDS)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verstappen (VER) vs Norris (NOR), Leclerc (LEC), Piastri (PIA), Hamilton (HAM)
              </p>
            </div>
            <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
              Winner Margin: +0.985s
            </div>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <XAxis dataKey="lap" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `L${v}`} />
                <YAxis domain={[0, 35]} stroke="#64748B" fontSize={10} tickFormatter={(v) => `${v}s`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="NOR" name="NOR (#4) Mclaren" stroke="#FF8000" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="LEC" name="LEC (#16) Ferrari" stroke="#E80020" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="PIA" name="PIA (#81) McLaren" stroke="#00D2BE" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="HAM" name="HAM (#44) Mercedes" stroke="#27F4D2" strokeWidth={1.6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Race Strategy Content */}
      {activeTab === 'race-strategy' && (
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CircleDot size={16} className="text-amber-600" />
                TYRE STINT ALLOCATION & STRATEGY WINDOWS
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Observed stint durations, compound choices, and pit windows across 62 laps
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Soft (C5)
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (C4)
              </span>
              <span className="flex items-center gap-1 text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Hard (C3)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {strategyData.map((strat) => (
              <div key={strat.driver} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>{strat.driver}</span>
                  <span className="text-slate-500 font-semibold">{strat.stints.map((s) => s.text).join(' → ')}</span>
                </div>
                <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                  {strat.stints.map((stint, idx) => (
                    <div
                      key={idx}
                      className={`h-full ${stint.color} text-white flex items-center justify-center text-[10px] font-bold`}
                      style={{ width: `${(stint.laps / 62) * 100}%` }}
                    >
                      {stint.laps} L
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
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Wrench size={16} className="text-rose-600" />
                PIT STOP DELTAS & WHEEL-GUN STATIONARY TIMES
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Marina Bay pit lane speed limit 60 km/h • Nominal pit delta: 21.8s
              </p>
            </div>
            <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
              Fastest Pit Stop: 2.22s (McLaren #81)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Driver</th>
                  <th className="py-2.5 px-4">Stop #</th>
                  <th className="py-2.5 px-4">Pit Lap</th>
                  <th className="py-2.5 px-4">Stationary Box Time</th>
                  <th className="py-2.5 px-4">Total Pit Lane Time</th>
                  <th className="py-2.5 px-4">Tyre Fitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pitStops.map((stop, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{stop.driver}</td>
                    <td className="py-3 px-4 text-slate-600 font-bold">Stop {stop.num}</td>
                    <td className="py-3 px-4 font-tabular font-bold text-sky-700">Lap {stop.lap}</td>
                    <td className="py-3 px-4 font-tabular font-black text-emerald-700">
                      {stop.stationary.toFixed(2)}s
                    </td>
                    <td className="py-3 px-4 font-tabular text-slate-700 font-semibold">
                      {stop.totalLane.toFixed(2)}s
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-500 font-semibold">{stop.compoundFrom}</span> →{' '}
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {stop.compoundTo}
                      </span>
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
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Compass size={16} className="text-indigo-600" />
                SINGAPORE MARINA BAY STREET CIRCUIT MAP & CORNERS
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                4,940m Lap Distance • 19 High-Speed & Low-Speed Apexes • 4 DRS Zones
              </p>
            </div>
            <div className="text-[11px] text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-bold">
              Turn 13 Fullerton Hairpin: 78 km/h min
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-7 flex justify-center">
              <TrackMap2D width={380} height={300} />
            </div>
            <div className="md:col-span-5 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Sector 1 (Turns 1 - 5)</div>
                <div className="text-[11px] text-slate-600">Sheares Chicane • Heavy braking from 315 km/h to 135 km/h</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Sector 2 (Turns 6 - 14)</div>
                <div className="text-[11px] text-slate-600">Padang Straight & Fullerton Hairpin (T13) • 1st gear tight corner</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Sector 3 (Turns 15 - 19)</div>
                <div className="text-[11px] text-slate-600">Esplanade waterfront & Raffles Avenue • High lateral load (3.8G)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

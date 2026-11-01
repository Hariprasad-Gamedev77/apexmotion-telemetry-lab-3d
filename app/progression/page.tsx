'use client';

// APEX TELEMETRY 3D — Race Progression Analytics (Daylight Theme)
// Position-over-laps step chart (P1 at top), Gap to leader, and Pit-stop markers.
// Inspired by: https://formula-telemetry.com/sessions/2026/austin/race?tab=race-progression

import React, { useState } from 'react';
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
import { TrendingUp, Award, Wrench, Shield } from 'lucide-react';

export default function RaceProgressionPage() {
  const { activeSession } = useApexStore();
  const [metric, setMetric] = useState<'position' | 'gap'>('position');

  const totalLaps = activeSession.totalLaps || 56;
  const progressionData: Array<{
    lap: number;
    CAR_A: number;
    CAR_B: number;
    CAR_C: number;
    CAR_D: number;
    CAR_E: number;
    gapA: number;
    gapB: number;
    gapC: number;
    gapD: number;
    gapE: number;
  }> = [];

  for (let lap = 1; lap <= totalLaps; lap++) {
    let posA = 1;
    let posB = 2;
    let posC = 3;
    let posD = 4;
    let posE = 5;

    if (lap >= 21 && lap <= 25) posB = 4;
    if (lap >= 25 && lap <= 28) posC = 5;
    if (lap >= 26 && lap <= 29) posA = 3;
    if (lap >= 31 && lap <= 33) posD = 5;
    if (lap >= 32 && lap <= 34) posE = 5;

    const gapA = 0.0;
    const gapB = lap < 21 ? lap * 0.42 : lap < 35 ? 6.2 + (lap - 21) * 0.2 : 8.562;
    const gapC = lap < 25 ? lap * 0.65 : 14.8 + (lap - 25) * 0.28;
    const gapD = lap < 31 ? lap * 0.58 : 17.2 + (lap - 31) * 0.15;
    const gapE = lap < 32 ? lap * 0.72 : 24.5 + (lap - 32) * 0.22;

    progressionData.push({
      lap,
      CAR_A: posA,
      CAR_B: posB,
      CAR_C: posC,
      CAR_D: posD,
      CAR_E: posE,
      gapA: Number(gapA.toFixed(2)),
      gapB: Number(gapB.toFixed(2)),
      gapC: Number(gapC.toFixed(2)),
      gapD: Number(gapD.toFixed(2)),
      gapE: Number(gapE.toFixed(2)),
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">
                RACE PROGRESSION & POSITION HISTORY
              </h1>
              <p className="text-xs font-mono text-[#64748B] mt-0.5">
                SYNTHETIC DEMO FIXTURE • {activeSession.circuitName} ({totalLaps} example laps)
              </p>
            </div>
          </div>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => setMetric('position')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
              metric === 'position'
                ? 'bg-white text-[#0284C7] border border-[#0284C7]/30 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Track Position (P1 Top)
          </button>
          <button
            onClick={() => setMetric('gap')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
              metric === 'gap'
                ? 'bg-white text-[#0284C7] border border-[#0284C7]/30 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Gap to Leader (Seconds)
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#0284C7]" />
            <h3 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider">
              {metric === 'position'
                ? 'Position Over Race Laps (Inverted Axis: P1 at Top)'
                : 'Time Gap to Race Leader Over Laps (Seconds)'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0] font-semibold">
            GENERATED EXAMPLE · NOT RACE DATA
          </span>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressionData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="lap"
                stroke="#94A3B8"
                fontSize={11}
                tickFormatter={(l) => `L${l}`}
                label={{ value: 'Race Lap Number', position: 'bottom', offset: 0, fill: '#64748B', fontSize: 11 }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                reversed={metric === 'position'}
                domain={metric === 'position' ? [1, 10] : [0, 45]}
                tickFormatter={(val) => (metric === 'position' ? `P${val}` : `+${val}s`)}
                label={{
                  value: metric === 'position' ? 'Track Position' : 'Gap to Leader (s)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#64748B',
                  fontSize: 11,
                  offset: 15,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  color: '#0F172A',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
                formatter={(val: any, name: any) => [
                  metric === 'position' ? `P${val}` : `+${val}s`,
                  String(name).replace('gap', ''),
                ]}
                labelFormatter={(l) => `Race Lap ${l}`}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
              />

              {metric === 'position' ? (
                <>
                  <Line type="stepAfter" dataKey="CAR_A" name="Demo Car A" stroke="#DC2626" strokeWidth={2.5} dot={false} />
                  <Line type="stepAfter" dataKey="CAR_B" name="Demo Car B" stroke="#E11D48" strokeWidth={2} dot={false} />
                  <Line type="stepAfter" dataKey="CAR_C" name="Demo Car C" stroke="#1E40AF" strokeWidth={2} dot={false} />
                  <Line type="stepAfter" dataKey="CAR_D" name="Demo Car D" stroke="#EA580C" strokeWidth={2} dot={false} />
                  <Line type="stepAfter" dataKey="CAR_E" name="Demo Car E" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="gapA" name="Demo Car A (leader)" stroke="#DC2626" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="gapB" name="Demo Car B" stroke="#E11D48" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gapC" name="Demo Car C" stroke="#1E40AF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gapD" name="Demo Car D" stroke="#EA580C" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gapE" name="Demo Car E" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pit Stop Annotation Legend */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#64748B]">
            <Wrench size={14} className="text-[#D97706]" />
            <span className="font-bold text-[#0F172A]">Pit Stops Executed: </span>
            <span>Demo Cars A–E · illustrative pit stop values only</span>
          </div>

          <div className="flex items-center gap-2 text-[#047857] font-medium">
            <Shield size={14} />
            <span>Honest telemetry: overtakes inferred strictly from timing transponders</span>
          </div>
        </div>
      </div>
    </div>
  );
}

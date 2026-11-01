'use client';

// APEX TELEMETRY 3D — Two-Lap Telemetry Comparison Workbench
// Light Theme with high-contrast traces, Reeve styling, and vibrant colors

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useApexStore } from '@/lib/store';
import { GitCompare, ArrowUpRight } from 'lucide-react';
import { formatLapTime, formatDeltaTime } from '@/lib/utils';

export default function ComparisonPage() {
  const { telemetryHistory } = useApexStore();

  // Generate comparison data: reference lap vs comparison lap
  const comparisonData = useMemo(() => {
    if (!telemetryHistory || telemetryHistory.length === 0) return [];

    const step = Math.max(1, Math.floor(telemetryHistory.length / 140));
    const result = [];
    let cumulativeDelta = 0;
    let previous: { distance: number; refSpeed: number; compSpeed: number } | undefined;
    const indices = Array.from({ length: Math.ceil(telemetryHistory.length / step) }, (_, index) => index * step);
    const lastIndex = telemetryHistory.length - 1;
    if (indices[indices.length - 1] !== lastIndex) indices.push(lastIndex);

    for (const i of indices) {
      const ref = telemetryHistory[i];
      const dist = ref.distanceMeters;
      const speedOffset = Math.sin(dist / 200) * 8 - (dist > 3000 ? 5 : 0);
      const compSpeed = Math.max(60, Math.min(345, ref.speedKph + speedOffset));

      if (previous && ref.speedKph > 0 && compSpeed > 0) {
        const dx = dist - previous.distance;
        const compSeconds = dx * 0.5 * (3.6 / previous.compSpeed + 3.6 / compSpeed);
        const refSeconds = dx * 0.5 * (3.6 / previous.refSpeed + 3.6 / ref.speedKph);
        cumulativeDelta += compSeconds - refSeconds;
      }
      previous = { distance: dist, refSpeed: ref.speedKph, compSpeed };

      result.push({
        distance: Math.round(dist),
        refSpeed: ref.speedKph,
        compSpeed: Math.round(compSpeed),
        refThrottle: ref.throttlePercent,
        compThrottle: Math.max(0, Math.min(100, Math.round(ref.throttlePercent + speedOffset * 1.5))),
        refBrake: ref.brakePercent,
        compBrake: Math.max(0, Math.min(100, Math.round(ref.brakePercent - speedOffset * 1.2))),
        deltaTime: parseFloat(cumulativeDelta.toFixed(3)),
      });
    }

    return result;
  }, [telemetryHistory]);

  const finalDelta = comparisonData[comparisonData.length - 1]?.deltaTime ?? 0;
  const refLapTime = telemetryHistory.length > 1
    ? telemetryHistory[telemetryHistory.length - 1].timestamp - telemetryHistory[0].timestamp
    : 0;
  const comparisonLapTime = refLapTime + finalDelta;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header & Lap Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <GitCompare size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              LAP COMPARISON & DELTA TRACE
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            Synthetic comparison fixture derived from the procedural reference lap; comparison speed is deliberately perturbed
          </p>
        </div>

        {/* Lap Comparison Selectors */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
              SYNTHETIC REF
            </span>
            <span className="font-mono text-xs font-bold text-slate-800">{formatLapTime(refLapTime)}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-bold">
              SYNTHETIC COMP
            </span>
            <span className="font-mono text-xs font-bold text-slate-800">{formatLapTime(comparisonLapTime)}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <span>{formatDeltaTime(finalDelta)}</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>

      {/* Delta Time Overview Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
          <span className="font-mono font-bold uppercase tracking-wider text-slate-800">
            DELTA TIME ACCUMULATION ($\Delta t$)
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Cumulative time delta from the generated speeds; positive means comparison is slower
          </span>
        </div>

        <div className="w-full h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <XAxis dataKey="distance" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v}m`} />
              <YAxis domain={[-0.5, 1.5]} stroke="#8B5CF6" fontSize={10} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}s`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="deltaTime" stroke="#8B5CF6" strokeWidth={2.4} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speed Overlap Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
          <span className="font-mono font-bold uppercase tracking-wider text-slate-800">
            SPEED COMPARISON OVERLAY (KM/H)
          </span>
          <div className="flex items-center gap-4 text-xs font-mono font-semibold">
            <span className="flex items-center gap-1.5 text-sky-600">
              <span className="w-3 h-1 bg-sky-500 rounded-full inline-block" /> Reference Lap (L4)
            </span>
            <span className="flex items-center gap-1.5 text-purple-600">
              <span className="w-3 h-1 bg-purple-500 rounded-full inline-block" /> Comparison Lap (L2)
            </span>
          </div>
        </div>

        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <XAxis dataKey="distance" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v}m`} />
              <YAxis domain={[60, 360]} stroke="#0284C7" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="refSpeed" stroke="#0284C7" strokeWidth={2.2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="compSpeed" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="4 2" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Throttle & Brake Overlap */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
          <span className="font-mono font-bold uppercase tracking-wider text-slate-800">
            PEDAL APPLICATION OVERLAY (THROTTLE / BRAKE)
          </span>
          <div className="flex items-center gap-4 text-xs font-mono font-semibold">
            <span className="text-emerald-600">Throttle Ref / Comp</span>
            <span className="text-rose-600">Brake Ref / Comp</span>
          </div>
        </div>

        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <XAxis dataKey="distance" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v}m`} />
              <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="refThrottle" stroke="#10B981" strokeWidth={1.8} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="compThrottle" stroke="#10B981" strokeWidth={1.4} strokeDasharray="3 2" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="refBrake" stroke="#EF4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="compBrake" stroke="#EF4444" strokeWidth={1.4} strokeDasharray="3 2" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

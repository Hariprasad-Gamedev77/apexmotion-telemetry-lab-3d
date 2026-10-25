'use client';

// APEX TELEMETRY 3D — Synchronized Multi-Signal Telemetry Charts
// Light Theme with vibrant multi-signal traces and crisp Reeve design

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
import { Activity } from 'lucide-react';

interface SynchronizedTelemetryChartProps {
  height?: number;
}

export function SynchronizedTelemetryChart({ height = 240 }: SynchronizedTelemetryChartProps) {
  const { telemetryHistory, currentTelemetry, setCurrentTime } = useApexStore();

  // Downsample data if too dense for smooth 60fps charting
  const chartData = useMemo(() => {
    if (!telemetryHistory || telemetryHistory.length === 0) return [];
    const step = Math.max(1, Math.floor(telemetryHistory.length / 150));
    const sampled = [];
    for (let i = 0; i < telemetryHistory.length; i += step) {
      const pt = telemetryHistory[i];
      sampled.push({
        time: pt.timestamp,
        distance: pt.distanceMeters,
        speed: pt.speedKph,
        throttle: pt.throttlePercent,
        brake: pt.brakePercent,
        gear: pt.gear,
        rpm: Math.round(pt.rpm / 100),
      });
    }
    return sampled;
  }, [telemetryHistory]);

  const currentDist = currentTelemetry.distanceMeters;

  return (
    <div className="w-full flex flex-col gap-2.5 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm select-none">
      {/* Chart Header */}
      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Activity size={13} className="text-sky-600" />
            SYNCHRONIZED OVERLAY TRACE
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono font-semibold">
            <span className="flex items-center gap-1 text-sky-600">
              <span className="w-2.5 h-1 bg-sky-500 rounded-full inline-block" /> Speed (km/h)
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2.5 h-1 bg-emerald-500 rounded-full inline-block" /> Throttle (%)
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2.5 h-1 bg-rose-500 rounded-full inline-block" /> Brake (%)
            </span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          Track Distance:{' '}
          <span className="text-sky-700 font-tabular font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            {currentDist}m
          </span>
        </div>
      </div>

      {/* Main Speed Chart */}
      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                const clickedTime = e.activePayload[0].payload.time;
                if (clickedTime !== undefined) setCurrentTime(clickedTime);
              }
            }}
          >
            <XAxis
              dataKey="distance"
              stroke="#94A3B8"
              fontSize={10}
              tickFormatter={(v) => `${Math.round(v)}m`}
            />
            <YAxis
              yAxisId="speed"
              domain={[60, 360]}
              stroke="#0284C7"
              fontSize={10}
              tickCount={5}
            />
            <YAxis
              yAxisId="pedal"
              orientation="right"
              domain={[0, 100]}
              stroke="#10B981"
              fontSize={10}
              tickCount={5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white/95 border border-slate-200 p-2.5 rounded-xl shadow-lg backdrop-blur-md font-mono text-[11px] flex flex-col gap-1 min-w-[140px]">
                    <div className="text-slate-500 font-semibold border-b border-slate-100 pb-1">
                      Distance: <span className="text-slate-800">{Math.round(d.distance)}m</span>
                    </div>
                    <div className="flex justify-between items-center text-sky-600 font-bold">
                      <span>Speed</span>
                      <span>{Math.round(d.speed)} km/h</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>Throttle</span>
                      <span>{Math.round(d.throttle)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-600 font-bold">
                      <span>Brake</span>
                      <span>{Math.round(d.brake)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-indigo-600 font-bold">
                      <span>Gear</span>
                      <span>{d.gear}</span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Current Scrub Scrubber Line */}
            <ReferenceLine
              x={currentDist}
              stroke="#0284C7"
              strokeDasharray="3 3"
              strokeWidth={2}
            />

            {/* Speed Trace */}
            <Line
              yAxisId="speed"
              type="monotone"
              dataKey="speed"
              stroke="#0284C7"
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Throttle Trace */}
            <Line
              yAxisId="pedal"
              type="monotone"
              dataKey="throttle"
              stroke="#10B981"
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />

            {/* Brake Trace */}
            <Line
              yAxisId="pedal"
              type="monotone"
              dataKey="brake"
              stroke="#EF4444"
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

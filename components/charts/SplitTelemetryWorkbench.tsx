'use client';

// APEX TELEMETRY 3D — Split Synchronized Multi-Signal Telemetry Workbench
// Light Theme with high-contrast traces, Reeve styling, and rich color palettes.
// Stacks Speed, Throttle, Brake, Gear/RPM, and G-Forces into distinct synchronized panes.

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { useApexStore } from '@/lib/store';
import { Activity } from 'lucide-react';

interface SplitTelemetryWorkbenchProps {
  compact?: boolean;
}

export function SplitTelemetryWorkbench({ compact = false }: SplitTelemetryWorkbenchProps) {
  const {
    telemetryHistory,
    currentTelemetry,
    seekToDistance,
    setCurrentTime,
    duration,
    circuit,
  } = useApexStore();

  const [alignBy, setAlignBy] = useState<'distance' | 'time'>('distance');
  const [showGForces, setShowGForces] = useState<boolean>(true);

  // Sample data smoothly for 60fps charting
  const chartData = useMemo(() => {
    if (!telemetryHistory || telemetryHistory.length === 0) return [];
    const step = Math.max(1, Math.floor(telemetryHistory.length / 180));
    const sampled = [];

    for (let i = 0; i < telemetryHistory.length; i += step) {
      const pt = telemetryHistory[i];
      sampled.push({
        distance: pt.distanceMeters,
        time: pt.timestamp,
        speed: pt.speedKph,
        throttle: pt.throttlePercent,
        brake: pt.brakePercent,
        gear: pt.gear,
        rpm: pt.rpm,
        longG: pt.longitudinalG,
        latG: pt.lateralG ? Math.abs(pt.lateralG) : 0,
        drs: pt.drs,
      });
    }
    return sampled;
  }, [telemetryHistory]);

  const currentX = alignBy === 'distance' ? currentTelemetry.distanceMeters : currentTelemetry.timestamp;

  // Handle click on any chart to seek replay & 3D vehicle
  const handleChartClick = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const payload = e.activePayload[0].payload;
      if (alignBy === 'distance' && payload.distance !== undefined) {
        seekToDistance(payload.distance);
      } else if (payload.time !== undefined) {
        setCurrentTime(payload.time);
      }
    }
  };

  const sharedTooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E2E8F0',
    borderRadius: '12px',
    fontSize: '11px',
    fontFamily: 'monospace',
    padding: '4px 10px',
    color: '#0F172A',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  return (
    <div className="w-full flex flex-col gap-2 bg-white/95 border border-slate-200/90 p-4 rounded-3xl select-none backdrop-blur-xl shadow-xl shadow-slate-200/50">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            <Activity size={15} className="text-sky-600" />
            <span>SPLIT TELEMETRY TRACES</span>
          </div>

          {/* Alignment Pills: Distance vs Time */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setAlignBy('distance')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                alignBy === 'distance'
                  ? 'bg-white text-sky-700 border border-slate-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Distance (m)
            </button>
            <button
              onClick={() => setAlignBy('time')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                alignBy === 'time'
                  ? 'bg-white text-sky-700 border border-slate-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Time (s)
            </button>
          </div>
        </div>

        {/* Live Synchronized Readout Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 shadow-xs">
            <span className="font-bold text-[10px]">VEL:</span>
            <span className="font-tabular font-bold">{currentTelemetry.speedKph} km/h</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
            <span className="font-bold text-[10px]">THR:</span>
            <span className="font-tabular font-bold">{currentTelemetry.throttlePercent}%</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shadow-xs">
            <span className="font-bold text-[10px]">BRK:</span>
            <span className="font-tabular font-bold">{currentTelemetry.brakePercent}%</span>
          </span>
          <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 shadow-xs">
            <span className="font-bold text-[10px]">GEAR:</span>
            <span className="font-tabular font-bold">{currentTelemetry.gear}</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-xs">
            <span className="font-bold text-[10px]">RPM:</span>
            <span className="font-tabular font-bold">{currentTelemetry.rpm}</span>
          </span>
        </div>
      </div>

      {/* --- PANE 1: SPEED / VELOCITY (KM/H) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-sky-700 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-sky-500 rounded-full inline-block" /> SPEED (KM/H)
          </span>
          <span className="text-slate-400 font-semibold">0 - 360 km/h</span>
        </div>
        <div className="w-full h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <defs>
                <linearGradient id="speedGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis domain={[50, 350]} stroke="#0284C7" fontSize={9} tickCount={4} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Area type="monotone" dataKey="speed" stroke="#0284C7" strokeWidth={2} fill="url(#speedGradLight)" isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#0284C7" strokeWidth={2} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 2: THROTTLE (%) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-emerald-500 rounded-full inline-block" /> THROTTLE PEDAL (%)
          </span>
          <span className="text-slate-400 font-semibold">0 - 100%</span>
        </div>
        <div className="w-full h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <defs>
                <linearGradient id="throttleGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} stroke="#10B981" fontSize={9} tickCount={3} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Area type="monotone" dataKey="throttle" stroke="#10B981" strokeWidth={1.8} fill="url(#throttleGradLight)" isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 3: BRAKE (%) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-rose-700 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-rose-500 rounded-full inline-block" /> BRAKE PRESSURE (%)
          </span>
          <span className="text-slate-400 font-semibold">0 - 100%</span>
        </div>
        <div className="w-full h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <defs>
                <linearGradient id="brakeGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} stroke="#EF4444" fontSize={9} tickCount={3} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Area type="monotone" dataKey="brake" stroke="#EF4444" strokeWidth={1.8} fill="url(#brakeGradLight)" isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 4: GEAR & RPM --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="font-bold flex items-center gap-3">
            <span className="text-purple-700 flex items-center gap-1"><span className="w-2.5 h-1 bg-purple-500 rounded-full inline-block" /> GEAR (1-8)</span>
            <span className="text-amber-700 flex items-center gap-1"><span className="w-2.5 h-1 bg-amber-500 rounded-full inline-block" /> RPM</span>
          </span>
          <span className="text-slate-400 font-semibold">Stepped Ratio & Revs</span>
        </div>
        <div className="w-full h-18">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <YAxis yAxisId="gear" domain={[1, 8]} stroke="#8B5CF6" fontSize={9} tickCount={4} />
              <YAxis yAxisId="rpm" domain={[4000, 13500]} orientation="right" stroke="#F59E0B" fontSize={9} tickCount={4} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Line yAxisId="gear" type="stepAfter" dataKey="gear" stroke="#8B5CF6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="rpm" type="monotone" dataKey="rpm" stroke="#F59E0B" strokeWidth={1.4} dot={false} isAnimationActive={false} />
              <ReferenceLine yAxisId="gear" x={currentX} stroke="#8B5CF6" strokeWidth={2} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 5: G-FORCES (LONGITUDINAL / LATERAL) --- */}
      {showGForces && (
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-center text-[10px] font-mono px-1">
            <span className="font-bold flex items-center gap-3">
              <span className="text-sky-700 flex items-center gap-1"><span className="w-2.5 h-1 bg-sky-500 rounded-full inline-block" /> Longitudinal G (+accel / -brake)</span>
              <span className="text-amber-700 flex items-center gap-1"><span className="w-2.5 h-1 bg-amber-500 rounded-full inline-block" /> Lateral G (Cornering)</span>
            </span>
            <span className="text-slate-400 font-semibold">-5G to +5G</span>
          </div>
          <div className="w-full h-18">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
                <XAxis
                  dataKey={alignBy === 'distance' ? 'distance' : 'time'}
                  stroke="#94A3B8"
                  fontSize={9}
                  tickFormatter={(v) => alignBy === 'distance' ? `${Math.round(v)}m` : `${v.toFixed(1)}s`}
                />
                <YAxis domain={[-5, 5]} stroke="#64748B" fontSize={9} tickCount={5} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}G`} />
                <Tooltip contentStyle={sharedTooltipStyle} />
                <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="longG" stroke="#0284C7" strokeWidth={1.6} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="latG" stroke="#F59E0B" strokeWidth={1.6} dot={false} isAnimationActive={false} />
                <ReferenceLine x={currentX} stroke="#64748B" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

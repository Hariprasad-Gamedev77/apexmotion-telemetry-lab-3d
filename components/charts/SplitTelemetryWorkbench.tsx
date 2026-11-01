'use client';

// APEX TELEMETRY 3D — Split Synchronized Telemetry Workbench (Daylight Theme)
// MoTeC / Formula Telemetry inspired individual panes: Speed, Throttle, Brake, Gear, Engine RPM
// Distance (m) or Time (s) synchronized scrubber.

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useApexStore } from '@/lib/store';
import { Activity } from 'lucide-react';

interface SplitTelemetryWorkbenchProps {
  maxHeight?: number;
}

export function SplitTelemetryWorkbench({ maxHeight }: SplitTelemetryWorkbenchProps) {
  const { currentTelemetry, telemetryHistory, setCurrentTime, seekToDistance } = useApexStore();
  const [alignBy, setAlignBy] = useState<'distance' | 'time'>('distance');

  // Chart data sampled uniformly from history
  const chartData = telemetryHistory.map((s, idx) => ({
    index: idx,
    time: Math.round(s.timestamp * 100) / 100,
    distance: Math.round(s.distanceMeters),
    speed: Math.round(s.speedKph),
    throttle: Math.round(s.throttlePercent),
    brake: Math.round(s.brakePercent),
    gear: s.gear,
    rpm: s.rpm,
  }));

  const currentX = alignBy === 'distance' ? currentTelemetry.distanceMeters : currentTelemetry.timestamp;

  // Handle click on any chart to seek replay & 3D vehicle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartClick = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0 && e.activePayload[0].payload) {
      const payload = e.activePayload[0].payload;
      if (alignBy === 'distance' && payload.distance !== undefined) {
        seekToDistance(payload.distance);
      } else if (payload.time !== undefined) {
        setCurrentTime(payload.time);
      }
    }
  };

  const sharedTooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: '12px',
    fontSize: '11px',
    fontFamily: 'monospace',
    padding: '4px 10px',
    color: '#0F172A',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  };

  return (
    <div className="w-full flex flex-col gap-2 bg-white border border-[#E2E8F0] p-4 rounded-3xl select-none shadow-sm">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2.5 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-[11px] uppercase tracking-wider">
            <Activity size={15} className="text-[#0284C7]" />
            <span>SPLIT TELEMETRY TRACES</span>
          </div>

          {/* Alignment Pills: Distance vs Time */}
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
            <button
              onClick={() => setAlignBy('distance')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                alignBy === 'distance'
                  ? 'bg-white text-[#0284C7] border border-[#0284C7]/20 shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Distance (m)
            </button>
            <button
              onClick={() => setAlignBy('time')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                alignBy === 'time'
                  ? 'bg-white text-[#0284C7] border border-[#0284C7]/20 shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Time (s)
            </button>
          </div>
        </div>

        {/* Live Synchronized Readout Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#0369A1] bg-[#E0F2FE] px-2.5 py-1 rounded-full border border-[#BAE6FD] shadow-xs">
            <span className="font-bold text-[10px]">VEL:</span>
            <span className="font-tabular font-bold">{currentTelemetry.speedKph} km/h</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#047857] bg-[#D1FAE5] px-2.5 py-1 rounded-full border border-[#A7F3D0] shadow-xs">
            <span className="font-bold text-[10px]">THR:</span>
            <span className="font-tabular font-bold">{currentTelemetry.throttlePercent}%</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#B91C1C] bg-[#FEE2E2] px-2.5 py-1 rounded-full border border-[#FECACA] shadow-xs">
            <span className="font-bold text-[10px]">BRK:</span>
            <span className="font-tabular font-bold">{currentTelemetry.brakePercent}%</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#6D28D9] bg-[#EDE9FE] px-2.5 py-1 rounded-full border border-[#DDD6FE] shadow-xs">
            <span className="font-bold text-[10px]">GEAR:</span>
            <span className="font-tabular font-bold">{currentTelemetry.gear}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-full border border-[#FDE68A] shadow-xs">
            <span className="font-bold text-[10px]">RPM:</span>
            <span className="font-tabular font-bold">{currentTelemetry.rpm}</span>
          </span>
        </div>
      </div>

      {/* --- PANE 1: SPEED / VELOCITY (KM/H) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-[#0284C7] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#0284C7] rounded-full inline-block" /> SPEED (KM/H)
          </span>
          <span className="text-[#64748B] font-semibold">0 - 360 km/h</span>
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
              <YAxis domain={[50, 350]} stroke="#94A3B8" fontSize={9} tickCount={4} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Area type="monotone" dataKey="speed" stroke="#0284C7" strokeWidth={2} fill="url(#speedGradLight)" isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#0284C7" strokeWidth={2} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 2: THROTTLE APPLICATION (%) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-[#10B981] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#10B981] rounded-full inline-block" /> THROTTLE (%)
          </span>
          <span className="text-[#64748B] font-semibold">0 - 100 %</span>
        </div>
        <div className="w-full h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <defs>
                <linearGradient id="thrGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={9} tickCount={3} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Area type="monotone" dataKey="throttle" stroke="#10B981" strokeWidth={1.75} fill="url(#thrGradLight)" isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#0284C7" strokeWidth={2} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 3: BRAKE APPLICATION (%) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-[#EF4444] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#EF4444] rounded-full inline-block" /> BRAKE (%)
          </span>
          <span className="text-[#64748B] font-semibold">0 - 100 %</span>
        </div>
        <div className="w-full h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <defs>
                <linearGradient id="brkGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={9} tickCount={3} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Area type="monotone" dataKey="brake" stroke="#EF4444" strokeWidth={1.75} fill="url(#brkGradLight)" isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#0284C7" strokeWidth={2} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 4: GEAR SELECTION (1 - 8) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-[#8B5CF6] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#8B5CF6] rounded-full inline-block" /> GEAR (1 - 8)
          </span>
          <span className="text-[#64748B] font-semibold">Gears 1 to 8</span>
        </div>
        <div className="w-full h-14">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <YAxis domain={[1, 8]} stroke="#94A3B8" fontSize={9} tickCount={4} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Line type="stepAfter" dataKey="gear" stroke="#8B5CF6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#0284C7" strokeWidth={2} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PANE 5: ENGINE RPM (4000 - 13500) --- */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono px-1">
          <span className="text-[#F59E0B] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#F59E0B] rounded-full inline-block" /> ENGINE RPM
          </span>
          <span className="text-[#64748B] font-semibold">4,000 - 13,500 rpm</span>
        </div>
        <div className="w-full h-18">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
              <defs>
                <linearGradient id="rpmGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey={alignBy === 'distance' ? 'distance' : 'time'}
                stroke="#94A3B8"
                fontSize={9}
                tickFormatter={(v) => (alignBy === 'distance' ? `${Math.round(v)}m` : `${v}s`)}
              />
              <YAxis domain={[4000, 13500]} stroke="#94A3B8" fontSize={9} tickCount={4} />
              <Tooltip contentStyle={sharedTooltipStyle} />
              <Area type="monotone" dataKey="rpm" stroke="#F59E0B" strokeWidth={1.5} fill="url(#rpmGradLight)" isAnimationActive={false} />
              <ReferenceLine x={currentX} stroke="#0284C7" strokeWidth={2} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SplitTelemetryWorkbench;

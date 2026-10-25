'use client';

// APEX TELEMETRY 3D — Engineering Telemetry Heads-Up Display (HUD)
// Light Theme with high-contrast, rich color accents, and Collapsible Mode to prevent overlay issues

import React, { useState } from 'react';
import { useApexStore } from '@/lib/store';
import { formatRpm, formatSpeed } from '@/lib/utils';
import { Gauge, Wind, Minimize2, Maximize2 } from 'lucide-react';

interface LiveDashboardHUDProps {
  initialCompact?: boolean;
}

export function LiveDashboardHUD({ initialCompact = false }: LiveDashboardHUDProps) {
  const { currentTelemetry, drivers, selectedDriverNumber } = useApexStore();
  const [isCompact, setIsCompact] = useState(initialCompact);
  const driver = drivers.find((d) => d.driverNumber === selectedDriverNumber);

  const rpm = currentTelemetry.rpm || 0;
  const maxRpm = 13500;
  const rpmPercent = Math.min(100, Math.max(0, (rpm / maxRpm) * 100));

  // Shift LEDs (15 LEDs: 5 emerald, 5 amber, 5 crimson/violet)
  const totalLeds = 15;
  const litLeds = Math.floor((rpmPercent / 100) * totalLeds);

  // Compact Minimalist Single-Line Mode (Guarantees zero overlap with graphs)
  if (isCompact) {
    return (
      <div className="flex items-center justify-between gap-3 p-2.5 bg-white/95 border border-slate-200/90 rounded-2xl shadow-lg backdrop-blur-md select-none text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
            style={{ backgroundColor: driver?.color || '#0284C7' }}
          />
          <span className="font-bold text-slate-800">
            {driver?.code || 'VER'} #{driver?.driverNumber || 1}
          </span>
        </div>

        <div className="flex items-center gap-2 font-tabular">
          <span className="text-sky-700 font-extrabold text-sm">
            {formatSpeed(currentTelemetry.speedKph)} <span className="text-[10px] text-slate-400">KM/H</span>
          </span>
          <span className="bg-slate-100 text-slate-800 font-black px-1.5 py-0.5 rounded-md border border-slate-200 text-xs">
            G:{currentTelemetry.gear || 'N'}
          </span>
          <span className="text-emerald-700 font-bold text-[11px]">
            T:{currentTelemetry.throttlePercent}%
          </span>
          <span className="text-rose-700 font-bold text-[11px]">
            B:{currentTelemetry.brakePercent}%
          </span>
        </div>

        <button
          onClick={() => setIsCompact(false)}
          title="Expand Full Gauge Cluster"
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    );
  }

  // Full Gauge Cluster Mode
  return (
    <div className="flex flex-col gap-3 p-4 bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 backdrop-blur-md select-none">
      {/* Top Header: Active Driver and DRS Indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white"
            style={{ backgroundColor: driver?.color || '#0284C7' }}
          />
          <span className="font-mono font-bold text-sm text-slate-800">
            {driver?.name || 'Driver 1'}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            #{driver?.driverNumber || 1} {driver?.code || 'VER'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* DRS Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs ${
              currentTelemetry.drs === 1
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 animate-pulse'
                : 'bg-slate-100 border border-slate-200 text-slate-400'
            }`}
          >
            <Wind size={11} />
            {currentTelemetry.drs === 1 ? 'DRS' : 'CLOSED'}
          </div>

          {/* Compact Toggle Button */}
          <button
            onClick={() => setIsCompact(true)}
            title="Minimize to Compact Bar (Prevents Graph Overlap)"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <Minimize2 size={13} />
          </button>
        </div>
      </div>

      {/* RPM Shift Lights Array */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span className="font-semibold">ENGINE RPM</span>
          <span className="text-slate-800 font-tabular font-bold">{formatRpm(rpm)} / 13,500</span>
        </div>
        <div className="grid grid-cols-15 gap-1 h-3.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {Array.from({ length: totalLeds }).map((_, i) => {
            const isLit = i < litLeds;
            let ledColor = 'bg-emerald-500 shadow-emerald-400/50'; // Green (1-5)
            if (i >= 5 && i < 10) ledColor = 'bg-amber-500 shadow-amber-400/50'; // Amber (6-10)
            if (i >= 10 && i < 13) ledColor = 'bg-rose-500 shadow-rose-400/50'; // Red (11-13)
            if (i >= 13) ledColor = 'bg-purple-600 shadow-purple-400/50'; // Purple / shift (14-15)

            return (
              <div
                key={i}
                className={`h-full rounded-xs transition-colors duration-75 ${
                  isLit ? `${ledColor} shadow-xs` : 'bg-slate-200/70'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Cluster: Speed & Gear Display */}
      <div className="grid grid-cols-12 gap-2.5 items-center py-1">
        {/* Large Speed Display */}
        <div className="col-span-7 flex flex-col bg-gradient-to-br from-slate-50 to-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
            <Gauge size={12} className="text-sky-600" /> Velocity
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-4xl font-extrabold font-mono font-tabular text-sky-600 tracking-tight">
              {formatSpeed(currentTelemetry.speedKph)}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">KM/H</span>
          </div>
        </div>

        {/* Gear Box */}
        <div className="col-span-5 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            GEAR
          </span>
          <span className="text-4xl font-black font-mono text-slate-800 tracking-tight">
            {currentTelemetry.gear || 'N'}
          </span>
        </div>
      </div>

      {/* Pedals: Throttle & Brake Gauges */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Throttle Gauge */}
        <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold">
            <span className="text-slate-600">THROTTLE</span>
            <span className="text-emerald-600 font-tabular">
              {currentTelemetry.throttlePercent ?? 0}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
              style={{ width: `${currentTelemetry.throttlePercent ?? 0}%` }}
            />
          </div>
        </div>

        {/* Brake Gauge */}
        <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold">
            <span className="text-slate-600">BRAKE</span>
            <span className="text-rose-600 font-tabular">
              {currentTelemetry.brakePercent ?? 0}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-75 rounded-full"
              style={{ width: `${currentTelemetry.brakePercent ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics: G-Forces & Steering */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
          <div className="text-[9px] font-mono font-semibold uppercase text-slate-500">Long. G</div>
          <div className="text-xs font-mono font-bold font-tabular text-slate-800 mt-0.5">
            {currentTelemetry.longitudinalG !== null
              ? `${currentTelemetry.longitudinalG > 0 ? '+' : ''}${currentTelemetry.longitudinalG.toFixed(2)}G`
              : '---'}
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
          <div className="text-[9px] font-mono font-semibold uppercase text-slate-500">Lat. G</div>
          <div className="text-xs font-mono font-bold font-tabular text-slate-800 mt-0.5">
            {currentTelemetry.lateralG !== null
              ? `${Math.abs(currentTelemetry.lateralG).toFixed(2)}G`
              : '---'}
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
          <div className="text-[9px] font-mono font-semibold uppercase text-slate-500">Steer</div>
          <div className="text-xs font-mono font-bold font-tabular text-slate-800 mt-0.5">
            {currentTelemetry.steeringAngleDeg !== null
              ? `${currentTelemetry.steeringAngleDeg > 0 ? '+' : ''}${currentTelemetry.steeringAngleDeg}°`
              : '---'}
          </div>
        </div>
      </div>
    </div>
  );
}

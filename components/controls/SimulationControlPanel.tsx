'use client';

// APEX TELEMETRY 3D — Reeve-Inspired Interactive Simulation & Vehicle Physics Controls
// Light Theme with vibrant color accents and tactile Reeve controls

import React from 'react';
import { useApexStore } from '@/lib/store';
import { Cpu, User } from 'lucide-react';

export function SimulationControlPanel() {
  const {
    manualControl,
    setManualControl,
    manualThrottle,
    setManualThrottle,
    manualBrake,
    setManualBrake,
    currentTelemetry,
  } = useApexStore();

  const handleFullThrottle = () => {
    setManualControl(true);
    setManualThrottle(1.0);
    setManualBrake(0.0);
  };

  const handleFullBrake = () => {
    setManualControl(true);
    setManualBrake(1.0);
    setManualThrottle(0.0);
  };

  const handleCoast = () => {
    setManualControl(true);
    setManualThrottle(0.0);
    setManualBrake(0.0);
  };

  return (
    <div className="flex flex-col gap-3.5 bg-white/95 border border-slate-200/90 p-4 rounded-2xl select-none backdrop-blur-xl shadow-xl shadow-slate-200/50 font-mono text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Cpu size={14} className="text-emerald-600" /> VEHICLE DYNAMICS
        </span>

        {/* AI Auto-driver vs Manual Capsule */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setManualControl(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
              !manualControl
                ? 'bg-white text-emerald-700 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu size={10} /> Auto AI
          </button>
          <button
            onClick={() => setManualControl(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
              manualControl
                ? 'bg-white text-amber-700 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={10} /> Manual
          </button>
        </div>
      </div>

      {/* Manual Driver Controls */}
      {manualControl ? (
        <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {/* Quick Action Pills */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleFullThrottle}
              className="py-1 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-800 text-[10px] font-bold transition-all active:scale-95 text-center shadow-xs"
            >
              Full Throttle
            </button>
            <button
              onClick={handleCoast}
              className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold transition-all active:scale-95 text-center shadow-xs"
            >
              Coast (0%)
            </button>
            <button
              onClick={handleFullBrake}
              className="py-1 px-2 rounded-lg bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 text-[10px] font-bold transition-all active:scale-95 text-center shadow-xs"
            >
              Full Brake
            </button>
          </div>

          {/* Throttle Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-700">Throttle Pedal</span>
              <span className="text-slate-800 font-tabular">{Math.round(manualThrottle * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={manualThrottle}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setManualThrottle(val);
                if (val > 0) setManualBrake(0);
              }}
              aria-label="Manual throttle pedal position"
              className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Brake Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-rose-700">Brake Pedal</span>
              <span className="text-slate-800 font-tabular">{Math.round(manualBrake * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={manualBrake}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setManualBrake(val);
                if (val > 0) setManualThrottle(0);
              }}
              aria-label="Manual brake pedal position"
              className="w-full accent-rose-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 flex flex-col gap-2">
          <div className="text-emerald-700 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Autonomous AI Driver Mode
          </div>
          <div className="flex justify-between border-b border-slate-200/70 pb-1">
            <span className="font-semibold">Apex Target Profile:</span>
            <span className="text-slate-800 font-bold">Curvature Limit Bounded</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/70 pb-1">
            <span className="font-semibold">Traction Envelope:</span>
            <span className="text-emerald-700 font-bold">100% Adhesion (Dry)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Downforce Map:</span>
            <span className="text-amber-700 font-bold">High Downforce Setting</span>
          </div>
        </div>
      )}

      {/* Real-time Forces State */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-semibold">Net Drive Force:</span>
          <div className="text-slate-800 font-bold font-tabular mt-0.5 text-xs">
            {currentTelemetry.throttlePercent > 0 ? `${(currentTelemetry.throttlePercent * 140).toFixed(0)} N` : '0 N'}
          </div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-semibold">Aero Drag Load:</span>
          <div className="text-slate-800 font-bold font-tabular mt-0.5 text-xs">
            {`${(0.5 * 1.225 * 0.85 * 1.55 * Math.pow(currentTelemetry.speedKph / 3.6, 2)).toFixed(0)} N`}
          </div>
        </div>
      </div>
    </div>
  );
}

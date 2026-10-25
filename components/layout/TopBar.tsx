'use client';

// APEX TELEMETRY 3D — Engineering Header & Operating Mode Switcher (Light Theme)
// High-contrast, crystal-clear typography, and functional mode switching.

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApexStore } from '@/lib/store';
import { DATA_MODES } from '@/lib/constants';
import { Sparkles, Database, Wifi, MapPin } from 'lucide-react';

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { dataMode, setDataMode, activeSession, wsConnected, switchCircuit } = useApexStore();

  const handleModeSwitch = (mode: string) => {
    setDataMode(mode as any);
    if (mode === DATA_MODES.SYNTHETIC) {
      switchCircuit('singapore');
      if (pathname !== '/dashboard') router.push('/dashboard');
    } else if (mode === DATA_MODES.HISTORICAL) {
      if (pathname !== '/historical' && pathname !== '/dashboard') {
        router.push('/historical');
      }
    } else if (mode === DATA_MODES.LIVE) {
      if (pathname !== '/connection') {
        router.push('/connection');
      }
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none z-30 shadow-xs">
      {/* Left: Mode Selector Tabs & Persistent Badge */}
      <div className="flex items-center gap-3">
        {/* Operating Mode Buttons with high contrast and clear purpose */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => handleModeSwitch(DATA_MODES.SYNTHETIC)}
            title="Switch to Procedural 3D Physics Simulation (No API/Game needed)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
              dataMode === DATA_MODES.SYNTHETIC
                ? 'bg-white text-sky-700 border border-sky-300 shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles size={13} className={dataMode === DATA_MODES.SYNTHETIC ? 'text-sky-600' : 'text-slate-600'} />
            <span>Synthetic 3D</span>
          </button>

          <button
            onClick={() => handleModeSwitch(DATA_MODES.HISTORICAL)}
            title="Browse and replay historical Formula 1 GPS & Telemetry"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
              dataMode === DATA_MODES.HISTORICAL
                ? 'bg-white text-amber-800 border border-amber-300 shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <Database size={13} className={dataMode === DATA_MODES.HISTORICAL ? 'text-amber-600' : 'text-slate-600'} />
            <span>Historical F1</span>
          </button>

          <button
            onClick={() => handleModeSwitch(DATA_MODES.LIVE)}
            title="Connect local Python UDP telemetry receiver (Port 20777)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
              dataMode === DATA_MODES.LIVE
                ? 'bg-white text-emerald-800 border border-emerald-300 shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <Wifi size={13} className={dataMode === DATA_MODES.LIVE ? 'text-emerald-600' : 'text-slate-600'} />
            <span>Live Sim</span>
          </button>
        </div>

        {/* Persistent Mode Status Badge */}
        {dataMode === DATA_MODES.SYNTHETIC && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-800 text-[10px] font-mono font-extrabold tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            SYNTHETIC DEMO
          </div>
        )}
        {dataMode === DATA_MODES.HISTORICAL && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-mono font-extrabold tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            HISTORICAL RECORD
          </div>
        )}
        {dataMode === DATA_MODES.LIVE && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-extrabold tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            LIVE TELEMETRY
          </div>
        )}
      </div>

      {/* Center: Selected Session & Track Pill */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-mono shadow-xs">
        <MapPin size={13} className="text-sky-600" />
        <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">CIRCUIT:</span>
        <span className="text-slate-900 font-black">{activeSession.circuitName}</span>
        <span className="text-slate-300">•</span>
        <span className="text-sky-700 font-extrabold">{activeSession.year}</span>
      </div>

      {/* Right: Connection & Status Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              dataMode === DATA_MODES.SYNTHETIC
                ? 'bg-sky-500'
                : wsConnected
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-extrabold text-slate-800">
            {dataMode === DATA_MODES.SYNTHETIC
              ? 'SIM ENGINE ACTIVE'
              : wsConnected
              ? 'UDP STREAM 60HZ'
              : 'OFFLINE / DISCONNECTED'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;


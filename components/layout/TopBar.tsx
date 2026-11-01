'use client';

// APEX TELEMETRY 3D — Engineering Header & Operating Mode Switcher
// High-contrast, motorsport daylight theme (#FFFFFF / #E2E8F0 / #0284C7 / #0F172A)

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApexStore } from '@/lib/store';
import { DATA_MODES, type DataMode } from '@/lib/constants';
import { Sparkles, Database, Wifi, MapPin } from 'lucide-react';

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { dataMode, setDataMode, activeSession, wsConnected, switchCircuit } = useApexStore();

  const handleModeSwitch = (mode: DataMode) => {
    setDataMode(mode);
    if (mode === DATA_MODES.SYNTHETIC) {
      switchCircuit('austin');
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
    <header className="h-14 bg-white border-b border-[#E2E8F0] px-4 flex items-center justify-between select-none z-30 shadow-xs">
      {/* Left: Mode Selector Tabs & Persistent Badge */}
      <div className="flex items-center gap-3">
        {/* Operating Mode Buttons */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => handleModeSwitch(DATA_MODES.SYNTHETIC)}
            title="Switch to Procedural 3D Physics Simulation"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
              dataMode === DATA_MODES.SYNTHETIC
                ? 'bg-white text-[#0284C7] border border-[#0284C7]/30 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
            }`}
          >
            <Sparkles size={13} className={dataMode === DATA_MODES.SYNTHETIC ? 'text-[#0284C7]' : 'text-[#64748B]'} />
            <span>Synthetic 3D</span>
          </button>

          <button
            onClick={() => handleModeSwitch(DATA_MODES.HISTORICAL)}
            title="Browse and replay historical Formula 1 GPS & Telemetry"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
              dataMode === DATA_MODES.HISTORICAL
                ? 'bg-white text-[#D97706] border border-[#D97706]/30 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
            }`}
          >
            <Database size={13} className={dataMode === DATA_MODES.HISTORICAL ? 'text-[#D97706]' : 'text-[#64748B]'} />
            <span>Historical F1</span>
          </button>

          <button
            onClick={() => handleModeSwitch(DATA_MODES.LIVE)}
            title="Connect local Python UDP telemetry receiver (Port 20777)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
              dataMode === DATA_MODES.LIVE
                ? 'bg-white text-[#059669] border border-[#059669]/30 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
            }`}
          >
            <Wifi size={13} className={dataMode === DATA_MODES.LIVE ? 'text-[#059669]' : 'text-[#64748B]'} />
            <span>Live Sim</span>
          </button>
        </div>

        {/* Persistent Mode Status Badge */}
        {dataMode === DATA_MODES.SYNTHETIC && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-[10px] font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
            SYNTHETIC DEMO
          </div>
        )}
        {dataMode === DATA_MODES.HISTORICAL && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-[10px] font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            HISTORICAL RECORD
          </div>
        )}
        {dataMode === DATA_MODES.LIVE && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] border border-[#A7F3D0] text-[#047857] text-[10px] font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
            LIVE TELEMETRY
          </div>
        )}
      </div>

      {/* Center: Selected Session & Track Pill */}
      <div className="hidden lg:flex items-center gap-2 bg-[#F8FAFC] px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-mono">
        <MapPin size={13} className="text-[#0284C7]" />
        <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">CIRCUIT:</span>
        <span className="text-[#0F172A] font-bold">{activeSession.circuitName}</span>
        <span className="text-[#CBD5E1]">•</span>
        <span className="text-[#0284C7] font-bold">{activeSession.year}</span>
      </div>

      {/* Right: Connection & Status Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
          <span
            className={`w-2 h-2 rounded-full ${
              dataMode === DATA_MODES.SYNTHETIC
                ? 'bg-[#0284C7]'
                : wsConnected
                ? 'bg-[#10B981]'
                : 'bg-[#F59E0B]'
            }`}
          />
          <span className="text-[11px] font-bold text-[#0F172A]">
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

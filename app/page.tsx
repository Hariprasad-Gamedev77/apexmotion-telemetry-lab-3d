'use client';

// APEX TELEMETRY 3D — Engineering Workbench Home & Mode Launcher
// Light Theme with rich colors, frosted glass cards, and Reeve-inspired interactions

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Database,
  Wifi,
  ArrowRight,
  Activity,
  LineChart,
  Cpu,
  ShieldCheck,
  Compass,
  Gauge,
  Sliders,
} from 'lucide-react';
import { useApexStore } from '@/lib/store';
import { DATA_MODES } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const { setDataMode } = useApexStore();

  const handleStartDemo = () => {
    setDataMode(DATA_MODES.SYNTHETIC);
    router.push('/dashboard');
  };

  const handleHistorical = () => {
    setDataMode(DATA_MODES.HISTORICAL);
    router.push('/historical');
  };

  const handleConnectLive = () => {
    setDataMode(DATA_MODES.LIVE);
    router.push('/connection');
  };

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 select-none">
      {/* Hero Engineering Presentation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-sky-50/40 border border-slate-200/90 p-8 md:p-12 shadow-xl shadow-slate-200/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-800 font-mono font-bold text-xs uppercase tracking-wider shadow-xs">
              v1.4.0 Engine Ready
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono font-semibold text-slate-500">
              Motorsport Telemetry & 3D Spatial Analytics
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tight text-slate-900">
              APEX TELEMETRY 3D
            </h1>
            <p className="text-lg md:text-xl text-sky-600 font-mono font-bold">
              See the race. Understand the data.
            </p>
          </div>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl font-sans">
            A high-performance browser engineering workbench connecting real-time racing simulator UDP telemetry, historical Formula 1 GPS coordinates, synchronized 3D multi-car replays, and vehicle dynamics analysis.
          </p>

          {/* Core Action Callouts */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-mono font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:opacity-95 active:scale-95 transition-all group"
            >
              <Sparkles size={16} />
              <span>Launch 3D Synthetic Demo</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleHistorical}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-mono font-semibold text-sm shadow-xs active:scale-95 transition-all"
            >
              <Database size={16} className="text-amber-500" />
              <span>Explore Historical F1</span>
            </button>

            <button
              onClick={handleConnectLive}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-mono font-semibold text-sm shadow-xs active:scale-95 transition-all"
            >
              <Wifi size={16} className="text-emerald-500" />
              <span>Connect Live Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Three Operating Modes Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
          Three Independent Operating Modes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mode 1: Synthetic 3D */}
          <div
            onClick={handleStartDemo}
            className="group cursor-pointer flex flex-col justify-between p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-mono font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-base">
                  Synthetic 3D Simulation
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Procedural closed-loop circuit with longitudinal vehicle dynamics (F_net = F_drive - F_aero - F_brake). Immediate zero-setup demonstration.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-sky-600 font-bold mt-5">
              <span>Enter 3D Workstation</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Mode 2: Historical F1 Analysis */}
          <div
            onClick={handleHistorical}
            className="group cursor-pointer flex flex-col justify-between p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Database size={22} />
              </div>
              <div>
                <h3 className="font-mono font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-base">
                  Historical F1 Analysis
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Direct OpenF1 historical Grand Prix data ingestion. Real GPS coordinates, multi-driver lap progression, and synchronized telemetry traces.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-600 font-bold mt-5">
              <span>Browse Sessions</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Mode 3: Live Simulator Telemetry */}
          <div
            onClick={handleConnectLive}
            className="group cursor-pointer flex flex-col justify-between p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Wifi size={22} />
              </div>
              <div>
                <h3 className="font-mono font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-base">
                  Live Simulator Telemetry
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Python UDP packet collector with struct binary decoding (<code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-[11px] font-mono">&lt;BBIf</code>). Real-time 60Hz WebSocket streaming bridge.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 font-bold mt-5">
              <span>Configure Collector</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture & Engineering Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold">
            <span>3D GRAPHICS PIPELINE</span>
            <Activity size={14} className="text-sky-600" />
          </div>
          <div className="text-base font-bold font-mono text-slate-800">Three.js + R3F</div>
          <div className="text-[11px] font-mono font-medium text-sky-600">Client-side Procedural</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold">
            <span>SYNCHRONIZED CLOCK</span>
            <LineChart size={14} className="text-emerald-600" />
          </div>
          <div className="text-base font-bold font-mono text-slate-800">Unified Store</div>
          <div className="text-[11px] font-mono font-medium text-emerald-600">Deterministic Replay</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold">
            <span>UDP NETWORKING</span>
            <Cpu size={14} className="text-amber-600" />
          </div>
          <div className="text-base font-bold font-mono text-slate-800">FastAPI + Struct</div>
          <div className="text-[11px] font-mono font-medium text-amber-600">Port 20777 Localhost</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold">
            <span>DATA PROVENANCE</span>
            <ShieldCheck size={14} className="text-purple-600" />
          </div>
          <div className="text-base font-bold font-mono text-slate-800">Zod Validated</div>
          <div className="text-[11px] font-mono font-medium text-purple-600">No Mixed Synthetic Data</div>
        </div>
      </div>
    </div>
  );
}

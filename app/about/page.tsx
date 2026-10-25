'use client';

// APEX TELEMETRY 3D — Portfolio & Technical Engineering Presentation
// Light Theme with Reeve styling and vibrant architecture highlights

import React from 'react';
import { Info, Cpu, Terminal, ShieldCheck, Compass, Code } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8 select-none">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Info size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black font-mono text-slate-900 tracking-tight">
              APEX TELEMETRY 3D — ARCHITECTURE
            </h1>
            <p className="text-xs font-mono font-bold text-sky-600 mt-1">
              Full-Stack Motorsport Telemetry Engineering Platform • Portfolio Documentation
            </p>
          </div>
        </div>
      </div>

      {/* Engineering Overview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-mono font-bold text-base text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Cpu size={18} className="text-sky-600" /> Project Overview & Design Philosophy
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          APEX TELEMETRY 3D was conceived and engineered as an end-to-end telemetry engineering workbench that bridges low-level network systems programming with browser-based WebGL graphics. The primary architectural innovation is its three completely independent operating modes: <strong className="text-slate-900 font-semibold">Synthetic 3D Simulation</strong>, <strong className="text-slate-900 font-semibold">Historical Formula 1 Analysis</strong>, and <strong className="text-slate-900 font-semibold">Live Simulator UDP Telemetry</strong>.
        </p>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Low-Level Networking */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Terminal size={18} />
            <h3 className="font-mono font-bold text-sm">1. Binary Packet Decoding & Networking</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            The Python backend listens for raw UDP datagrams on loopback port 20777 with an OS-level <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">SO_RCVBUF</code> socket buffer. Packets are parsed using Python's standard-library <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">struct.unpack_from</code> with little-endian format strings (<code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">&lt;BBIf</code> header, <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">&lt;Hff</code> telemetry). Bounded asynchronous queues protect against memory growth during UI lag.
          </p>
        </div>

        {/* 2. Procedural 3D & Catmull-Rom Splines */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sky-700">
            <Compass size={18} />
            <h3 className="font-mono font-bold text-sm">2. 3D Spline Geometry & Vehicle Modeling</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Track geometry is procedurally synthesized from closed 3D Catmull-Rom splines with dynamic curvature estimation ($\kappa = |x&apos;z&apos;&apos; - z&apos;x&apos;&apos;| / (x&apos;^2 + z&apos;^2)^{'{3/2}'}$). Road ribbons and alternating apex kerbs are dynamically triangulated. The original low-poly Formula car features moving aerodynamic wings, rotating carbon wheels, and halo structures.
          </p>
        </div>

        {/* 3. Longitudinal Vehicle Physics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700">
            <Code size={18} />
            <h3 className="font-mono font-bold text-sm">3. Longitudinal Dynamics Physics Model</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Vehicles are simulated via semi-implicit Euler integration:
            <span className="block my-2 font-mono text-xs font-semibold text-sky-800 bg-sky-50 p-2 rounded-xl border border-sky-200">
              {'a = (F_drive - F_brake - F_drag - F_rr) / m'}
            </span>
            where aerodynamic drag incorporates DRS flap state (<code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded font-mono">{'F_drag = 0.5 * rho * Cd * A * v^2'}</code>). Corner speeds are constrained by tire grip limits (<code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded font-mono">{'v_max = sqrt(a_lat / kappa)'}</code>).
          </p>
        </div>

        {/* 4. Unified Clock & Provenance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-purple-700">
            <ShieldCheck size={18} />
            <h4 className="font-mono font-bold text-sm">4. Deterministic Clock & Data Provenance</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            A single logical replay clock drives both the 3D WebGL car position and the Recharts telemetry traces synchronously. Scrubbing the timeline instantaneously seeks both representations. Synthetic data is strictly tagged with persistent badges and never silently mingled with historical records.
          </p>
        </div>
      </div>
    </div>
  );
}

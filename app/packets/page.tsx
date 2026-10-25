'use client';

// APEX TELEMETRY 3D — Packet Diagnostics & Binary Protocol Inspector
// Light Theme with high-contrast typography, vibrant badges, and Reeve styling

import React from 'react';
import { useApexStore } from '@/lib/store';
import { Binary } from 'lucide-react';

export default function PacketInspectorPage() {
  const { diagnostics } = useApexStore();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Binary size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              PACKET DIAGNOSTICS & BINARY INSPECTOR
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            UDP Receiver telemetry metrics • Binary packet decoding using Python struct
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 font-semibold">UDP BIND:</span>
          <span className="text-emerald-700 font-bold">127.0.0.1:20777</span>
        </div>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">PACKETS RECEIVED</span>
          <div className="text-3xl font-black font-mono font-tabular text-sky-700">
            {diagnostics.packetsReceived.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono font-semibold text-emerald-600">0.00% packet loss</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">PACKETS DECODED</span>
          <div className="text-3xl font-black font-mono font-tabular text-slate-800">
            {diagnostics.packetsDecoded.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-400">Binary struct unpacked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">PACKET RATE</span>
          <div className="text-3xl font-black font-mono font-tabular text-emerald-600">
            {diagnostics.estimatedPacketRateHz.toFixed(1)} Hz
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-400">Target: 60Hz tick</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">WEBSOCKET CLIENTS</span>
          <div className="text-3xl font-black font-mono font-tabular text-purple-600">
            {diagnostics.connectedClients} Connected
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-400">FastAPI Broadcaster</span>
        </div>
      </div>

      {/* Binary Packet Protocol Specification Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-6 shadow-sm flex flex-col gap-4">
        <span className="font-mono font-bold text-xs uppercase text-slate-800 tracking-wider">
          EDUCATIONAL BINARY PACKET SPECIFICATION (LITTLE-ENDIAN)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Header Format */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-sky-700 font-bold text-sm">1. Packet Header (`&lt;BBIf`) — 10 Bytes</div>
            <ul className="space-y-1 text-slate-600 font-medium">
              <li>• `packet_id`: uint8 (1 Byte) — [0: Motion, 2: Lap, 6: Telemetry]</li>
              <li>• `game_year`: uint8 (1 Byte) — e.g. 24</li>
              <li>• `frame_id`: uint32 (4 Bytes) — Monotonic frame counter</li>
              <li>• `session_time`: float32 (4 Bytes) — Session elapsed seconds</li>
            </ul>
          </div>

          {/* Telemetry Payload */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-emerald-700 font-bold text-sm">2. Telemetry Payload (`&lt;Hff`) — 10 Bytes (ID 6)</div>
            <ul className="space-y-1 text-slate-600 font-medium">
              <li>• `speed_kph`: uint16 (2 Bytes) — Vehicle speed in km/h</li>
              <li>• `throttle`: float32 (4 Bytes) — 0.0 to 1.0 pedal input</li>
              <li>• `brake`: float32 (4 Bytes) — 0.0 to 1.0 pedal input</li>
            </ul>
          </div>
        </div>

        {/* Live Packet Raw Hex Simulation View */}
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 font-mono text-xs">
          <div className="text-slate-400 text-[11px] font-semibold">RAW PACKET HEX DUMP (LATEST UDP FRAME)</div>
          <div className="font-mono tracking-wider break-all text-xs">
            06 18 2F 01 00 00 A4 70 45 42 01 4C 00 00 80 3F 00 00 00 00 04
          </div>
          <div className="text-[10px] text-slate-500">
            Decoded: Packet ID 6 (Telemetry), Year 24, Frame #303, Session Time: 12.34s, Speed: 332 km/h, Throttle: 100%, Brake: 0%
          </div>
        </div>
      </div>
    </div>
  );
}

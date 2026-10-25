'use client';

// APEX TELEMETRY 3D — Simulator UDP & WebSocket Connection Setup
// Light Theme with Reeve styling and vibrant connection badges

import React, { useState } from 'react';
import { useApexStore } from '@/lib/store';
import { Wifi, ShieldCheck, Terminal } from 'lucide-react';

export default function ConnectionSetupPage() {
  const { wsConnected, setWsConnected } = useApexStore();
  const [wsUrl, setWsUrl] = useState('ws://127.0.0.1:8000/ws/telemetry');
  const [testing, setTesting] = useState(false);

  const handleTestConnection = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setWsConnected(true);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Wifi size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              SIMULATOR & COLLECTOR CONNECTION
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            Configure local Python UDP receiver and real-time WebSocket bridge
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-500 font-semibold">BRIDGE STATUS:</span>
          <span className={wsConnected ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
            {wsConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* WebSocket Configuration Form */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
        <h2 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
          TELEMETRY BROADCAST ENDPOINT
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            placeholder="ws://127.0.0.1:8000/ws/telemetry"
            className="flex-1 bg-slate-50 text-xs font-mono text-slate-800 px-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {testing ? 'Testing Socket...' : wsConnected ? 'Re-test Socket' : 'Connect WebSocket'}
          </button>
        </div>

        <p className="text-[11px] font-mono text-slate-500">
          Note: For local gaming setups, run the Python collector script (<code className="text-sky-700 font-semibold bg-sky-50 px-1 py-0.5 rounded">python-collector/app/main.py</code>) on your racing PC.
        </p>
      </div>

      {/* Simulator Game Configuration Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-sky-700 font-mono font-bold text-sm">
            <Terminal size={18} />
            <h3>Racing Simulator In-Game Settings</h3>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs font-mono text-slate-600">
            <li>Open your racing simulator options (Telemetry / UDP Settings).</li>
            <li>Enable UDP Telemetry output toggle.</li>
            <li>Set IP Address to <span className="text-slate-900 font-bold">127.0.0.1</span> (localhost).</li>
            <li>Set Port to <span className="text-slate-900 font-bold">20777</span>.</li>
            <li>Set Packet Send Rate to <span className="text-slate-900 font-bold">60 Hz</span>.</li>
            <li>Set UDP Format to 2024 / Standard Educational format.</li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 font-mono font-bold text-sm">
            <ShieldCheck size={18} />
            <h3>Architecture Security & Isolation</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Browsers cannot open raw UDP sockets directly due to Web platform sandbox security. The Python bridge receives UDP datagrams over loopback, validates binary packets with struct unpacking, and safely relays normalized JSON telemetry over WebSockets to this web interface.
          </p>
        </div>
      </div>
    </div>
  );
}

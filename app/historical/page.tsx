'use client';

// APEX TELEMETRY 3D — OpenF1 Historical Session Explorer
// Light Theme with vibrant amber badges, clean white cards, and Reeve-inspired styling

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApexStore } from '@/lib/store';
import { CURATED_HISTORICAL_SESSIONS } from '@/lib/api/openf1';
import { DATA_MODES } from '@/lib/constants';
import { Database, Play, Calendar, MapPin, CheckCircle } from 'lucide-react';

export default function HistoricalExplorerPage() {
  const router = useRouter();
  const { setDataMode, setActiveSession, switchCircuit } = useApexStore();
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const handleLoadSession = (session: typeof CURATED_HISTORICAL_SESSIONS[0]) => {
    setDataMode(DATA_MODES.HISTORICAL);
    setActiveSession(session);
    const cName = session.circuitName.toLowerCase();
    if (cName.includes('singapore') || cName.includes('marina')) {
      switchCircuit('singapore');
    } else if (cName.includes('silverstone')) {
      switchCircuit('silverstone');
    } else if (cName.includes('spa')) {
      switchCircuit('spa');
    } else if (cName.includes('monza')) {
      switchCircuit('monza');
    }
    router.push('/dashboard');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Database size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              HISTORICAL F1 SESSION EXPLORER
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            Browse authenticated Grand Prix telemetry and GPS coordinates via OpenF1
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          {[2024, 2023].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                selectedYear === yr
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {yr} Season
            </button>
          ))}
        </div>
      </div>

      {/* Historical Sessions Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CURATED_HISTORICAL_SESSIONS.map((session) => (
          <div
            key={session.id}
            className="bg-white hover:bg-gradient-to-b hover:from-white hover:to-amber-50/40 border border-slate-200 hover:border-amber-300 rounded-3xl p-6 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                  {session.sessionType}
                </span>
                <span className="text-xs font-mono text-slate-400 font-medium flex items-center gap-1">
                  <Calendar size={12} /> {session.date}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold font-mono text-slate-900 group-hover:text-amber-600 transition-colors">
                  {session.meetingName}
                </h2>
                <div className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin size={12} className="text-sky-600" /> {session.circuitName}, {session.country}
                </div>
              </div>

              {/* Data Availability Indicators */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Track Length:</span>
                  <span className="text-slate-900 font-tabular font-bold">{session.trackLengthMeters}m</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>GPS 3D Stream:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle size={12} /> Available
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Car Telemetry:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle size={12} /> 10Hz Calibrated
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLoadSession(session)}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Play size={13} fill="currentColor" />
              <span>Load Into 3D Replay</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

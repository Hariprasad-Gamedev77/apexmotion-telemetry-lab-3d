'use client';

// APEX TELEMETRY 3D — Session History
// Light Theme with Reeve styling and vibrant color accents

import React from 'react';
import Link from 'next/link';
import { History, Play } from 'lucide-react';
import { CURATED_HISTORICAL_SESSIONS } from '@/lib/api/openf1';

export default function SessionHistoryPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
          <History size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-mono text-slate-900">
            SESSION RECORDINGS & HISTORY
          </h1>
          <p className="text-xs font-mono font-medium text-slate-500">
            Reference session catalogue. Telemetry is not stored with these entries.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {CURATED_HISTORICAL_SESSIONS.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-sky-300 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="space-y-1">
              <div className="font-mono font-bold text-base text-slate-900">{s.meetingName}</div>
              <div className="text-xs font-mono font-medium text-slate-500">{s.circuitName} • {s.date}</div>
            </div>

            <Link
              href="/historical"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-mono text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Play size={12} fill="currentColor" /> Check provider session
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

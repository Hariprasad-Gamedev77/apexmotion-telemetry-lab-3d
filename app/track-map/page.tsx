'use client';

// APEX TELEMETRY 3D — Full Track Map & Spatial Inspector
// Light Theme with Reeve styling and high-contrast circuit visualization

import React from 'react';
import { TrackMap2D } from '@/components/telemetry/TrackMap2D';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { Compass } from 'lucide-react';
import { useApexStore } from '@/lib/store';

export default function TrackMapPage() {
  const { circuit } = useApexStore();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] select-none bg-slate-50">
      <div className="p-6 flex-1 overflow-y-auto max-w-5xl mx-auto w-full flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Compass size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              CIRCUIT MAP & SPATIAL POSITIONS
            </h1>
            <p className="text-xs font-mono font-medium text-slate-500 mt-0.5">
              {circuit.name} • {circuit.lengthMeters}m Lap Distance
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <TrackMap2D width={600} height={480} />
          </div>
        </div>
      </div>

      <ReplayControls />
    </div>
  );
}

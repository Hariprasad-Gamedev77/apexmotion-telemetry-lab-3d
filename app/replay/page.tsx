'use client';

// APEX TELEMETRY 3D — Dedicated Full-Screen Track Replay Suite
// Light Theme with daylight 3D scene and Reeve floating HUD

import React from 'react';
import dynamic from 'next/dynamic';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { LiveDashboardHUD } from '@/components/telemetry/LiveDashboardHUD';
import { useApexStore } from '@/lib/store';

const ApexScene = dynamic(() => import('@/components/three/ApexScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function TrackReplayPage() {
  const { dataMode, activeSession } = useApexStore();
  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-slate-100 select-none">
      <div className="relative flex-1 w-full min-h-0">
        <ApexScene />
        {dataMode !== 'synthetic' && (
          <div role="status" className="absolute bottom-4 left-4 z-20 max-w-xl rounded-xl border border-amber-300 bg-amber-50/95 px-4 py-3 text-xs font-mono text-amber-950 shadow-lg">
            <strong>{dataMode === 'historical' ? 'HISTORICAL METADATA' : 'LIVE MODE · NO TELEMETRY SUBSCRIPTION'}{dataMode === 'historical' ? ' · ' + activeSession.meetingName : ''}</strong>
            <div className="mt-1">This replay view uses synthetic geometry and vehicle movement; selected-source position samples are unavailable.</div>
          </div>
        )}

        {/* Compact HUD in top corner */}
        <div className="absolute top-4 left-4 z-20 w-80">
          <LiveDashboardHUD />
        </div>
      </div>

      <ReplayControls />
    </div>
  );
}

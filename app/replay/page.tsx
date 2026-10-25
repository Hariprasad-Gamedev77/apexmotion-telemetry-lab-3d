'use client';

// APEX TELEMETRY 3D — Dedicated Full-Screen Track Replay Suite
// Light Theme with daylight 3D scene and Reeve floating HUD

import React from 'react';
import dynamic from 'next/dynamic';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { LiveDashboardHUD } from '@/components/telemetry/LiveDashboardHUD';

const ApexScene = dynamic(() => import('@/components/three/ApexScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function TrackReplayPage() {
  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-slate-100 select-none">
      <div className="relative flex-1 w-full min-h-0">
        <ApexScene />

        {/* Compact HUD in top corner */}
        <div className="absolute top-4 left-4 z-20 w-80">
          <LiveDashboardHUD />
        </div>
      </div>

      <ReplayControls />
    </div>
  );
}

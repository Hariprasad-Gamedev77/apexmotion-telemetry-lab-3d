'use client';

// APEX TELEMETRY 3D — Flagship 3D Motorsport Workstation
// Reeve-inspired floating UI/UX, light daylight aesthetic, adjustable non-overlapping graph drawer,
// and Formula Telemetry Singapore GP tabs (Lap Analysis, Race Progression, Strategy, Pit Stops).

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { LiveDashboardHUD } from '@/components/telemetry/LiveDashboardHUD';
import { SynchronizedTelemetryChart } from '@/components/charts/SynchronizedTelemetryChart';
import { SplitTelemetryWorkbench } from '@/components/charts/SplitTelemetryWorkbench';
import { FormulaTelemetrySuite, type FormulaTelemetryTab } from '@/components/charts/FormulaTelemetrySuite';
import { SimulationControlPanel } from '@/components/controls/SimulationControlPanel';
import { TrackAdjustmentModal } from '@/components/controls/TrackAdjustmentModal';
import { TrackMap2D } from '@/components/telemetry/TrackMap2D';
import { useApexStore } from '@/lib/store';
import {
  ChevronUp,
  ChevronDown,
  Activity,
  Map,
  Cpu,
  Sliders,
  Maximize2,
  Minimize2,
  Layers,
  Gauge,
  ListOrdered,
  TrendingUp,
  CircleDot,
  Wrench,
  Compass,
} from 'lucide-react';

const ApexScene = dynamic(() => import('@/components/three/ApexScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-3 font-mono">
      <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin shadow-md shadow-sky-200" />
      <span className="text-xs text-sky-700 font-bold tracking-wider uppercase">
        Initializing 3D Telemetry Environment...
      </span>
    </div>
  ),
});

export default function DashboardPage() {
  const { manualControl, setManualThrottle, setManualBrake } = useApexStore();
  const [showCharts, setShowCharts] = useState(true);
  const [chartViewMode, setChartViewMode] = useState<'split' | 'overlay'>('split');
  const [activeTab, setActiveTab] = useState<'hud' | 'sim' | 'adjust' | 'map'>('hud');
  const [formulaTab, setFormulaTab] = useState<FormulaTelemetryTab>('telemetry');
  
  // Adjustable Graph Height: 'compact' (220px), 'medium' (320px), 'expanded' (440px), 'maximized' (62vh)
  const [graphHeight, setGraphHeight] = useState<'compact' | 'medium' | 'expanded' | 'maximized'>('medium');

  // Manual driving keyboard controls (W/Up for throttle, S/Down for brake)
  useEffect(() => {
    if (!manualControl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'w' || e.key === 'ArrowUp') {
        setManualThrottle(1.0);
        setManualBrake(0.0);
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        setManualBrake(1.0);
        setManualThrottle(0.0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') {
        setManualThrottle(0.35);
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        setManualBrake(0.0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [manualControl, setManualThrottle, setManualBrake]);

  const heightClasses = {
    compact: 'h-[220px]',
    medium: 'h-[320px]',
    expanded: 'h-[440px]',
    maximized: 'h-[62vh]',
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-slate-100 select-none">
      {/* Upper Area: 3D Scene + Reeve Floating Control Dock */}
      <div className="relative flex-1 w-full min-h-0">
        <ApexScene />

        {/* --- Reeve Floating Workstation Capsule (Top Right) --- */}
        {/* Constrained to top corner so it never collides with bottom graphs */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 w-84 max-h-[calc(100%-3rem)] overflow-y-auto">
          {/* Segmented Pill Tab Bar */}
          <div className="flex items-center gap-1 bg-white/95 p-1 rounded-2xl border border-slate-200 backdrop-blur-2xl shadow-lg shadow-slate-200/50">
            <button
              onClick={() => setActiveTab('hud')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'hud'
                  ? 'bg-sky-50 text-sky-800 border border-sky-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity size={12} className={activeTab === 'hud' ? 'text-sky-600' : 'text-slate-400'} /> HUD
            </button>
            <button
              onClick={() => setActiveTab('sim')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'sim'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Cpu size={12} className={activeTab === 'sim' ? 'text-emerald-600' : 'text-slate-400'} /> Physics
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'adjust'
                  ? 'bg-purple-50 text-purple-800 border border-purple-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders size={12} className={activeTab === 'adjust' ? 'text-purple-600' : 'text-slate-400'} /> Track
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'map'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Map size={12} className={activeTab === 'map' ? 'text-amber-600' : 'text-slate-400'} /> 2D
            </button>
          </div>

          {/* Active Drawer Card */}
          <div className="transition-all drop-shadow-sm">
            {activeTab === 'hud' && <LiveDashboardHUD initialCompact={false} />}
            {activeTab === 'sim' && <SimulationControlPanel />}
            {activeTab === 'adjust' && <TrackAdjustmentModal />}
            {activeTab === 'map' && <TrackMap2D width={310} height={250} />}
          </div>
        </div>

        {/* --- Floating Bottom Drawer Toggle & Adjustment Controls --- */}
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2">
          {showCharts && (
            <div className="flex items-center gap-1 bg-white/95 p-1 rounded-xl border border-slate-200 backdrop-blur-xl shadow-md text-xs font-mono">
              {/* Height Adjuster Pills */}
              <span className="text-[10px] text-slate-400 font-bold px-1.5">Height:</span>
              {(['compact', 'medium', 'expanded'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setGraphHeight(h)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 ${
                    graphHeight === h
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {h === 'compact' ? 'S' : h === 'medium' ? 'M' : 'L'}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-mono font-bold text-slate-800 hover:text-slate-950 hover:bg-white backdrop-blur-xl transition-all shadow-md active:scale-95"
          >
            <span>{showCharts ? 'Hide Workbench' : 'Show Workbench'}</span>
            {showCharts ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* --- Adjustable Formula Telemetry & Split Graphs Drawer --- */}
      {showCharts && (
        <div className={`w-full ${heightClasses[graphHeight]} overflow-y-auto px-4 pt-2 pb-3 bg-slate-50 border-t border-slate-200 transition-all backdrop-blur-xl shadow-inner flex flex-col gap-2`}>
          {/* Formula Telemetry Navigation Tabs */}
          <FormulaTelemetrySuite activeTab={formulaTab} onTabChange={setFormulaTab} />

          {/* Active Tab Content */}
          {formulaTab === 'telemetry' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                  View Mode:
                </span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    onClick={() => setChartViewMode('split')}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      chartViewMode === 'split'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Split Panes
                  </button>
                  <button
                    onClick={() => setChartViewMode('overlay')}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      chartViewMode === 'overlay'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overlay
                  </button>
                </div>
              </div>

              {chartViewMode === 'split' ? (
                <SplitTelemetryWorkbench />
              ) : (
                <SynchronizedTelemetryChart height={180} />
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Pinned Bottom Replay Controller --- */}
      <ReplayControls onOpenTrackAdjustment={() => setActiveTab('adjust')} />
    </div>
  );
}

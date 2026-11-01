'use client';

// APEX TELEMETRY 3D — Flagship 3D Motorsport Workstation
// Reeve-Inspired Daylight Theme (#F8FAFC / #FFFFFF / #E2E8F0 / #0F172A / #0284C7)
// Synchronized 3D vehicle simulation, adjustable telemetry workbench, and Formula Telemetry tabs.

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
} from 'lucide-react';

const ApexScene = dynamic(() => import('@/components/three/ApexScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#F1F5F9] gap-3 font-mono">
      <div className="w-10 h-10 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin shadow-md shadow-[#0284C7]/20" />
      <span className="text-xs text-[#0284C7] font-bold tracking-wider uppercase">
        Initializing 3D Telemetry Environment...
      </span>
    </div>
  ),
});

export default function DashboardPage() {
  const { manualControl, setManualThrottle, setManualBrake, dataMode, activeSession } = useApexStore();
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
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-[#F8FAFC] select-none text-[#0F172A]">
      {/* Upper Area: 3D Scene + Floating Control Dock */}
      <div className="relative flex-1 w-full min-h-0">
        <ApexScene />

        {dataMode !== 'synthetic' && (
          <div role="status" className="absolute bottom-4 left-4 z-20 max-w-xl rounded-xl border border-amber-300 bg-amber-50/95 px-4 py-3 text-xs font-mono text-amber-950 shadow-lg">
            <strong>{dataMode === 'historical' ? `HISTORICAL SESSION METADATA · ${activeSession.meetingName}` : 'LIVE MODE · NO TELEMETRY SUBSCRIPTION'}</strong>
            <div className="mt-1">This view does not have position telemetry for the selected source. The displayed circuit and vehicle geometry are synthetic.</div>
          </div>
        )}

        {/* Floating Workstation Capsule (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 w-84 max-h-[calc(100%-3rem)] overflow-y-auto">
          {/* Segmented Pill Tab Bar */}
          <div className="flex items-center gap-1 bg-white/95 p-1 rounded-2xl border border-[#E2E8F0] backdrop-blur-2xl shadow-xl">
            <button
              onClick={() => setActiveTab('hud')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'hud'
                  ? 'bg-[#EFF6FF] text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Activity size={12} className={activeTab === 'hud' ? 'text-[#0284C7]' : 'text-[#64748B]'} /> HUD
            </button>
            <button
              onClick={() => setActiveTab('sim')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'sim'
                  ? 'bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Cpu size={12} className={activeTab === 'sim' ? 'text-[#047857]' : 'text-[#64748B]'} /> Physics
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'adjust'
                  ? 'bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Sliders size={12} className={activeTab === 'adjust' ? 'text-[#7C3AED]' : 'text-[#64748B]'} /> Track
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                activeTab === 'map'
                  ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Map size={12} className={activeTab === 'map' ? 'text-[#B45309]' : 'text-[#64748B]'} /> 2D
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

        {/* Floating Bottom Drawer Toggle & Adjustment Controls */}
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2">
          {showCharts && (
            <div className="flex items-center gap-1 bg-white/95 p-1 rounded-xl border border-[#E2E8F0] backdrop-blur-xl shadow-md text-xs font-mono">
              <span className="text-[10px] text-[#64748B] font-bold px-1.5">Height:</span>
              {(['compact', 'medium', 'expanded'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setGraphHeight(h)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 ${
                    graphHeight === h
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {h === 'compact' ? 'S' : h === 'medium' ? 'M' : 'L'}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-[#E2E8F0] text-xs font-mono font-bold text-[#0F172A] hover:bg-[#F8FAFC] backdrop-blur-xl transition-all shadow-md active:scale-95"
          >
            <span>{showCharts ? 'Hide Workbench' : 'Show Workbench'}</span>
            {showCharts ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Adjustable Formula Telemetry & Split Graphs Drawer */}
      {showCharts && (
        <div className={`w-full ${heightClasses[graphHeight]} overflow-y-auto px-4 pt-2 pb-3 bg-white border-t border-[#E2E8F0] transition-all backdrop-blur-xl shadow-xl flex flex-col gap-2 scrollbar-thin scrollbar-thumb-[#CBD5E1]`}>
          {/* Formula Telemetry Navigation Tabs */}
          <FormulaTelemetrySuite activeTab={formulaTab} onTabChange={setFormulaTab} />

          {/* Active Tab Content */}
          {formulaTab === 'telemetry' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold">
                  View Mode:
                </span>
                <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
                  <button
                    onClick={() => setChartViewMode('split')}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      chartViewMode === 'split'
                        ? 'bg-white text-[#0284C7] border border-[#0284C7]/30 shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Split Panes
                  </button>
                  <button
                    onClick={() => setChartViewMode('overlay')}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      chartViewMode === 'overlay'
                        ? 'bg-white text-[#0284C7] border border-[#0284C7]/30 shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
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

      {/* Pinned Bottom Replay Controller */}
      <ReplayControls onOpenTrackAdjustment={() => setActiveTab('adjust')} />
    </div>
  );
}

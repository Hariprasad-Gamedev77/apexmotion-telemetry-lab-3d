'use client';

// APEX TELEMETRY 3D — Track Visualization & Adjustment Drawer
// Reference: https://formula-telemetry.com/sessions/2026/singapore/race?tab=track-visualization
// Light Theme with rich colors, Reeve styling, and tactile controls

import React from 'react';
import { useApexStore } from '@/lib/store';
import {
  Sliders,
  Check,
  Palette,
  X,
} from 'lucide-react';

interface TrackAdjustmentModalProps {
  onClose?: () => void;
}

export function TrackAdjustmentModal({ onClose }: TrackAdjustmentModalProps) {
  const { circuit, switchCircuit, trackSettings, updateTrackSettings } = useApexStore();

  const circuits = [
    { id: 'singapore', name: 'Marina Bay Street Circuit', country: 'Singapore', turns: 19, length: '4,940m' },
    { id: 'silverstone', name: 'Silverstone Circuit', country: 'United Kingdom', turns: 18, length: '5,891m' },
    { id: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', turns: 19, length: '7,004m' },
    { id: 'monza', name: 'Autodromo Nazionale Monza', country: 'Italy', turns: 11, length: '5,793m' },
    { id: 'apex', name: 'Apex International Raceway', country: 'United Kingdom', turns: 16, length: '5,300m' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/95 border border-slate-200/90 rounded-2xl backdrop-blur-xl text-xs font-mono select-none shadow-xl shadow-slate-200/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders size={15} className="text-purple-600" />
          <span className="font-bold text-slate-800 tracking-wider uppercase text-[11px]">
            TRACK VISUALIZATION & TUNING
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close track visualization modal"
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 1. Circuit Selector */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          Active Racing Circuit:
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {circuits.map((c) => {
            const isActive = circuit.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => switchCircuit(c.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all active:scale-[0.99] ${
                  isActive
                    ? 'bg-purple-50 border border-purple-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                }`}
              >
                <div>
                  <div className={`font-bold ${isActive ? 'text-purple-700' : 'text-slate-800'}`}>
                    {c.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {c.country} • {c.turns} Turns • {c.length}
                  </div>
                </div>
                {isActive && <Check size={16} className="text-purple-600 font-bold" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Track Surface Color Heatmap Modes */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
          <Palette size={12} className="text-amber-500" /> Surface Heatmap:
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(
            [
              { id: 'asphalt', label: 'Asphalt' },
              { id: 'speed_heatmap', label: 'Speed' },
              { id: 'braking_zones', label: 'Braking' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => updateTrackSettings({ surfaceColorMode: m.id })}
              className={`py-1.5 rounded-lg text-center font-bold text-[10px] transition-all active:scale-95 ${
                trackSettings.surfaceColorMode === m.id
                  ? 'bg-white text-purple-700 border border-slate-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Geometry Adjustment Sliders */}
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        {/* Track Width */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-600">Track Ribbon Width</span>
            <span className="text-sky-700 font-tabular">{trackSettings.trackWidth}m</span>
          </div>
          <input
            type="range"
            min="8"
            max="24"
            step="1"
            value={trackSettings.trackWidth}
            onChange={(e) => updateTrackSettings({ trackWidth: parseInt(e.target.value) })}
            aria-label="Track ribbon width"
            className="w-full accent-sky-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Track Rotation */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-600">Circuit Rotation</span>
            <span className="text-amber-700 font-tabular">{trackSettings.trackRotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={trackSettings.trackRotation}
            onChange={(e) => updateTrackSettings({ trackRotation: parseInt(e.target.value) })}
            aria-label="Circuit rotation angle"
            className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Elevation Scale */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-600">Elevation Relief Scale</span>
            <span className="text-emerald-700 font-tabular">{trackSettings.trackElevationScale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={trackSettings.trackElevationScale}
            onChange={(e) => updateTrackSettings({ trackElevationScale: parseFloat(e.target.value) })}
            aria-label="Track elevation scale"
            className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Feature Visibility Toggles */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          Overlays & Visual Markers:
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => updateTrackSettings({ showTurnNumbers: !trackSettings.showTurnNumbers })}
            className={`p-2 rounded-xl text-left flex items-center justify-between border transition-all active:scale-95 ${
              trackSettings.showTurnNumbers
                ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>Corner Tags (T1-T19)</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trackSettings.showTurnNumbers ? '#0284C7' : '#CBD5E1' }} />
          </button>

          <button
            onClick={() => updateTrackSettings({ showDrsZones: !trackSettings.showDrsZones })}
            className={`p-2 rounded-xl text-left flex items-center justify-between border transition-all active:scale-95 ${
              trackSettings.showDrsZones
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>DRS Zones</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trackSettings.showDrsZones ? '#10B981' : '#CBD5E1' }} />
          </button>

          <button
            onClick={() => updateTrackSettings({ showSectorGates: !trackSettings.showSectorGates })}
            className={`p-2 rounded-xl text-left flex items-center justify-between border transition-all active:scale-95 ${
              trackSettings.showSectorGates
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>Sector Gates</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trackSettings.showSectorGates ? '#F59E0B' : '#CBD5E1' }} />
          </button>

          <button
            onClick={() => updateTrackSettings({ showKerbs: !trackSettings.showKerbs })}
            className={`p-2 rounded-xl text-left flex items-center justify-between border transition-all active:scale-95 ${
              trackSettings.showKerbs
                ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>Apex Kerbs</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trackSettings.showKerbs ? '#EF4444' : '#CBD5E1' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

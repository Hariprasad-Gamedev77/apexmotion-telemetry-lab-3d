'use client';

// APEX TELEMETRY 3D — Reeve-Inspired Floating Replay Timeline & Capsule Controls
// Light Theme with high-contrast typography, vibrant color pills, and tactile controls

import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
  Eye,
  Sliders,
} from 'lucide-react';
import { useApexStore } from '@/lib/store';
import { PLAYBACK_SPEEDS, CAMERA_MODES } from '@/lib/constants';
import { formatLapTime } from '@/lib/utils';

interface ReplayControlsProps {
  onOpenTrackAdjustment?: () => void;
}

export function ReplayControls({ onOpenTrackAdjustment }: ReplayControlsProps) {
  const {
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    setCurrentTime,
    playbackSpeed,
    setPlaybackSpeed,
    cameraMode,
    setCameraMode,
    restartReplay,
    drivers,
    selectedDriverNumber,
    setSelectedDriverNumber,
    toggleDriverVisibility,
  } = useApexStore();

  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Keyboard shortcut listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentTime(Math.max(0, currentTime - 2.5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentTime(Math.min(duration, currentTime + 2.5));
          break;
        case 'Home':
          e.preventDefault();
          restartReplay();
          break;
        case 'c':
        case 'C': {
          e.preventDefault();
          const modes = Object.values(CAMERA_MODES);
          const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
          setCameraMode(modes[nextIdx]);
          break;
        }
      }
    },
    [togglePlay, currentTime, duration, setCurrentTime, restartReplay, cameraMode, setCameraMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle Scrubbing (Click + Drag)
  const handleScrubberMove = useCallback(
    (clientX: number) => {
      if (!scrubberRef.current) return;
      const rect = scrubberRef.current.getBoundingClientRect();
      const clickRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setCurrentTime(clickRatio * duration);
    },
    [duration, setCurrentTime]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleScrubberMove(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleScrubberMove(moveEvent.clientX);
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-white/95 border-t border-slate-200 px-4 py-2.5 backdrop-blur-2xl flex flex-col gap-2 select-none z-30 shadow-lg shadow-slate-200/50">
      {/* --- Sleek Scrubber Bar with Sector Marks & Hover Head --- */}
      <div className="relative w-full flex items-center group">
        <div
          ref={scrubberRef}
          onMouseDown={handleMouseDown}
          className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden cursor-pointer border border-slate-300 hover:border-sky-500 transition-all shadow-inner"
        >
          {/* Sector 1 & Sector 2 divider markers */}
          <div className="absolute top-0 bottom-0 left-[33%] w-0.5 bg-sky-500/60 z-10 pointer-events-none" title="Sector 1 Gate" />
          <div className="absolute top-0 bottom-0 left-[67%] w-0.5 bg-amber-500/60 z-10 pointer-events-none" title="Sector 2 Gate" />

          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 transition-all duration-75 relative rounded-full"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Head */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-sky-600 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>
      </div>

      {/* --- Reeve Floating Capsule Controls Row --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Playback & Times Capsule */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-xs">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all active:scale-95 ${
              isPlaying
                ? 'bg-white hover:bg-slate-50 border border-slate-300 text-sky-700 shadow-xs'
                : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" fill="currentColor" />}
          </button>

          {/* Restart Button */}
          <button
            onClick={restartReplay}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all active:scale-95 shadow-xs"
            title="Restart Lap (Home)"
          >
            <RotateCcw size={14} />
          </button>

          {/* Current / Total Duration */}
          <div className="flex items-center gap-1.5 font-tabular bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-sky-700 font-black">{formatLapTime(currentTime)}</span>
            <span className="text-slate-300 font-bold">/</span>
            <span className="text-slate-500 font-semibold">{formatLapTime(duration)}</span>
          </div>

          {/* Playback Speed Pills */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-200 shadow-xs">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                  playbackSpeed === speed
                    ? 'bg-sky-50 text-sky-700 border border-sky-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Multi-Driver Selection Capsule */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mr-1">
            Drivers:
          </span>
          {drivers.map((drv) => {
            const isSelected = drv.driverNumber === selectedDriverNumber;
            return (
              <button
                key={drv.driverNumber}
                onClick={() => setSelectedDriverNumber(drv.driverNumber)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-white border border-sky-300 text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white" style={{ backgroundColor: drv.color }} />
                <span>{drv.code}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDriverVisibility(drv.driverNumber);
                  }}
                  className={`ml-1 opacity-70 hover:opacity-100 ${!drv.visible ? 'line-through text-rose-500' : ''}`}
                  title={drv.visible ? 'Hide car in 3D' : 'Show car in 3D'}
                >
                  <Eye size={10} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Camera Selector & Track Tuning Button */}
        <div className="flex items-center gap-2">
          {/* Track Tuning Button */}
          {onOpenTrackAdjustment && (
            <button
              onClick={onOpenTrackAdjustment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold transition-all active:scale-95 shadow-xs"
            >
              <Sliders size={13} className="text-purple-600" />
              <span className="text-[11px]">Track Adjust</span>
            </button>
          )}

          {/* Camera Modes Capsule */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-xs">
            <span className="px-1.5 text-slate-500">
              <Camera size={13} />
            </span>
            {(
              [
                { mode: CAMERA_MODES.CHASE, label: 'Chase' },
                { mode: CAMERA_MODES.DRIVER, label: 'Cockpit' },
                { mode: CAMERA_MODES.HELICOPTER, label: 'Heli' },
                { mode: CAMERA_MODES.TRACKSIDE, label: 'Track' },
                { mode: CAMERA_MODES.OVERVIEW, label: 'Map' },
                { mode: CAMERA_MODES.FREE, label: 'Free' },
              ] as const
            ).map((item) => (
              <button
                key={item.mode}
                onClick={() => setCameraMode(item.mode)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                  cameraMode === item.mode
                    ? 'bg-white text-sky-700 border border-sky-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

// APEX TELEMETRY 3D — Floating Replay Timeline & Capsule Controls
// Daylight Motorsport Palette: #FFFFFF / #E2E8F0 / #0284C7 / #0F172A

import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
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
  } = useApexStore();

  const scrubberRef = useRef<HTMLDivElement>(null);
  const [, setIsScrubbing] = useState(false);

  // Keyboard shortcut listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            restartReplay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentTime(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentTime(Math.min(duration, currentTime + 5));
          break;
        case 'Digit1':
          setPlaybackSpeed(1);
          break;
        case 'Digit2':
          setPlaybackSpeed(2);
          break;
        case 'Digit4':
          setPlaybackSpeed(4);
          break;
      }
    },
    [togglePlay, restartReplay, setCurrentTime, currentTime, duration, setPlaybackSpeed]
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
      const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      setCurrentTime(newTime);
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
    <div className="w-full bg-white/95 border-t border-[#E2E8F0] px-4 py-2.5 flex flex-col gap-2 select-none shadow-lg z-30">
      {/* Scrubber Bar with Sector Marks */}
      <div className="relative w-full flex items-center group">
        <div
          ref={scrubberRef}
          onMouseDown={handleMouseDown}
          className="relative w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden cursor-pointer border border-[#CBD5E1] hover:border-[#0284C7] transition-all shadow-inner"
        >
          {/* Sector 1 & Sector 2 divider markers */}
          <div className="absolute top-0 bottom-0 left-[33%] w-0.5 bg-[#0284C7]/60 z-10 pointer-events-none" title="Sector 1 Gate" />
          <div className="absolute top-0 bottom-0 left-[67%] w-0.5 bg-[#F59E0B]/60 z-10 pointer-events-none" title="Sector 2 Gate" />

          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-[#0284C7] via-[#2563EB] to-[#10B981] transition-all duration-75 relative rounded-full"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Head */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#0284C7] rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>
      </div>

      {/* Floating Capsule Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Playback & Times Capsule */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0]">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all active:scale-95 ${
              isPlaying
                ? 'bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0284C7] shadow-xs'
                : 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md shadow-[#0284C7]/25'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" fill="currentColor" />}
          </button>

          {/* Restart Button */}
          <button
            onClick={restartReplay}
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-all active:scale-95 shadow-xs"
            title="Restart Lap (Home)"
          >
            <RotateCcw size={14} />
          </button>

          {/* Current / Total Duration */}
          <div className="flex items-center gap-1.5 font-tabular bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[#0284C7] font-black">{formatLapTime(currentTime)}</span>
            <span className="text-[#CBD5E1] font-bold">/</span>
            <span className="text-[#64748B] font-semibold">{formatLapTime(duration)}</span>
          </div>

          {/* Playback Speed Pills */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-[#E2E8F0] shadow-xs">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                  playbackSpeed === speed
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Multi-Driver Selection Capsule */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#F1F5F9] px-2.5 py-1 rounded-2xl border border-[#E2E8F0]">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mr-1">
            Drivers:
          </span>
          {drivers.map((drv) => {
            const isSelected = drv.driverNumber === selectedDriverNumber;
            return (
              <button
                key={drv.driverNumber}
                onClick={() => setSelectedDriverNumber(drv.driverNumber)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#EFF6FF] text-[#0284C7] border border-[#0284C7] shadow-xs'
                    : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full ring-1 ring-slate-300"
                  style={{ backgroundColor: drv.color }}
                />
                <span>{drv.code}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Camera Capsule & Track Settings */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0]">
          <div className="flex items-center gap-1">
            <Camera size={14} className="text-[#0284C7] ml-2" />
            <select
              value={cameraMode}
              onChange={(e) => setCameraMode(e.target.value as any)}
              className="bg-white text-[10px] font-bold text-[#0F172A] px-2 py-1 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#0284C7] shadow-xs"
            >
              <option value={CAMERA_MODES.CHASE}>CHASE</option>
              <option value={CAMERA_MODES.HELICOPTER}>HELI</option>
              <option value={CAMERA_MODES.TRACKSIDE}>TRACK</option>
              <option value={CAMERA_MODES.FREE}>FREE ORBIT</option>
            </select>
          </div>

          {onOpenTrackAdjustment && (
            <button
              onClick={onOpenTrackAdjustment}
              className="px-2.5 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#0284C7] rounded-xl border border-[#E2E8F0] flex items-center gap-1 text-[10px] font-bold transition-all active:scale-95 shadow-xs"
            >
              <Sliders size={12} />
              <span>TUNING</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReplayControls;

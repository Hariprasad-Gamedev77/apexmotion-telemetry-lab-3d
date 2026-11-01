'use client';

// APEX TELEMETRY 3D — Engineering Telemetry Heads-Up Display (HUD)
// Styling: Daylight theme (Background #FFFFFF/95, Border #E2E8F0, Text #0F172A, Velocity #0284C7, Throttle #10B981, Brake #EF4444, RPM #F59E0B)

import React, { useState } from 'react';
import { useApexStore } from '@/lib/store';
import { formatRpm, formatSpeed } from '@/lib/utils';
import { Minimize2, Maximize2 } from 'lucide-react';

interface LiveDashboardHUDProps {
  initialCompact?: boolean;
}

export function LiveDashboardHUD({ initialCompact = false }: LiveDashboardHUDProps) {
  const currentTelemetry = useApexStore((s) => s.currentTelemetry);
  const drivers = useApexStore((s) => s.drivers);
  const selectedDriverNumber = useApexStore((s) => s.selectedDriverNumber);
  
  const [isCompact, setIsCompact] = useState(initialCompact);
  const driver = drivers.find((d) => d.driverNumber === selectedDriverNumber);

  const rpm = currentTelemetry.rpm || 0;
  const maxRpm = 13500;
  const rpmPercent = Math.min(100, Math.max(0, (rpm / maxRpm) * 100));

  // Shift LEDs (15 LEDs: 5 emerald, 5 amber, 5 crimson)
  const totalLeds = 15;
  const litLeds = Math.floor((rpmPercent / 100) * totalLeds);

  // Compact Minimalist Single-Line Mode
  if (isCompact) {
    return (
      <div className="flex items-center justify-between gap-3 p-2.5 bg-white/95 border border-[#E2E8F0] rounded-2xl shadow-lg backdrop-blur-md select-none text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
            style={{ backgroundColor: driver?.color || '#0284C7' }}
          />
          <span className="font-bold text-[#0F172A]">
            {driver?.code || 'VER'} #{driver?.driverNumber || 1}
          </span>
        </div>

        <div className="flex items-center gap-2.5 font-tabular">
          <span className="text-[#0284C7] font-extrabold text-sm">
            {formatSpeed(currentTelemetry.speedKph)} <span className="text-[10px] text-[#64748B]">KM/H</span>
          </span>
          <span className="bg-[#F1F5F9] text-[#0F172A] font-black px-1.5 py-0.5 rounded-md border border-[#E2E8F0] text-xs">
            G:{currentTelemetry.gear || 'N'}
          </span>
          <span className="text-[#10B981] font-bold text-[11px]">
            T:{currentTelemetry.throttlePercent}%
          </span>
          <span className="text-[#EF4444] font-bold text-[11px]">
            B:{currentTelemetry.brakePercent}%
          </span>
          <span className="text-[#F59E0B] font-bold text-[11px] whitespace-nowrap">
            {formatRpm(currentTelemetry.rpm)} <span className="text-[9px] text-[#64748B]">RPM</span>
          </span>
          {currentTelemetry.drs === 1 && (
            <span className="text-[10px] font-black bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] px-1.5 py-0.5 rounded">
              DRS
            </span>
          )}
        </div>

        <button
          onClick={() => setIsCompact(false)}
          className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          title="Expand Telemetry HUD"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    );
  }

  // Expanded Dashboard Mode
  return (
    <div className="flex flex-col gap-3 p-4 bg-white/95 border border-[#E2E8F0] rounded-3xl shadow-xl backdrop-blur-md select-none text-xs font-mono">
      {/* Top Row: Driver Profile & Shift LEDs */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3 h-3 rounded-full ring-2 ring-slate-200"
            style={{ backgroundColor: driver?.color || '#0284C7' }}
          />
          <div>
            <div className="text-[11px] text-[#64748B] leading-none mb-0.5">
              {driver?.name?.split(' ')[0] || 'Max'}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-[#0F172A] text-sm leading-none">
                {driver?.name?.split(' ').slice(1).join(' ') || 'Verstappen'}
              </span>
              <span className="text-[10px] text-[#64748B]">#{driver?.driverNumber || 1}</span>
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">
              • {driver?.team || 'Red Bull Racing'}
            </div>
          </div>
        </div>

        {/* F1 Steering Wheel Shift Lights (15 LEDs) */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] px-2.5 py-1.5 rounded-xl border border-[#E2E8F0]">
          {Array.from({ length: totalLeds }).map((_, i) => {
            const isLit = i < litLeds;
            let ledColor = 'bg-[#CBD5E1]';
            if (isLit) {
              if (i < 5) ledColor = 'bg-[#10B981] shadow-xs shadow-[#10B981]/50';
              else if (i < 10) ledColor = 'bg-[#F59E0B] shadow-xs shadow-[#F59E0B]/50';
              else ledColor = 'bg-[#EF4444] shadow-xs shadow-[#EF4444]/50';
            }

            return (
              <div
                key={i}
                className={`w-1.5 h-3.5 rounded-full transition-all duration-75 ${ledColor}`}
              />
            );
          })}
        </div>

        <button
          onClick={() => setIsCompact(true)}
          className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          title="Collapse Telemetry HUD"
        >
          <Minimize2 size={15} />
        </button>
      </div>

      {/* Main Engineering Readout Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-tabular">
        {/* Metric 1: Velocity */}
        <div className="flex flex-col bg-[#F8FAFC] p-2.5 rounded-2xl border border-[#E2E8F0] min-w-[75px]">
          <span className="text-[10px] text-[#64748B] font-bold">VELOCITY</span>
          <div className="text-xl font-black text-[#0284C7] mt-0.5 leading-tight">
            {formatSpeed(currentTelemetry.speedKph)}{' '}
            <span className="text-[10px] text-[#64748B] font-normal">km/h</span>
          </div>
        </div>

        {/* Metric 2: Gear */}
        <div className="flex flex-col bg-[#F8FAFC] p-2.5 rounded-2xl border border-[#E2E8F0] min-w-[65px]">
          <span className="text-[10px] text-[#64748B] font-bold">GEAR</span>
          <div className="text-xl font-black text-[#8B5CF6] mt-0.5 leading-tight">
            {currentTelemetry.gear || 'N'}
          </div>
        </div>

        {/* Metric 3: Throttle */}
        <div className="flex flex-col bg-[#F8FAFC] p-2.5 rounded-2xl border border-[#E2E8F0] min-w-[75px]">
          <span className="text-[10px] text-[#64748B] font-bold">THROTTLE</span>
          <div className="text-xl font-black text-[#10B981] mt-0.5 leading-tight">
            {currentTelemetry.throttlePercent}%
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#10B981] h-full transition-all duration-75"
              style={{ width: `${currentTelemetry.throttlePercent}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Brake */}
        <div className="flex flex-col bg-[#F8FAFC] p-2.5 rounded-2xl border border-[#E2E8F0] min-w-[75px]">
          <span className="text-[10px] text-[#64748B] font-bold">BRAKE LINE</span>
          <div className="text-xl font-black text-[#EF4444] mt-0.5 leading-tight">
            {currentTelemetry.brakePercent}%
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#EF4444] h-full transition-all duration-75"
              style={{ width: `${currentTelemetry.brakePercent}%` }}
            />
          </div>
        </div>

        {/* Metric 5: Engine Speed & DRS (Sufficient min-width and no overflow truncation) */}
        <div className="flex flex-col bg-[#F8FAFC] p-2.5 rounded-2xl border border-[#E2E8F0] min-w-[95px]">
          <div className="flex justify-between items-center text-[10px] text-[#64748B] font-bold">
            <span>ENGINE RPM</span>
            {currentTelemetry.drs === 1 && (
              <span className="text-[#047857] font-bold bg-[#D1FAE5] px-1 rounded text-[9px]">DRS</span>
            )}
          </div>
          <div className="text-xl font-black text-[#F59E0B] mt-0.5 leading-tight whitespace-nowrap">
            {formatRpm(currentTelemetry.rpm)}
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#F59E0B] h-full transition-all duration-75"
              style={{ width: `${rpmPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveDashboardHUD;

'use client';

// APEX TELEMETRY 3D — Illustrative Pit Stop Fixture
// Distinguishes stationary service time from total pit lane transit time.
// Reference: https://formula-telemetry.com/sessions/2026/austin/race?tab=pit-stops

import React from 'react';
import { useApexStore } from '@/lib/store';
import { Wrench, Clock, Shield, ArrowRight } from 'lucide-react';

interface PitStopRecord {
  driver: string;
  driverNumber: number;
  team: string;
  teamColor: string;
  lap: number;
  stopNumber: number;
  stationaryBoxTime: number; // Seconds stationary in box
  totalPitLaneTime: number; // Seconds from pit entry to pit exit line
  compoundBefore: string;
  compoundAfter: string;
  positionBefore: number;
  positionAfter: number;
}

export default function PitStopsPage() {
  const { activeSession } = useApexStore();

  // Static illustrative Austin 2024 values; these are not fetched for activeSession.
  const pitStops: PitStopRecord[] = [
    {
      driver: 'Demo Car B',
      driverNumber: 2,
      team: 'Synthetic Demo',
      teamColor: '#E11D48',
      lap: 21,
      stopNumber: 1,
      stationaryBoxTime: 2.6,
      totalPitLaneTime: 23.963,
      compoundBefore: 'MEDIUM',
      compoundAfter: 'HARD',
      positionBefore: 2,
      positionAfter: 4,
    },
    {
      driver: 'Demo Car C',
      driverNumber: 3,
      team: 'Synthetic Demo',
      teamColor: '#1E40AF',
      lap: 25,
      stopNumber: 1,
      stationaryBoxTime: 2.7,
      totalPitLaneTime: 24.228,
      compoundBefore: 'MEDIUM',
      compoundAfter: 'HARD',
      positionBefore: 3,
      positionAfter: 5,
    },
    {
      driver: 'Demo Car A',
      driverNumber: 1,
      team: 'Synthetic Demo',
      teamColor: '#DC2626',
      lap: 26,
      stopNumber: 1,
      stationaryBoxTime: 2.5,
      totalPitLaneTime: 23.812,
      compoundBefore: 'MEDIUM',
      compoundAfter: 'HARD',
      positionBefore: 1,
      positionAfter: 3,
    },
    {
      driver: 'Demo Car D',
      driverNumber: 4,
      team: 'Synthetic Demo',
      teamColor: '#EA580C',
      lap: 31,
      stopNumber: 1,
      stationaryBoxTime: 2.2,
      totalPitLaneTime: 23.731,
      compoundBefore: 'MEDIUM',
      compoundAfter: 'HARD',
      positionBefore: 1,
      positionAfter: 5,
    },
    {
      driver: 'Demo Car E',
      driverNumber: 5,
      team: 'Synthetic Demo',
      teamColor: '#F59E0B',
      lap: 32,
      stopNumber: 1,
      stationaryBoxTime: 2.6,
      totalPitLaneTime: 24.102,
      compoundBefore: 'MEDIUM',
      compoundAfter: 'HARD',
      positionBefore: 1,
      positionAfter: 5,
    },
    {
      driver: 'George Russell',
      driverNumber: 63,
      team: 'Mercedes-AMG',
      teamColor: '#14B8A6',
      lap: 40,
      stopNumber: 1,
      stationaryBoxTime: 2.8,
      totalPitLaneTime: 24.321,
      compoundBefore: 'HARD',
      compoundAfter: 'MEDIUM',
      positionBefore: 6,
      positionAfter: 8,
    },
    {
      driver: 'Lewis Hamilton',
      driverNumber: 44,
      team: 'Mercedes-AMG',
      teamColor: '#0D9488',
      lap: 41,
      stopNumber: 1,
      stationaryBoxTime: 2.9,
      totalPitLaneTime: 24.450,
      compoundBefore: 'HARD',
      compoundAfter: 'MEDIUM',
      positionBefore: 7,
      positionAfter: 9,
    },
  ];

  const fastestBox = Math.min(...pitStops.map((s) => s.stationaryBoxTime));
  const fastestLane = Math.min(...pitStops.map((s) => s.totalPitLaneTime));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#EF4444]">
              <Wrench size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">
                PIT STOP DURATIONS & LANE ANALYSIS
              </h1>
              <p className="text-xs font-mono text-[#64748B] mt-0.5">
                AUSTIN 2024 DEMO FIXTURE • Not loaded for {activeSession.meetingName}
              </p>
            </div>
          </div>
        </div>

        {/* Fastest Stop Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono shadow-xs">
            <span className="text-[#64748B] text-[10px] font-bold">FASTEST BOX:</span>
            <span className="text-[#047857] font-black">{fastestBox}s (Norris)</span>
          </div>
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono shadow-xs">
            <span className="text-[#64748B] text-[10px] font-bold">FASTEST LANE:</span>
            <span className="text-[#0284C7] font-black">{fastestLane}s</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#0284C7]" />
            <h3 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider">
              Recorded Pit Stops & Compound Transitions
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0] font-semibold">
            ILLUSTRATIVE FIXTURE · SOURCE UNVERIFIED
          </span>
        </div>

        <div className="overflow-x-auto border border-[#E2E8F0] rounded-2xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] text-[10px]">
              <tr>
                <th className="py-2.5 px-3">LAP</th>
                <th className="py-2.5 px-3">DRIVER</th>
                <th className="py-2.5 px-3">TEAM</th>
                <th className="py-2.5 px-3 text-center">BOX TIME</th>
                <th className="py-2.5 px-3 text-center">PIT LANE DURATION</th>
                <th className="py-2.5 px-3 text-center">TYRE CHANGE</th>
                <th className="py-2.5 px-3 text-right">POS DELTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
              {pitStops.map((stop, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#0284C7]">L{stop.lap}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stop.teamColor }}
                      />
                      <span className="font-bold text-[#0F172A]">{stop.driver}</span>
                      <span className="text-[10px] text-[#64748B]">#{stop.driverNumber}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B]">{stop.team}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-bold text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                      {stop.stationaryBoxTime}s
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-[#0F172A] font-bold">
                    {stop.totalPitLaneTime}s
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[10px]">
                      <span className="text-[#D97706] font-bold">{stop.compoundBefore}</span>
                      <ArrowRight size={10} className="text-[#64748B]" />
                      <span className="text-slate-700 font-bold">{stop.compoundAfter}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span className="text-[#64748B]">P{stop.positionBefore}</span>
                    <span className="text-[#94A3B8] mx-1">→</span>
                    <span className="text-[#0F172A]">P{stop.positionAfter}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transponder Explanation */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-start gap-2.5 text-xs font-mono text-[#64748B]">
          <Shield size={16} className="text-[#047857] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#0F172A] font-bold">Transponder Separation Standard: </span>
            Stationary Box Time measures the duration the car was wheels-stopped on jacks in the pit box. Total Pit Lane Duration includes deceleration from the pit entry line, transit through the speed-limited lane (typically 80 km/h), and acceleration back to the track.
          </div>
        </div>
      </div>
    </div>
  );
}

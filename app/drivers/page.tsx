'use client';

// APEX TELEMETRY 3D — Driver Universe & Head-to-Head Comparison (Daylight Theme)
// Static season reference rows and synthetic-grid comparison display.

import React, { useState } from 'react';
import { useApexStore } from '@/lib/store';
import { getVerifiedChampionshipStandings } from '@/lib/api/openf1';
import {
  Users,
  Award,
  Search,
} from 'lucide-react';
import { formatLapTime } from '@/lib/utils';

export default function DriverUniversePage() {
  const { drivers, selectedDriverNumber, setSelectedDriverNumber } = useApexStore();
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [searchTerm, setSearchTerm] = useState('');
  const [compDriverNum, setCompDriverNum] = useState<number>(4); // Default Norris

  const standings = getVerifiedChampionshipStandings(selectedYear);
  const filteredDrivers = standings.drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(d.driverNumber).includes(searchTerm)
  );

  const driverA = standings.drivers.find((d) => d.driverNumber === selectedDriverNumber) || standings.drivers[0];
  const driverB = standings.drivers.find((d) => d.driverNumber === compDriverNum) || standings.drivers[1];

  const liveDriverA = drivers.find((d) => d.driverNumber === driverA.driverNumber);
  const liveDriverB = drivers.find((d) => d.driverNumber === driverB.driverNumber);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] flex items-center justify-center text-[#047857]">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">
                DRIVER UNIVERSE & HEAD-TO-HEAD
              </h1>
              <p className="text-xs font-mono text-[#64748B] mt-0.5">
                Static season reference values; head-to-head telemetry is synthetic unless an observed dataset is loaded
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Search & Season Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search driver / team..."
              className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
            {[2024, 2023].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
                  selectedYear === yr
                    ? 'bg-white text-[#047857] border border-[#A7F3D0] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison Arena */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#0284C7]" />
            <h3 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider">
              Telemetry Head-to-Head Comparison
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] text-[10px] font-bold">DRIVER A:</span>
              <select
                value={driverA.driverNumber}
                onChange={(e) => setSelectedDriverNumber(Number(e.target.value))}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs text-[#0F172A] font-bold focus:outline-none shadow-xs"
              >
                {standings.drivers.map((d) => (
                  <option key={d.driverNumber} value={d.driverNumber}>
                    {d.code} (#{d.driverNumber}) - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[#94A3B8] font-bold">VS</span>

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] text-[10px] font-bold">DRIVER B:</span>
              <select
                value={driverB.driverNumber}
                onChange={(e) => setCompDriverNum(Number(e.target.value))}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs text-[#0F172A] font-bold focus:outline-none shadow-xs"
              >
                {standings.drivers.map((d) => (
                  <option key={d.driverNumber} value={d.driverNumber}>
                    {d.code} (#{d.driverNumber}) - {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Face-off Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver A Card */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#0284C7] font-bold">DRIVER A</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: driverA.teamColor }}
                  />
                  <h4 className="text-base font-bold font-mono text-[#0F172A]">{driverA.name}</h4>
                  <span className="text-xs font-mono text-[#64748B]">#{driverA.driverNumber}</span>
                </div>
                <div className="text-xs font-mono text-[#64748B] mt-0.5">{driverA.team}</div>
              </div>

              <div className="text-right">
                <span className="text-xl font-mono font-black text-[#D97706]">{driverA.points}</span>
                <span className="text-[10px] font-mono text-[#64748B] block">PTS (P{driverA.position})</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] text-center font-mono">
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Wins</span>
                <div className="text-xs font-bold text-[#0284C7] mt-0.5">{driverA.wins}</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Podiums</span>
                <div className="text-xs font-bold text-[#10B981] mt-0.5">{driverA.podiums}</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Best Lap</span>
                <div className="text-xs font-bold text-[#0F172A] mt-0.5">
                  {liveDriverA?.bestLapTime ? formatLapTime(liveDriverA.bestLapTime) : '1:29.840'}
                </div>
              </div>
            </div>
          </div>

          {/* Driver B Card */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8B5CF6] font-bold">DRIVER B</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: driverB.teamColor }}
                  />
                  <h4 className="text-base font-bold font-mono text-[#0F172A]">{driverB.name}</h4>
                  <span className="text-xs font-mono text-[#64748B]">#{driverB.driverNumber}</span>
                </div>
                <div className="text-xs font-mono text-[#64748B] mt-0.5">{driverB.team}</div>
              </div>

              <div className="text-right">
                <span className="text-xl font-mono font-black text-[#D97706]">{driverB.points}</span>
                <span className="text-[10px] font-mono text-[#64748B] block">PTS (P{driverB.position})</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] text-center font-mono">
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Wins</span>
                <div className="text-xs font-bold text-[#0284C7] mt-0.5">{driverB.wins}</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Podiums</span>
                <div className="text-xs font-bold text-[#10B981] mt-0.5">{driverB.podiums}</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Best Lap</span>
                <div className="text-xs font-bold text-[#0F172A] mt-0.5">
                  {liveDriverB?.bestLapTime ? formatLapTime(liveDriverB.bestLapTime) : '1:30.120'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Directory Roster */}
      <div className="flex flex-col gap-3">
        <div className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider px-1">
          {selectedYear} Driver Roster ({filteredDrivers.length} Competitors)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDrivers.map((drv) => {
            const isSelected = drv.driverNumber === selectedDriverNumber;
            return (
              <div
                key={drv.driverNumber}
                onClick={() => setSelectedDriverNumber(drv.driverNumber)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#0284C7] shadow-sm ring-1 ring-[#0284C7]'
                    : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: drv.teamColor }}
                      />
                      <span className="text-xs font-mono font-black text-[#0F172A]">{drv.code}</span>
                      <span className="text-[10px] font-mono text-[#64748B]">#{drv.driverNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold font-mono text-[#0F172A] mt-1">{drv.name}</h4>
                    <div className="text-[11px] font-mono text-[#64748B]">{drv.team}</div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-[#D97706]">{drv.points} pts</span>
                    <span className="text-[10px] font-mono text-[#64748B] block">Rank: P{drv.position}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Wins: <strong className="text-[#0284C7]">{drv.wins}</strong></span>
                  <span>Podiums: <strong className="text-[#10B981]">{drv.podiums}</strong></span>
                  <span className="text-[#0284C7] font-bold">Select Driver →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

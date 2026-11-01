'use client';

// APEX TELEMETRY 3D — Official Championship Statistics & Standings (Daylight Theme)
// Verified Season Records for 2024 & 2023 without fabricated numbers.

import React, { useState } from 'react';
import { getVerifiedChampionshipStandings } from '@/lib/api/openf1';
import {
  Trophy,
  Award,
  Users,
} from 'lucide-react';

export default function ChampionshipStatsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const standings = getVerifiedChampionshipStandings(selectedYear);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Trophy size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">
              CHAMPIONSHIP STANDINGS & STATISTICS
            </h1>
          </div>
          <p className="text-xs font-mono text-[#64748B] mt-1">
            Verified FIA Formula 1 World Championship points, race victories, and constructor classifications
          </p>
        </div>

        {/* Season Selector */}
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
          {[2024, 2023].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
                selectedYear === yr
                  ? 'bg-white text-[#D97706] border border-[#D97706]/30 shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {yr} Season
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Drivers & Constructors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Drivers Standings Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#D97706]" />
              <h2 className="text-sm font-bold font-mono text-[#0F172A] uppercase tracking-wider">
                Driver World Championship ({selectedYear})
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0] font-semibold">
              OFFICIAL RESULTS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-[#64748B] border-b border-[#E2E8F0] text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">POS</th>
                  <th className="py-2.5 px-3">DRIVER</th>
                  <th className="py-2.5 px-3">TEAM</th>
                  <th className="py-2.5 px-3 text-center">WINS</th>
                  <th className="py-2.5 px-3 text-center">PODIUMS</th>
                  <th className="py-2.5 px-3 text-right">POINTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
                {standings.drivers.map((drv) => (
                  <tr key={drv.driverNumber} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">
                      {drv.position === 1 ? (
                        <span className="text-[#D97706] font-black">P1</span>
                      ) : drv.position === 2 ? (
                        <span className="text-slate-500 font-bold">P2</span>
                      ) : drv.position === 3 ? (
                        <span className="text-amber-700 font-bold">P3</span>
                      ) : (
                        `P${drv.position}`
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-3 rounded-full"
                          style={{ backgroundColor: drv.teamColor }}
                        />
                        <span className="font-bold text-[#0F172A]">{drv.name}</span>
                        <span className="text-[10px] text-[#64748B]">#{drv.driverNumber}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B]">{drv.team}</td>
                    <td className="py-2.5 px-3 text-center text-[#0284C7] font-bold">{drv.wins}</td>
                    <td className="py-2.5 px-3 text-center text-[#10B981]">{drv.podiums}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[#0F172A]">{drv.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Constructors Standings Table (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#0284C7]" />
              <h2 className="text-sm font-bold font-mono text-[#0F172A] uppercase tracking-wider">
                Constructor Championship
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD] font-semibold">
              {selectedYear}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-[#64748B] border-b border-[#E2E8F0] text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">POS</th>
                  <th className="py-2.5 px-3">CONSTRUCTOR</th>
                  <th className="py-2.5 px-3 text-center">WINS</th>
                  <th className="py-2.5 px-3 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
                {standings.constructors.map((c) => (
                  <tr key={c.team} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">
                      {c.position === 1 ? (
                        <span className="text-[#D97706] font-black">P1</span>
                      ) : (
                        `P${c.position}`
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: c.teamColor }}
                        />
                        <span className="font-bold text-[#0F172A]">{c.team}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#0284C7] font-bold">{c.wins}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[#0F172A]">{c.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Points Rules Note */}
          <div className="mt-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[10px] font-mono text-[#64748B] space-y-1">
            <div className="text-[#0F172A] font-bold">FIA Points Allocation System:</div>
            <div>• Grand Prix: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 (Top 10)</div>
            <div>• Sprint Race: 8, 7, 6, 5, 4, 3, 2, 1 (Top 8)</div>
            <div>• Fastest Lap: 1 bonus point awarded to top 10 finisher</div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

// APEX TELEMETRY 3D — Circuit Explorer & Circuit Data Universe (Daylight Motorsport Theme)
// Displays verified circuits, layout versions, turn metadata, Sportmonks recent lap records, and signature Circuit Data Passports.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApexStore } from '@/lib/store';
import { VERIFIED_CIRCUITS, type CircuitRecord } from '@/lib/circuits/registry';
import { DATA_MODES } from '@/lib/constants';
import {
  MapPin,
  Compass,
  Trophy,
  Shield,
  Layers,
  ChevronRight,
  Search,
  CheckCircle,
  Play,
  RotateCw,
  Gauge,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CircuitExplorerPage() {
  const router = useRouter();
  const { switchCircuit, setDataMode, setActiveSession } = useApexStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('singapore');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'EUROPE' | 'AMERICAS' | 'ASIA_ME' | 'OCEANIA'>('ALL');

  const circuits = Object.values(VERIFIED_CIRCUITS);

  const getRegion = (country: string): 'EUROPE' | 'AMERICAS' | 'ASIA_ME' | 'OCEANIA' => {
    if (['United Kingdom', 'Italy', 'Monaco', 'Spain', 'Austria', 'Hungary', 'Belgium', 'Netherlands'].includes(country)) {
      return 'EUROPE';
    }
    if (['United States', 'Canada', 'Mexico', 'Brazil'].includes(country)) {
      return 'AMERICAS';
    }
    if (['Australia'].includes(country)) {
      return 'OCEANIA';
    }
    return 'ASIA_ME';
  };

  const filteredCircuits = circuits.filter((c) => {
    const matchesSearch =
      c.officialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'ALL' || getRegion(c.country) === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const activePassport = VERIFIED_CIRCUITS[selectedCircuitId] || VERIFIED_CIRCUITS.singapore;

  const handleLaunchCircuit = (circuit: CircuitRecord) => {
    switchCircuit(circuit.circuitId);
    setDataMode(DATA_MODES.SYNTHETIC);
    setActiveSession({
      id: `${circuit.circuitId}-gp`,
      sessionKey: 9617,
      meetingName: `${circuit.country} Grand Prix 2024`,
      circuitName: circuit.officialName,
      country: circuit.country,
      year: 2024,
      sessionType: 'Race',
      date: '2024-10-20',
      totalLaps: 56,
      trackLengthMeters: circuit.lengthMeters,
      dataMode: DATA_MODES.SYNTHETIC,
      availableDrivers: [1, 4, 16, 81, 44],
      hasCoordinateStream: true,
      hasHighFrequencyTelemetry: true,
      circuitPassport: circuit,
    });
    router.push('/dashboard');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
              <Compass size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-[#0F172A]">
              CIRCUIT EXPLORER & DATA PASSPORTS
            </h1>
          </div>
          <p className="text-xs font-mono text-[#64748B] mt-1">
            24 verified Grand Prix circuits, turn classifications, coordinate transforms, and Sportmonks recent lap records
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search circuits or country..."
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] shadow-xs"
          />
        </div>
      </div>

      {/* Region Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {(['ALL', 'EUROPE', 'AMERICAS', 'ASIA_ME', 'OCEANIA'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRegionFilter(r)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all whitespace-nowrap ${
              regionFilter === r
                ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            {r === 'ASIA_ME' ? 'ASIA & MIDDLE EAST' : r}
          </button>
        ))}
      </div>

      {/* Main Grid: Circuit Cards & Interactive Passport View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Circuit Directory Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider px-1">
            Verified Calendar Tracks ({filteredCircuits.length})
          </div>

          <div className="flex flex-col gap-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredCircuits.map((circ) => {
              const isSelected = selectedCircuitId === circ.circuitId;
              return (
                <div
                  key={circ.circuitId}
                  onClick={() => setSelectedCircuitId(circ.circuitId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#0284C7] shadow-sm ring-1 ring-[#0284C7]'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                          {circ.country}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {circ.layoutVersion}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold font-mono text-[#0F172A] mt-1.5">
                        {circ.officialName}
                      </h3>
                      <div className="text-[11px] font-mono text-[#64748B] mt-0.5">
                        {circ.location}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-[#0F172A]">
                        {circ.lengthMeters.toLocaleString()}m
                      </span>
                      <span className="text-[10px] font-mono text-[#10B981] font-bold">
                        {circ.turnCount} Turns
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                      <CheckCircle size={13} />
                      <span>{circ.qualityStatus}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchCircuit(circ);
                      }}
                      className="flex items-center gap-1 text-[#0284C7] font-bold hover:underline"
                    >
                      <span>Simulate</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Circuit Data Passport View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 sticky top-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            {/* Passport Banner */}
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#0284C7] font-bold">
                  <Shield size={14} />
                  <span>FIA HOMOLOGATED CIRCUIT PASSPORT</span>
                </div>
                <h2 className="text-xl font-black font-mono text-[#0F172A] mt-1">
                  {activePassport.officialName}
                </h2>
                <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] mt-1">
                  <MapPin size={12} className="text-[#0284C7]" />
                  <span>
                    {activePassport.location}, {activePassport.country}
                  </span>
                  <span>•</span>
                  <span>
                    {activePassport.latitude.toFixed(4)}°N, {activePassport.longitude.toFixed(4)}°E
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchCircuit(activePassport)}
                className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2.5 rounded-xl font-mono font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Play size={14} fill="currentColor" />
                <span>Launch 3D Track</span>
              </button>
            </div>

            {/* Passport Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Track Length</span>
                <div className="text-lg font-black text-[#0F172A] mt-0.5">
                  {(activePassport.lengthMeters / 1000).toFixed(3)} km
                </div>
                <span className="text-[9px] text-[#64748B]">
                  {activePassport.lengthMeters.toLocaleString()} meters
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Corners</span>
                <div className="text-lg font-black text-[#10B981] mt-0.5">
                  {activePassport.turnCount}
                </div>
                <span className="text-[9px] text-[#64748B]">Turns 1 to {activePassport.turnCount}</span>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">DRS Zones</span>
                <div className="text-lg font-black text-[#0284C7] mt-0.5">
                  {activePassport.drsZoneCount} Zones
                </div>
                <span className="text-[9px] text-[#64748B]">Detection & Activation</span>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Quality</span>
                <div className="text-xs font-black text-[#059669] mt-1.5 truncate">
                  {activePassport.qualityStatus}
                </div>
                <span className="text-[9px] text-[#64748B]">FIA Certified</span>
              </div>
            </div>

            {/* Official Lap Records (From Sportmonks API & Formula-Timer) */}
            {activePassport.lapRecord && (
              <div className="bg-[#EFF6FF] border border-[#BAE6FD] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#BAE6FD] flex items-center justify-center text-[#D97706] shadow-xs">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                      Official Lap Record
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg font-black font-mono text-[#0F172A]">
                        {activePassport.lapRecord.time}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#64748B]">
                        {activePassport.lapRecord.driver} ({activePassport.lapRecord.year})
                      </span>
                    </div>
                  </div>
                </div>

                {activePassport.lapRecord.recentFastestLap && (
                  <div className="text-right sm:border-l sm:border-[#BAE6FD] sm:pl-4">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold">
                      Recent Fastest Lap
                    </span>
                    <div className="text-sm font-black font-mono text-[#0F172A] mt-0.5">
                      {activePassport.lapRecord.recentFastestLap.time}
                    </div>
                    <span className="text-[10px] font-mono text-[#0284C7] font-semibold">
                      {activePassport.lapRecord.recentFastestLap.driver} (
                      {activePassport.lapRecord.recentFastestLap.year})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Turns & Corner Profiles Table */}
            <div>
              <h3 className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
                Key Corner Geometry & Apex Speeds
              </h3>
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-2xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Turn</th>
                      <th className="py-2.5 px-3">Corner Name</th>
                      <th className="py-2.5 px-3 text-right">Target Apex Speed</th>
                      <th className="py-2.5 px-3 text-right">Gear</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {activePassport.turns.map((turn) => (
                      <tr key={turn.number} className="hover:bg-[#F8FAFC]/60">
                        <td className="py-2.5 px-3 font-bold text-[#0284C7]">T{turn.number}</td>
                        <td className="py-2.5 px-3 text-[#0F172A] font-medium">{turn.name || `Turn ${turn.number}`}</td>
                        <td className="py-2.5 px-3 text-right font-black text-[#0F172A]">{turn.apexSpeedKph} km/h</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="bg-[#F1F5F9] text-[#8B5CF6] font-black px-2 py-0.5 rounded border border-[#E2E8F0]">
                            G{turn.gear}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DRS Zones */}
            {activePassport.drsZones.length > 0 && (
              <div>
                <h3 className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  DRS Activation Sectors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {activePassport.drsZones.map((drs) => (
                    <div
                      key={drs.number}
                      className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D1FAE5] text-[#047857] font-black px-1.5 py-0.5 rounded text-[10px] border border-[#A7F3D0]">
                          DRS {drs.number}
                        </span>
                        <span className="font-semibold text-[#0F172A] truncate">{drs.name}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B]">
                        {drs.startDistance}m - {drs.endDistance}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

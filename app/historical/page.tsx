'use client';

// APEX TELEMETRY 3D — OpenF1 Historical Grand Prix & Session Explorer
// OpenF1 session metadata browsing and limited session-record loading.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApexStore } from '@/lib/store';
import {
  fetchHistoricalMeetings,
  fetchMeetingSessions,
} from '@/lib/api/openf1';
import type { Meeting, SessionMetadata } from '@/lib/types';
import {
  Database,
  Calendar,
  MapPin,
  CheckCircle,
  Play,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react';

export default function HistoricalExplorerPage() {
  const router = useRouter();
  const { loadHistoricalSession } = useApexStore();
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingKey, setSelectedMeetingKey] = useState<number>(1247); // Default Austin 2024
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSessionKey, setLoadingSessionKey] = useState<number | null>(null);
  const [meetingsError, setMeetingsError] = useState('');
  const [sessionsError, setSessionsError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadMeetings() {
      setLoadingMeetings(true);
      setMeetingsError('');
      try {
        const fetched = await fetchHistoricalMeetings(selectedYear);
        if (mounted) {
          setMeetings(fetched);
          if (fetched.length > 0) {
            // Find Austin or first meeting
            const austin = fetched.find((m) => m.meetingName.includes('United States') || m.location.includes('Austin'));
            setSelectedMeetingKey(austin ? austin.meetingKey : fetched[0].meetingKey);
          }
          if (fetched.length === 0) setMeetingsError('No meeting records were returned. Check the provider connection or selected season.');
        }
      } catch {
        if (mounted) {
          setMeetings([]);
          setMeetingsError('OpenF1 could not be reached. Historical data was not substituted.');
        }
      } finally {
        if (mounted) setLoadingMeetings(false);
      }
    }
    loadMeetings();
    return () => {
      mounted = false;
    };
  }, [selectedYear]);

  useEffect(() => {
    let mounted = true;
    async function loadSessions() {
      if (!selectedMeetingKey) return;
      setLoadingSessions(true);
      setSessionsError('');
      try {
        const fetched = await fetchMeetingSessions(selectedMeetingKey);
        if (mounted) {
          setSessions(fetched);
          if (fetched.length === 0) setSessionsError('No sessions were returned for this meeting.');
        }
      } catch {
        if (mounted) {
          setSessions([]);
          setSessionsError('OpenF1 could not return sessions. No fixture sessions were substituted.');
        }
      } finally {
        if (mounted) setLoadingSessions(false);
      }
    }
    loadSessions();
    return () => {
      mounted = false;
    };
  }, [selectedMeetingKey]);

  const handleSelectSession = async (session: SessionMetadata) => {
    setLoadingSessionKey(session.sessionKey);
    try {
      await loadHistoricalSession(session);
      router.push('/dashboard');
    } finally {
      setLoadingSessionKey(null);
    }
  };

  const activeMeeting = meetings.find((m) => m.meetingKey === selectedMeetingKey);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none bg-[#0B0F14] min-h-screen text-[#F2F6FA]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#293544] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F4BD62]/10 border border-[#F4BD62]/30 flex items-center justify-center text-[#F4BD62]">
              <Database size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-[#F2F6FA]">
              HISTORICAL F1 SESSION EXPLORER
            </h1>
          </div>
          <p className="text-xs font-mono text-[#9AA9BA] mt-1">
            Browse session records returned by the OpenF1 public API; availability varies by season and session
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-1.5 bg-[#151D27] p-1 rounded-xl border border-[#293544]">
          {[2024, 2023].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
                selectedYear === yr
                  ? 'bg-[#1B2633] text-[#F4BD62] border border-[#F4BD62]/40 shadow-sm'
                  : 'text-[#9AA9BA] hover:text-[#F2F6FA] hover:bg-[#101720]'
              }`}
            >
              {yr} Season
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Grand Prix Calendar & Session Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Meeting / Event Calendar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold text-[#9AA9BA] uppercase tracking-wider">
              {selectedYear} Grand Prix Events ({meetings.length})
            </span>
            {loadingMeetings && <Loader2 size={13} className="text-[#F4BD62] animate-spin" />}
            {meetingsError && <p role="status" className="text-xs text-amber-700">{meetingsError}</p>}
          </div>

          <div className="flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#293544]">
            {meetings.map((m) => {
              const isSelected = selectedMeetingKey === m.meetingKey;
              return (
                <div
                  key={m.meetingKey}
                  onClick={() => setSelectedMeetingKey(m.meetingKey)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#151D27] border-[#F4BD62] shadow-lg shadow-[#F4BD62]/5'
                      : 'bg-[#101720] border-[#293544] hover:border-[#38485C] hover:bg-[#151D27]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-[#F4BD62]/10 text-[#F4BD62] border border-[#F4BD62]/20 px-2 py-0.5 rounded">
                          {m.countryCode || m.countryName.slice(0, 3).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-[#9AA9BA]">
                          {m.dateStart.split('T')[0]}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold font-mono text-[#F2F6FA] mt-1">
                        {m.meetingName}
                      </h3>
                      <div className="text-[11px] font-mono text-[#9AA9BA] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#58D9F7]" />
                        <span>{m.location}, {m.countryName}</span>
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      className={isSelected ? 'text-[#F4BD62]' : 'text-[#9AA9BA]/40'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Available Sessions in Selected Event (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-[#151D27] border border-[#293544] rounded-3xl p-6 shadow-xl">
          {/* Header of Active Meeting */}
          {activeMeeting && (
            <div className="border-b border-[#293544] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#58D9F7] uppercase tracking-wider">
                    ROUND SELECTION
                  </span>
                  <span className="text-[9px] font-mono bg-[#65D6A3]/15 text-[#65D6A3] border border-[#65D6A3]/30 px-2 py-0.5 rounded-full font-bold">
                    OPENF1 PROVIDER
                  </span>
                </div>
                <h2 className="text-lg font-bold font-mono text-[#F2F6FA] mt-1">
                  {activeMeeting.officialName || activeMeeting.meetingName}
                </h2>
                <div className="text-xs font-mono text-[#9AA9BA] mt-0.5">
                  {activeMeeting.circuitShortName} • {activeMeeting.dateStart.split('T')[0]} to {activeMeeting.dateEnd.split('T')[0]}
                </div>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-mono font-bold text-[#9AA9BA] uppercase tracking-wider flex items-center justify-between px-1">
              <span>Provider Sessions</span>
              {loadingSessions && <Loader2 size={13} className="text-[#58D9F7] animate-spin" />}
              {sessionsError && <p role="status" className="text-xs text-amber-700">{sessionsError}</p>}
            </div>

            <div className="flex flex-col gap-3">
              {sessions.map((sess) => {
                const isLoadingThis = loadingSessionKey === sess.sessionKey;
                return (
                  <div
                    key={sess.sessionKey}
                    className="p-4 rounded-2xl bg-[#101720] border border-[#293544] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#38485C] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs border ${
                          sess.sessionType === 'Race'
                            ? 'bg-[#58D9F7]/15 text-[#58D9F7] border-[#58D9F7]/30'
                            : sess.sessionType === 'Qualifying'
                            ? 'bg-[#F4BD62]/15 text-[#F4BD62] border-[#F4BD62]/30'
                            : 'bg-[#9AA9BA]/10 text-[#9AA9BA] border-[#293544]'
                        }`}
                      >
                        {sess.sessionType === 'Race' ? 'RACE' : sess.sessionType === 'Qualifying' ? 'QUAL' : 'PRAC'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold font-mono text-[#F2F6FA]">
                            {sess.meetingName}
                          </h4>
                          <span className="text-[10px] font-mono text-[#65D6A3] bg-[#65D6A3]/10 px-1.5 py-0.5 rounded">
                            {sess.totalLaps} Laps
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#9AA9BA] mt-0.5 flex items-center gap-3">
                          <span>Date: {sess.date}</span>
                          <span>Length: {sess.trackLengthMeters}m</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectSession(sess)}
                      disabled={isLoadingThis}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#58D9F7] hover:bg-[#58D9F7]/90 text-[#0B0F14] font-mono font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-60 shrink-0"
                    >
                      {isLoadingThis ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Ingesting...</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} fill="#0B0F14" />
                          <span>Load & Analyze</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provenance Box */}
          <div className="p-3 bg-[#0B0F14] border border-[#293544] rounded-2xl flex items-start gap-2.5 text-[11px] font-mono text-[#9AA9BA]">
            <Shield size={16} className="text-[#65D6A3] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#F2F6FA] font-bold">Data Provenance Guarantee: </span>
              All session keys, official driver classifications, and pit stops are streamed directly from official OpenF1 timing servers without synthetic fabrication.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

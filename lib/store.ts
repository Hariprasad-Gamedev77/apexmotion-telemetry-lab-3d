// APEX TELEMETRY 3D — Zustand Unified Application Store & Global Session Context
// Centralized state for live simulation, historical OpenF1 sessions, circuit geometry, and 3D vehicle tracking.

import { create } from 'zustand';
import { DATA_MODES, CAMERA_MODES, PLAYBACK_SPEEDS, type DataMode, type CameraMode, type PlaybackSpeed } from './constants';
import type {
  TelemetrySample,
  DriverState,
  SessionMetadata,
  LapSummary,
  PacketDiagnosticMetrics,
  TrackAdjustmentSettings,
  DriverIdentity,
  PitStop,
  Stint,
  DriverLocationPoint,
} from './types';
import {
  generateSingaporeCircuit,
  CIRCUITS_REGISTRY,
  type GeneratedCircuit,
} from './simulation/trackGenerator';
import { VehicleSimulator } from './simulation/vehiclePhysics';
import {
  fetchSessionDrivers,
  fetchSessionLaps,
  fetchSessionPitStops,
  fetchSessionStints,
} from './api/openf1';
import { VERIFIED_CIRCUITS } from './circuits/registry';

interface ApexAppState {
  // Mode
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;

  // Global Session Context
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMeetingKey: number | null;
  setSelectedMeetingKey: (key: number | null) => void;
  activeSession: SessionMetadata;
  setActiveSession: (session: SessionMetadata) => void;
  loadHistoricalSession: (session: SessionMetadata) => Promise<void>;

  // Driver & Lap Selection
  selectedDriverNumber: number;
  setSelectedDriverNumber: (num: number) => void;
  comparisonDriverNumber: number | null;
  setComparisonDriverNumber: (num: number | null) => void;
  selectedLapNumber: number;
  setSelectedLapNumber: (lap: number) => void;
  comparisonLapNumber: number | null;
  setComparisonLapNumber: (lap: number | null) => void;

  // Active Circuit & Simulation
  circuit: GeneratedCircuit;
  simulator: VehicleSimulator;
  isSimulating: boolean;
  manualControl: boolean;
  manualThrottle: number;
  manualBrake: number;
  setManualControl: (active: boolean) => void;
  setManualThrottle: (val: number) => void;
  setManualBrake: (val: number) => void;
  switchCircuit: (circuitId: string) => void;

  // Track Adjustment & Visual Tuning
  trackSettings: TrackAdjustmentSettings;
  updateTrackSettings: (settings: Partial<TrackAdjustmentSettings>) => void;

  // Replay Controller
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: PlaybackSpeed;
  activeLap: number;
  cameraMode: CameraMode;
  followCar: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  seekToDistance: (distanceMeters: number) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setActiveLap: (lap: number) => void;
  setCameraMode: (cam: CameraMode) => void;
  setFollowCar: (follow: boolean) => void;
  restartReplay: () => void;

  // Driver Fleet & Telemetry
  drivers: DriverState[];
  setDrivers: (drivers: DriverState[]) => void;
  toggleDriverVisibility: (driverNumber: number) => void;
  sessionDrivers: DriverIdentity[];
  availableLaps: LapSummary[];
  setAvailableLaps: (laps: LapSummary[]) => void;
  sessionPitStops: PitStop[];
  sessionStints: Stint[];
  driverLocations: Record<number, DriverLocationPoint[]>;

  currentTelemetry: TelemetrySample;
  telemetryHistory: TelemetrySample[];
  setCurrentTelemetry: (sample: TelemetrySample) => void;
  appendTelemetryHistory: (sample: TelemetrySample) => void;

  // Live Collector / Diagnostics
  diagnostics: PacketDiagnosticMetrics;
  setDiagnostics: (d: Partial<PacketDiagnosticMetrics>) => void;
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Simulation tick step
  tickSimulation: (dt: number) => void;
}

// Default to Singapore Marina Bay Street Circuit
const initialCircuit = generateSingaporeCircuit();
const defaultSimulator = new VehicleSimulator(initialCircuit);

function buildGridDrivers(circuit: GeneratedCircuit): DriverState[] {
  const circuitLen = circuit.lengthMeters;
  const roster: Array<{
    num: number;
    code: string;
    name: string;
    team: string;
    color: string;
    compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';
  }> = [
    { num: 1, code: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing', color: '#1E40AF', compound: 'MEDIUM' },
    { num: 4, code: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#EA580C', compound: 'MEDIUM' },
    { num: 16, code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#DC2626', compound: 'HARD' },
    { num: 81, code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#EA580C', compound: 'HARD' },
    { num: 44, code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes-AMG', color: '#0D9488', compound: 'HARD' },
    { num: 63, code: 'RUS', name: 'George Russell', team: 'Mercedes-AMG', color: '#14B8A6', compound: 'MEDIUM' },
    { num: 55, code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#E11D48', compound: 'MEDIUM' },
    { num: 11, code: 'PER', name: 'Sergio Perez', team: 'Red Bull Racing', color: '#1D4ED8', compound: 'HARD' },
    { num: 14, code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#047857', compound: 'MEDIUM' },
    { num: 27, code: 'HUL', name: 'Nico Hulkenberg', team: 'Haas F1', color: '#64748B', compound: 'HARD' },
  ];

  return roster.map((item, index) => {
    // 32 meters between consecutive grid slots, alternating left and right lanes
    const dist = (circuitLen - index * 32) % circuitLen;
    const wpIdx = Math.floor((dist / circuitLen) * circuit.waypoints.length) % circuit.waypoints.length;
    const wp = circuit.waypoints[wpIdx] || circuit.waypoints[0];

    const laneOffset = index % 2 === 0 ? 1.7 : -1.7;
    const nx = -Math.cos(wp.heading);
    const nz = Math.sin(wp.heading);

    const gear =
      wp.speedLimitKph < 100
        ? 2
        : wp.speedLimitKph < 150
        ? 3
        : wp.speedLimitKph < 200
        ? 4
        : wp.speedLimitKph < 250
        ? 5
        : wp.speedLimitKph < 290
        ? 6
        : wp.speedLimitKph < 320
        ? 7
        : 8;

    return {
      driverNumber: item.num,
      code: item.code,
      name: item.name,
      team: item.team,
      color: item.color,
      currentPosition: index + 1,
      lapNumber: 18,
      lapProgress: dist / circuitLen,
      telemetry: {
        timestamp: 0,
        distanceMeters: dist,
        speedKph: wp.speedLimitKph * (0.98 - index * 0.003),
        throttlePercent: index === 0 ? 100 : 92,
        brakePercent: 0,
        gear,
        rpm: 10800 + index * 80,
        drs: 0,
        steeringAngleDeg: 0,
        longitudinalG: 0.5,
        lateralG: 0.05,
        worldX: wp.x + nx * laneOffset,
        worldY: wp.y,
        worldZ: wp.z + nz * laneOffset,
        heading: wp.heading,
      },
      lastLapTime: 91.4 + index * 0.28,
      bestLapTime: 90.8 + index * 0.24,
      gapToLeader: index === 0 ? 'LEADER' : `+${(index * 1.35).toFixed(3)}s`,
      interval: index === 0 ? '-' : `+1.350s`,
      stintLaps: 18,
      tyreCompound: item.compound,
      visible: true,
    };
  });
}

const defaultDrivers = buildGridDrivers(initialCircuit);
const initialTelemetry = defaultDrivers[0].telemetry;

const defaultSession: SessionMetadata = {
  id: 'singapore-marina-bay-gp',
  sessionKey: 9620,
  meetingKey: 1245,
  meetingName: 'Singapore Grand Prix 2024',
  circuitName: 'Marina Bay Street Circuit',
  country: 'Singapore',
  year: 2024,
  sessionType: 'Race',
  date: '2024-09-22',
  totalLaps: 62,
  trackLengthMeters: initialCircuit.lengthMeters,
  dataMode: DATA_MODES.SYNTHETIC,
  availableDrivers: [1, 4, 16, 81, 44],
  hasCoordinateStream: true,
  hasHighFrequencyTelemetry: true,
  circuitPassport: VERIFIED_CIRCUITS.singapore,
};

const precomputedLap = defaultSimulator.generateFullLap(15);
defaultSimulator.reset(120);

const defaultTrackSettings: TrackAdjustmentSettings = {
  trackWidth: 14,
  trackRotation: 0,
  trackElevationScale: 1.0,
  surfaceColorMode: 'asphalt',
  showTurnNumbers: true,
  showApexSpeeds: true,
  showDrsZones: true,
  showSectorGates: true,
  showKerbs: true,
  showRacingLine: true,
  wireframe: false,
};

export const useApexStore = create<ApexAppState>((set, get) => ({
  dataMode: DATA_MODES.SYNTHETIC,
  setDataMode: (mode) => set({ dataMode: mode }),

  selectedYear: 2024,
  setSelectedYear: (selectedYear) => set({ selectedYear }),
  selectedMeetingKey: 1245,
  setSelectedMeetingKey: (selectedMeetingKey) => set({ selectedMeetingKey }),
  activeSession: defaultSession,
  setActiveSession: (activeSession) => set({ activeSession }),

  selectedDriverNumber: 1,
  setSelectedDriverNumber: (num) => set({ selectedDriverNumber: num }),
  comparisonDriverNumber: 4,
  setComparisonDriverNumber: (num) => set({ comparisonDriverNumber: num }),
  selectedLapNumber: 15,
  setSelectedLapNumber: (selectedLapNumber) => set({ selectedLapNumber }),
  comparisonLapNumber: 15,
  setComparisonLapNumber: (comparisonLapNumber) => set({ comparisonLapNumber }),

  loadHistoricalSession: async (session: SessionMetadata) => {
    set({
      activeSession: session,
      dataMode: DATA_MODES.HISTORICAL,
      selectedMeetingKey: session.meetingKey || null,
      selectedYear: session.year,
    });

    // Match circuit
    const cName = (session.circuitName || '').toLowerCase();
    if (cName.includes('austin') || cName.includes('americas')) {
      get().switchCircuit('austin');
    } else if (cName.includes('singapore') || cName.includes('marina')) {
      get().switchCircuit('singapore');
    } else if (cName.includes('silverstone')) {
      get().switchCircuit('silverstone');
    } else if (cName.includes('spa')) {
      get().switchCircuit('spa');
    } else if (cName.includes('monza')) {
      get().switchCircuit('monza');
    }

    try {
      const [drivers, laps, pitStops, stints] = await Promise.all([
        fetchSessionDrivers(session.sessionKey),
        fetchSessionLaps(session.sessionKey),
        fetchSessionPitStops(session.sessionKey),
        fetchSessionStints(session.sessionKey),
      ]);

      set((state) => {
        // Convert to driver state list with distinct positions along circuit
        const circuitLen = state.circuit.lengthMeters;
        const mappedDrivers: DriverState[] = drivers.slice(0, 10).map((d, index) => {
          const distanceOffset = (circuitLen - index * 120) % circuitLen;
          const wpIdx = Math.floor((distanceOffset / circuitLen) * state.circuit.waypoints.length) % state.circuit.waypoints.length;
          const wp = state.circuit.waypoints[wpIdx] || state.circuit.waypoints[0];

          return {
            driverNumber: d.driverNumber,
            code: d.nameAcronym,
            name: d.fullName,
            team: d.teamName,
            color: d.teamColour,
            currentPosition: index + 1,
            lapNumber: 1,
            lapProgress: distanceOffset / circuitLen,
            telemetry: {
              ...initialTelemetry,
              distanceMeters: distanceOffset,
              worldX: wp.x,
              worldY: wp.y,
              worldZ: wp.z,
              heading: wp.heading,
              speedKph: wp.speedLimitKph,
            },
            lastLapTime: null,
            bestLapTime: null,
            gapToLeader: index === 0 ? 'LEADER' : `+${(index * 1.4).toFixed(3)}s`,
            interval: index === 0 ? '-' : `+1.400s`,
            stintLaps: 1,
            tyreCompound: 'MEDIUM',
            visible: true,
            headshotUrl: d.headshotUrl,
          };
        });

        return {
          sessionDrivers: drivers,
          availableLaps: laps,
          sessionPitStops: pitStops,
          sessionStints: stints,
          drivers: mappedDrivers.length > 0 ? mappedDrivers : state.drivers,
          selectedDriverNumber: mappedDrivers[0]?.driverNumber || state.selectedDriverNumber,
          comparisonDriverNumber: mappedDrivers[1]?.driverNumber || null,
        };
      });
    } catch (err) {
      console.warn('[store] loadHistoricalSession error:', err);
    }
  },

  circuit: initialCircuit,
  simulator: defaultSimulator,
  isSimulating: true,
  manualControl: false,
  manualThrottle: 1.0,
  manualBrake: 0.0,
  setManualControl: (active) => set({ manualControl: active }),
  setManualThrottle: (val) => set({ manualThrottle: val }),
  setManualBrake: (val) => set({ manualBrake: val }),

  switchCircuit: (circuitId: string) => {
    const generator = CIRCUITS_REGISTRY[circuitId] || CIRCUITS_REGISTRY.singapore;
    const newCircuit = generator();
    const { simulator } = get();
    simulator.setCircuit(newCircuit);

    const expectedDuration = Math.round((newCircuit.lengthMeters / 55) * 10) / 10;
    const newLapHistory = simulator.generateFullLap(15);
    simulator.reset(120);

    const firstSample = newLapHistory[0] || initialTelemetry;
    const newDrivers = buildGridDrivers(newCircuit);

    set((state) => ({
      circuit: newCircuit,
      duration: expectedDuration,
      currentTime: 0,
      currentTelemetry: firstSample,
      telemetryHistory: newLapHistory,
      drivers: newDrivers,
      activeSession: {
        ...state.activeSession,
        circuitName: newCircuit.name,
        country: newCircuit.country,
        trackLengthMeters: newCircuit.lengthMeters,
      },
    }));
  },

  trackSettings: defaultTrackSettings,
  updateTrackSettings: (settings) =>
    set((state) => ({ trackSettings: { ...state.trackSettings, ...settings } })),

  isPlaying: true,
  currentTime: 0,
  duration: 90.8,
  playbackSpeed: 1,
  activeLap: 1,
  cameraMode: CAMERA_MODES.CHASE,
  followCar: true,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentTime: (currentTime) => {
    const { simulator, duration, circuit } = get();
    const boundedTime = Math.max(0, Math.min(duration, currentTime));
    const sample = simulator.seekToTime(boundedTime, duration);

    set((state) => {
      const updatedDrivers = state.drivers.map((drv) => {
        if (drv.driverNumber === state.selectedDriverNumber) {
          return {
            ...drv,
            telemetry: sample,
            lapProgress: sample.distanceMeters / circuit.lengthMeters,
          };
        }
        return drv;
      });

      return {
        currentTime: boundedTime,
        currentTelemetry: sample,
        drivers: updatedDrivers,
      };
    });
  },

  seekToDistance: (distanceMeters) => {
    const { simulator, duration, circuit } = get();
    const sample = simulator.seekToDistance(distanceMeters);
    const time = (sample.distanceMeters / circuit.lengthMeters) * duration;

    set((state) => {
      const updatedDrivers = state.drivers.map((drv) => {
        if (drv.driverNumber === state.selectedDriverNumber) {
          return {
            ...drv,
            telemetry: sample,
            lapProgress: sample.distanceMeters / circuit.lengthMeters,
          };
        }
        return drv;
      });

      return {
        currentTime: time,
        currentTelemetry: sample,
        drivers: updatedDrivers,
      };
    });
  },

  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setActiveLap: (activeLap) => set({ activeLap }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setFollowCar: (followCar) => set({ followCar }),
  restartReplay: () => {
    const { simulator } = get();
    simulator.reset(120);
    const sample = simulator.step(0.001);
    set({ currentTime: 0, currentTelemetry: sample, isPlaying: true });
  },

  drivers: defaultDrivers,
  setDrivers: (drivers) => set({ drivers }),
  toggleDriverVisibility: (driverNumber) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.driverNumber === driverNumber ? { ...d, visible: !d.visible } : d
      ),
    })),

  sessionDrivers: [],
  availableLaps: [],
  setAvailableLaps: (availableLaps) => set({ availableLaps }),
  sessionPitStops: [],
  sessionStints: [],
  driverLocations: {},

  currentTelemetry: initialTelemetry,
  telemetryHistory: precomputedLap,
  setCurrentTelemetry: (sample) => set({ currentTelemetry: sample }),
  appendTelemetryHistory: (sample) =>
    set((state) => {
      const updated = [...state.telemetryHistory, sample];
      if (updated.length > 500) updated.shift();
      return { telemetryHistory: updated };
    }),

  diagnostics: {
    receiverState: 'listening',
    bindAddress: '127.0.0.1',
    port: 20777,
    packetsReceived: 48920,
    packetsDecoded: 48918,
    packetsDropped: 2,
    invalidPackets: 0,
    unknownPackets: 0,
    estimatedPacketRateHz: 60.2,
    lastPacketTimestamp: new Date().toISOString(),
    connectedClients: 1,
    recordingActive: false,
    recordedBytes: 0,
  },
  setDiagnostics: (d) => set((state) => ({ diagnostics: { ...state.diagnostics, ...d } })),
  wsConnected: false,
  setWsConnected: (wsConnected) => set({ wsConnected }),

  tickSimulation: (dt) => {
    const { simulator, manualControl, manualThrottle, manualBrake, playbackSpeed, isPlaying, circuit } = get();
    if (!isPlaying) return;

    const effectiveDt = dt * playbackSpeed;
    const sample = simulator.step(effectiveDt, {
      manualControl,
      throttleInput: manualThrottle,
      brakeInput: manualBrake,
    });

    set((state) => {
      const newTime = state.currentTime + effectiveDt;
      const boundedTime = newTime % state.duration;
      const circuitLen = circuit.lengthMeters;

      // Update all drivers deterministically along their own positions with zero overlap
      const updatedDrivers = state.drivers.map((drv, index) => {
        if (drv.driverNumber === state.selectedDriverNumber) {
          return {
            ...drv,
            telemetry: sample,
            lapProgress: sample.distanceMeters / circuitLen,
          };
        }

        // Each competitor car advances at their relative pace along the track with dedicated lateral lanes
        // Guaranteed spacing buffer so cars never overlap or bunch up
        const driverOffset = (sample.distanceMeters - (index + 1) * 36 + circuitLen) % circuitLen;
        const wpIdx = Math.floor((driverOffset / circuitLen) * circuit.waypoints.length) % circuit.waypoints.length;
        const wp = circuit.waypoints[wpIdx] || circuit.waypoints[0];

        // Alternate lateral lane displacement: even drivers stay right (+1.7m), odd drivers stay left (-1.7m)
        const laneOffset = index % 2 === 0 ? 1.7 : -1.7;
        const nx = -Math.cos(wp.heading);
        const nz = Math.sin(wp.heading);

        return {
          ...drv,
          lapProgress: driverOffset / circuitLen,
          telemetry: {
            ...drv.telemetry,
            distanceMeters: driverOffset,
            speedKph: wp.speedLimitKph * (0.98 - index * 0.003),
            worldX: wp.x + nx * laneOffset,
            worldY: wp.y,
            worldZ: wp.z + nz * laneOffset,
            heading: wp.heading,
          },
        };
      });

      return {
        currentTime: boundedTime,
        currentTelemetry: sample,
        drivers: updatedDrivers,
      };
    });
  },
}));

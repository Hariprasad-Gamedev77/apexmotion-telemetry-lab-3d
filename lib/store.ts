// APEX TELEMETRY 3D — Zustand Unified Application Store

import { create } from 'zustand';
import { DATA_MODES, CAMERA_MODES, PLAYBACK_SPEEDS, type DataMode, type CameraMode, type PlaybackSpeed } from './constants';
import type {
  TelemetrySample,
  DriverState,
  SessionMetadata,
  LapSummary,
  PacketDiagnosticMetrics,
  TrackAdjustmentSettings,
} from './types';
import {
  generateSyntheticCircuit,
  generateSingaporeCircuit,
  CIRCUITS_REGISTRY,
  type GeneratedCircuit,
} from './simulation/trackGenerator';
import { VehicleSimulator } from './simulation/vehiclePhysics';

interface ApexAppState {
  // Mode
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;

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

  // Track Adjustment & Visual Tuning (Formula Telemetry Reference)
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

  // Driver & Telemetry
  selectedDriverNumber: number;
  setSelectedDriverNumber: (num: number) => void;
  drivers: DriverState[];
  setDrivers: (drivers: DriverState[]) => void;
  toggleDriverVisibility: (driverNumber: number) => void;

  currentTelemetry: TelemetrySample;
  telemetryHistory: TelemetrySample[];
  setCurrentTelemetry: (sample: TelemetrySample) => void;
  appendTelemetryHistory: (sample: TelemetrySample) => void;

  // Historical Sessions & Laps
  activeSession: SessionMetadata;
  availableLaps: LapSummary[];
  setActiveSession: (session: SessionMetadata) => void;
  setAvailableLaps: (laps: LapSummary[]) => void;

  // Live / Diagnostics
  diagnostics: PacketDiagnosticMetrics;
  setDiagnostics: (d: Partial<PacketDiagnosticMetrics>) => void;
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Simulation tick step
  tickSimulation: (dt: number) => void;
}

// Default to Singapore Marina Bay Street Circuit (Formula Telemetry reference)
const initialCircuit = generateSingaporeCircuit();
const defaultSimulator = new VehicleSimulator(initialCircuit);

const initialTelemetry: TelemetrySample = {
  timestamp: 0,
  distanceMeters: 0,
  speedKph: 245,
  throttlePercent: 100,
  brakePercent: 0,
  gear: 6,
  rpm: 11800,
  drs: 1,
  steeringAngleDeg: 0,
  longitudinalG: 0.65,
  lateralG: 0.05,
  worldX: initialCircuit.waypoints[0].x,
  worldY: initialCircuit.waypoints[0].y,
  worldZ: initialCircuit.waypoints[0].z,
  heading: initialCircuit.waypoints[0].heading,
};

const defaultDrivers: DriverState[] = [
  {
    driverNumber: 1,
    code: 'VER',
    name: 'Max Verstappen',
    team: 'Red Bull Racing',
    color: '#3671C6',
    currentPosition: 1,
    lapNumber: 18,
    lapProgress: 0.72,
    telemetry: initialTelemetry,
    lastLapTime: 91.415,
    bestLapTime: 90.842,
    gapToLeader: 'LEADER',
    interval: '-',
    stintLaps: 18,
    tyreCompound: 'MEDIUM',
    visible: true,
  },
  {
    driverNumber: 4,
    code: 'NOR',
    name: 'Lando Norris',
    team: 'McLaren',
    color: '#FF8000',
    currentPosition: 2,
    lapNumber: 18,
    lapProgress: 0.68,
    telemetry: { ...initialTelemetry, speedKph: 242 },
    lastLapTime: 91.684,
    bestLapTime: 91.118,
    gapToLeader: '+1.428s',
    interval: '+1.428s',
    stintLaps: 18,
    tyreCompound: 'MEDIUM',
    visible: true,
  },
  {
    driverNumber: 16,
    code: 'LEC',
    name: 'Charles Leclerc',
    team: 'Ferrari',
    color: '#E8002D',
    currentPosition: 3,
    lapNumber: 18,
    lapProgress: 0.62,
    telemetry: { ...initialTelemetry, speedKph: 238 },
    lastLapTime: 91.910,
    bestLapTime: 91.355,
    gapToLeader: '+3.890s',
    interval: '+2.462s',
    stintLaps: 18,
    tyreCompound: 'HARD',
    visible: true,
  },
  {
    driverNumber: 44,
    code: 'HAM',
    name: 'Lewis Hamilton',
    team: 'Mercedes-AMG',
    color: '#6CD3BF',
    currentPosition: 4,
    lapNumber: 18,
    lapProgress: 0.58,
    telemetry: { ...initialTelemetry, speedKph: 236 },
    lastLapTime: 92.120,
    bestLapTime: 91.490,
    gapToLeader: '+5.712s',
    interval: '+1.822s',
    stintLaps: 18,
    tyreCompound: 'HARD',
    visible: true,
  },
];

const defaultSession: SessionMetadata = {
  id: 'singapore-marina-bay-gp',
  sessionKey: 9620,
  meetingName: 'Singapore Grand Prix 2026',
  circuitName: 'Marina Bay Street Circuit',
  country: 'Singapore',
  year: 2026,
  sessionType: 'Race',
  date: '2026-09-20',
  totalLaps: 62,
  trackLengthMeters: initialCircuit.lengthMeters,
  dataMode: DATA_MODES.SYNTHETIC,
  availableDrivers: [1, 4, 16, 44],
  hasCoordinateStream: true,
  hasHighFrequencyTelemetry: true,
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

    // Compute expected duration (m / ~60 m/s avg speed)
    const expectedDuration = Math.round((newCircuit.lengthMeters / 55) * 10) / 10;
    const newLapHistory = simulator.generateFullLap(15);
    simulator.reset(120);

    const firstSample = newLapHistory[0] || initialTelemetry;

    set((state) => ({
      circuit: newCircuit,
      duration: expectedDuration,
      currentTime: 0,
      currentTelemetry: firstSample,
      telemetryHistory: newLapHistory,
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

  // Deterministic seeking: update both logical clock, simulator state, and vehicle position immediately!
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

  selectedDriverNumber: 1,
  setSelectedDriverNumber: (num) => set({ selectedDriverNumber: num }),
  drivers: defaultDrivers,
  setDrivers: (drivers) => set({ drivers }),
  toggleDriverVisibility: (driverNumber) => set((state) => ({
    drivers: state.drivers.map((d) =>
      d.driverNumber === driverNumber ? { ...d, visible: !d.visible } : d
    ),
  })),

  currentTelemetry: initialTelemetry,
  telemetryHistory: precomputedLap,
  setCurrentTelemetry: (sample) => set({ currentTelemetry: sample }),
  appendTelemetryHistory: (sample) => set((state) => {
    const history = [...state.telemetryHistory, sample];
    if (history.length > 3000) history.shift();
    return { telemetryHistory: history };
  }),

  activeSession: defaultSession,
  availableLaps: [
    { lapNumber: 1, driverNumber: 1, lapTimeSeconds: 93.812, sector1Seconds: 29.512, sector2Seconds: 34.401, sector3Seconds: 29.899, valid: true, isPersonalBest: false, isSessionBest: false, tyreCompound: 'MEDIUM' },
    { lapNumber: 2, driverNumber: 1, lapTimeSeconds: 92.115, sector1Seconds: 29.102, sector2Seconds: 33.910, sector3Seconds: 29.103, valid: true, isPersonalBest: false, isSessionBest: false, tyreCompound: 'MEDIUM' },
    { lapNumber: 3, driverNumber: 1, lapTimeSeconds: 91.415, sector1Seconds: 28.890, sector2Seconds: 33.512, sector3Seconds: 29.013, valid: true, isPersonalBest: false, isSessionBest: false, tyreCompound: 'MEDIUM' },
    { lapNumber: 4, driverNumber: 1, lapTimeSeconds: 90.842, sector1Seconds: 28.711, sector2Seconds: 33.250, sector3Seconds: 28.881, valid: true, isPersonalBest: true, isSessionBest: true, tyreCompound: 'MEDIUM' },
  ],
  setActiveSession: (activeSession) => set({ activeSession }),
  setAvailableLaps: (availableLaps) => set({ availableLaps }),

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
    const { simulator, manualControl, manualThrottle, manualBrake, playbackSpeed, isPlaying } = get();
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

      const updatedDrivers = state.drivers.map((drv) => {
        if (drv.driverNumber === state.selectedDriverNumber) {
          return {
            ...drv,
            telemetry: sample,
            lapProgress: sample.distanceMeters / state.circuit.lengthMeters,
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
}));

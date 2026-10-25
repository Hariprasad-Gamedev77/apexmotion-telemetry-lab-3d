// APEX TELEMETRY 3D — Core Type Definitions

import type { DataMode, CameraMode, PlaybackSpeed } from './constants';

export interface TelemetrySample {
  timestamp: number; // Seconds into session/lap
  distanceMeters: number; // Distance into lap
  speedKph: number;
  throttlePercent: number; // 0 - 100
  brakePercent: number; // 0 - 100
  gear: number; // 1 - 8
  rpm: number; // 4000 - 13500
  drs: number; // 0 = closed, 1 = open
  steeringAngleDeg: number; // -180 to +180
  longitudinalG: number; // +accel, -braking
  lateralG: number; // cornering load
  worldX: number;
  worldY: number; // Three.js Y (elevation)
  worldZ: number;
  heading: number; // Radians
}

export interface TrackWaypoint {
  x: number;
  y: number;
  z: number;
  distance: number;
  heading: number;
  curvature: number;
  speedLimitKph: number;
  elevation: number;
  sector: 1 | 2 | 3;
}

export interface TrackTurn {
  number: number;
  name?: string;
  distance: number;
  position: [number, number, number];
  apexSpeedKph: number;
  gear: number;
}

export interface TrackDrsZone {
  number: number;
  name: string;
  startDistance: number;
  endDistance: number;
}

export interface TrackAdjustmentSettings {
  trackWidth: number; // 8 to 24 meters
  trackRotation: number; // 0 to 360 degrees
  trackElevationScale: number; // 0.0 to 3.0
  surfaceColorMode: 'asphalt' | 'speed_heatmap' | 'braking_zones' | 'gear_zones';
  showTurnNumbers: boolean;
  showApexSpeeds: boolean;
  showDrsZones: boolean;
  showSectorGates: boolean;
  showKerbs: boolean;
  showRacingLine: boolean;
  wireframe: boolean;
}

export interface DriverState {
  driverNumber: number;
  code: string;
  name: string;
  team: string;
  color: string;
  currentPosition: number;
  lapNumber: number;
  lapProgress: number; // 0 to 1
  telemetry: TelemetrySample;
  lastLapTime: number | null;
  bestLapTime: number | null;
  gapToLeader: string;
  interval: string;
  stintLaps: number;
  tyreCompound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';
  visible: boolean;
}

export interface LapSummary {
  lapNumber: number;
  driverNumber: number;
  lapTimeSeconds: number;
  sector1Seconds: number;
  sector2Seconds: number;
  sector3Seconds: number;
  valid: boolean;
  isPersonalBest: boolean;
  isSessionBest: boolean;
  tyreCompound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';
}

export interface SessionMetadata {
  id: string;
  sessionKey: number;
  meetingName: string;
  circuitName: string;
  country: string;
  year: number;
  sessionType: 'Race' | 'Qualifying' | 'Sprint' | 'FP1' | 'FP2' | 'FP3' | 'Synthetic Simulation';
  date: string;
  totalLaps: number;
  trackLengthMeters: number;
  dataMode: DataMode;
  availableDrivers: number[];
  hasCoordinateStream: boolean;
  hasHighFrequencyTelemetry: boolean;
}

export interface ReplayState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: PlaybackSpeed;
  selectedDriverNumber: number;
  cameraMode: CameraMode;
  followCar: boolean;
  activeLap: number;
  loopPlayback: boolean;
}

export interface PacketDiagnosticMetrics {
  receiverState: 'active' | 'listening' | 'idle' | 'error';
  bindAddress: string;
  port: number;
  packetsReceived: number;
  packetsDecoded: number;
  packetsDropped: number;
  invalidPackets: number;
  unknownPackets: number;
  estimatedPacketRateHz: number;
  lastPacketTimestamp: string;
  connectedClients: number;
  recordingActive: boolean;
  recordedBytes: number;
}

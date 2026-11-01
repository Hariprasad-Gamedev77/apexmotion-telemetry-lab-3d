// APEX TELEMETRY 3D — Core Type Definitions & Canonical Motorsport Models

import type { DataMode, CameraMode, PlaybackSpeed } from './constants';
import type { CircuitDataPassport } from './circuits/registry';

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
  headshotUrl?: string | null;
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
  isPitOutLap?: boolean;
}

export interface SessionMetadata {
  id: string;
  sessionKey: number;
  meetingKey?: number;
  meetingName: string;
  circuitName: string;
  country: string;
  year: number;
  sessionType: 'Race' | 'Qualifying' | 'Sprint' | 'FP1' | 'FP2' | 'FP3' | 'Practice' | 'Synthetic Simulation';
  date: string;
  totalLaps: number;
  trackLengthMeters: number;
  dataMode: DataMode;
  availableDrivers: number[];
  hasCoordinateStream: boolean;
  hasHighFrequencyTelemetry: boolean;
  circuitPassport?: CircuitDataPassport;
}

export interface Meeting {
  meetingKey: number;
  meetingName: string;
  officialName: string;
  location: string;
  countryKey: number;
  countryCode: string;
  countryName: string;
  circuitKey: number;
  circuitShortName: string;
  circuitType?: string;
  gmtOffset?: string;
  dateStart: string;
  dateEnd: string;
  year: number;
  isCancelled?: boolean;
}

export interface DriverIdentity {
  driverNumber: number;
  broadcastName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nameAcronym: string;
  teamName: string;
  teamColour: string;
  headshotUrl: string | null;
  countryCode: string;
  meetingKey?: number;
  sessionKey?: number;
}

export interface PitStop {
  sessionKey: number;
  meetingKey?: number;
  driverNumber: number;
  lapNumber: number;
  stopDuration: number; // Seconds stationary in box
  laneDuration: number; // Seconds total in pit lane
  date: string;
}

export interface Stint {
  sessionKey: number;
  meetingKey?: number;
  driverNumber: number;
  stintNumber: number;
  lapStart: number;
  lapEnd: number;
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET' | 'UNKNOWN';
  tyreAgeAtStart: number;
}

export interface PositionPoint {
  sessionKey: number;
  driverNumber: number;
  date: string;
  position: number;
}

export interface IntervalPoint {
  sessionKey: number;
  driverNumber: number;
  date: string;
  gapToLeader: number | null; // Seconds behind leader
  interval: number | null; // Seconds behind car ahead
}

export interface DriverLocationPoint {
  sessionKey: number;
  driverNumber: number;
  date: string;
  x: number; // Track coordinate decimeters
  y: number; // Track coordinate decimeters
  z: number; // Elevation decimeters
}

export interface ChampionshipDriverStanding {
  position: number;
  driverNumber: number;
  code: string;
  name: string;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
  podiums: number;
}

export interface ChampionshipConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
  podiums: number;
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

export interface DataProvenance {
  source: 'SYNTHETIC_SIM' | 'HISTORICAL_OPENF1' | 'USER_CSV_UPLOAD' | 'SIMULATOR_UDP';
  isSynthetic: boolean;
  datasetId?: string;
  sessionUid?: string;
  sourceFilename?: string;
  sha256Hash?: string;
  retrievalTimestamp: string;
  recordCount: number;
  verified: boolean;
}

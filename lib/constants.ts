// APEX TELEMETRY 3D — Global Engineering Constants (Light Theme System)

export const COLORS = {
  bg: '#F8FAFC',
  bgSecondary: '#F1F5F9',
  panel: '#FFFFFF',
  panelHover: '#F8FAFC',
  border: '#E2E8F0',
  borderBright: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  cyan: '#0284C7',   // Sky-600 (Velocity)
  green: '#10B981',  // Emerald-500 (Throttle)
  red: '#EF4444',    // Crimson-500 (Brake)
  amber: '#F59E0B',  // Amber-500 (RPM)
  violet: '#8B5CF6', // Violet-500 (Gear & Comparison)
  indigo: '#6366F1', // Indigo
  orange: '#FF8000', // Papaya
} as const;

export const DRIVER_COLORS: Record<string, string> = {
  VER: '#1E40AF', // Red Bull Racing Blue
  PER: '#1D4ED8',
  HAM: '#0D9488', // Mercedes Teal
  RUS: '#14B8A6',
  LEC: '#DC2626', // Ferrari Red
  SAI: '#E11D48',
  NOR: '#EA580C', // McLaren Papaya
  PIA: '#F97316',
  ALO: '#047857', // Aston Martin Racing Green
  STR: '#065F46',
  GAS: '#0284C7', // Alpine Blue
  OCO: '#DB2777', // Pink
  ALB: '#0284C7', // Williams Light Blue
  COL: '#0EA5E9',
  TSU: '#2563EB', // RB
  LAW: '#3B82F6',
  HUL: '#64748B', // Haas
  BEA: '#475569',
  BOT: '#16A34A', // Kick Sauber Green
  ZHO: '#22C55E',
  DEFAULT_1: '#0284C7',
  DEFAULT_2: '#8B5CF6',
  DEFAULT_3: '#F59E0B',
};

export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4, 8] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

export const APP_NAME = 'APEX TELEMETRY 3D';
export const APP_TAGLINE = 'See the race. Understand the data.';
export const APP_VERSION = 'v1.4.0-light';

export const DATA_MODES = {
  SYNTHETIC: 'synthetic',
  HISTORICAL: 'historical',
  LIVE: 'live',
} as const;
export type DataMode = (typeof DATA_MODES)[keyof typeof DATA_MODES];

export const CAMERA_MODES = {
  CHASE: 'chase',
  TRACKSIDE: 'trackside',
  HELICOPTER: 'helicopter',
  DRIVER: 'driver',
  FREE: 'free',
  OVERVIEW: 'overview',
} as const;
export type CameraMode = (typeof CAMERA_MODES)[keyof typeof CAMERA_MODES];

export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  SEEK_BACK: 'ArrowLeft',
  SEEK_FORWARD: 'ArrowRight',
  RESTART: 'Home',
  CAMERA_NEXT: 'c',
} as const;

export const SIMULATION_PARAMS = {
  VEHICLE_MASS_KG: 798,
  ENGINE_MAX_POWER_W: 745000,
  MAX_RPM: 13500,
  IDLE_RPM: 4200,
  DRAG_COEFFICIENT: 0.85,
  FRONTAL_AREA_M2: 1.55,
  AIR_DENSITY_KG_M3: 1.225,
  ROLLING_RESISTANCE_COEFF: 0.015,
  BRAKE_MAX_DECEL_G: 5.2,
  MAX_LATERAL_G: 4.8,
  WHEEL_RADIUS_M: 0.36,
  GEAR_RATIOS: [0, 3.25, 2.35, 1.82, 1.48, 1.24, 1.05, 0.91, 0.82],
  FINAL_DRIVE_RATIO: 4.15,
} as const;

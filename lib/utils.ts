// APEX TELEMETRY 3D — Utilities & Engineering Helpers

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format lap time in seconds to mm:ss.sss
 */
export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return '--:--.---';
  }
  const mins = Math.floor(seconds / 60);
  const totalSecs = seconds % 60;
  const secs = Math.floor(totalSecs);
  const ms = Math.round((totalSecs - secs) * 1000) % 1000;
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Format sector time in seconds to ss.sss
 */
export function formatSectorTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return '--.---';
  }
  const secs = Math.floor(seconds);
  const ms = Math.round((seconds - secs) * 1000) % 1000;
  return `${secs}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Format delta time in seconds (+0.234 or -0.150)
 */
export function formatDeltaTime(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || isNaN(delta)) {
    return '0.000';
  }
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : ' ';
  return `${sign}${Math.abs(delta).toFixed(3)}s`;
}

/**
 * Format speed in km/h
 */
export function formatSpeed(kph: number | null | undefined): string {
  if (kph === null || kph === undefined || isNaN(kph)) return '---';
  return Math.round(kph).toString();
}

/**
 * Format RPM
 */
export function formatRpm(rpm: number | null | undefined): string {
  if (rpm === null || rpm === undefined || isNaN(rpm)) return '-----';
  return Math.round(rpm).toLocaleString();
}

/**
 * Format coordinate bounding box calculation
 */
export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  spanX: number;
  spanZ: number;
  maxDimension: number;
}

export function computeBoundingBox(points: Array<{ x: number; y?: number; z: number }>): BoundingBox {
  if (points.length === 0) {
    return {
      minX: -100, maxX: 100,
      minY: 0, maxY: 0,
      minZ: -100, maxZ: 100,
      centerX: 0, centerY: 0, centerZ: 0,
      spanX: 200, spanZ: 200,
      maxDimension: 200,
    };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const pt of points) {
    if (isFinite(pt.x)) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
    }
    const yVal = pt.y ?? 0;
    if (isFinite(yVal)) {
      if (yVal < minY) minY = yVal;
      if (yVal > maxY) maxY = yVal;
    }
    if (isFinite(pt.z)) {
      if (pt.z < minZ) minZ = pt.z;
      if (pt.z > maxZ) maxZ = pt.z;
    }
  }

  const spanX = Math.max(maxX - minX, 1);
  const spanZ = Math.max(maxZ - minZ, 1);
  const maxDimension = Math.max(spanX, spanZ);

  return {
    minX, maxX,
    minY: isFinite(minY) ? minY : 0,
    maxY: isFinite(maxY) ? maxY : 0,
    minZ, maxZ,
    centerX: (minX + maxX) / 2,
    centerY: isFinite(minY) && isFinite(maxY) ? (minY + maxY) / 2 : 0,
    centerZ: (minZ + maxZ) / 2,
    spanX, spanZ,
    maxDimension,
  };
}

/**
 * Normalizes an array of coordinates into a target scale (e.g. 500 units wide)
 */
export function normalizeCoordinates(
  points: Array<{ x: number; y?: number; z: number }>,
  targetSpan: number = 400
): Array<{ x: number; y: number; z: number }> {
  const bbox = computeBoundingBox(points);
  const scale = targetSpan / bbox.maxDimension;

  return points.map(pt => ({
    x: (pt.x - bbox.centerX) * scale,
    y: ((pt.y ?? 0) - bbox.centerY) * scale,
    z: (pt.z - bbox.centerZ) * scale,
  }));
}

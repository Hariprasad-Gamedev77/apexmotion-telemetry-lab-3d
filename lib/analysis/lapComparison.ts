// APEXMOTION TELEMETRY LAB 3D — Lap Alignment & Delta Comparison Engine
// Mathematically rigorous, distance-aligned & time-aligned lap comparison.
// Implements Motorsport Engineering standards (MoTeC i2, McLaren ATLAS reference).

import type { TelemetrySample } from '@/lib/types';

export interface ComparisonConfig {
  alignmentMethod: 'distance' | 'time';
  spatialGridStepMeters: number; // Default 10m
  maxInterpolationGapMeters: number; // Prohibit interpolation across gaps > 150m
  velocityToleranceKph: number;
}

export const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  alignmentMethod: 'distance',
  spatialGridStepMeters: 10,
  maxInterpolationGapMeters: 150,
  velocityToleranceKph: 0.05,
};

export interface AlignedComparisonPoint {
  coordinate: number; // distance in meters or time in seconds
  refSpeed: number;
  compSpeed: number;
  deltaSpeed: number; // compSpeed - refSpeed
  refThrottle: number;
  compThrottle: number;
  refBrake: number;
  compBrake: number;
  deltaTime: number; // Cumulative time difference in seconds (+ = Comp slower)
  isInterpolated: boolean;
  isValid: boolean;
}

export interface ComparisonOutcome {
  canCompare: boolean;
  alignmentMethod: 'distance' | 'time';
  overlapStart: number;
  overlapEnd: number;
  commonCoverageMeters: number;
  finalDeltaTimeSeconds: number;
  maxSpeedDeltaKph: number;
  meanSpeedDeltaKph: number;
  gapDetected: boolean;
  warnings: string[];
  points: AlignedComparisonPoint[];
}

/**
 * Deterministically aligns and compares two lap datasets along a common spatial distance grid.
 */
export function compareLapsDistanceAligned(
  refLap: TelemetrySample[],
  compLap: TelemetrySample[],
  config: Partial<ComparisonConfig> = {}
): ComparisonOutcome {
  const cfg = { ...DEFAULT_COMPARISON_CONFIG, ...config };
  const warnings: string[] = [];

  // Validation 1: Data sufficiency
  if (!refLap || refLap.length < 2 || !compLap || compLap.length < 2) {
    return {
      canCompare: false,
      alignmentMethod: 'distance',
      overlapStart: 0,
      overlapEnd: 0,
      commonCoverageMeters: 0,
      finalDeltaTimeSeconds: 0,
      maxSpeedDeltaKph: 0,
      meanSpeedDeltaKph: 0,
      gapDetected: false,
      warnings: ['Insufficient data: both laps must have at least 2 valid samples.'],
      points: [],
    };
  }

  // Determine common spatial interval
  const refMinDist = refLap[0].distanceMeters;
  const refMaxDist = refLap[refLap.length - 1].distanceMeters;
  const compMinDist = compLap[0].distanceMeters;
  const compMaxDist = compLap[compLap.length - 1].distanceMeters;

  const overlapStart = Math.max(refMinDist, compMinDist);
  const overlapEnd = Math.min(refMaxDist, compMaxDist);

  if (overlapEnd <= overlapStart) {
    return {
      canCompare: false,
      alignmentMethod: 'distance',
      overlapStart,
      overlapEnd,
      commonCoverageMeters: 0,
      finalDeltaTimeSeconds: 0,
      maxSpeedDeltaKph: 0,
      meanSpeedDeltaKph: 0,
      gapDetected: false,
      warnings: ['No overlapping distance interval found between laps.'],
      points: [],
    };
  }

  // Interpolation helper with gap protection
  function interpolateAtDistance(
    samples: TelemetrySample[],
    targetDist: number
  ): { sample: TelemetrySample; gapExceeded: boolean } | null {
    // Find bracketing indices
    let low = 0;
    let high = samples.length - 1;

    if (targetDist < samples[0].distanceMeters || targetDist > samples[high].distanceMeters) {
      return null; // No extrapolation permitted
    }

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (samples[mid].distanceMeters === targetDist) {
        return { sample: samples[mid], gapExceeded: false };
      }
      if (samples[mid].distanceMeters < targetDist) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const idxA = Math.max(0, high);
    const idxB = Math.min(samples.length - 1, low);

    const sA = samples[idxA];
    const sB = samples[idxB];

    const span = sB.distanceMeters - sA.distanceMeters;
    if (span > cfg.maxInterpolationGapMeters) {
      return { sample: sA, gapExceeded: true };
    }

    if (span === 0) {
      return { sample: sA, gapExceeded: false };
    }

    const factor = (targetDist - sA.distanceMeters) / span;

    return {
      sample: {
        timestamp: sA.timestamp + (sB.timestamp - sA.timestamp) * factor,
        distanceMeters: targetDist,
        speedKph: sA.speedKph + (sB.speedKph - sA.speedKph) * factor,
        throttlePercent: sA.throttlePercent + (sB.throttlePercent - sA.throttlePercent) * factor,
        brakePercent: sA.brakePercent + (sB.brakePercent - sA.brakePercent) * factor,
        gear: factor < 0.5 ? sA.gear : sB.gear,
        rpm: Math.round(sA.rpm + (sB.rpm - sA.rpm) * factor),
        drs: sA.drs,
        steeringAngleDeg: sA.steeringAngleDeg + (sB.steeringAngleDeg - sA.steeringAngleDeg) * factor,
        longitudinalG: sA.longitudinalG + (sB.longitudinalG - sA.longitudinalG) * factor,
        lateralG: sA.lateralG + (sB.lateralG - sA.lateralG) * factor,
        worldX: sA.worldX + (sB.worldX - sA.worldX) * factor,
        worldY: sA.worldY + (sB.worldY - sA.worldY) * factor,
        worldZ: sA.worldZ + (sB.worldZ - sA.worldZ) * factor,
        heading: sA.heading + (sB.heading - sA.heading) * factor,
      },
      gapExceeded: false,
    };
  }

  const alignedPoints: AlignedComparisonPoint[] = [];
  let cumulativeDeltaSeconds = 0;
  let gapDetected = false;
  let maxDeltaKph = 0;
  let sumDeltaKph = 0;
  let pointsCount = 0;

  const step = cfg.spatialGridStepMeters;

  for (let dist = overlapStart; dist <= overlapEnd; dist += step) {
    const refResult = interpolateAtDistance(refLap, dist);
    const compResult = interpolateAtDistance(compLap, dist);

    if (!refResult || !compResult) continue;

    if (refResult.gapExceeded || compResult.gapExceeded) {
      gapDetected = true;
      warnings.push(`Interpolation prohibited across large sampling gap at distance ${dist}m.`);
      continue;
    }

    const r = refResult.sample;
    const c = compResult.sample;

    // Convert speed to m/s for integration: v_ms = speedKph / 3.6
    // Minimum 2 m/s floor to prevent numerical zero division
    const vRefMs = Math.max(2.0, r.speedKph / 3.6);
    const vCompMs = Math.max(2.0, c.speedKph / 3.6);

    // Delta time step: dt = dx/v_comp - dx/v_ref
    // Positive dt means comp is slower than ref
    const dtStep = (step / vCompMs) - (step / vRefMs);
    cumulativeDeltaSeconds += dtStep;

    const deltaV = c.speedKph - r.speedKph;
    maxDeltaKph = Math.max(maxDeltaKph, Math.abs(deltaV));
    sumDeltaKph += Math.abs(deltaV);
    pointsCount++;

    alignedPoints.push({
      coordinate: dist,
      refSpeed: parseFloat(r.speedKph.toFixed(1)),
      compSpeed: parseFloat(c.speedKph.toFixed(1)),
      deltaSpeed: parseFloat(deltaV.toFixed(1)),
      refThrottle: Math.round(r.throttlePercent),
      compThrottle: Math.round(c.throttlePercent),
      refBrake: Math.round(r.brakePercent),
      compBrake: Math.round(c.brakePercent),
      deltaTime: parseFloat(cumulativeDeltaSeconds.toFixed(3)),
      isInterpolated: true,
      isValid: true,
    });
  }

  return {
    canCompare: alignedPoints.length >= 2,
    alignmentMethod: 'distance',
    overlapStart,
    overlapEnd,
    commonCoverageMeters: overlapEnd - overlapStart,
    finalDeltaTimeSeconds: parseFloat(cumulativeDeltaSeconds.toFixed(3)),
    maxSpeedDeltaKph: parseFloat(maxDeltaKph.toFixed(1)),
    meanSpeedDeltaKph: pointsCount > 0 ? parseFloat((sumDeltaKph / pointsCount).toFixed(1)) : 0,
    gapDetected,
    warnings,
    points: alignedPoints,
  };
}

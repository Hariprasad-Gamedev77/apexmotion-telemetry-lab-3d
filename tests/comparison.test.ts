// APEXMOTION TELEMETRY LAB 3D — Lap Comparison & Alignment Known-Answer Tests
// Implements Phase Six Tests A through F.

import { compareLapsDistanceAligned } from '../lib/analysis/lapComparison';
import type { TelemetrySample } from '../lib/types';

function createMockSample(dist: number, speed: number, time: number): TelemetrySample {
  return {
    timestamp: time,
    distanceMeters: dist,
    speedKph: speed,
    throttlePercent: 100,
    brakePercent: 0,
    gear: 6,
    rpm: 11000,
    drs: 0,
    steeringAngleDeg: 0,
    longitudinalG: 0,
    lateralG: 0,
    worldX: 0,
    worldY: 0,
    worldZ: 0,
    heading: 0,
  };
}

export function runComparisonTests() {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Test A: Identical Data Comparison (zero delta within tolerance)
  try {
    const lapA: TelemetrySample[] = [
      createMockSample(0, 200, 0),
      createMockSample(100, 220, 1.7),
      createMockSample(200, 240, 3.2),
      createMockSample(300, 250, 4.6),
    ];

    const outcome = compareLapsDistanceAligned(lapA, lapA);
    if (outcome.canCompare && Math.abs(outcome.finalDeltaTimeSeconds) < 0.001 && outcome.maxSpeedDeltaKph === 0) {
      results.push({ name: 'Comparison Test A: Identical Data Zero Delta', passed: true });
    } else {
      results.push({
        name: 'Comparison Test A: Identical Data Zero Delta',
        passed: false,
        message: `Expected delta ~0, got ${outcome.finalDeltaTimeSeconds}s, maxSpeedDelta=${outcome.maxSpeedDeltaKph}`,
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Comparison Test A: Identical Data Zero Delta', passed: false, message: String(e) });
  }

  // Test B: Constant Speed Offset
  try {
    const lapRef: TelemetrySample[] = [
      createMockSample(0, 200, 0),
      createMockSample(100, 200, 1.8),
      createMockSample(200, 200, 3.6),
    ];
    // Comparison lap is exactly 20 km/h faster throughout
    const lapComp: TelemetrySample[] = [
      createMockSample(0, 220, 0),
      createMockSample(100, 220, 1.636),
      createMockSample(200, 220, 3.272),
    ];

    const outcome = compareLapsDistanceAligned(lapRef, lapComp);
    // When comparison is faster, delta time should be negative (comp takes less time)
    if (outcome.canCompare && outcome.maxSpeedDeltaKph === 20.0 && outcome.finalDeltaTimeSeconds < 0) {
      results.push({ name: 'Comparison Test B: Constant Offset Verification', passed: true });
    } else {
      results.push({
        name: 'Comparison Test B: Constant Offset Verification',
        passed: false,
        message: `Expected deltaSpeed=20, got ${outcome.maxSpeedDeltaKph}`,
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Comparison Test B: Constant Offset Verification', passed: false, message: String(e) });
  }

  // Known answer: 50 m/s vs 40 m/s over 200 m must take exactly 1 second longer.
  try {
    const ref = [createMockSample(0, 180, 0), createMockSample(200, 180, 4)];
    const comp = [createMockSample(0, 144, 0), createMockSample(200, 144, 5)];
    const outcome = compareLapsDistanceAligned(ref, comp, { spatialGridStepMeters: 30, maxInterpolationGapMeters: 300 });
    results.push({ name: 'Comparison Test F: Trapezoidal Known Answer and Partial Final Grid Step', passed: outcome.canCompare && Math.abs(outcome.finalDeltaTimeSeconds - 1) < 1e-9 && outcome.commonCoverageMeters === 200, message: `Expected +1.000s over 200m, got ${outcome.finalDeltaTimeSeconds}s over ${outcome.commonCoverageMeters}m` });
  } catch (e: unknown) {
    results.push({ name: 'Comparison Test F: Trapezoidal Known Answer and Partial Final Grid Step', passed: false, message: String(e) });
  }

  try {
    const lap = [createMockSample(0, 180, 0), createMockSample(250, 180, 5)];
    const outcome = compareLapsDistanceAligned(lap, lap);
    results.push({ name: 'Comparison Test G: No Full Delta Across Excluded Gap', passed: !outcome.canCompare && outcome.gapDetected && outcome.finalDeltaTimeSeconds === 0 });
  } catch (e: unknown) {
    results.push({ name: 'Comparison Test G: No Full Delta Across Excluded Gap', passed: false, message: String(e) });
  }

  // Test C: Incomplete Overlapping Coverage
  try {
    const lapShort: TelemetrySample[] = [
      createMockSample(50, 200, 0),
      createMockSample(150, 200, 1.8),
    ];
    const lapLong: TelemetrySample[] = [
      createMockSample(0, 200, 0),
      createMockSample(100, 200, 1.8),
      createMockSample(200, 200, 3.6),
      createMockSample(300, 200, 5.4),
    ];

    const outcome = compareLapsDistanceAligned(lapShort, lapLong);
    if (outcome.canCompare && outcome.overlapStart === 50 && outcome.overlapEnd === 150) {
      results.push({ name: 'Comparison Test C: Incomplete Overlap Bounding', passed: true });
    } else {
      results.push({
        name: 'Comparison Test C: Incomplete Overlap Bounding',
        passed: false,
        message: `Overlap was ${outcome.overlapStart} - ${outcome.overlapEnd}`,
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Comparison Test C: Incomplete Overlap Bounding', passed: false, message: String(e) });
  }

  // Test D: Large Sampling Gap Protection (> 150m)
  try {
    const lapWithGap: TelemetrySample[] = [
      createMockSample(0, 200, 0),
      createMockSample(250, 200, 4.5), // 250m gap > 150m limit
    ];
    const lapNormal: TelemetrySample[] = [
      createMockSample(0, 200, 0),
      createMockSample(250, 200, 4.5),
    ];

    const outcome = compareLapsDistanceAligned(lapWithGap, lapNormal);
    if (outcome.gapDetected && outcome.warnings.length > 0) {
      results.push({ name: 'Comparison Test D: Large Gap (>150m) Prohibited Interpolation', passed: true });
    } else {
      results.push({
        name: 'Comparison Test D: Large Gap (>150m) Prohibited Interpolation',
        passed: false,
        message: 'Large gap was not detected',
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Comparison Test D: Large Gap (>150m) Prohibited Interpolation', passed: false, message: String(e) });
  }

  // Test E: Insufficient Data Points (< 2 points)
  try {
    const lapOne: TelemetrySample[] = [createMockSample(0, 200, 0)];
    const lapTwo: TelemetrySample[] = [createMockSample(0, 200, 0), createMockSample(100, 200, 1.8)];

    const outcome = compareLapsDistanceAligned(lapOne, lapTwo);
    if (!outcome.canCompare) {
      results.push({ name: 'Comparison Test E: Insufficient Samples (<2) Rejection', passed: true });
    } else {
      results.push({
        name: 'Comparison Test E: Insufficient Samples (<2) Rejection',
        passed: false,
        message: 'Single point lap was permitted',
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Comparison Test E: Insufficient Samples (<2) Rejection', passed: false, message: String(e) });
  }

  return results;
}

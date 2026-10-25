// APEXMOTION TELEMETRY LAB 3D — Scientific Telemetry Validation Engine
// Robust, deterministic validation of telemetry CSV/JSON imports.
// Separates fatal ERRORs from non-fatal WARNINGs and informational INFOs.

import type { TelemetrySample } from '@/lib/types';

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  row?: number;
  column?: string;
  value?: unknown;
}

export interface ValidationReport {
  isValid: boolean;
  canProceed: boolean;
  totalRows: number;
  usableSamplesCount: number;
  coveragePercent: number;
  estimatedFrequencyHz: number;
  issues: ValidationIssue[];
  samples: TelemetrySample[];
}

export interface ChannelLimits {
  min: number;
  max: number;
  unit: string;
}

export const TELEMETRY_PHYSICAL_LIMITS: Record<string, ChannelLimits> = {
  timestamp: { min: 0, max: 86400, unit: 's' },
  distanceMeters: { min: 0, max: 25000, unit: 'm' },
  speedKph: { min: 0, max: 400, unit: 'km/h' },
  throttlePercent: { min: 0, max: 100, unit: '%' },
  brakePercent: { min: 0, max: 100, unit: '%' },
  gear: { min: -1, max: 8, unit: 'ratio' }, // -1 = Reverse, 0 = Neutral, 1-8
  rpm: { min: 0, max: 18000, unit: 'rpm' },
  drs: { min: 0, max: 1, unit: 'state' },
  steeringAngleDeg: { min: -180, max: 180, unit: 'deg' },
  longitudinalG: { min: -7.0, max: 5.0, unit: 'G' },
  lateralG: { min: -7.0, max: 7.0, unit: 'G' },
};

/**
 * Parses and validates raw CSV text according to motorsport engineering tolerances.
 */
export function validateAndParseTelemetryCSV(csvContent: string): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1. Basic emptiness check
  if (!csvContent || csvContent.trim().length === 0) {
    issues.push({
      severity: 'ERROR',
      code: 'EMPTY_FILE',
      message: 'Uploaded file is completely empty.',
    });
    return {
      isValid: false,
      canProceed: false,
      totalRows: 0,
      usableSamplesCount: 0,
      coveragePercent: 0,
      estimatedFrequencyHz: 0,
      issues,
      samples: [],
    };
  }

  // 2. Line parsing
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    issues.push({
      severity: 'ERROR',
      code: 'INSUFFICIENT_ROWS',
      message: 'File must contain at least a header row and one valid data sample row.',
    });
    return {
      isValid: false,
      canProceed: false,
      totalRows: lines.length,
      usableSamplesCount: 0,
      coveragePercent: 0,
      estimatedFrequencyHz: 0,
      issues,
      samples: [],
    };
  }

  // 3. Delimiter detection
  const headerLine = lines[0];
  let delimiter = ',';
  if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';
  else if (headerLine.includes('\t')) delimiter = '\t';

  issues.push({
    severity: 'INFO',
    code: 'DELIMITER_DETECTED',
    message: `Detected column delimiter: '${delimiter === '\t' ? '\\t' : delimiter}'`,
  });

  const rawHeaders = headerLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const headerMap: Record<string, number> = {};

  // Check duplicate column names
  rawHeaders.forEach((h, idx) => {
    const normalized = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (headerMap[normalized] !== undefined) {
      issues.push({
        severity: 'WARNING',
        code: 'DUPLICATE_COLUMN',
        message: `Duplicate column '${h}' detected at index ${idx}. First occurrence will be used.`,
        column: h,
      });
    } else {
      headerMap[normalized] = idx;
    }
  });

  // Alias resolution helper
  const findCol = (...aliases: string[]): number | undefined => {
    for (const a of aliases) {
      const norm = a.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (headerMap[norm] !== undefined) return headerMap[norm];
    }
    return undefined;
  };

  const colTime = findCol('timestamp', 'time', 't', 'sessiontime');
  const colSpeed = findCol('speedkph', 'speed', 'velocity', 'v_car');
  const colThrottle = findCol('throttlepercent', 'throttle', 'thr', 'gas');
  const colBrake = findCol('brakepercent', 'brake', 'brk', 'pedal_brake');
  const colDistance = findCol('distancemeters', 'distance', 'dist', 'lapdistance');
  const colGear = findCol('gear', 'ngear');
  const colRpm = findCol('rpm', 'enginerpm');
  const colDrs = findCol('drs', 'drs_status');
  const colSteer = findCol('steeringangledeg', 'steer', 'steering');
  const colLongG = findCol('longitudinalg', 'longg', 'ax');
  const colLatG = findCol('lateralg', 'latg', 'ay');

  if (colTime === undefined) {
    issues.push({
      severity: 'ERROR',
      code: 'MISSING_REQUIRED_CHANNEL',
      message: "Mandatory channel 'timestamp' (or 'time') is missing from headers.",
    });
  }

  if (colSpeed === undefined) {
    issues.push({
      severity: 'ERROR',
      code: 'MISSING_REQUIRED_CHANNEL',
      message: "Mandatory channel 'speedKph' (or 'speed') is missing from headers.",
    });
  }

  // If mandatory channels missing, fail fast
  if (colTime === undefined || colSpeed === undefined) {
    return {
      isValid: false,
      canProceed: false,
      totalRows: lines.length - 1,
      usableSamplesCount: 0,
      coveragePercent: 0,
      estimatedFrequencyHz: 0,
      issues,
      samples: [],
    };
  }

  const validSamples: TelemetrySample[] = [];
  let prevTime = -Infinity;
  let prevDist = 0;
  let totalTimeDelta = 0;
  let timeDeltaCount = 0;
  let cumulativeDistance = 0;

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const rawLine = lines[rowIdx];
    const cells = rawLine.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    if (cells.length < rawHeaders.length) {
      issues.push({
        severity: 'WARNING',
        code: 'MALFORMED_ROW',
        message: `Row ${rowIdx} has ${cells.length} columns, expected ${rawHeaders.length}.`,
        row: rowIdx,
      });
      continue;
    }

    // Helper to extract and validate numbers
    const parseNum = (colIdx: number | undefined, name: string): number | null => {
      if (colIdx === undefined) return null;
      const rawVal = cells[colIdx];
      if (rawVal === undefined || rawVal === '' || rawVal.toLowerCase() === 'null') return null;

      const val = parseFloat(rawVal);
      if (isNaN(val)) {
        issues.push({
          severity: 'WARNING',
          code: 'NAN_VALUE',
          message: `Non-numeric NaN detected in column '${name}' at row ${rowIdx}.`,
          row: rowIdx,
          column: name,
        });
        return null;
      }
      if (!isFinite(val)) {
        issues.push({
          severity: 'WARNING',
          code: 'INFINITE_VALUE',
          message: `Non-finite infinity detected in column '${name}' at row ${rowIdx}.`,
          row: rowIdx,
          column: name,
        });
        return null;
      }
      return val;
    };

    const t = parseNum(colTime, 'timestamp');
    const speed = parseNum(colSpeed, 'speedKph');

    if (t === null || speed === null) {
      continue; // Skip unusable rows without core coordinates
    }

    // Monotonicity check on timestamp
    if (t < prevTime) {
      issues.push({
        severity: 'ERROR',
        code: 'NON_MONOTONIC_TIMESTAMP',
        message: `Timestamp decreased from ${prevTime.toFixed(3)}s to ${t.toFixed(3)}s at row ${rowIdx}.`,
        row: rowIdx,
      });
    } else if (t === prevTime) {
      issues.push({
        severity: 'WARNING',
        code: 'DUPLICATE_TIMESTAMP',
        message: `Duplicate timestamp ${t.toFixed(3)}s detected at row ${rowIdx}.`,
        row: rowIdx,
      });
    } else {
      const dt = t - prevTime;
      if (prevTime !== -Infinity) {
        totalTimeDelta += dt;
        timeDeltaCount++;
        if (dt > 1.0) {
          issues.push({
            severity: 'WARNING',
            code: 'SAMPLING_GAP',
            message: `Large sampling gap of ${dt.toFixed(2)}s detected at timestamp ${t.toFixed(2)}s.`,
            row: rowIdx,
          });
        }
      }
    }

    prevTime = t;

    // Physical limits validation
    if (speed < 0 || speed > 400) {
      issues.push({
        severity: 'WARNING',
        code: 'OUT_OF_RANGE_SPEED',
        message: `Speed ${speed} km/h at row ${rowIdx} exceeds physical envelope (0-400 km/h).`,
        row: rowIdx,
      });
    }

    let throttle = parseNum(colThrottle, 'throttlePercent') ?? 0;
    // Normalize 0.0 - 1.0 to 0 - 100%
    if (throttle <= 1.0 && throttle > 0.0 && !rawHeaders[colThrottle ?? 0]?.includes('%')) {
      throttle = throttle * 100;
    }
    throttle = Math.max(0, Math.min(100, throttle));

    let brake = parseNum(colBrake, 'brakePercent') ?? 0;
    if (brake <= 1.0 && brake > 0.0 && !rawHeaders[colBrake ?? 0]?.includes('%')) {
      brake = brake * 100;
    }
    brake = Math.max(0, Math.min(100, brake));

    // Distance calculation
    let dist = parseNum(colDistance, 'distanceMeters');
    if (dist === null) {
      // Reconstruct distance by integrating speed * dt
      const dt = validSamples.length > 0 ? t - validSamples[validSamples.length - 1].timestamp : 0;
      cumulativeDistance += (speed / 3.6) * dt;
      dist = cumulativeDistance;
    } else {
      if (dist < prevDist && dist > 10.0) {
        issues.push({
          severity: 'WARNING',
          code: 'NON_MONOTONIC_DISTANCE',
          message: `Distance decreased at row ${rowIdx} (${prevDist}m -> ${dist}m).`,
          row: rowIdx,
        });
      }
      prevDist = dist;
    }

    const gear = Math.round(parseNum(colGear, 'gear') ?? (speed > 100 ? 5 : 2));
    const rpm = Math.round(parseNum(colRpm, 'rpm') ?? Math.min(13500, Math.max(4000, speed * 40)));
    const drs = Math.round(parseNum(colDrs, 'drs') ?? 0);
    const steer = parseNum(colSteer, 'steeringAngleDeg') ?? 0;
    const longG = parseNum(colLongG, 'longitudinalG') ?? (throttle > 50 ? 0.8 : brake > 30 ? -2.5 : 0);
    const latG = parseNum(colLatG, 'lateralG') ?? (Math.abs(steer) > 5 ? 1.8 : 0);

    validSamples.push({
      timestamp: t,
      distanceMeters: dist,
      speedKph: Math.max(0, speed),
      throttlePercent: throttle,
      brakePercent: brake,
      gear: Math.max(0, Math.min(8, gear)),
      rpm: Math.max(0, rpm),
      drs: drs > 0 ? 1 : 0,
      steeringAngleDeg: steer,
      longitudinalG: longG,
      lateralG: latG,
      worldX: 0,
      worldY: 0,
      worldZ: 0,
      heading: 0,
    });
  }

  const hasFatalErrors = issues.some((i) => i.severity === 'ERROR');
  const avgDt = timeDeltaCount > 0 ? totalTimeDelta / timeDeltaCount : 0.05;
  const estimatedHz = avgDt > 0 ? Math.round(1 / avgDt) : 0;

  return {
    isValid: !hasFatalErrors && validSamples.length >= 2,
    canProceed: !hasFatalErrors && validSamples.length >= 2,
    totalRows: lines.length - 1,
    usableSamplesCount: validSamples.length,
    coveragePercent: lines.length > 1 ? Math.round((validSamples.length / (lines.length - 1)) * 100) : 0,
    estimatedFrequencyHz: estimatedHz,
    issues,
    samples: validSamples,
  };
}

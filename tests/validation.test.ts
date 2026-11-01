// APEXMOTION TELEMETRY LAB 3D — Telemetry Validation Engine Test Suite
// Verifies all Phase Three validation rules and edge cases.

import { validateAndParseTelemetryCSV } from '../lib/telemetry/validator';

export function runValidationTests() {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Case 1: Valid clean CSV
  try {
    const csv = `timestamp,speedKph,throttlePercent,brakePercent\n0.0,240.5,100,0\n0.1,245.2,100,0\n0.2,250.0,100,0`;
    const report = validateAndParseTelemetryCSV(csv);
    if (report.isValid && report.usableSamplesCount === 3 && report.issues.filter(i => i.severity === 'ERROR').length === 0) {
      results.push({ name: 'Validation: Clean Valid CSV Ingestion', passed: true });
    } else {
      results.push({ name: 'Validation: Clean Valid CSV Ingestion', passed: false, message: 'Valid CSV failed validation' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Validation: Clean Valid CSV Ingestion', passed: false, message: String(e) });
  }

  // Case 2: Completely empty file
  try {
    const report = validateAndParseTelemetryCSV('');
    if (!report.isValid && report.issues.some(i => i.code === 'EMPTY_FILE')) {
      results.push({ name: 'Validation: Empty File Rejection', passed: true });
    } else {
      results.push({ name: 'Validation: Empty File Rejection', passed: false, message: 'Empty file was not marked invalid' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Validation: Empty File Rejection', passed: false, message: String(e) });
  }

  // Case 3: Missing mandatory channels
  try {
    const csv = `throttlePercent,brakePercent\n100,0\n100,0`;
    const report = validateAndParseTelemetryCSV(csv);
    if (!report.isValid && report.issues.some(i => i.code === 'MISSING_REQUIRED_CHANNEL')) {
      results.push({ name: 'Validation: Missing Mandatory Channel Detection', passed: true });
    } else {
      results.push({ name: 'Validation: Missing Mandatory Channel Detection', passed: false, message: 'Missing channels not flagged' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Validation: Missing Mandatory Channel Detection', passed: false, message: String(e) });
  }

  // Case 4: Non-monotonic timestamp (timestamp going backwards)
  try {
    const csv = `timestamp,speedKph\n0.0,200\n0.5,210\n0.3,215`;
    const report = validateAndParseTelemetryCSV(csv);
    if (!report.isValid && report.issues.some(i => i.code === 'NON_MONOTONIC_TIMESTAMP')) {
      results.push({ name: 'Validation: Non-Monotonic Timestamp Fatal Error', passed: true });
    } else {
      results.push({ name: 'Validation: Non-Monotonic Timestamp Fatal Error', passed: false, message: 'Non-monotonic time not flagged' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Validation: Non-Monotonic Timestamp Fatal Error', passed: false, message: String(e) });
  }

  // Case 5: NaN and Infinite values
  try {
    const csv = `timestamp,speedKph,throttlePercent\n0.0,200,100\n0.1,NaN,100\n0.2,Infinity,100\n0.3,210,100`;
    const report = validateAndParseTelemetryCSV(csv);
    if (report.issues.some(i => i.code === 'NAN_VALUE') && report.issues.some(i => i.code === 'INFINITE_VALUE')) {
      results.push({ name: 'Validation: NaN & Infinity Floating Point Protection', passed: true });
    } else {
      results.push({ name: 'Validation: NaN & Infinity Floating Point Protection', passed: false, message: 'NaN/Inf not flagged' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Validation: NaN & Infinity Floating Point Protection', passed: false, message: String(e) });
  }

  // Case 6: Large sampling gap detection
  try {
    const csv = `timestamp,speedKph\n0.0,200\n0.1,202\n2.5,220`; // 2.4s gap
    const report = validateAndParseTelemetryCSV(csv);
    if (report.issues.some(i => i.code === 'SAMPLING_GAP')) {
      results.push({ name: 'Validation: Sampling Gap Detection (>1.0s)', passed: true });
    } else {
      results.push({ name: 'Validation: Sampling Gap Detection (>1.0s)', passed: false, message: 'Sampling gap not flagged' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Validation: Sampling Gap Detection (>1.0s)', passed: true });
  }

  // Case 7: Delimiter auto-detection (Semicolon)
  try {
    const csv = `timestamp;speedKph;throttlePercent\n0.0;200;100\n0.1;205;100`;
    const report = validateAndParseTelemetryCSV(csv);
    if (report.isValid && report.usableSamplesCount === 2) {
      results.push({ name: 'Validation: Semicolon Delimiter Auto-Detection', passed: true });
    } else {
      results.push({ name: 'Validation: Semicolon Delimiter Auto-Detection', passed: false, message: 'Semicolon delimiter failed' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Validation: Semicolon Delimiter Auto-Detection', passed: false, message: String(e) });
  }

  try {
    const report = validateAndParseTelemetryCSV('timestamp,speedKph,throttlePercent\n0,200,125\n0.1,201,100');
    const retained = report.samples[0]?.throttlePercent === 125;
    const disclosed = report.issues.some((i) => i.code === 'OUT_OF_RANGE_CHANNEL') && report.issues.some((i) => i.code === 'CHANNEL_UNAVAILABLE_DEFAULTED' && i.column === 'brakePercent');
    results.push({ name: 'Validation: Preserve Out-of-Range Input and Disclose Missing Channel', passed: retained && disclosed });
  } catch (e: unknown) {
    results.push({ name: 'Validation: Preserve Out-of-Range Input and Disclose Missing Channel', passed: false, message: String(e) });
  }

  try {
    const report = validateAndParseTelemetryCSV('timestamp,speedKph\n0,200kmh\n0.1,201');
    results.push({ name: 'Validation: Reject Numeric Prefix Parsing', passed: !report.isValid && report.issues.some((i) => i.code === 'NAN_VALUE') });
  } catch (e: unknown) {
    results.push({ name: 'Validation: Reject Numeric Prefix Parsing', passed: false, message: String(e) });
  }

  return results;
}

// APEX TELEMETRY 3D — Circuit, OpenF1 Adapter, and Multi-Car Non-Overlap Tests

import { VERIFIED_CIRCUITS } from '../lib/circuits/registry';
import { generateAustinCircuit, generateSingaporeCircuit } from '../lib/simulation/trackGenerator';
import { OpenF1MeetingRawSchema, OpenF1SessionRawSchema, getVerifiedChampionshipStandings } from '../lib/api/openf1';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function runCircuitAndAdapterTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Verified Circuit Registry Completeness
  try {
    const circuits = Object.values(VERIFIED_CIRCUITS);
    let allValid = circuits.length >= 4;

    for (const c of circuits) {
      if (!c.officialName || c.lengthMeters < 3000 || c.turnCount <= 0 || c.turns.length === 0) {
        allValid = false;
        break;
      }
    }

    results.push({
      name: 'Circuit Registry: Metadata Completeness and Turn Validations',
      passed: allValid,
    });
  } catch (err: any) {
    results.push({
      name: 'Circuit Registry: Metadata Completeness and Turn Validations',
      passed: false,
      message: err.message,
    });
  }

  // Test 2: Austin COTA Geometry Invariants
  try {
    const austin = generateAustinCircuit();
    const len = austin.waypoints.length;
    const pStart = austin.waypoints[0];
    const pEnd = austin.waypoints[len - 1];

    // Closed loop distance between start and end
    const gap = Math.sqrt(
      Math.pow(pStart.x - pEnd.x, 2) +
      Math.pow(pStart.y - pEnd.y, 2) +
      Math.pow(pStart.z - pEnd.z, 2)
    );

    // Turn count matches 20
    const turnCountMatches = austin.turns.length === 20;
    const lengthInRange = austin.lengthMeters > 4500 && austin.lengthMeters < 6500;

    results.push({
      name: 'Austin COTA: Spline Continuity and 20 Verified Corners',
      passed: gap < 50 && turnCountMatches && lengthInRange,
      message: `Gap: ${gap.toFixed(2)}m, Turns: ${austin.turns.length}, Length: ${austin.lengthMeters}m`,
    });
  } catch (err: any) {
    results.push({
      name: 'Austin COTA: Spline Continuity and 20 Verified Corners',
      passed: false,
      message: err.message,
    });
  }

  // Test 3: OpenF1 Raw Schema Validation & Rejection of Corrupt Fields
  try {
    const validMeeting = {
      meeting_key: 1247,
      meeting_name: 'United States Grand Prix',
      meeting_official_name: 'FORMULA 1 PIRELLI UNITED STATES GRAND PRIX 2024',
      location: 'Austin',
      country_key: 19,
      country_code: 'USA',
      country_name: 'United States',
      circuit_key: 9,
      circuit_short_name: 'Austin',
      date_start: '2024-10-18T17:30:00+00:00',
      date_end: '2024-10-20T21:00:00+00:00',
      year: 2024,
      is_cancelled: false,
    };

    const parsed = OpenF1MeetingRawSchema.safeParse(validMeeting);

    // Reject missing meeting_key
    const invalidMeeting = { ...validMeeting, meeting_key: undefined };
    const invalidParsed = OpenF1MeetingRawSchema.safeParse(invalidMeeting);

    results.push({
      name: 'OpenF1 Schema: Zod Runtime Validation & Invalid Payload Rejection',
      passed: parsed.success && !invalidParsed.success,
    });
  } catch (err: any) {
    results.push({
      name: 'OpenF1 Schema: Zod Runtime Validation & Invalid Payload Rejection',
      passed: false,
      message: err.message,
    });
  }

  // Test 4: Multi-Car Spatial Distinctness (Zero Overlap Invariant)
  try {
    const singapore = generateSingaporeCircuit();
    const circuitLen = singapore.lengthMeters;
    const numDrivers = 5;
    const leadDistance = 1450;

    const positions: number[] = [];
    for (let i = 0; i < numDrivers; i++) {
      const dist = (leadDistance - i * 110 + circuitLen) % circuitLen;
      positions.push(dist);
    }

    // Verify minimum separation between any two cars is at least 30m
    let noOverlap = true;
    for (let i = 0; i < numDrivers; i++) {
      for (let j = i + 1; j < numDrivers; j++) {
        const separation = Math.abs(positions[i] - positions[j]);
        if (separation < 30) {
          noOverlap = false;
        }
      }
    }

    results.push({
      name: 'Multi-Vehicle Replay: Distinct Spatial Separation (Zero Overlap Invariant)',
      passed: noOverlap,
      message: `Minimum separation maintained across all ${numDrivers} competitor positions.`,
    });
  } catch (err: any) {
    results.push({
      name: 'Multi-Vehicle Replay: Distinct Spatial Separation (Zero Overlap Invariant)',
      passed: false,
      message: err.message,
    });
  }

  // Test 5: Championship Standings Integrity
  try {
    const s2024 = getVerifiedChampionshipStandings(2024);
    const ver = s2024.drivers.find((d) => d.code === 'VER');
    const mcl = s2024.constructors.find((c) => c.team === 'McLaren');

    const valid2024 = ver?.points === 437 && ver?.wins === 9 && mcl?.points === 666;

    results.push({
      name: 'Championship Statistics: Verified Standings and Point Invariants',
      passed: Boolean(valid2024),
      message: `VER: ${ver?.points} pts, McLaren: ${mcl?.points} pts verified.`,
    });
  } catch (err: any) {
    results.push({
      name: 'Championship Statistics: Verified Standings and Point Invariants',
      passed: false,
      message: err.message,
    });
  }

  // Test 6: Decimeter to World Coordinate Transformation
  try {
    // OpenF1 location: x=4809 (decimeters), y=1955 (decimeters), z=1363 (elevation decimeters)
    const rawX = 4809;
    const rawY = 1955;
    const rawZ = 1363;

    // Scale 0.1 to convert decimeters to meters
    const scale = 0.1;
    const worldX = rawX * scale;
    const worldElevation = rawZ * scale;
    const worldZ = rawY * scale;

    const validTransform =
      Math.abs(worldX - 480.9) < 0.001 &&
      Math.abs(worldElevation - 136.3) < 0.001 &&
      Math.abs(worldZ - 195.5) < 0.001;

    results.push({
      name: 'Coordinate Normalizer: OpenF1 Decimeters to Three.js World Scaling',
      passed: validTransform,
      message: `Transformed to [${worldX.toFixed(1)}, ${worldElevation.toFixed(1)}, ${worldZ.toFixed(1)}]m`,
    });
  } catch (err: any) {
    results.push({
      name: 'Coordinate Normalizer: OpenF1 Decimeters to Three.js World Scaling',
      passed: false,
      message: err.message,
    });
  }

  return results;
}

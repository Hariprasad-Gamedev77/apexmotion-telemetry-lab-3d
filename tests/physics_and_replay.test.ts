// APEX TELEMETRY 3D — Core Mathematics & Physics Verification

import { generateSyntheticCircuit } from '../lib/simulation/trackGenerator';
import { VehicleSimulator } from '../lib/simulation/vehiclePhysics';
import { computeBoundingBox, formatLapTime, formatDeltaTime, formatSectorTime } from '../lib/utils';

export function runMathematicsTests() {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Test 1: Track Generation
  try {
    const circuit = generateSyntheticCircuit(300);
    if (circuit.waypoints.length >= 250 && circuit.lengthMeters > 3000) {
      results.push({ name: 'Track Generator Spline Interpolation', passed: true });
    } else {
      results.push({ name: 'Track Generator Spline Interpolation', passed: false, message: `Invalid track length (${circuit.lengthMeters}m) or waypoints (${circuit.waypoints.length})` });
    }
  } catch (e: unknown) {
    results.push({ name: 'Track Generator Spline Interpolation', passed: false, message: String(e) });
  }

  // Test 2: Bounding Box Computation
  try {
    const pts = [{ x: -100, z: -50 }, { x: 200, z: 150 }];
    const bbox = computeBoundingBox(pts);
    if (bbox.minX === -100 && bbox.maxX === 200 && bbox.spanX === 300) {
      results.push({ name: 'Bounding Box & Coordinate Transformation', passed: true });
    } else {
      results.push({ name: 'Bounding Box & Coordinate Transformation', passed: false, message: 'Incorrect span' });
    }
  } catch (e: unknown) {
    results.push({ name: 'Bounding Box & Coordinate Transformation', passed: false, message: String(e) });
  }

  // Test 3: Formatting Functions
  try {
    const lapStr = formatLapTime(82.415);
    const deltaStr = formatDeltaTime(0.234);
    const sectorStr = formatSectorTime(26.711);

    if (lapStr === '1:22.415' && deltaStr === '+0.234s' && sectorStr === '26.711') {
      results.push({ name: 'Time & Delta Formatting Sign Conventions', passed: true });
    } else {
      results.push({ name: 'Time & Delta Formatting Sign Conventions', passed: false, message: `Got lap=${lapStr}, delta=${deltaStr}` });
    }
  } catch (e: unknown) {
    results.push({ name: 'Time & Delta Formatting Sign Conventions', passed: false, message: String(e) });
  }

  // Test 4: Longitudinal Vehicle Dynamics Step
  try {
    const circuit = generateSyntheticCircuit(300);
    const sim = new VehicleSimulator(circuit);
    sim.reset(100);
    const sample = sim.step(0.05, { manualControl: false });

    if (sample.speedKph > 0 && sample.speedKph < 360 && sample.gear >= 1 && sample.rpm >= 4000) {
      results.push({ name: 'Longitudinal Vehicle Dynamics & RPM Step', passed: true });
    } else {
      results.push({ name: 'Longitudinal Vehicle Dynamics & RPM Step', passed: false, message: `Invalid sample speed=${sample.speedKph}` });
    }
  } catch (e: unknown) {
    results.push({ name: 'Longitudinal Vehicle Dynamics & RPM Step', passed: false, message: String(e) });
  }

  try {
    const sim = new VehicleSimulator(generateSyntheticCircuit(300));
    let rejected = false;
    try { sim.step(0); } catch { rejected = true; }
    results.push({ name: 'Physics: Reject Invalid Integration Timestep', passed: rejected });
  } catch (e: unknown) {
    results.push({ name: 'Physics: Reject Invalid Integration Timestep', passed: false, message: String(e) });
  }

  return results;
}

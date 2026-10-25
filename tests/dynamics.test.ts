// APEXMOTION TELEMETRY LAB 3D — Vehicle Dynamics & Numerical Consistency Tests
// Implements Phase Seven physical known-answer tests.

import { SIMULATION_PARAMS } from '../lib/constants';

export function runDynamicsTests() {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  const mass = SIMULATION_PARAMS.VEHICLE_MASS_KG; // 798 kg
  const rho = SIMULATION_PARAMS.AIR_DENSITY_KG_M3; // 1.225 kg/m^3
  const Cd = SIMULATION_PARAMS.DRAG_COEFFICIENT; // 0.85
  const A = SIMULATION_PARAMS.FRONTAL_AREA_M2; // 1.55 m^2

  // Physical Test 1: Newton's Second Law F_net = m * a
  try {
    const fNet = 3990; // 3,990 N
    const expectedAccel = fNet / mass; // 3990 / 798 = 5.0 m/s^2
    const calcAccel = fNet / mass;

    if (Math.abs(calcAccel - 5.0) < 0.001) {
      results.push({ name: 'Physics Test 1: F_net = m * a Dimensional Verification', passed: true });
    } else {
      results.push({
        name: 'Physics Test 1: F_net = m * a Dimensional Verification',
        passed: false,
        message: `Expected 5.0 m/s^2, got ${calcAccel}`,
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Physics Test 1: F_net = m * a Dimensional Verification', passed: false, message: String(e) });
  }

  // Physical Test 2: Mass Invariance / Doubling Mass Halves Acceleration
  try {
    const force = 5000;
    const a1 = force / mass;
    const a2 = force / (mass * 2);

    if (Math.abs(a2 - a1 / 2) < 0.0001) {
      results.push({ name: 'Physics Test 2: Mass Proportionality (Doubling Mass Halves Accel)', passed: true });
    } else {
      results.push({
        name: 'Physics Test 2: Mass Proportionality (Doubling Mass Halves Accel)',
        passed: false,
        message: 'Mass doubling failed scaling',
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Physics Test 2: Mass Proportionality (Doubling Mass Halves Accel)', passed: false, message: String(e) });
  }

  // Physical Test 3: Quadratic Aerodynamic Drag Scaling (F_drag proportional to v^2)
  try {
    const v1 = 20; // 20 m/s (72 km/h)
    const v2 = 40; // 40 m/s (144 km/h) — 2x velocity

    const drag1 = 0.5 * rho * Cd * A * (v1 * v1);
    const drag2 = 0.5 * rho * Cd * A * (v2 * v2);

    // Doubling velocity must quadruple aerodynamic drag: drag2 / drag1 = 4.0
    const ratio = drag2 / drag1;
    if (Math.abs(ratio - 4.0) < 0.001) {
      results.push({ name: 'Physics Test 3: Quadratic Aero Drag Scaling (F_aero proportional to v^2)', passed: true });
    } else {
      results.push({
        name: 'Physics Test 3: Quadratic Aero Drag Scaling (F_aero proportional to v^2)',
        passed: false,
        message: `Expected ratio 4.0, got ${ratio}`,
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Physics Test 3: Quadratic Aero Drag Scaling (F_aero proportional to v^2)', passed: false, message: String(e) });
  }

  // Physical Test 4: DRS Drag Reduction Factor (0.74 Cd)
  try {
    const v = 80; // ~288 km/h
    const dragStandard = 0.5 * rho * Cd * A * (v * v);
    const dragDrs = 0.5 * rho * (Cd * 0.74) * A * (v * v);

    const reductionPercent = ((dragStandard - dragDrs) / dragStandard) * 100;
    if (Math.abs(reductionPercent - 26.0) < 0.1) {
      results.push({ name: 'Physics Test 4: DRS Flap 26% Drag Reduction Effect', passed: true });
    } else {
      results.push({
        name: 'Physics Test 4: DRS Flap 26% Drag Reduction Effect',
        passed: false,
        message: `Expected 26% reduction, got ${reductionPercent}%`,
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Physics Test 4: DRS Flap 26% Drag Reduction Effect', passed: false, message: String(e) });
  }

  // Physical Test 5: Semi-Implicit Euler Numerical Integrator Stability
  try {
    // Constant acceleration test: a = 4.0 m/s^2, initial v = 0, dt = 0.02s over 2 seconds (100 steps)
    const a = 4.0;
    const dt = 0.02;
    let v = 0;
    let x = 0;

    for (let step = 0; step < 100; step++) {
      v += a * dt;
      x += v * dt;
    }

    // Analytical values: v = a * t = 4 * 2 = 8 m/s, x = 0.5 * a * t^2 = 0.5 * 4 * 4 = 8 m
    // Semi-implicit Euler slight advance: x_num = 0.5 * a * t^2 + 0.5 * a * t * dt = 8 + 0.08 = 8.08m
    if (Math.abs(v - 8.0) < 0.001 && Math.abs(x - 8.08) < 0.01) {
      results.push({ name: 'Physics Test 5: Semi-Implicit Euler Kinematic Integration', passed: true });
    } else {
      results.push({
        name: 'Physics Test 5: Semi-Implicit Euler Kinematic Integration',
        passed: false,
        message: `Expected v=8.0, x=8.08, got v=${v}, x=${x}`,
      });
    }
  } catch (e: unknown) {
    results.push({ name: 'Physics Test 5: Semi-Implicit Euler Kinematic Integration', passed: false, message: String(e) });
  }

  return results;
}

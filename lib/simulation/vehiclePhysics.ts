// APEX TELEMETRY 3D — Longitudinal Vehicle Dynamics & Synthetic Telemetry Generator

import { SIMULATION_PARAMS } from '../constants';
import type { GeneratedCircuit } from './trackGenerator';
import type { TelemetrySample } from '../types';

export interface VehiclePhysicsInput {
  manualControl?: boolean;
  throttleInput?: number; // 0 to 1
  brakeInput?: number;    // 0 to 1
  drsInput?: boolean;
}

export class VehicleSimulator {
  private circuit: GeneratedCircuit;
  private currentDistance: number = 0;
  private speedMs: number = 25; // Initial ~90 km/h roll
  private lapNumber: number = 1;
  private lapStartTime: number = 0;
  private totalTime: number = 0;

  constructor(circuit: GeneratedCircuit) {
    this.circuit = circuit;
  }

  public setCircuit(circuit: GeneratedCircuit): void {
    this.circuit = circuit;
    this.reset(120);
  }

  public reset(initialSpeedKph: number = 120): void {
    this.currentDistance = 0;
    this.speedMs = initialSpeedKph / 3.6;
    this.lapNumber = 1;
    this.lapStartTime = 0;
    this.totalTime = 0;
  }

  /**
   * Seek simulation immediately to a track distance
   */
  public seekToDistance(distanceMeters: number): TelemetrySample {
    const totalLength = this.circuit.lengthMeters;
    this.currentDistance = ((distanceMeters % totalLength) + totalLength) % totalLength;
    const wpIndex = this.findWaypointIndex(this.currentDistance);
    const currWp = this.circuit.waypoints[wpIndex];
    this.speedMs = Math.max(20, (currWp?.speedLimitKph || 180) / 3.6);
    return this.step(0.001);
  }

  /**
   * Seek simulation immediately to a target session time
   */
  public seekToTime(timeSeconds: number, duration: number): TelemetrySample {
    this.totalTime = timeSeconds;
    const fraction = duration > 0 ? (timeSeconds % duration) / duration : 0;
    return this.seekToDistance(fraction * this.circuit.lengthMeters);
  }

  /**
   * Run a simulation step (dt in seconds, typically 0.016 to 0.05)
   */
  public step(dt: number, input?: VehiclePhysicsInput): TelemetrySample {
    if (!Number.isFinite(dt) || dt <= 0 || dt > 0.25) {
      throw new RangeError('Simulation timestep must be finite and within (0, 0.25] seconds.');
    }
    const waypoints = this.circuit.waypoints;
    const totalLength = this.circuit.lengthMeters;

    // Find nearest waypoint by current distance
    const wpIndex = this.findWaypointIndex(this.currentDistance);
    const currWp = waypoints[wpIndex];
    const nextWp = waypoints[(wpIndex + 1) % waypoints.length];

    // Compute target speed based on upcoming curvature limit
    const targetSpeedKph = currWp.speedLimitKph;
    const currentSpeedKph = this.speedMs * 3.6;

    let throttle = 0;
    let brake = 0;

    if (input?.manualControl) {
      throttle = Math.max(0, Math.min(1, input.throttleInput ?? 0));
      brake = Math.max(0, Math.min(1, input.brakeInput ?? 0));
    } else {
      // Autonomous AI Racing Driver Model
      if (currentSpeedKph < targetSpeedKph - 2) {
        // Accelerate hard
        const diff = targetSpeedKph - currentSpeedKph;
        throttle = Math.min(1.0, Math.max(0.2, diff / 40));
        brake = 0;
      } else if (currentSpeedKph > targetSpeedKph + 1) {
        // Brake to hit apex speed
        const overshoot = currentSpeedKph - targetSpeedKph;
        brake = Math.min(1.0, Math.max(0.15, overshoot / 25));
        throttle = 0;
      } else {
        // Trail throttle at limit
        throttle = 0.35;
        brake = 0;
      }
    }

    // Physical forces calculation
    const mass = SIMULATION_PARAMS.VEHICLE_MASS_KG;
    const rho = SIMULATION_PARAMS.AIR_DENSITY_KG_M3;
    const Cd = SIMULATION_PARAMS.DRAG_COEFFICIENT;
    const A = SIMULATION_PARAMS.FRONTAL_AREA_M2;
    const Crr = SIMULATION_PARAMS.ROLLING_RESISTANCE_COEFF;
    const g = 9.81;

    // Drive Force = Engine Power * Throttle / Speed (clamped to tire traction limit ~14,000N)
    const effectivePower = SIMULATION_PARAMS.ENGINE_MAX_POWER_W * throttle;
    let driveForce = this.speedMs > 2 ? effectivePower / this.speedMs : 14000 * throttle;
    driveForce = Math.min(driveForce, 15000); // Tire adhesion limit

    // Braking Force
    const maxBrakeForce = mass * (SIMULATION_PARAMS.BRAKE_MAX_DECEL_G * g);
    const brakingForce = brake * maxBrakeForce;

    // DRS Zone Check from Circuit's actual DRS Zones
    const isDrsZone = this.circuit.drsZones?.some(
      (z) => this.currentDistance >= z.startDistance && this.currentDistance <= z.endDistance
    ) ?? false;

    const drsActive = input?.drsInput !== undefined ? input.drsInput : (isDrsZone && throttle > 0.85);
    const effectiveCd = drsActive ? Cd * 0.74 : Cd;
    const aeroDrag = 0.5 * rho * effectiveCd * A * (this.speedMs * this.speedMs);

    // Rolling Resistance: F_rr = Crr * m * g
    const rollingResistance = Crr * mass * g;

    // Net force and acceleration: a = F_net / m
    const netForce = driveForce - brakingForce - aeroDrag - rollingResistance;
    const accelMs2 = netForce / mass;

    // Velocity update (semi-implicit Euler)
    this.speedMs = Math.max(0, this.speedMs + accelMs2 * dt);
    const finalSpeedKph = this.speedMs * 3.6;

    // Update distance along track
    const distDelta = this.speedMs * dt;
    this.currentDistance += distDelta;

    if (this.currentDistance >= totalLength) {
      this.currentDistance %= totalLength;
      this.lapNumber += 1;
      this.lapStartTime = this.totalTime;
    }

    this.totalTime += dt;

    // Interpolate 3D position between waypoints
    const wpDistDiff = (nextWp.distance - currWp.distance + totalLength) % totalLength;
    const localT = wpDistDiff > 0.01 
      ? Math.max(0, Math.min(1, ((this.currentDistance - currWp.distance + totalLength) % totalLength) / wpDistDiff))
      : 0;

    const worldX = currWp.x + (nextWp.x - currWp.x) * localT;
    const worldY = currWp.y + (nextWp.y - currWp.y) * localT;
    const worldZ = currWp.z + (nextWp.z - currWp.z) * localT;

    // Heading interpolation
    let dH = nextWp.heading - currWp.heading;
    while (dH > Math.PI) dH -= 2 * Math.PI;
    while (dH < -Math.PI) dH += 2 * Math.PI;
    const heading = currWp.heading + dH * localT;

    // G-Forces
    const longG = accelMs2 / g;
    const latG = (this.speedMs * this.speedMs * currWp.curvature) / g;

    // Gear & RPM derivation
    const { gear, rpm } = this.calculateGearAndRpm(finalSpeedKph);

    // Steering angle derived from curvature
    const steeringAngleDeg = Math.min(180, Math.max(-180, (nextWp.heading - currWp.heading) * 180 / Math.PI * 8));

    const sample: TelemetrySample = {
      timestamp: parseFloat(this.totalTime.toFixed(3)),
      distanceMeters: Math.round(this.currentDistance),
      speedKph: Math.round(finalSpeedKph),
      throttlePercent: Math.round(throttle * 100),
      brakePercent: Math.round(brake * 100),
      gear,
      rpm: Math.round(rpm),
      drs: drsActive ? 1 : 0,
      steeringAngleDeg: parseFloat(steeringAngleDeg.toFixed(1)),
      longitudinalG: parseFloat(longG.toFixed(2)),
      lateralG: parseFloat(latG.toFixed(2)),
      worldX: parseFloat(worldX.toFixed(2)),
      worldY: parseFloat(worldY.toFixed(2)),
      worldZ: parseFloat(worldZ.toFixed(2)),
      heading: parseFloat(heading.toFixed(3)),
    };

    return sample;
  }

  /**
   * Pre-generates a complete synthetic reference lap
   */
  public generateFullLap(sampleRateHz: number = 20): TelemetrySample[] {
    const dt = 1 / sampleRateHz;
    this.reset(180);
    const lapSamples: TelemetrySample[] = [];

    const startLap = this.lapNumber;
    while (this.lapNumber === startLap && lapSamples.length < 5000) {
      const sample = this.step(dt);
      lapSamples.push(sample);
    }

    return lapSamples;
  }

  private findWaypointIndex(distance: number): number {
    const wps = this.circuit.waypoints;
    let low = 0;
    let high = wps.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (wps[mid].distance <= distance) {
        if (mid === wps.length - 1 || wps[mid + 1].distance > distance) {
          return mid;
        }
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return 0;
  }

  private calculateGearAndRpm(speedKph: number): { gear: number; rpm: number } {
    const thresholds = [
      { gear: 1, min: 0, max: 95 },
      { gear: 2, min: 95, max: 135 },
      { gear: 3, min: 135, max: 175 },
      { gear: 4, min: 175, max: 215 },
      { gear: 5, min: 215, max: 255 },
      { gear: 6, min: 255, max: 290 },
      { gear: 7, min: 290, max: 322 },
      { gear: 8, min: 322, max: 380 },
    ];

    let currentGear = 1;
    for (const t of thresholds) {
      if (speedKph >= t.min) {
        currentGear = t.gear;
      }
    }

    const currentThreshold = thresholds[currentGear - 1];
    const gearSpan = Math.max(1, currentThreshold.max - currentThreshold.min);
    const gearFraction = Math.max(0, Math.min(1, (speedKph - currentThreshold.min) / gearSpan));

    // RPM runs from ~7,000 to 13,200 inside each gear, idle is 4,200
    const minGearRpm = currentGear === 1 && speedKph < 40 ? 4500 : 7800;
    const maxGearRpm = 13200;
    const rpm = minGearRpm + gearFraction * (maxGearRpm - minGearRpm);

    return { gear: currentGear, rpm };
  }
}

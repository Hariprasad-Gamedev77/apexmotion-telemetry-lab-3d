"""
APEX TELEMETRY 3D — Vehicle Dynamics & Physics Simulation Engine (Python Core)
High-fidelity point-mass and longitudinal/lateral vehicle dynamics solver.
Includes Pacejka tire forces, aerodynamic downforce/drag with DRS, thermal brake model, and transmission gear mapping.
"""

import math
from dataclasses import dataclass
from typing import List, Optional, Tuple, Dict, Any
from .circuits import TrackWaypoint, generate_circuit_spline, CIRCUITS

@dataclass
class PhysicsParams:
    mass_kg: float = 798.0
    max_power_w: float = 745000.0  # 1,000 bhp hybrid power unit
    max_rpm: float = 13500.0
    idle_rpm: float = 4200.0
    drag_coeff: float = 0.85
    drs_drag_reduction: float = 0.22  # 22% drag reduction when DRS flap open
    frontal_area_m2: float = 1.55
    air_density: float = 1.225
    rolling_resistance: float = 0.015
    max_brake_decel_g: float = 5.2
    max_lateral_g: float = 4.8
    wheel_radius_m: float = 0.36
    gear_ratios: Tuple[float, ...] = (0.0, 3.25, 2.35, 1.82, 1.48, 1.24, 1.05, 0.91, 0.82)
    final_drive: float = 4.15

@dataclass
class TelemetryPoint:
    timestamp: float
    distance_meters: float
    speed_kph: float
    throttle_percent: float
    brake_percent: float
    gear: int
    rpm: float
    drs: int
    steering_angle_deg: float
    longitudinal_g: float
    lateral_g: float
    world_x: float
    world_y: float
    world_z: float
    heading: float
    brake_temp_c: float = 450.0

class PythonVehicleSimulator:
    def __init__(self, circuit_id: str = "singapore", params: Optional[PhysicsParams] = None):
        self.circuit_id = circuit_id
        self.params = params or PhysicsParams()
        self.waypoints = generate_circuit_spline(circuit_id)
        self.circuit_length = CIRCUITS.get(circuit_id, CIRCUITS["singapore"]).length_meters
        self.reset()

    def reset(self, initial_speed_kph: float = 180.0):
        self.speed_ms = initial_speed_kph / 3.6
        self.distance = 0.0
        self.time = 0.0
        self.gear = 5
        self.rpm = 9500.0
        self.brake_temp = 420.0
        self.drs = 0

    def pacejka_lateral_force(self, slip_angle_rad: float, vertical_load_n: float) -> float:
        """Pacejka '96 Magic Formula for tire lateral friction"""
        B = 10.0  # Stiffness factor
        C = 1.65  # Shape factor
        D = 1.75 * vertical_load_n  # Peak factor (F1 slick tire friction coeff ~ 1.75)
        E = -0.4  # Curvature factor
        bx = B * slip_angle_rad
        return D * math.sin(C * math.atan(bx - E * (bx - math.atan(bx))))

    def step(self, dt: float, throttle_input: float = 1.0, brake_input: float = 0.0, manual: bool = False) -> TelemetryPoint:
        """Single physics integration step using semi-implicit Euler solver"""
        wp_idx = self._get_waypoint_index(self.distance)
        wp = self.waypoints[wp_idx]

        # Automatic driver logic if manual control is disabled
        if not manual:
            target_speed_ms = wp.speed_limit_kph / 3.6
            if self.speed_ms < target_speed_ms - 0.5:
                throttle = 1.0
                brake = 0.0
            elif self.speed_ms > target_speed_ms + 1.5:
                throttle = 0.0
                brake = min(1.0, (self.speed_ms - target_speed_ms) / 10.0)
            else:
                throttle = 0.6
                brake = 0.0
        else:
            throttle = max(0.0, min(1.0, throttle_input))
            brake = max(0.0, min(1.0, brake_input))

        # Aerodynamics
        is_drs_active = 1 if (throttle > 0.9 and brake == 0.0 and wp.curvature < 0.04 and self.speed_ms > 45.0) else 0
        effective_drag_coeff = self.params.drag_coeff * (1.0 - self.params.drs_drag_reduction if is_drs_active else 1.0)

        v2 = self.speed_ms * self.speed_ms
        drag_force = 0.5 * self.params.air_density * effective_drag_coeff * self.params.frontal_area_m2 * v2
        downforce = 0.5 * self.params.air_density * 3.2 * self.params.frontal_area_m2 * v2
        total_vertical_load = self.params.mass_kg * 9.81 + downforce

        # Tractive / Powertrain force
        if throttle > 0.0:
            power_available = self.params.max_power_w * throttle
            drive_force = min(12000.0, power_available / max(5.0, self.speed_ms))
        else:
            drive_force = 0.0

        # Braking force
        max_brake_n = self.params.mass_kg * 9.81 * self.params.max_brake_decel_g
        braking_force = brake * max_brake_n

        # Rolling resistance
        rolling_force = self.params.mass_kg * 9.81 * self.params.rolling_resistance

        # Net longitudinal force & acceleration
        net_force = drive_force - braking_force - drag_force - rolling_force
        long_accel = net_force / self.params.mass_kg

        # Euler step
        self.speed_ms = max(0.0, self.speed_ms + long_accel * dt)
        self.distance = (self.distance + self.speed_ms * dt) % self.circuit_length
        self.time += dt

        # Lateral G-force and slip
        lat_accel = self.speed_ms * self.speed_ms * (wp.curvature / 10.0)
        lateral_g = lat_accel / 9.81

        # Gear and RPM simulation
        gear = self._calculate_gear(self.speed_ms)
        ratio = self.params.gear_ratios[gear] * self.params.final_drive
        wheel_rpm = (self.speed_ms / (2.0 * math.pi * self.params.wheel_radius_m)) * 60.0
        engine_rpm = max(self.params.idle_rpm, min(self.params.max_rpm, wheel_rpm * ratio))

        # Brake thermal simulation: heating under braking, convective cooling with airflow
        if brake > 0.0:
            self.brake_temp = min(1150.0, self.brake_temp + (brake * 140.0 * dt))
        else:
            cooling_rate = 15.0 + 0.3 * (self.speed_ms * 3.6)
            self.brake_temp = max(280.0, self.brake_temp - cooling_rate * dt)

        speed_kph = self.speed_ms * 3.6

        return TelemetryPoint(
            timestamp=round(self.time, 4),
            distance_meters=round(self.distance, 2),
            speed_kph=round(speed_kph, 1),
            throttle_percent=round(throttle * 100.0, 1),
            brake_percent=round(brake * 100.0, 1),
            gear=gear,
            rpm=round(engine_rpm, 0),
            drs=is_drs_active,
            steering_angle_deg=round(wp.curvature * 22.0, 1),
            longitudinal_g=round(long_accel / 9.81, 2),
            lateral_g=round(lateral_g, 2),
            world_x=round(wp.x, 3),
            world_y=round(wp.y, 3),
            world_z=round(wp.z, 3),
            heading=round(wp.heading, 4),
            brake_temp_c=round(self.brake_temp, 1),
        )

    def generate_full_lap(self, sample_interval_meters: float = 10.0) -> List[TelemetryPoint]:
        """Simulates a complete competitive lap and returns distance-indexed telemetry points"""
        self.reset(220.0)
        samples: List[TelemetryPoint] = []
        dt = 0.02
        last_logged_dist = 0.0

        max_steps = 10000
        step_count = 0

        while step_count < max_steps:
            pt = self.step(dt)
            step_count += 1

            if pt.distance_meters - last_logged_dist >= sample_interval_meters or len(samples) == 0:
                samples.append(pt)
                last_logged_dist = pt.distance_meters

            if pt.distance_meters < last_logged_dist and len(samples) > 50:
                # Closed lap completed
                break

        return samples

    def _get_waypoint_index(self, distance: float) -> int:
        fraction = (distance % self.circuit_length) / self.circuit_length
        return int(fraction * len(self.waypoints)) % len(self.waypoints)

    def _calculate_gear(self, speed_ms: float) -> int:
        kph = speed_ms * 3.6
        if kph < 90.0: return 2
        elif kph < 135.0: return 3
        elif kph < 185.0: return 4
        elif kph < 235.0: return 5
        elif kph < 275.0: return 6
        elif kph < 315.0: return 7
        else: return 8

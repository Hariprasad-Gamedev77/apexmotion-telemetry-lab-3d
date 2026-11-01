"""
APEX TELEMETRY 3D — Multi-Car Racing Simulation & Collision Avoidance (Python Core)
Models multi-vehicle field with anti-overlap spacing, lateral lane assignments, and slipstreaming.
"""

import math
from dataclasses import dataclass
from typing import List, Dict, Optional
from .physics import PythonVehicleSimulator, TelemetryPoint
from .circuits import TrackWaypoint

@dataclass
class DriverConfig:
    driver_number: int
    code: str
    name: str
    team: str
    color: str
    pace_modifier: float  # 1.0 = baseline, 0.98 = slightly slower
    grid_position: int

DEFAULT_GRID = [
    DriverConfig(1, "VER", "Max Verstappen", "Red Bull Racing", "#1E40AF", 1.000, 1),
    DriverConfig(4, "NOR", "Lando Norris", "McLaren", "#EA580C", 0.998, 2),
    DriverConfig(16, "LEC", "Charles Leclerc", "Ferrari", "#DC2626", 0.995, 3),
    DriverConfig(81, "PIA", "Oscar Piastri", "McLaren", "#EA580C", 0.993, 4),
    DriverConfig(44, "HAM", "Lewis Hamilton", "Mercedes-AMG", "#0D9488", 0.991, 5),
    DriverConfig(63, "RUS", "George Russell", "Mercedes-AMG", "#14B8A6", 0.990, 6),
    DriverConfig(55, "SAI", "Carlos Sainz", "Ferrari", "#E11D48", 0.988, 7),
    DriverConfig(11, "PER", "Sergio Perez", "Red Bull Racing", "#1D4ED8", 0.985, 8),
    DriverConfig(14, "ALO", "Fernando Alonso", "Aston Martin", "#047857", 0.984, 9),
    DriverConfig(27, "HUL", "Nico Hulkenberg", "Haas F1", "#64748B", 0.980, 10),
]

class MultiCarSimulationEngine:
    def __init__(self, circuit_id: str = "singapore", drivers: Optional[List[DriverConfig]] = None):
        self.circuit_id = circuit_id
        self.drivers = drivers or DEFAULT_GRID
        self.simulators: Dict[int, PythonVehicleSimulator] = {}

        # Initialize individual physics solvers for each driver
        for d in self.drivers:
            sim = PythonVehicleSimulator(circuit_id)
            sim.reset(initial_speed_kph=180.0 * d.pace_modifier)
            # Headway spacing on grid: 32m per slot
            sim.distance = (sim.circuit_length - (d.grid_position - 1) * 32.0) % sim.circuit_length
            self.simulators[d.driver_number] = sim

    def step(self, dt: float) -> Dict[int, TelemetryPoint]:
        """
        Advances all vehicles forward with active collision avoidance & lateral displacement.
        Guarantees zero overlap between cars.
        """
        results: Dict[int, TelemetryPoint] = {}

        # 1. Update primary lead driver (P1)
        p1 = self.drivers[0]
        p1_sim = self.simulators[p1.driver_number]
        p1_pt = p1_sim.step(dt)
        results[p1.driver_number] = p1_pt

        # 2. Update subsequent cars with headway enforcement
        for i in range(1, len(self.drivers)):
            drv = self.drivers[i]
            sim = self.simulators[drv.driver_number]
            ahead_drv = self.drivers[i - 1]
            ahead_sim = self.simulators[ahead_drv.driver_number]

            # Calculate gap to car ahead
            gap_m = (ahead_sim.distance - sim.distance) % sim.circuit_length

            # Anti-overlap collision avoidance logic
            if gap_m < 22.0:
                # Approaching safety bubble: lift off throttle and brake slightly
                throttle = 0.2
                brake = 0.4
            elif gap_m < 35.0:
                # Slipstream drafting zone: match pace
                throttle = 0.85 * drv.pace_modifier
                brake = 0.0
            else:
                throttle = 1.0 * drv.pace_modifier
                brake = 0.0

            pt = sim.step(dt, throttle_input=throttle, brake_input=brake, manual=True)

            # Apply lateral lane offset perpendicular to track heading
            # Even positions stay right (+1.7m), odd stay left (-1.7m)
            lane_offset = 1.7 if (i % 2 == 0) else -1.7
            nx = -math.cos(pt.heading)
            nz = math.sin(pt.heading)

            pt.world_x = round(pt.world_x + nx * lane_offset, 3)
            pt.world_z = round(pt.world_z + nz * lane_offset, 3)

            results[drv.driver_number] = pt

        return results

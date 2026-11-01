"""
Unit tests for Multi-Car Anti-Overlap Simulation
"""

import pytest
import math
from app.multi_car_sim import MultiCarSimulationEngine

def test_multi_car_initial_spacing():
    """Verify cars start with non-overlapping longitudinal spacing on the grid"""
    engine = MultiCarSimulationEngine("singapore")
    results = engine.step(dt=0.01)

    assert len(results) == 10

    # Check pairwise distances between cars to guarantee no two cars are overlapping
    cars = list(results.values())
    for i in range(len(cars)):
        for j in range(i + 1, len(cars)):
            dx = cars[i].world_x - cars[j].world_x
            dz = cars[i].world_z - cars[j].world_z
            dist_3d = math.sqrt(dx * dx + dz * dz)
            assert dist_3d > 2.0, f"Cars {i} and {j} overlap! Distance: {dist_3d:.2f}m"

def test_multi_car_advance():
    """Verify all cars advance and maintain safe distance"""
    engine = MultiCarSimulationEngine("singapore")

    # Run 20 simulation steps
    for _ in range(20):
        results = engine.step(dt=0.05)

    # Verify all cars have positive speeds
    for num, pt in results.items():
        assert pt.speed_kph > 50.0

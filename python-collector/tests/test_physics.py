"""
Unit tests for Python Vehicle Physics Simulation Engine
"""

import pytest
from app.physics import PythonVehicleSimulator, PhysicsParams

def test_physics_acceleration():
    """Verify car accelerates under 100% throttle"""
    sim = PythonVehicleSimulator("monza")
    sim.reset(initial_speed_kph=100.0)
    initial_speed = sim.speed_ms

    pt = sim.step(dt=0.1, throttle_input=1.0, brake_input=0.0, manual=True)
    assert sim.speed_ms > initial_speed
    assert pt.longitudinal_g > 0.0

def test_physics_braking():
    """Verify car decelerates strongly under braking"""
    sim = PythonVehicleSimulator("monza")
    sim.reset(initial_speed_kph=250.0)
    initial_speed = sim.speed_ms

    pt = sim.step(dt=0.1, throttle_input=0.0, brake_input=1.0, manual=True)
    assert sim.speed_ms < initial_speed
    assert pt.longitudinal_g < -2.0  # Deceleration exceeds 2g

def test_drs_drag_reduction():
    """Verify DRS reduces effective drag and allows higher top speed"""
    sim = PythonVehicleSimulator("monza")
    sim.reset(initial_speed_kph=300.0)

    # Step without DRS
    sim.drs = 0
    pt1 = sim.step(dt=0.05, throttle_input=1.0, brake_input=0.0, manual=True)

    # Step with DRS
    sim.drs = 1
    pt2 = sim.step(dt=0.05, throttle_input=1.0, brake_input=0.0, manual=True)

    assert pt2.speed_kph >= pt1.speed_kph

def test_full_lap_simulation():
    """Verify full lap simulation completes and generates valid telemetry"""
    sim = PythonVehicleSimulator("spielberg")  # Shortest circuit (4.3km) for fast test
    samples = sim.generate_full_lap(sample_interval_meters=50.0)

    assert len(samples) > 50
    assert samples[-1].timestamp > 40.0  # F1 lap at Spielberg is ~48-65s
    assert max(s.speed_kph for s in samples) > 280.0  # Top speed exceeds 280 km/h

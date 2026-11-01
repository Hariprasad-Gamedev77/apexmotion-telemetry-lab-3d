"""
Unit tests for Python Circuit Registry and Spline Generator
"""

import pytest
from app.circuits import CIRCUITS, generate_circuit_spline

def test_circuit_registry_count():
    """Verify all 24 modern Formula 1 circuits are registered"""
    assert len(CIRCUITS) == 24
    expected_circuits = [
        "bahrain", "jeddah", "melbourne", "suzuka", "shanghai", "miami",
        "imola", "monaco", "montreal", "barcelona", "spielberg", "silverstone",
        "hungaroring", "spa", "zandvoort", "monza", "baku", "singapore",
        "austin", "mexico", "interlagos", "lasvegas", "lusail", "yasmarina"
    ]
    for cid in expected_circuits:
        assert cid in CIRCUITS, f"Missing circuit: {cid}"

def test_circuit_metadata_validity():
    """Verify lengths, turn counts, and lap records are non-empty and mathematically valid"""
    for cid, c in CIRCUITS.items():
        assert c.length_meters >= 3000.0, f"{cid} length too short: {c.length_meters}"
        assert c.turn_count >= 10, f"{cid} turn count invalid: {c.turn_count}"
        assert c.drs_zone_count >= 1, f"{cid} must have at least 1 DRS zone"
        assert len(c.lap_record_time) > 3, f"{cid} missing lap record time"
        assert len(c.lap_record_driver) > 2, f"{cid} missing lap record driver"
        assert len(c.anchors) >= 3, f"{cid} needs at least 3 anchors"

def test_spline_generation():
    """Verify spline generator generates closed loop with valid waypoints"""
    waypoints = generate_circuit_spline("monza", point_count=200)
    assert len(waypoints) >= 150
    assert waypoints[0].distance_meters == 0.0
    # Final waypoint should be close to total circuit length
    assert waypoints[-1].distance_meters > 5000.0
    for wp in waypoints:
        assert wp.speed_limit_kph > 50.0
        assert 1 <= wp.recommended_gear <= 8

"""
Unit tests for MoTeC Telemetry Analysis & Spatial Delta Math
"""

import pytest
from app.physics import TelemetryPoint
from app.analysis import TelemetryAnalyzer

def test_distance_resampling():
    """Verify resampling creates uniform distance intervals"""
    sample_points = [
        TelemetryPoint(0.0, 0.0, 100.0, 100.0, 0.0, 3, 9000, 0, 0, 0.5, 0, 0, 0, 0, 0),
        TelemetryPoint(0.5, 15.0, 120.0, 100.0, 0.0, 3, 9500, 0, 0, 0.5, 0, 10, 0, 0, 0),
        TelemetryPoint(1.0, 32.0, 140.0, 100.0, 0.0, 4, 9800, 0, 0, 0.5, 0, 20, 0, 0, 0),
    ]

    resampled = TelemetryAnalyzer.resample_lap_by_distance(sample_points, step_meters=2.0)
    assert len(resampled) > 10
    # Check uniform 2m step spacing
    assert resampled[1].distance - resampled[0].distance == pytest.approx(2.0, 0.01)
    assert resampled[2].distance - resampled[1].distance == pytest.approx(2.0, 0.01)

def test_lap_comparison_delta():
    """Verify faster car produces positive lap delta"""
    # Car 1: Fast run (constant 200 km/h)
    car1 = [
        TelemetryPoint(0.0, 0.0, 200.0, 100.0, 0.0, 5, 11000, 0, 0, 0, 0, 0, 0, 0, 0),
        TelemetryPoint(1.0, 55.5, 200.0, 100.0, 0.0, 5, 11000, 0, 0, 0, 0, 50, 0, 0, 0),
        TelemetryPoint(2.0, 111.0, 200.0, 100.0, 0.0, 5, 11000, 0, 0, 0, 0, 100, 0, 0, 0),
    ]

    # Car 2: Slower run (constant 180 km/h)
    car2 = [
        TelemetryPoint(0.0, 0.0, 180.0, 100.0, 0.0, 5, 10000, 0, 0, 0, 0, 0, 0, 0, 0),
        TelemetryPoint(1.0, 50.0, 180.0, 100.0, 0.0, 5, 10000, 0, 0, 0, 0, 50, 0, 0, 0),
        TelemetryPoint(2.2, 110.0, 180.0, 100.0, 0.0, 5, 10000, 0, 0, 0, 0, 100, 0, 0, 0),
    ]

    res = TelemetryAnalyzer.compare_laps(car1, car2, car1_code="VER", car2_code="NOR", step_meters=5.0)

    assert res.car1_lap_time < res.car2_lap_time
    assert res.delta_time_final > 0.0  # Car 1 is faster

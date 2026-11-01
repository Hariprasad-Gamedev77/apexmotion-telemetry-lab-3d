"""
APEX TELEMETRY 3D — REST Analytics API Endpoints (Python Core)
Circuit explorer, physics simulation runs, multi-car fleet tracking, and lap delta analysis.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from .circuits import CIRCUITS, generate_circuit_spline
from .physics import PythonVehicleSimulator, TelemetryPoint
from .multi_car_sim import MultiCarSimulationEngine
from .analysis import TelemetryAnalyzer

router = APIRouter(prefix="/api/v1")

class SimulationRequest(BaseModel):
    circuit_id: str = "singapore"
    sample_interval_meters: float = 10.0

class MultiCarStepRequest(BaseModel):
    circuit_id: str = "singapore"
    dt: float = 0.05

@router.get("/circuits")
async def list_circuits():
    """List all 24 Formula 1 World Championship circuits with Sportmonks lap records"""
    result = []
    for c_id, c in CIRCUITS.items():
        result.append({
            "circuit_id": c.circuit_id,
            "official_name": c.official_name,
            "country": c.country,
            "location": c.location,
            "length_meters": c.length_meters,
            "turn_count": c.turn_count,
            "drs_zone_count": c.drs_zone_count,
            "lap_record": {
                "time": c.lap_record_time,
                "driver": c.lap_record_driver,
                "year": c.lap_record_year,
                "recent_fastest_lap": {
                    "time": c.recent_fastest_lap,
                    "driver": c.recent_driver,
                    "year": c.recent_year,
                } if c.recent_fastest_lap else None,
            },
        })
    return {"count": len(result), "circuits": result}

@router.get("/circuits/{circuit_id}")
async def get_circuit_details(circuit_id: str):
    """Retrieve detailed geometry, turn profiles, and DRS zones for a circuit"""
    c = CIRCUITS.get(circuit_id.lower())
    if not c:
        raise HTTPException(status_code=404, detail=f"Circuit '{circuit_id}' not found")

    waypoints = generate_circuit_spline(circuit_id.lower(), point_count=200)

    return {
        "circuit_id": c.circuit_id,
        "official_name": c.official_name,
        "country": c.country,
        "length_meters": c.length_meters,
        "turn_count": c.turn_count,
        "drs_zones": [{"number": z.number, "name": z.name, "start": z.start_distance, "end": z.end_distance} for z in c.drs_zones],
        "turns": [{"number": t.number, "name": t.name, "apex_speed_kph": t.apex_speed_kph, "gear": t.gear} for t in c.turns],
        "waypoint_count": len(waypoints),
        "waypoints": [
            {
                "x": w.x, "y": w.y, "z": w.z,
                "distance_m": w.distance_meters,
                "heading": w.heading,
                "speed_kph": w.speed_limit_kph,
                "gear": w.recommended_gear
            } for w in waypoints[::2]
        ],
    }

@router.post("/simulate")
async def run_simulation(req: SimulationRequest):
    """Executes high-fidelity physics simulation for a full lap on any circuit"""
    if req.circuit_id.lower() not in CIRCUITS:
        raise HTTPException(status_code=404, detail=f"Circuit '{req.circuit_id}' not found")

    sim = PythonVehicleSimulator(req.circuit_id.lower())
    samples = sim.generate_full_lap(sample_interval_meters=req.sample_interval_meters)

    return {
        "circuit_id": req.circuit_id,
        "lap_distance_meters": sim.circuit_length,
        "total_samples": len(samples),
        "telemetry": [
            {
                "time": s.timestamp,
                "distance": s.distance_meters,
                "speed_kph": s.speed_kph,
                "throttle": s.throttle_percent,
                "brake": s.brake_percent,
                "gear": s.gear,
                "rpm": s.rpm,
                "drs": s.drs,
                "long_g": s.longitudinal_g,
                "lat_g": s.lateral_g,
                "x": s.world_x,
                "y": s.world_y,
                "z": s.world_z,
            } for s in samples
        ],
    }

@router.post("/simulate/multi-car")
async def step_multicar(req: MultiCarStepRequest):
    """Executes a multi-car simulation step with active anti-overlap collision avoidance"""
    engine = MultiCarSimulationEngine(circuit_id=req.circuit_id)
    step_results = engine.step(req.dt)

    return {
        "circuit_id": req.circuit_id,
        "drivers_count": len(step_results),
        "drivers": {
            driver_num: {
                "distance": pt.distance_meters,
                "speed_kph": pt.speed_kph,
                "throttle": pt.throttle_percent,
                "brake": pt.brake_percent,
                "gear": pt.gear,
                "x": pt.world_x,
                "y": pt.world_y,
                "z": pt.world_z,
                "heading": pt.heading,
            }
            for driver_num, pt in step_results.items()
        },
    }

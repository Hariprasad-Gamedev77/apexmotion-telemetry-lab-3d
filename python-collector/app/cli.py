"""
APEX TELEMETRY 3D — Python Motorsport CLI Tool
Allows running physics simulations, lap delta analysis, and circuit inspection directly in terminal.
"""

import sys
import argparse
import json
from .circuits import CIRCUITS
from .physics import PythonVehicleSimulator
from .analysis import TelemetryAnalyzer
from .multi_car_sim import MultiCarSimulationEngine

def main():
    parser = argparse.ArgumentParser(description="APEX Telemetry 3D — Engineering CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # circuits command
    subparsers.add_parser("circuits", help="List all 24 Formula 1 circuits and records")

    # simulate command
    sim_parser = subparsers.add_parser("simulate", help="Run physics simulation of a full lap")
    sim_parser.add_argument("--circuit", default="monza", help="Circuit ID (e.g. monza, spa, silverstone, singapore)")
    sim_parser.add_argument("--interval", type=float, default=20.0, help="Sampling interval in meters")
    sim_parser.add_argument("--export", default=None, help="Export output to JSON file")

    # multicar command
    mc_parser = subparsers.add_parser("multicar", help="Run multi-car grid simulation step")
    mc_parser.add_argument("--circuit", default="singapore", help="Circuit ID")
    mc_parser.add_argument("--dt", type=float, default=0.05, help="Simulation timestep in seconds")

    args = parser.parse_args()

    if args.command == "circuits":
        print(f"\nAPEX TELEMETRY 3D — 24 FORMULA 1 CALENDAR CIRCUITS")
        print("=" * 80)
        for c_id, c in CIRCUITS.items():
            print(f"[{c_id.upper():12}] {c.official_name:36} | {c.length_meters:5.0f}m | {c.turn_count:2d} Turns | Rec: {c.lap_record_time} ({c.lap_record_driver})")
        print("=" * 80)

    elif args.command == "simulate":
        circuit_id = args.circuit.lower()
        if circuit_id not in CIRCUITS:
            print(f"Error: Unknown circuit '{circuit_id}'. Available: {list(CIRCUITS.keys())}")
            sys.exit(1)

        c = CIRCUITS[circuit_id]
        print(f"Simulating full lap on {c.official_name} ({c.length_meters}m)...")
        sim = PythonVehicleSimulator(circuit_id)
        samples = sim.generate_full_lap(sample_interval_meters=args.interval)

        lap_time = samples[-1].timestamp if samples else 0.0
        max_speed = max(s.speed_kph for s in samples) if samples else 0.0
        avg_speed = sum(s.speed_kph for s in samples) / len(samples) if samples else 0.0

        print(f"Simulation completed successfully:")
        print(f"  Lap Time:  {lap_time:.3f} s")
        print(f"  Max Speed: {max_speed:.1f} km/h")
        print(f"  Avg Speed: {avg_speed:.1f} km/h")
        print(f"  Samples:   {len(samples)}")

        if args.export:
            out_data = [{"dist": s.distance_meters, "speed": s.speed_kph, "gear": s.gear, "rpm": s.rpm} for s in samples]
            with open(args.export, "w") as f:
                json.dump(out_data, f, indent=2)
            print(f"Exported to {args.export}")

    elif args.command == "multicar":
        engine = MultiCarSimulationEngine(circuit_id=args.circuit.lower())
        results = engine.step(args.dt)
        print(f"\nMulti-Car Grid Simulation Step (dt={args.dt}s):")
        for num, pt in results.items():
            print(f"  Car #{num:2d} | Dist: {pt.distance_meters:6.1f}m | Speed: {pt.speed_kph:5.1f} km/h | Coords: ({pt.world_x:.1f}, {pt.world_z:.1f})")

    else:
        parser.print_help()

if __name__ == "__main__":
    main()

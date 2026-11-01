"""
APEX TELEMETRY 3D — MoTeC-Standard Telemetry Analysis & Spatial Delta Engine (Python Core)
Uniform distance resampling (1m pitch), delta time integration, and corner apex extraction.
"""

import math
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple
from .physics import TelemetryPoint

@dataclass
class ResampledSample:
    distance: float
    speed_kph: float
    throttle: float
    brake: float
    gear: int
    rpm: float
    lateral_g: float

@dataclass
class TelemetryComparisonResult:
    car1_code: str
    car2_code: str
    lap_length_meters: float
    car1_lap_time: float
    car2_lap_time: float
    delta_time_final: float
    distance_axis: List[float]
    delta_time_curve: List[float]
    car1_speed: List[float]
    car2_speed: List[float]
    car1_throttle: List[float]
    car2_throttle: List[float]
    car1_brake: List[float]
    car2_brake: List[float]
    apex_deltas: List[Dict[str, Any]]

class TelemetryAnalyzer:
    @staticmethod
    def resample_lap_by_distance(samples: List[TelemetryPoint], step_meters: float = 1.0) -> List[ResampledSample]:
        """Resamples telemetry linearly onto uniform distance intervals (MoTeC standard)"""
        if not samples:
            return []

        # Sort by distance
        sorted_samples = sorted(samples, key=lambda s: s.distance_meters)
        max_dist = sorted_samples[-1].distance_meters

        resampled: List[ResampledSample] = []
        curr_dist = 0.0
        idx = 0

        while curr_dist <= max_dist and idx < len(sorted_samples) - 1:
            while idx < len(sorted_samples) - 1 and sorted_samples[idx + 1].distance_meters < curr_dist:
                idx += 1

            p0 = sorted_samples[idx]
            p1 = sorted_samples[min(idx + 1, len(sorted_samples) - 1)]

            seg_len = p1.distance_meters - p0.distance_meters
            t = (curr_dist - p0.distance_meters) / seg_len if seg_len > 0.001 else 0.0
            t = max(0.0, min(1.0, t))

            resampled.append(ResampledSample(
                distance=round(curr_dist, 1),
                speed_kph=round(p0.speed_kph + t * (p1.speed_kph - p0.speed_kph), 1),
                throttle=round(p0.throttle_percent + t * (p1.throttle_percent - p0.throttle_percent), 1),
                brake=round(p0.brake_percent + t * (p1.brake_percent - p0.brake_percent), 1),
                gear=p0.gear if t < 0.5 else p1.gear,
                rpm=round(p0.rpm + t * (p1.rpm - p0.rpm), 0),
                lateral_g=round(p0.lateral_g + t * (p1.lateral_g - p0.lateral_g), 2),
            ))
            curr_dist += step_meters

        return resampled

    @staticmethod
    def compare_laps(
        car1_samples: List[TelemetryPoint],
        car2_samples: List[TelemetryPoint],
        car1_code: str = "VER",
        car2_code: str = "NOR",
        step_meters: float = 2.0
    ) -> TelemetryComparisonResult:
        """
        Calculates exact delta time along distance:
        Delta t(s) = Integral from 0 to s of (1 / vA(s') - 1 / vB(s')) ds'
        """
        r1 = TelemetryAnalyzer.resample_lap_by_distance(car1_samples, step_meters)
        r2 = TelemetryAnalyzer.resample_lap_by_distance(car2_samples, step_meters)

        min_len = min(len(r1), len(r2))
        dist_axis: List[float] = []
        delta_time: List[float] = []
        car1_speed: List[float] = []
        car2_speed: List[float] = []
        car1_throttle: List[float] = []
        car2_throttle: List[float] = []
        car1_brake: List[float] = []
        car2_brake: List[float] = []

        accumulated_delta_t = 0.0
        time1 = 0.0
        time2 = 0.0

        for i in range(min_len):
            p1 = r1[i]
            p2 = r2[i]

            dist_axis.append(p1.distance)
            car1_speed.append(p1.speed_kph)
            car2_speed.append(p2.speed_kph)
            car1_throttle.append(p1.throttle)
            car2_throttle.append(p2.throttle)
            car1_brake.append(p1.brake)
            car2_brake.append(p2.brake)

            v1_ms = max(5.0, p1.speed_kph / 3.6)
            v2_ms = max(5.0, p2.speed_kph / 3.6)

            dt1 = step_meters / v1_ms
            dt2 = step_meters / v2_ms
            time1 += dt1
            time2 += dt2

            # delta_t > 0 means car1 is faster / ahead of car2
            accumulated_delta_t += (dt2 - dt1)
            delta_time.append(round(accumulated_delta_t, 3))

        # Detect corner apexes (local minimum speed points)
        apex_deltas: List[Dict[str, Any]] = []
        for i in range(5, min_len - 5):
            if (car1_speed[i] < car1_speed[i - 2] and car1_speed[i] < car1_speed[i + 2] and car1_speed[i] < 160.0):
                apex_deltas.append({
                    "distance_m": dist_axis[i],
                    "car1_speed_kph": car1_speed[i],
                    "car2_speed_kph": car2_speed[i],
                    "speed_delta_kph": round(car1_speed[i] - car2_speed[i], 1),
                    "time_delta_s": delta_time[i],
                })

        return TelemetryComparisonResult(
            car1_code=car1_code,
            car2_code=car2_code,
            lap_length_meters=dist_axis[-1] if dist_axis else 0.0,
            car1_lap_time=round(time1, 3),
            car2_lap_time=round(time2, 3),
            delta_time_final=round(accumulated_delta_t, 3),
            distance_axis=dist_axis,
            delta_time_curve=delta_time,
            car1_speed=car1_speed,
            car2_speed=car2_speed,
            car1_throttle=car1_throttle,
            car2_throttle=car2_throttle,
            car1_brake=car1_brake,
            car2_brake=car2_brake,
            apex_deltas=apex_deltas,
        )

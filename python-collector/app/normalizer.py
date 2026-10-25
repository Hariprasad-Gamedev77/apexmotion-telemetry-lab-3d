"""
APEX TELEMETRY 3D — Telemetry Event Normalizer
"""

from typing import Dict, Any
from .models import TelemetrySample, WebSocketTelemetryEnvelope

class TelemetryNormalizer:
    @staticmethod
    def normalize_to_ws_event(sample: TelemetrySample) -> Dict[str, Any]:
        """Convert decoded TelemetrySample into versioned WebSocket event envelope"""
        payload = {
            "frameId": sample.frame_identifier,
            "packetId": sample.packet_id,
        }

        if sample.speed_kph is not None:
            payload["speedKph"] = round(sample.speed_kph, 1)

        if sample.throttle is not None:
            payload["throttlePercent"] = round(sample.throttle * 100.0, 1)

        if sample.brake is not None:
            payload["brakePercent"] = round(sample.brake * 100.0, 1)

        if sample.rpm is not None:
            payload["rpm"] = sample.rpm

        if sample.gear is not None:
            payload["gear"] = sample.gear

        if sample.world_x is not None:
            payload["worldX"] = round(sample.world_x, 3)

        if sample.world_y is not None:
            payload["worldY"] = round(sample.world_y, 3)

        envelope = WebSocketTelemetryEnvelope(
            schemaVersion=1,
            source="live",
            eventType="telemetry.sample",
            timestamp=sample.timestamp,
            payload=payload,
        )
        return envelope.model_dump()

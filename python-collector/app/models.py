"""
APEX TELEMETRY 3D — Telemetry Data Models
"""

from dataclasses import dataclass
from typing import Optional
from pydantic import BaseModel, Field

@dataclass(frozen=True)
class DecodedPacketHeader:
    packet_id: int
    game_year: int
    frame_identifier: int
    session_time: float

@dataclass(frozen=True)
class TelemetrySample:
    timestamp: float
    frame_identifier: int
    packet_id: int
    speed_kph: Optional[float] = None
    throttle: Optional[float] = None
    brake: Optional[float] = None
    rpm: Optional[int] = None
    gear: Optional[int] = None
    world_x: Optional[float] = None
    world_y: Optional[float] = None
    drs: Optional[int] = None

class WebSocketTelemetryEnvelope(BaseModel):
    schemaVersion: int = 1
    source: str = "live"
    eventType: str = "telemetry.sample"
    timestamp: float
    payload: dict = Field(default_factory=dict)

class DiagnosticsResponse(BaseModel):
    receiver_state: str
    bind_address: str
    port: int
    packets_received: int
    packets_decoded: int
    packets_dropped: int
    invalid_packets: int
    unknown_packets: int
    estimated_rate_hz: float
    connected_ws_clients: int
    recording_active: bool

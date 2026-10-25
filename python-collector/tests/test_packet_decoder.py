"""
APEX TELEMETRY 3D — Automated Packet Decoder & Normalizer Unit Tests
"""

import math
import struct
import pytest
from app.protocols.f1_educational import EducationalPacketDecoder, HEADER_FORMAT, TELEMETRY_PAYLOAD_FORMAT, LAP_PAYLOAD_FORMAT
from app.normalizer import TelemetryNormalizer

@pytest.fixture
def decoder():
    return EducationalPacketDecoder()

def test_valid_telemetry_packet_unpacking(decoder):
    """Verify correct unpacking of Header + Telemetry payload (ID 6)"""
    # Header: packet_id=6, game_year=24, frame_id=1024, session_time=82.415
    header_bytes = struct.pack(HEADER_FORMAT, 6, 24, 1024, 82.415)
    # Telemetry: speed_kph=285, throttle=0.98, brake=0.0
    payload_bytes = struct.pack(TELEMETRY_PAYLOAD_FORMAT, 285, 0.98, 0.0)

    packet = header_bytes + payload_bytes
    sample = decoder.decode_packet(packet)

    assert sample is not None
    assert sample.packet_id == 6
    assert sample.frame_identifier == 1024
    assert pytest.approx(sample.timestamp, 0.001) == 82.415
    assert sample.speed_kph == 285.0
    assert pytest.approx(sample.throttle, 0.001) == 0.98
    assert sample.brake == 0.0

def test_valid_lap_packet_unpacking(decoder):
    """Verify correct unpacking of Header + Lap position payload (ID 2)"""
    header_bytes = struct.pack(HEADER_FORMAT, 2, 24, 2048, 14.2)
    payload_bytes = struct.pack(LAP_PAYLOAD_FORMAT, 350.5, -120.25)

    packet = header_bytes + payload_bytes
    sample = decoder.decode_packet(packet)

    assert sample is not None
    assert sample.packet_id == 2
    assert sample.frame_identifier == 2048
    assert pytest.approx(sample.world_x, 0.01) == 350.5
    assert pytest.approx(sample.world_y, 0.01) == -120.25

def test_short_truncated_packet_rejection(decoder):
    """Packets shorter than required size must be rejected safely without crashing"""
    short_packet = b"\x06\x18\x00"
    sample = decoder.decode_packet(short_packet)

    assert sample is None
    assert decoder.invalid_packets == 1

def test_nan_float_rejection(decoder):
    """Non-finite floats (NaN, Inf) must be rejected to protect 3D simulation stability"""
    header_bytes = struct.pack(HEADER_FORMAT, 6, 24, 100, 1.0)
    payload_bytes = struct.pack(TELEMETRY_PAYLOAD_FORMAT, 200, float("nan"), 0.0)

    packet = header_bytes + payload_bytes
    sample = decoder.decode_packet(packet)

    assert sample is None
    assert decoder.invalid_packets == 1

def test_unknown_packet_id(decoder):
    """Unknown packet IDs must be tracked safely without exceptions"""
    header_bytes = struct.pack(HEADER_FORMAT, 99, 24, 50, 2.0)
    payload_bytes = b"\x00" * 16

    packet = header_bytes + payload_bytes
    sample = decoder.decode_packet(packet)

    assert sample is None
    assert decoder.unknown_packets == 1

def test_telemetry_normalizer_envelope():
    """Verify JSON WebSocket envelope structure and scaling"""
    from app.models import TelemetrySample

    sample = TelemetrySample(
        timestamp=45.123,
        frame_identifier=8800,
        packet_id=6,
        speed_kph=312.4,
        throttle=1.0,
        brake=0.0,
        world_x=120.5,
        world_y=-40.2,
    )

    event = TelemetryNormalizer.normalize_to_ws_event(sample)

    assert event["schemaVersion"] == 1
    assert event["source"] == "live"
    assert event["eventType"] == "telemetry.sample"
    assert event["timestamp"] == 45.123
    assert event["payload"]["speedKph"] == 312.4
    assert event["payload"]["throttlePercent"] == 100.0
    assert event["payload"]["brakePercent"] == 0.0

"""
APEX TELEMETRY 3D — Educational Binary Packet Decoder

Implements struct-based binary unpacking for little-endian UDP datagrams.
Format specifications:
  Header:   <BBIf  (10 bytes: packet_id, game_year, frame_id, session_time)
  ID 6 Tel: <Hff   (10 bytes: speed_kph uint16, throttle float32, brake float32)
  ID 2 Lap: <ff    (8 bytes:  world_x float32, world_y float32)
"""

import math
import struct
from typing import Optional, Tuple
from ..models import DecodedPacketHeader, TelemetrySample

HEADER_FORMAT = "<BBIf"
HEADER_SIZE = struct.calcsize(HEADER_FORMAT)  # 10 bytes

TELEMETRY_PAYLOAD_FORMAT = "<Hff"
TELEMETRY_PAYLOAD_SIZE = struct.calcsize(TELEMETRY_PAYLOAD_FORMAT)  # 10 bytes

LAP_PAYLOAD_FORMAT = "<ff"
LAP_PAYLOAD_SIZE = struct.calcsize(LAP_PAYLOAD_FORMAT)  # 8 bytes

class EducationalPacketDecoder:
    def __init__(self):
        self.packets_decoded = 0
        self.invalid_packets = 0
        self.unknown_packets = 0

    def decode_header(self, buffer: bytes) -> Optional[DecodedPacketHeader]:
        """Validate length and unpack binary packet header"""
        if len(buffer) < HEADER_SIZE:
            self.invalid_packets += 1
            return None

        try:
            packet_id, game_year, frame_id, session_time = struct.unpack_from(HEADER_FORMAT, buffer, 0)
        except struct.error:
            self.invalid_packets += 1
            return None

        # Reject non-finite floating point timestamps
        if not math.isfinite(session_time):
            self.invalid_packets += 1
            return None

        return DecodedPacketHeader(
            packet_id=packet_id,
            game_year=game_year,
            frame_identifier=frame_id,
            session_time=session_time,
        )

    def decode_packet(self, buffer: bytes) -> Optional[TelemetrySample]:
        """Decode complete UDP datagram into normalized TelemetrySample"""
        header = self.decode_header(buffer)
        if not header:
            return None

        payload_bytes = buffer[HEADER_SIZE:]

        # Packet ID 6: Vehicle Telemetry Data
        if header.packet_id == 6:
            if len(payload_bytes) < TELEMETRY_PAYLOAD_SIZE:
                self.invalid_packets += 1
                return None

            try:
                speed, throttle, brake = struct.unpack_from(TELEMETRY_PAYLOAD_FORMAT, payload_bytes, 0)
            except struct.error:
                self.invalid_packets += 1
                return None

            if not (math.isfinite(throttle) and math.isfinite(brake)):
                self.invalid_packets += 1
                return None

            # Clamp valid throttle and brake bounds [0.0, 1.0]
            throttle = max(0.0, min(1.0, float(throttle)))
            brake = max(0.0, min(1.0, float(brake)))

            self.packets_decoded += 1
            return TelemetrySample(
                timestamp=header.session_time,
                frame_identifier=header.frame_identifier,
                packet_id=header.packet_id,
                speed_kph=float(speed),
                throttle=throttle,
                brake=brake,
            )

        # Packet ID 2: Lap Data / World Coordinates
        elif header.packet_id == 2:
            if len(payload_bytes) < LAP_PAYLOAD_SIZE:
                self.invalid_packets += 1
                return None

            try:
                world_x, world_y = struct.unpack_from(LAP_PAYLOAD_FORMAT, payload_bytes, 0)
            except struct.error:
                self.invalid_packets += 1
                return None

            if not (math.isfinite(world_x) and math.isfinite(world_y)):
                self.invalid_packets += 1
                return None

            self.packets_decoded += 1
            return TelemetrySample(
                timestamp=header.session_time,
                frame_identifier=header.frame_identifier,
                packet_id=header.packet_id,
                world_x=float(world_x),
                world_y=float(world_y),
            )

        else:
            self.unknown_packets += 1
            return None

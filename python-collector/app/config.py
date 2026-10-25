"""
APEX TELEMETRY 3D — Python UDP Collector Configuration
"""

import os
from pydantic import BaseModel

class CollectorConfig(BaseModel):
    UDP_BIND_HOST: str = os.getenv("UDP_HOST", "127.0.0.1")
    UDP_BIND_PORT: int = int(os.getenv("UDP_PORT", "20777"))
    SOCKET_RCVBUF_BYTES: int = 1024 * 1024  # 1MB OS socket receive buffer
    RECEIVER_QUEUE_MAX_SIZE: int = 2000     # Bounded queue to prevent unbounded memory growth
    SOCKET_TIMEOUT_SECONDS: float = 1.0
    WS_HOST: str = os.getenv("WS_HOST", "0.0.0.0")
    WS_PORT: int = int(os.getenv("WS_PORT", "8000"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    RECORDINGS_DIR: str = os.getenv("RECORDINGS_DIR", "./recordings")

config = CollectorConfig()

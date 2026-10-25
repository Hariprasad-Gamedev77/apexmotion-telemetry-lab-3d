"""
APEX TELEMETRY 3D — FastAPI Collector & WebSocket Telemetry Server
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import config
from .models import DiagnosticsResponse
from .receiver import UdpReceiver
from .protocols.f1_educational import EducationalPacketDecoder
from .normalizer import TelemetryNormalizer
from .broadcaster import WebSocketBroadcaster
from .recorder import TelemetryRecorder

logging.basicConfig(level=getattr(logging, config.LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger("apex.main")

# Subsystem singletons
receiver = UdpReceiver()
decoder = EducationalPacketDecoder()
broadcaster = WebSocketBroadcaster()
recorder = TelemetryRecorder()

async def packet_processing_loop():
    """Background task reading raw UDP packets from queue, decoding, and broadcasting"""
    loop = asyncio.get_running_loop()
    logger.info("Packet processing dispatcher task active")

    while receiver.running.is_set():
        try:
            # Non-blocking fetch with small sleep or executor run
            raw_packet = await loop.run_in_executor(None, lambda: receiver.packet_queue.get(timeout=0.05))
            sample = decoder.decode_packet(raw_packet)

            if sample:
                event = TelemetryNormalizer.normalize_to_ws_event(sample)
                await broadcaster.broadcast_event(event)
                recorder.record_sample(event)

        except Exception:
            await asyncio.sleep(0.005)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start UDP socket receiver and packet dispatcher
    receiver.start()
    task = asyncio.create_task(packet_processing_loop())
    logger.info(f"APEX Telemetry Collector initialized on UDP port {config.UDP_BIND_PORT}")
    yield
    # Shutdown: Cleanly stop receiver and flush recordings
    receiver.stop()
    recorder.stop_recording()
    task.cancel()
    logger.info("APEX Telemetry Collector shut down cleanly")

app = FastAPI(
    title="APEX TELEMETRY 3D — Live Collector Service",
    version="1.4.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "APEX Telemetry Collector",
        "version": "1.4.0",
        "udp_receiver_active": receiver.running.is_set(),
    }

@app.get("/api/v1/diagnostics", response_model=DiagnosticsResponse)
async def get_diagnostics():
    return DiagnosticsResponse(
        receiver_state="active" if receiver.running.is_set() else "stopped",
        bind_address=receiver.host,
        port=receiver.port,
        packets_received=receiver.packets_received,
        packets_decoded=decoder.packets_decoded,
        packets_dropped=receiver.packets_dropped,
        invalid_packets=decoder.invalid_packets,
        unknown_packets=decoder.unknown_packets,
        estimated_rate_hz=round(receiver.get_packet_rate_hz(), 1),
        connected_ws_clients=broadcaster.client_count,
        recording_active=recorder.active,
    )

@app.post("/api/v1/recordings/start")
async def start_recording(session_name: str = "session"):
    recorder.start_recording(session_name)
    return {"status": "recording_started", "session": session_name}

@app.post("/api/v1/recordings/stop")
async def stop_recording():
    recorder.stop_recording()
    return {"status": "recording_stopped"}

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await broadcaster.connect(websocket)
    try:
        while True:
            # Client heartbeat / incoming ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        await broadcaster.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("python-collector.app.main:app", host=config.WS_HOST, port=config.WS_PORT, log_level="info")

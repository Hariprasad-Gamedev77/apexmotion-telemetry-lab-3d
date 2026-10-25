"""
APEX TELEMETRY 3D — WebSocket Telemetry Broadcaster
"""

import asyncio
import json
import logging
from typing import Set, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("apex.broadcaster")

class WebSocketBroadcaster:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total active: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        async with self.lock:
            self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast_event(self, event_dict: Dict[str, Any]):
        """Broadcast normalized JSON event to all connected web clients"""
        if not self.active_connections:
            return

        message_str = json.dumps(event_dict)
        dead_sockets = set()

        async with self.lock:
            for connection in self.active_connections:
                try:
                    await connection.send_text(message_str)
                except (WebSocketDisconnect, RuntimeError):
                    dead_sockets.add(connection)

            for dead in dead_sockets:
                self.active_connections.discard(dead)

    @property
    def client_count(self) -> int:
        return len(self.active_connections)

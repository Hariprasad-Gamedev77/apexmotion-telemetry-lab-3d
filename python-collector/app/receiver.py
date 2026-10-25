"""
APEX TELEMETRY 3D — UDP Socket Receiver & Bounded Queue Buffer
"""

import queue
import socket
import threading
import time
import logging
from typing import Optional
from .config import config

logger = logging.getLogger("apex.receiver")

class UdpReceiver:
    def __init__(self, host: str = config.UDP_BIND_HOST, port: int = config.UDP_BIND_PORT):
        self.host = host
        self.port = port
        self.packet_queue: queue.Queue = queue.Queue(maxsize=config.RECEIVER_QUEUE_MAX_SIZE)
        self.running = threading.Event()
        self.worker_thread: Optional[threading.Thread] = None
        self.sock: Optional[socket.socket] = None

        # Metrics
        self.packets_received = 0
        self.packets_dropped = 0
        self.start_time = time.time()

    def start(self):
        """Bind socket and spawn receiver worker thread"""
        if self.running.is_set():
            return

        self.running.set()
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Increase OS UDP receive buffer
        try:
            self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, config.SOCKET_RCVBUF_BYTES)
        except OSError as e:
            logger.warning(f"Could not set SO_RCVBUF: {e}")

        self.sock.settimeout(config.SOCKET_TIMEOUT_SECONDS)
        self.sock.bind((self.host, self.port))
        logger.info(f"UDP Receiver successfully bound to {self.host}:{self.port}")

        self.worker_thread = threading.Thread(target=self._receive_loop, daemon=True, name="ApexUdpReceiver")
        self.worker_thread.start()

    def _receive_loop(self):
        while self.running.is_set():
            try:
                data, _ = self.sock.recvfrom(2048)
                self.packets_received += 1

                try:
                    self.packet_queue.put_nowait(data)
                except queue.Full:
                    # Drop oldest or drop new to preserve fresh real-time display updates
                    self.packets_dropped += 1
            except socket.timeout:
                continue
            except OSError as e:
                if self.running.is_set():
                    logger.error(f"UDP Socket error: {e}")
                break

    def stop(self):
        """Signal worker and cleanly close socket"""
        self.running.clear()
        if self.sock:
            try:
                self.sock.close()
            except OSError:
                pass
        if self.worker_thread and self.worker_thread.is_alive():
            self.worker_thread.join(timeout=1.5)
        logger.info("UDP Receiver stopped cleanly")

    def get_packet_rate_hz(self) -> float:
        elapsed = time.time() - self.start_time
        return self.packets_received / elapsed if elapsed > 0.1 else 0.0

"""
APEX TELEMETRY 3D — Telemetry Disk Recorder (JSONL & CSV)
"""

import json
import os
import queue
import threading
import time
import logging
from typing import Optional
from .config import config

logger = logging.getLogger("apex.recorder")

class TelemetryRecorder:
    def __init__(self, output_dir: str = config.RECORDINGS_DIR):
        self.output_dir = output_dir
        self.active = False
        self.file_handle: Optional[object] = None
        self.write_queue: queue.Queue = queue.Queue(maxsize=5000)
        self.worker_thread: Optional[threading.Thread] = None
        self.total_bytes_written = 0

    def start_recording(self, session_name: str = "session"):
        if self.active:
            return

        os.makedirs(self.output_dir, exist_ok=True)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(self.output_dir, f"{session_name}_{timestamp}.jsonl")

        self.file_handle = open(filename, "w", encoding="utf-8")
        self.active = True
        self.total_bytes_written = 0

        self.worker_thread = threading.Thread(target=self._flush_loop, daemon=True, name="ApexDiskRecorder")
        self.worker_thread.start()
        logger.info(f"Telemetry recording started to {filename}")

    def record_sample(self, event_dict: dict):
        if not self.active:
            return
        try:
            self.write_queue.put_nowait(event_dict)
        except queue.Full:
            pass

    def _flush_loop(self):
        batch = []
        while self.active or not self.write_queue.empty():
            try:
                item = self.write_queue.get(timeout=0.2)
                batch.append(json.dumps(item) + "\n")
                if len(batch) >= 50:
                    data = "".join(batch)
                    self.file_handle.write(data)
                    self.file_handle.flush()
                    self.total_bytes_written += len(data.encode("utf-8"))
                    batch.clear()
            except queue.Empty:
                if batch:
                    data = "".join(batch)
                    self.file_handle.write(data)
                    self.file_handle.flush()
                    self.total_bytes_written += len(data.encode("utf-8"))
                    batch.clear()

    def stop_recording(self):
        if not self.active:
            return
        self.active = False
        if self.worker_thread:
            self.worker_thread.join(timeout=2.0)
        if self.file_handle:
            self.file_handle.close()
            self.file_handle = None
        logger.info("Telemetry recording completed and safely flushed to disk")

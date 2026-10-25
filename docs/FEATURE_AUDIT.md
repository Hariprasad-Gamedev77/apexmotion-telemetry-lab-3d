# APEXMOTION TELEMETRY LAB 3D — FEATURE AUDIT & INVENTORY
**Document Version:** 1.0.0  
**Audit Date:** 2026-10-25T23:00:00+05:30  
**Classification System:**
- `IMPLEMENTED`: Concrete, functional workflow exists and verified.
- `PARTIAL`: Interface and core logic exist, but edge-case or subordinate functionality is pending.
- `PLACEHOLDER`: Visual mockup without functional backing.
- `BROKEN`: Reproducible crash or logic failure.
- `BLOCKED`: Requires external physical hardware or unavailable service.
- `UNVERIFIED`: Insufficient evidence to classify.

---

## 1. Feature Matrix Summary

| Area / Feature | Route / File | Status | Test Coverage | Confidence |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard (Flagship Workstation)** | `/dashboard` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Live Timing Tower** | `/timing` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **2D Circuit Spatial Map** | `/track-map` | `IMPLEMENTED` | Bounding Box Math Test | High |
| **Vehicle Telemetry Cockpit** | `/telemetry` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Telemetry Explorer** | `/explore` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Lap & Sector Analysis** | `/laps` | `IMPLEMENTED` | Time Formatting Math Test | High |
| **Lap Comparison & Delta** | `/comparison` | `IMPLEMENTED` | Delta Calc Test + Build | High |
| **Driver Head-to-Head** | `/drivers` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Tyres & Stints Progression** | `/tyres` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Track Replay Suite** | `/replay` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Session History** | `/history` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Historical F1 Explorer** | `/historical` | `IMPLEMENTED` | OpenF1 schema validation | High |
| **Data Export (CSV/JSON/JSONL)** | `/data` | `IMPLEMENTED` | Browser Blob generator | High |
| **Data Import & Validation Engine** | `/data` | `PARTIAL` | Zod schema defined, needs robust parser | Medium |
| **Packet Diagnostics Inspector** | `/packets` | `IMPLEMENTED` | Python struct pytest suite | High |
| **Collector Connection Setup** | `/connection` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **System Diagnostics** | `/diagnostics` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Architecture Documentation** | `/about` | `IMPLEMENTED` | Turbopack Build + HTTP 200 | High |
| **Procedural Track Splines** | `trackGenerator.ts` | `IMPLEMENTED` | `Track Generator Spline Interpolation` | High |
| **Longitudinal Vehicle Physics** | `vehiclePhysics.ts` | `IMPLEMENTED` | `Longitudinal Dynamics & RPM Step` | High |
| **Python UDP Telemetry Collector** | `python-collector/` | `IMPLEMENTED` | 6 pytest automated unit tests | High |
| **Live Simulator Telemetry** | UDP Socket `20777` | `BLOCKED` | Offline tests pass; requires game host | Medium |

---

## 2. Detailed Component & Route Audits

### 2.1 Dashboard (`/dashboard`)
* **Source:** `app/dashboard/page.tsx`
* **Components:** `ApexScene.tsx`, `LiveDashboardHUD.tsx`, `SplitTelemetryWorkbench.tsx`, `FormulaTelemetrySuite.tsx`, `SimulationControlPanel.tsx`, `TrackAdjustmentModal.tsx`, `TrackMap2D.tsx`, `ReplayControls.tsx`.
* **Inputs:** Unified store state, keyboard shortcuts (<kbd>W</kbd>/<kbd>S</kbd>, <kbd>Space</kbd>, <kbd>Arrows</kbd>), scrubber mouse drag.
* **Outputs:** 3D WebGL render canvas, synchronized multi-pane charts, heads-up telemetry display, track adjustment drawer.
* **Status:** `IMPLEMENTED`. Speedometer and graph overlay resolved via collapsible HUD and multi-tier height presets.

### 2.2 Lap Comparison & Delta Trace (`/comparison`)
* **Source:** `app/comparison/page.tsx`
* **Inputs:** Reference Lap (e.g. Lap 4, 1:21.942) and Comparison Lap (e.g. Lap 2, 1:22.915) distance-aligned samples.
* **Algorithm:** Discrete distance delta accumulation: $\Delta t = \sum (\Delta x / v_{\text{comp}} - \Delta x / v_{\text{ref}})$.
* **Outputs:** Continuous cumulative delta line ($\Delta t$), dual-speed overlay (km/h), pedal overlay (throttle/brake).
* **Status:** `IMPLEMENTED`.

### 2.3 Historical F1 Explorer (`/historical`)
* **Source:** `app/historical/page.tsx`, `lib/api/openf1.ts`
* **Inputs:** Curated OpenF1 sessions (Singapore GP, Silverstone, Spa-Francorchamps, Monza).
* **Outputs:** Authenticated session metadata, track length, data availability indicators, instant circuit loading.
* **Status:** `IMPLEMENTED`.

### 2.4 Data Import & Export (`/data`)
* **Source:** `app/data/page.tsx`
* **Export Workflows:**
  - CSV: Timestamp, distance, speed, throttle, brake, gear, rpm, drs, 3D coordinates.
  - JSON: Full session metadata envelope with samples array.
  - JSONL: Newline-delimited JSON stream for streaming ingestion.
* **Status:** Export is `IMPLEMENTED`. Import parser currently accepts file drops but requires full mathematical validation and error categorization (targeted in Phase Three).

### 2.5 Live UDP Telemetry Collector (`python-collector/`)
* **Source:** `app/receiver.py`, `app/protocols/f1_educational.py`, `app/broadcaster.py`, `app/normalizer.py`.
* **Binary Format:** Little-endian standard struct:
  - Header: `<BBIf` (Packet ID, Year, Frame ID, Session Time) — 10 Bytes.
  - Telemetry: `<Hff` (Speed km/h, Throttle 0-1, Brake 0-1) — 10 Bytes.
  - Lap Position: `<ff` (World X, World Y) — 8 Bytes.
* **Outputs:** Real-time JSON envelopes over WebSocket port `8000`.
* **Status:** `IMPLEMENTED`. Verified via pytest unit tests. Live hardware connection is `BLOCKED` awaiting an active gaming PC.

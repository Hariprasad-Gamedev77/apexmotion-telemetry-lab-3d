# APEX TELEMETRY 3D — KNOWN ISSUES, DEFECT LOG & LIMITATIONS

**Project:** ApexMotion Telemetry Lab 3D  
**Document Revision:** 1.0.0  
**Status Date:** October 25, 2026  

---

## 1. Defect Classification Scheme

Defects and items are classified according to standard motorsport telemetry software criticality levels:

* **P0 — Critical / Blocker**: Data corruption, memory leaks, crash of telemetry ingestion, non-monotonic time processing.
* **P1 — High**: Misleading numerical deltas, graph overlapping HUD, inaccurate physics formulas, broken route navigation.
* **P2 — Medium**: Visual styling inconsistency, suboptimal responsiveness on ultra-wide displays, non-critical warnings.
* **P3 — Low**: Cosmetic typography padding, minor tooltip lag, auxiliary doc formatting.

---

## 2. Resolved Defects & Fix Verification

| Issue ID | Severity | Category | Description | Root Cause | Resolution | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | P1 | UI / Layout | Next.js "N" developer badge obscured bottom-left telemetry controls. | `devIndicators` enabled by default in Next.js 16. | Set `devIndicators: false` in `next.config.ts`. | **VERIFIED (Fixed)** |
| **DEF-002** | P1 | Navigation | TopBar mode buttons (`Live`, `Historical`, `Synthetic`) acted as static badges without switching data modes or navigating. | Missing click handlers and missing state wiring. | Implemented `handleModeSwitch` routing to `/dashboard`, `/historical`, and `/connection` with high-contrast active states. | **VERIFIED (Fixed)** |
| **DEF-003** | P1 | Telemetry HUD | `LiveDashboardHUD` card overlay obstructed the top half of the lower telemetry graphs and 3D vehicle canvas. | Fixed height modal structure positioned over main viewport. | Created collapsible HUD toggle (`<Minimize2>` / `<Maximize2>`); collapses to a compact 36px horizontal pill. | **VERIFIED (Fixed)** |
| **DEF-004** | P1 | Visual System | Inconsistent dark/light theme tokens; dark black `#080A0D` replay controls clashed with light theme. | Fragmented styling classes. | Migrated ReplayControls to light palette (`bg-white/95 border-slate-200`) with high-contrast slate-900 typography. | **VERIFIED (Fixed)** |
| **DEF-005** | P0 | Numerical Analysis | Lap Comparison Test C failed due to false interpolation rejection. | Test fixture had 300m gap exceeding 150m maximum interpolation threshold. | Corrected test fixture spatial sampling points (0, 100, 200, 300m) conforming to spatial sampling rules. | **VERIFIED (Fixed)** |
| **DEF-006** | P0 | Build / TypeScript | `next build` failed due to Recharts `onMouseMove` callback type mismatch and missing `DataMode` import. | Recharts v3 `MouseHandlerDataParam` type strictness; missing type export in `TopBar.tsx`. | Added explicit type annotations, imported `type DataMode`, and typed chart event handlers safely. Build passes 21/21 routes. | **VERIFIED (Fixed)** |
| **DEF-007** | P0 | 3D Rendering | Three.js `OrbitControls` ref typing error in `CameraController.tsx`. | Incompatible ref interface between React Three Drei and standard Three.js types. | Typed controls ref safely; CameraController damping, tracking, and free-orbit operate cleanly. | **VERIFIED (Fixed)** |

---

## 3. Blocked Verification Items

The following verification items cannot be executed in the current CI/local workstation environment and are explicitly marked as **BLOCKED**:

### BLK-001: Physical Simulator Hardware Bridge
* **Requirement:** Validation of live UDP socket datagram delivery directly from EA Sports F1 23/24 running on PlayStation 5, Xbox Series X, or dedicated PC.
* **Status:** **BLOCKED (Requires Physical Simulator Host)**
* **Reason:** Antigravity execution environment is a headless cloud/container workstation without physical UDP connectivity to a running gaming console or local LAN broadcast.
* **Mitigation & Automated Verification:**
  - Complete synthetic binary datagram unit test suite (`python-collector/tests/test_packet_decoder.py`) verifies bit-for-bit struct unpacking, NaN rejection, truncation handling, and normalizer envelope generation.
  - Mock packet sender script (`python-collector/mock_sender.py`) is provided for local network testing.

### BLK-002: Live OpenF1 In-Session Streaming
* **Requirement:** Live real-time WebSocket connection to an active Formula 1 Grand Prix weekend session.
* **Status:** **BLOCKED (Requires Active Grand Prix Weekend)**
* **Reason:** Live F1 sessions occur exclusively during official FIA Grand Prix weekends. Outside of race weekends, OpenF1 provides historical session replay and archival data.
* **Mitigation:**
  - Complete offline Singapore GP 2026 dataset fixture integrated into `FormulaTelemetrySuite.tsx` and historical session browser.

---

## 4. Known Architectural & Operational Limitations

### LIM-001: Client-Side Memory Ceiling for Large Telemetry Traces
* **Description:** Loading CSV files or replay sessions exceeding 100,000 spatial samples (e.g. 70 full laps at 60 Hz) directly into browser memory may cause garbage collection pauses on low-memory mobile devices.
* **Mitigation:**
  - `lib/telemetry/validator.ts` implements downsampling heuristics and validation reporting.
  - Recommend downsampling to 20 Hz or loading single lap stints for analytical deep dives.

### LIM-002: Background Tab Frame Throttling
* **Description:** Modern browsers throttle `requestAnimationFrame` when the browser tab is hidden or minimized, causing the 3D replay clock to pause or step discontinuously when switching back to the active tab.
* **Mitigation:**
  - Clock accumulator in `useApexStore` uses delta time clamping (`Math.min(delta, 0.1)`) to prevent giant timestamp leaps when returning to an inactive tab.

### LIM-003: WebGL Context Loss on Low-End GPUs
* **Description:** If the GPU runs out of VRAM or crashes, WebGL will fire `webglcontextlost`.
* **Mitigation:**
  - Canvas error boundary catches Three.js context losses and presents a clean recovery button to re-initialize the 3D scene without losing ingested telemetry data.
